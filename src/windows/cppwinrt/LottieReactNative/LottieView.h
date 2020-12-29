#pragma once
#include "LottieView.g.h"
#include <winrt\Windows.UI.Xaml.Controls.h>
#include <winrt\Windows.UI.Xaml.Media.h>
#include <winrt\Microsoft.UI.Xaml.Controls.h>
#include <winrt\Microsoft.ReactNative.h>
#include "ReactContext.h"

namespace winrt::LottieReactNative::implementation
{
    struct LottieView : LottieViewT<LottieView>
    {
    public:
        using Super = LottieViewT<LottieView>;

        LottieView();
        LottieView(winrt::Microsoft::ReactNative::IReactContext const& context);

        bool Loop();
        void Loop(bool loop);
        bool AutoPlay();
        void AutoPlay(bool autoPlay);
        double Speed();
        void Speed(double speed);
        void SetProgress(double progress);
        winrt::Windows::UI::Xaml::Media::Stretch ResizeMode();
        void ResizeMode(winrt::Windows::UI::Xaml::Media::Stretch resizeMode);
        winrt::Microsoft::UI::Xaml::Controls::IAnimatedVisualSource Source();
        void Source(winrt::Microsoft::UI::Xaml::Controls::IAnimatedVisualSource source);

        void Play(double from, double to);
        void Pause();
        void Resume();
        void Reset();

    private:
        winrt::Microsoft::ReactNative::ReactContext m_reactContext;
        winrt::Microsoft::UI::Xaml::Controls::AnimatedVisualPlayer m_player;
        bool m_loop;
        bool m_autoPlay;
        double m_from;
        double m_to;
        winrt::hstring m_sourceName;
    };
}

namespace winrt::LottieReactNative::factory_implementation
{
    struct LottieView : LottieViewT<LottieView, implementation::LottieView>
    {
    };
}