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
        m_player.PlaybackRate(speed);
    }

    winrt::Windows::UI::Xaml::Media::Stretch LottieView::ResizeMode() {
        return m_player.Stretch();
    }

    void LottieView::ResizeMode(winrt::Windows::UI::Xaml::Media::Stretch resizeMode) {
        m_player.Stretch(resizeMode);
    }

    void LottieView::SetProgress(double position) {
        m_propProgress = position;
    }

    void LottieView::SetLoop(bool loop) {
        m_propLoop = loop;
    }

    void LottieView::SetSourceName(winrt::hstring const& name) {
        if (m_pendingSourceLoad) {
            m_pendingSourceLoad.Cancel();
        }
        m_pendingSourceLoad = m_lottieSourceProvider.GetSourceFromName(name);
    }
    void LottieView::SetSourceJson(winrt::hstring const& json) {
        if (m_pendingSourceLoad) {
            m_pendingSourceLoad.Cancel();
        }
        m_pendingSourceLoad = m_lottieSourceProvider.GetSourceFromJson(json);
    }

    void LottieView::OnPlayerMounted(winrt::Windows::Foundation::IInspectable const& /*sender*/, winrt::Windows::Foundation::IInspectable const& /*args*/) {
        ApplyPropertyChanges();
    }

    void LottieView::ApplyPropertyChanges() {
        if (!IsLoaded()) {
            // Player hasn't been mounted in the UI tree yet. We'll apply props once it has.
            return;
        }

        if (m_pendingSourceLoad) {
            // Source changed. We'll defer applying other properties until it has finished loading.
            if (m_activeSourceLoad) {
                m_activeSourceLoad.Cancel();
            }
            m_activeSourceLoad = m_pendingSourceLoad;
            m_pendingSourceLoad = nullptr;

            m_from = FRAME_UNSET;
            m_to = FRAME_UNSET;
            m_loop = m_propLoop.value_or(m_loop);
            m_propLoop.reset();

            LoadSourceAsync();
            return;
        }
        
        if (m_propLoop.has_value()) {
            bool changed = m_propLoop != m_loop;
            m_loop = m_propLoop.value();
            m_propLoop.reset();

            // If we're already playing, we need to restart for the change to take effect
            if (changed && m_player.IsPlaying()) {
                Reset();
                PlayInternal(m_from, m_to, m_loop);
                return;
            }
        } 
        
        if (m_propProgress.has_value()) {
            m_player.SetProgress(m_propProgress.value());
            m_propProgress.reset();
        }
    }

    winrt::Windows::Foundation::IAsyncAction LottieView::LoadSourceAsync() {
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
        if (source) {
            m_player.Source(source);
            if (m_playOnLoad) {
                PlayInternal(m_from, m_to, m_loop);
            } 
            else if (m_propProgress.has_value() && m_propProgress.value() != 0) {
                m_player.SetProgress(m_propProgress.value());
            }
        }
        else {
            m_player.ClearValue(winrt::Microsoft::UI::Xaml::Controls::AnimatedVisualPlayer::SourceProperty());
        }
        m_activeSourceLoad = nullptr;
        m_playOnLoad = false;
        m_propProgress.reset();
    }

    void LottieView::Play(int64_t from, int64_t to) {
        if (!m_player.IsLoaded() || m_activeSourceLoad) {
            m_playOnLoad = true;
            m_from = from;
            m_to = to;
            return;
        }
        else {
            PlayInternal(from, to, m_loop);
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
        m_propProgress.reset();
        m_player.Pause();
        m_player.SetProgress(0);
    }

    void LottieView::PlayInternal(int64_t from, int64_t to, bool loop) {
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

        auto play = m_player.PlayAsync(normalizedFrom, normalizedTo, loop);

        if (!loop) {
            play.Completed([weakThis = get_weak()](const auto& /*asyncOp*/, const auto& status) {
                if (status == winrt::Windows::Foundation::AsyncStatus::Completed) {
                    if (auto strongThis{ weakThis.get() }) {
                        strongThis->m_reactContext.DispatchEvent(*strongThis, L"onAnimationFinish");
                    }
                }
            });
        }
    }
}