#include "pch.h"
#include "LottieView.h"
#include "LottieView.g.cpp"
#include <winrt/Windows.Foundation.h>
#include <winrt/Windows.UI.Xaml.h>
#include <winrt/Microsoft.UI.Xaml.Controls.h>

namespace winrt::LottieReactNative::implementation
{
    constexpr double ticksToSeconds(winrt::TimeSpan ticks)
    {
        return std::chrono::duration_cast<std::chrono::duration<double, std::ratio<1>>>(ticks).count();
    }

    template<typename T>
    bool PropChanged(T const& member, std::optional<T> const& value) {
        return value.has_value() ? value.value() != member : false;
    }

    template<typename T>
    void ApplyProp(T& member, std::optional<T>& value) {
        if (value.has_value()) {
            member = value.value();
        }
        value.reset();
    }

    LottieView::LottieView() : Super() {
        FlowDirection(winrt::Windows::UI::Xaml::FlowDirection::LeftToRight);

        m_player = winrt::Microsoft::UI::Xaml::Controls::AnimatedVisualPlayer();
        m_player.AutoPlay(false);
        m_playerLoadedRevoker = m_player.Loaded(winrt::auto_revoke, { get_weak(), &LottieView::OnPlayerMounted });
        Children().Append(m_player);
    }

    LottieView::LottieView(winrt::Microsoft::ReactNative::IReactContext const& context, winrt::LottieReactNative::ILottieSourceProvider const& lottieSourceProvider)
        : LottieView()
    {
        m_reactContext = context;
        m_lottieSourceProvider = lottieSourceProvider;
    }

    void LottieView::SetSpeed(double speed) {
        m_speed = speed;
        m_player.PlaybackRate(speed);
    }

    winrt::Windows::UI::Xaml::Media::Stretch LottieView::ResizeMode() {
        return m_player.Stretch();
    }

    void LottieView::ResizeMode(winrt::Windows::UI::Xaml::Media::Stretch resizeMode) {
        m_player.Stretch(resizeMode);
    }

    void LottieView::SetProgress(double position) {
        m_pendingProgressProp = position;
    }

    void LottieView::SetLoop(bool loop) {
        m_pendingLoopProp = loop;
    }

    void LottieView::SetNativeLooping(bool enable) {
        m_pendingNativeLoopingProp = enable;
    }

    void LottieView::SetSourceName(winrt::hstring const& name) {
        if (m_pendingSourceProp) {
            m_pendingSourceProp.Cancel();
        }
        m_pendingSourceProp = m_lottieSourceProvider.GetSourceFromName(name);
    }
    void LottieView::SetSourceJson(winrt::hstring const& json) {
        if (m_pendingSourceProp) {
            m_pendingSourceProp.Cancel();
        }
        m_pendingSourceProp = m_lottieSourceProvider.GetSourceFromJson(json);
    }

    void LottieView::OnPlayerMounted(winrt::Windows::Foundation::IInspectable const& /*sender*/, winrt::Windows::Foundation::IInspectable const& /*args*/) {
        // Unblock any pending loads
        if (m_activeSource) {
            HandleSourceLoaded(m_activeSource);
        }
    }

    //
    // Property Behaviors:
    //      loop        - Defers until loading complete. May reset playback.
    //      progress    - Defers until loading complete. Ignored if play() is called.
    //      resizeMode  - Applied immediately.
    //      source      - Applied immediately.
    //      speed       - Applied immediately.
    //
    void LottieView::ApplyPropertyChanges() {

        if (m_pendingSourceProp) {
            // Source changed. We'll defer applying other properties until it has finished loading.
            if (m_activeSourceLoad) {
                m_activeSourceLoad.Cancel();
            }
            m_activeSourceLoad = m_pendingSourceProp;
            m_activeSource = nullptr;
            m_pendingSourceProp = nullptr;

            Reset();
            LoadSourceAsync();
            return;
        }

        if (!IsLoaded() || m_activeSourceLoad) {
            // Not mounted or a load is in progress. Apply properties later.
            return;
        }

        if (m_pendingProgressProp.has_value()) {
            m_player.SetProgress(m_pendingProgressProp.value());
            m_pendingProgressProp.reset();
        }

        if (m_pendingLoopProp.has_value() || m_pendingNativeLoopingProp.has_value()) {
            // Looping changed. We may need to reset playback to handle it.
            bool loopChanged = PropChanged(m_loop, m_pendingLoopProp);
            bool useNativeChanged = PropChanged(m_useNativeLooping, m_pendingNativeLoopingProp);

            ApplyProp(m_loop, m_pendingLoopProp);
            ApplyProp(m_useNativeLooping, m_pendingNativeLoopingProp);

            bool needsResetForLooping = useNativeChanged || (loopChanged && m_useNativeLooping);

            if (needsResetForLooping && m_player.IsPlaying()) {
                PlayInternal();
            }
        }
    }

    winrt::fire_and_forget LottieView::LoadSourceAsync() {
        // Use weak ref in case this control is removed from the page while we're loading.
        // We also keep a local handle to the load task we're trying to complete. If it doesn't match the 
        // member var after loading, we've moved on to loading different content and we can discard this load.
        auto weakThis = get_weak();
        auto activeSource = m_activeSourceLoad;

        try {
            auto source = co_await activeSource; // Finish loading the source and hop back onto UI thread (due to IAsyncOperation)

            if (auto strongThis = weakThis.get()) {
                if (activeSource == strongThis->m_activeSourceLoad) {
                    strongThis->HandleSourceLoaded(source);
                }
            }
        }
        catch (hresult_canceled const&) {}
    }

    void LottieView::HandleSourceLoaded(winrt::Microsoft::UI::Xaml::Controls::IAnimatedVisualSource const& source) {
        if (!IsLoaded()) {
            // We aren't mounted to the UI yet, so applying a source will error. Wait until we mount.
            m_activeSource = source;
            return;
        }

        // Apply source
        if (source) {
            m_player.Source(source);
        }
        else {
            m_player.ClearValue(winrt::Microsoft::UI::Xaml::Controls::AnimatedVisualPlayer::SourceProperty());
        }
        m_activeSourceLoad = nullptr;
        m_activeSource = nullptr;

        // Apply deferred properties
        ApplyProp(m_loop, m_pendingLoopProp);
        ApplyProp(m_useNativeLooping, m_pendingNativeLoopingProp);

        if (m_pendingProgressProp.has_value()) {
            m_player.SetProgress(m_pendingProgressProp.value());
            m_pendingProgressProp.reset();
        }

        // Apply deferred playback
        if (source && m_playOnLoad) {
            m_playOnLoad = false;
            PlayInternal();
        }
    }

    void LottieView::Play(int64_t from, int64_t to) {
        m_pendingProgressProp.reset();
        m_from = from;
        m_to = to;

        if (!IsLoaded() || m_activeSourceLoad) {
            m_playOnLoad = true;
        }
        else {
            PlayInternal();
        }
    }

    void LottieView::Pause() {
        m_playOnLoad = false;
        m_player.Pause();
    }
    void LottieView::Resume() {
        m_player.Resume();
    }
    void LottieView::Reset() {
        m_from = FRAME_UNSET;
        m_to = FRAME_UNSET;
        m_playOnLoad = false;
        m_pendingProgressProp.reset();

        ++m_activePlayId;
        m_player.Pause();
        m_player.SetProgress(0);
    }

    void LottieView::PlayInternal() {
        int64_t from = m_from;
        int64_t to = m_to;
        double normalizedFrom;
        double normalizedTo;

        // Convert from frame number to normalized time [0,1]
        if (from == FRAME_UNSET && to == FRAME_UNSET) {
            // Sentinel values. Play full range.
            normalizedFrom = 0;
            normalizedTo = 1;
        }
        else if (auto codegenSource = m_player.Source().try_as<LottieReactNative::ILottieMediaSource>()) {
            // Query media source for conversion
            normalizedFrom = codegenSource.FrameToProgress(static_cast<double>(from));
            normalizedTo = codegenSource.FrameToProgress(static_cast<double>(to));
        }
        else {
            // No metadata available. Use a reasonable default to convert from frames to time.
            static const double framesPerSecond = 30.0;
            const double totalFrames = std::max<double>(ticksToSeconds(m_player.Duration()) * framesPerSecond, 1.0);

            normalizedFrom = from / totalFrames;
            normalizedTo = to / totalFrames;
        }

        //
        // Starting a new play will stop any previous ones, but we don't want to trigger their Completed callbacks. Not only would it
        // fire events we don't want, when using manual looping it will infinitely recurse.
        // 
        // A simple solution is to store an ID for the current play. Completed can then bail if its ID doesn't match the latest play call.
        //
        int playId = ++m_activePlayId;
        m_player.Stop();

        // AnimatedVisualPlayer and Lottie have different behaviors when "from" > "to"
        //  Lottie                  - Start at "from" and play backwards to "to"
        //  AnimatedVisualPlayer    - Start at "from" and play forwards, looping around to "to"
        //
        // We want the Lottie behavior, so use a negative PlaybackRate to play in reverse
        if (normalizedFrom > normalizedTo) {
            std::swap(normalizedFrom, normalizedTo);
            m_player.PlaybackRate(-1 * std::abs(m_speed));
        }
        else {
            m_player.PlaybackRate(std::abs(m_speed));
        }

        // Using the player's native looping will result in smoother playback, but doesn't signal completion of a loop
        // or allow for entering/exiting looping state while playback is already underway.
        bool nativeLoop = m_loop && m_useNativeLooping;

        auto play = m_player.PlayAsync(normalizedFrom, normalizedTo, nativeLoop);
        play.Completed([weakThis = get_weak(), playId](const auto& /*asyncOp*/, const auto& status) {
            if (status == winrt::Windows::Foundation::AsyncStatus::Completed) {
                if (auto strongThis{ weakThis.get() }) {
                    if (strongThis->m_activePlayId == playId) {
                        strongThis->HandlePlayCompleted();
                    }
                }
            }
        });
    }

    void LottieView::HandlePlayCompleted() {
        if (m_loop) {
            m_reactContext.DispatchEvent(*this, L"onAnimationLoop");
            PlayInternal();
        }
        else {
            m_reactContext.DispatchEvent(*this, L"onAnimationFinish");
        }
    }
}