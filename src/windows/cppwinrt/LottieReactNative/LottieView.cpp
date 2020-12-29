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

    bool LottieView::AutoPlay() {
        return m_player.AutoPlay();
    }

    void LottieView::AutoPlay(bool autoPlay) {
        m_player.AutoPlay(autoPlay);
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
            m_player.Source(source);
        }
        else {
            m_player.ClearValue(winrt::Microsoft::UI::Xaml::Controls::AnimatedVisualPlayer::SourceProperty());
        }
    }

    void LottieView::Play(double from, double to) {
        m_from = from;
        m_to = to;

        auto play = m_player.PlayAsync(from, to, m_loop);

        if (!m_loop) {
            play.Completed([weakThis = get_weak()](const auto& asyncOp, const auto& status) {
                if (status == winrt::Windows::Foundation::AsyncStatus::Completed) {
                    if (auto strongThis{ weakThis.get() }) {
                        strongThis->m_reactContext.DispatchEvent(*strongThis, L"onAnimationFinish");
                    }
                }
            });
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
}