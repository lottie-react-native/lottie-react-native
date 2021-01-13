#pragma once
#include "LottieView.g.h"
#include <winrt/Windows.UI.Xaml.Controls.h>
#include <winrt/Windows.UI.Xaml.Media.h>
#include <winrt/Microsoft.UI.Xaml.Controls.h>
#include <winrt/Microsoft.ReactNative.h>
#include <winrt/LottieReactNative.h>
#include "ReactContext.h"

namespace winrt::LottieReactNative::implementation
{
    struct LottieView : LottieViewT<LottieView>
    {
    public:
        using Super = LottieViewT<LottieView>;
        const int64_t FRAME_UNSET = -1;

        LottieView();
        LottieView(winrt::Microsoft::ReactNative::IReactContext const& context, winrt::LottieReactNative::ILottieSourceProvider const& lottieSourceProvider);

        winrt::Windows::UI::Xaml::Media::Stretch ResizeMode();
        void ResizeMode(winrt::Windows::UI::Xaml::Media::Stretch resizeMode);

        void SetSpeed(double speed);
        void SetLoop(bool loop);
        void SetProgress(double progress);

        void SetSourceName(winrt::hstring const& name);
        void SetSourceJson(winrt::hstring const& json);

        void ApplyPropertyChanges();

        void Play(int64_t from, int64_t to);
        void Pause();
        void Resume();
        void Reset();

    private:
        winrt::Microsoft::ReactNative::ReactContext m_reactContext;
        winrt::LottieReactNative::ILottieSourceProvider m_lottieSourceProvider;
        winrt::Microsoft::UI::Xaml::Controls::AnimatedVisualPlayer m_player;
        winrt::Microsoft::UI::Xaml::Controls::AnimatedVisualPlayer::Loaded_revoker m_playerLoadedRevoker;
        int m_loop = false;

        // Values 
        winrt::Windows::Foundation::IAsyncOperation<winrt::Microsoft::UI::Xaml::Controls::IAnimatedVisualSource> m_pendingSourceLoad;
        winrt::Windows::Foundation::IAsyncOperation<winrt::Microsoft::UI::Xaml::Controls::IAnimatedVisualSource> m_activeSourceLoad;
        int64_t m_from = FRAME_UNSET;
        int64_t m_to = FRAME_UNSET;
        bool m_playOnLoad = false;
        std::optional<double> m_propProgress;
        std::optional<bool> m_propLoop;

        void OnPlayerMounted(winrt::Windows::Foundation::IInspectable const& sender, winrt::Windows::Foundation::IInspectable const& args);
        winrt::Windows::Foundation::IAsyncAction LoadSourceAsync();
        void HandleSourceLoaded(winrt::Microsoft::UI::Xaml::Controls::IAnimatedVisualSource const& source);
        void PlayInternal(int64_t from, int64_t to, bool loop);
    };
}

namespace winrt::LottieReactNative::factory_implementation
{
    struct LottieView : LottieViewT<LottieView, implementation::LottieView>
    {
    };
}