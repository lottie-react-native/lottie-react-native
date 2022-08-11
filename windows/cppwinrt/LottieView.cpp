#include "pch.h"
#include "LottieView.h"
#include "LottieView.g.cpp"

namespace winrt::LottieReactNative::implementation
{
    constexpr double ticksToSeconds(winrt::TimeSpan ticks)
    {
        return std::chrono::duration_cast<std::chrono::duration<double, std::ratio<1>>>(ticks).count();
    }

    template<typename T>
    bool ApplyProp(T& member, std::optional<T>& value) {
        bool changed = false;
        if (value.has_value()) {
            changed = value.value() != member;
            member = value.value();
            value.reset();
        }
        return changed;
    }

    LottieView::LottieView() : Super() {
        FlowDirection(xaml::FlowDirection::LeftToRight);

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

    xaml::Media::Stretch LottieView::ResizeMode() {
        return m_player.Stretch();
    }

    void LottieView::ResizeMode(xaml::Media::Stretch resizeMode) {
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

    void LottieView::SetColorFilters(winrt::Windows::Foundation::Collections::IMapView<winrt::hstring, winrt::Windows::UI::Color> filters)
    {
        m_colorFilters = filters;
        m_colorFiltersChanged = true;
    }


    void LottieView::OnPlayerMounted(winrt::Windows::Foundation::IInspectable const& /*sender*/, winrt::Windows::Foundation::IInspectable const& /*args*/) {
        // Player was mounted into the XAML tree. If we have new source content that was waiting for mount,
        // we can now safely apply it to the player.
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
        bool progressChanged = ApplyProp(m_progress, m_pendingProgressProp);
        bool loopChanged = ApplyProp(m_loop, m_pendingLoopProp);
        bool useNativeChanged = ApplyProp(m_useNativeLooping, m_pendingNativeLoopingProp);

        if (m_pendingSourceProp) {
            // Source changed
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

        if (m_colorFiltersChanged) {
            ApplyColorFilters();
        }

        if (progressChanged) {
            ++m_activePlayId; // Prevent any active play's callback from running when we stop playback by seeking
            m_player.SetProgress(m_progress);
        }

        bool needsResetForLooping = useNativeChanged || (loopChanged && m_useNativeLooping);
        if (needsResetForLooping && m_player.IsPlaying()) {
            PlayInternal();
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

    void LottieView::HandleSourceLoaded(winrt::Microsoft::UI::Xaml::Controls::IAnimatedVisualSource source) {
        if (!IsLoaded()) {
            // We aren't mounted to the UI yet so applying a source will error. Wait until we mount.
            m_activeSource = source;
            return;
        }

        // Apply source
        if (source) {
            m_player.Source(source);

            auto codegenSource = source.try_as<LottieReactNative::ILottieMediaSource>();
            if (codegenSource) {
                m_sourceFrameCount = codegenSource.FrameCount();
            }
            else {
                // No metadata available. Use a reasonable default to convert from time to frames.
                // TODO: Fetch this from the JSON or have JS pass it in
                m_sourceFrameCount = std::max<double>(ticksToSeconds(m_player.Duration()) * 30, 1);
            }
            ApplyColorFilters();
        }
        else {
            m_player.ClearValue(winrt::Microsoft::UI::Xaml::Controls::AnimatedVisualPlayer::SourceProperty());
            m_sourceFrameCount = 0;
        }
        m_activeSourceLoad = nullptr;
        m_activeSource = nullptr;

        // Apply deferred playback
        if (source && m_playOnLoad) {
            m_playOnLoad = false;
            PlayInternal();
        }
        else {
            m_player.SetProgress(m_progress);
        }
    }

    void LottieView::ApplyColorFilters()
    {
        m_colorFiltersChanged = false;
        if (m_colorFilters) {
            if (auto codegenSource = m_player.Source().try_as<LottieReactNative::ILottieMediaSource>()) {
                for (auto const& item : m_colorFilters) {
                    codegenSource.SetColorProperty(item.Key(), item.Value());
                }
            }
            else if (auto visualSource2 = m_player.Source().try_as<winrt::Microsoft::UI::Xaml::Controls::IAnimatedVisualSource2>()) {
                // Requires WinUI 2.6+
                for (auto const& item : m_colorFilters) {
                    visualSource2.SetColorProperty(item.Key(), item.Value());
                }
            }
        }
    }

    void LottieView::Play(int64_t from, int64_t to) {
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
        m_playOnLoad = false;
        m_from = FRAME_UNSET;
        m_to = FRAME_UNSET;

        ++m_activePlayId;
        m_player.Pause();
        m_player.SetProgress(0);
    }

    void LottieView::PlayInternal() {
        int64_t from = m_from;
        int64_t to = m_to;
        double normalizedFrom;
        double normalizedTo;

        if (m_sourceFrameCount == 0) {
            return;
        }

        // Convert from frame number to normalized time [0,1]
        if (from == FRAME_UNSET) {
            normalizedFrom = 0.0;
        }
        else
        {
            normalizedFrom = static_cast<double>(from) / m_sourceFrameCount;
        }

        if (to == FRAME_UNSET) {
            normalizedTo = 1.0;
        }
        else
        {
            normalizedTo = static_cast<double>(to) / m_sourceFrameCount;
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
        if (from > to) {
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