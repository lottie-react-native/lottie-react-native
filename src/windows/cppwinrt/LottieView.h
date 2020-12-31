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
        double Speed();
        void Speed(double speed);
        void SetProgress(double progress);
        winrt::Windows::UI::Xaml::Media::Stretch ResizeMode();
        void ResizeMode(winrt::Windows::UI::Xaml::Media::Stretch resizeMode);
        winrt::Microsoft::UI::Xaml::Controls::IAnimatedVisualSource Source();
        void Source(winrt::Microsoft::UI::Xaml::Controls::IAnimatedVisualSource source);

        void Play(int64_t from, int64_t to);
        void Pause();
        void Resume();
        void Reset();

    private:
        winrt::Microsoft::ReactNative::ReactContext m_reactContext;
        winrt::Microsoft::UI::Xaml::Controls::AnimatedVisualPlayer m_player;
        winrt::Microsoft::UI::Xaml::Controls::IAnimatedVisualSource m_sourceToLoad;
        winrt::Microsoft::UI::Xaml::Controls::AnimatedVisualPlayer::Loaded_revoker m_playerLoadedRevoker;
        bool m_loop = false;
        bool m_playOnLoad = false;
        double m_from = 0;
        double m_to = 1;
        winrt::hstring m_sourceName;

        void OnPlayerMounted(winrt::Windows::Foundation::IInspectable const& sender, winrt::Windows::Foundation::IInspectable const& args);
        void PlayInternal();
    };
}

namespace winrt::LottieReactNative::factory_implementation
{
    struct LottieView : LottieViewT<LottieView, implementation::LottieView>
    {
    };
}