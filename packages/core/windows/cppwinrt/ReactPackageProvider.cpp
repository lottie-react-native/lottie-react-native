#include "pch.h"
#include "ReactPackageProvider.h"
#include "ReactPackageProvider.g.cpp"

#include "LottieAnimationViewManager.h"

namespace winrt::LottieReactNative::implementation
{
    ReactPackageProvider::ReactPackageProvider(winrt::LottieReactNative::ILottieSourceProvider lottieSourceProvider) : Super(), m_lottieSourceProvider(lottieSourceProvider) {

    }

    void ReactPackageProvider::CreatePackage(winrt::Microsoft::ReactNative::IReactPackageBuilder const& packageBuilder) noexcept
    {
        packageBuilder.AddViewManager(L"LottieAnimationViewManager", [lottieSourceProvider = m_lottieSourceProvider]() {
            return winrt::make<LottieAnimationViewManager>(lottieSourceProvider);
        });
    }
}