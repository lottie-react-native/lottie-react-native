#pragma once
#include <winrt/Windows.UI.Xaml.h>
#include <winrt/Microsoft.ReactNative.h>
#include <winrt/LottieReactNative.h>

namespace winrt::LottieReactNative::implementation {

    struct LottieAnimationViewManager : winrt::implements<
        LottieAnimationViewManager,
        winrt::Microsoft::ReactNative::IViewManager,
        winrt::Microsoft::ReactNative::IViewManagerWithReactContext,
        winrt::Microsoft::ReactNative::IViewManagerWithNativeProperties,
        winrt::Microsoft::ReactNative::IViewManagerWithCommands,
        winrt::Microsoft::ReactNative::IViewManagerWithExportedViewConstants,
        winrt::Microsoft::ReactNative::IViewManagerWithExportedEventTypeConstants> {
    public:
        LottieAnimationViewManager(winrt::LottieReactNative::ILottieSourceProvider lottieSourceProvider);

        // IViewManager
        winrt::hstring Name() noexcept;
        winrt::Windows::UI::Xaml::FrameworkElement CreateView() noexcept;

        // IViewManagerWithReactContext
        winrt::Microsoft::ReactNative::IReactContext ReactContext() noexcept;
        void ReactContext(winrt::Microsoft::ReactNative::IReactContext reactContext) noexcept;

        // IViewManagerWithNativeProperties
        winrt::Windows::Foundation::Collections::IMapView<winrt::hstring, winrt::Microsoft::ReactNative::ViewManagerPropertyType>
            NativeProps() noexcept;

        void UpdateProperties(
            winrt::Windows::UI::Xaml::FrameworkElement const& view,
            winrt::Microsoft::ReactNative::IJSValueReader const& propertyMapReader) noexcept;

        // IViewManagerWithCommands
        winrt::Windows::Foundation::Collections::IVectorView<winrt::hstring> Commands() noexcept;

        void DispatchCommand(
            winrt::Windows::UI::Xaml::FrameworkElement const& view,
            winrt::hstring command,
            winrt::Microsoft::ReactNative::IJSValueReader const& commandArgsReader) noexcept;

        // IViewManagerWithExportedViewConstants
        winrt::Microsoft::ReactNative::ConstantProviderDelegate ExportedViewConstants() noexcept;

        // IViewManagerWithExportedEventTypeConstants
        winrt::Microsoft::ReactNative::ConstantProviderDelegate ExportedCustomBubblingEventTypeConstants() noexcept;
        winrt::Microsoft::ReactNative::ConstantProviderDelegate ExportedCustomDirectEventTypeConstants() noexcept;

    private:
        winrt::Microsoft::ReactNative::IReactContext m_reactContext;
        winrt::LottieReactNative::ILottieSourceProvider m_lottieSourceProvider;
    };

}