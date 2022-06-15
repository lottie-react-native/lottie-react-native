#pragma once

#include "ReactPackageProvider.g.h"
#include <winrt\Microsoft.ReactNative.h>

namespace winrt::LottieReactNative::implementation
{
    struct ReactPackageProvider : ReactPackageProviderT<ReactPackageProvider>
    {
    public:
        using Super = ReactPackageProviderT<ReactPackageProvider>;

        ReactPackageProvider(winrt::LottieReactNative::ILottieSourceProvider lottieSourceProvider);

        void CreatePackage(winrt::Microsoft::ReactNative::IReactPackageBuilder const& packageBuilder) noexcept;

    private:
        winrt::LottieReactNative::ILottieSourceProvider m_lottieSourceProvider;
    };
}

namespace winrt::LottieReactNative::factory_implementation
{
    struct ReactPackageProvider : ReactPackageProviderT<ReactPackageProvider, implementation::ReactPackageProvider>
    {
    };
}
