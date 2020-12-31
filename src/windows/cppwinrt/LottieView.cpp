#include "pch.h"
#include "LottieView.h"
#include "LottieView.g.cpp"
#include <winrt/Windows.Foundation.h>
#include <winrt/Windows.UI.Xaml.h>
#include <winrt/Microsoft.UI.Xaml.Controls.h>

namespace winrt::LottieReactNative::implementation
{
    LottieView::LottieView() : Super() {
        FlowDirection(winrt::Windows::UI::Xaml::FlowDirection::LeftToRight);

        m_player = winrt::Microsoft::UI::Xaml::Controls::AnimatedVisualPlayer();
        m_player.AutoPlay(false);
        //m_player.HorizontalAlignment(winrt::Windows::UI::Xaml::HorizontalAlignment::Stretch);
        //m_player.VerticalAlignment(winrt::Windows::UI::Xaml::VerticalAlignment::Stretch);
        m_playerLoadedRevoker = m_player.Loaded(winrt::auto_revoke, { get_weak(), &LottieView::OnPlayerMounted });
        Children().Append(m_player);
    }

    LottieView::LottieView(winrt::Microsoft::ReactNative::IReactContext const& context) : LottieView()
    {
        m_reactContext = context;
    }

    bool LottieView::Loop() {
        return m_loop;
    }

    void LottieView::Loop(bool loop) {
        if (m_loop != loop) {
            m_loop = loop;
            if (m_player.IsPlaying()) {
                // Restart with looping enabled
                Reset();
                Play(m_from, m_to);
            }
        }
    }

    double LottieView::Speed() {
        return m_player.PlaybackRate();
    }

    void LottieView::Speed(double speed) {
        m_player.PlaybackRate(speed);
    }

    void LottieView::SetProgress(double position) {
        m_player.SetProgress(position);
    }

    winrt::Windows::UI::Xaml::Media::Stretch LottieView::ResizeMode() {
        return m_player.Stretch();
    }

    void LottieView::ResizeMode(winrt::Windows::UI::Xaml::Media::Stretch resizeMode) {
        m_player.Stretch(resizeMode);
    }

    winrt::Microsoft::UI::Xaml::Controls::IAnimatedVisualSource LottieView::Source() {
        return m_player.Source();
    }

    void LottieView::Source(winrt::Microsoft::UI::Xaml::Controls::IAnimatedVisualSource source) {
        if (source) {
            if (m_player.IsLoaded()) {
                m_player.Source(source);
            }
            else {
                m_sourceToLoad = source;
            }
        }
        else {
            m_player.ClearValue(winrt::Microsoft::UI::Xaml::Controls::AnimatedVisualPlayer::SourceProperty());
            m_sourceToLoad = nullptr;
        }
    }

    constexpr double ticksToSeconds(winrt::TimeSpan ticks)
    {
        return std::chrono::duration_cast<std::chrono::duration<double, std::ratio<1>>>(ticks).count();
    }

    void LottieView::Play(int64_t from, int64_t to) {
        if (from == -1 && to == -1) {
            m_from = 0;
            m_to = 1;
        }
        else {
            static const double framesPerSecond = 60.0;
            const double totalFrames = std::max<double>(ticksToSeconds(m_player.Duration()) * framesPerSecond, 1.0);

            m_from = from / totalFrames;
            m_to = to / totalFrames;
        }

        if (!m_player.IsLoaded()) {
            m_playOnLoad = true;
        }
        else {
            PlayInternal();
        }
    }

    void LottieView::Pause() {
        m_player.Pause();
    }
    void LottieView::Resume() {
        m_player.Resume();
    }
    void LottieView::Reset() {
        m_player.Stop();
    }

    void LottieView::OnPlayerMounted(winrt::Windows::Foundation::IInspectable const& sender, winrt::Windows::Foundation::IInspectable const& args) {
        if (m_sourceToLoad) {
            m_player.Source(m_sourceToLoad);
            m_sourceToLoad = nullptr;
        }

        if (m_playOnLoad) {
            m_playOnLoad = false;
            PlayInternal();
        }
    }

    void LottieView::PlayInternal() {
        auto play = m_player.PlayAsync(m_from, m_to, m_loop);

        if (!m_loop) {
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