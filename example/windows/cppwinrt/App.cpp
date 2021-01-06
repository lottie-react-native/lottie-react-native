#include "pch.h"

#include "App.h"

#include <winrt/Windows.ApplicationModel.h>
#include <winrt/Windows.ApplicationModel.Activation.h>
#include <winrt/Windows.UI.Xaml.h>
#include <winrt/Microsoft.UI.Xaml.Controls.h>
#include <winrt/Microsoft.ReactNative.h>
#include <winrt/LottieReactNative.h>
#include <winrt/AnimatedVisuals.h>

#include "Animations/LottieSourceProvider.g.cpp"

namespace winrt {
    using namespace winrt::Windows::UI::Xaml;
    using namespace winrt::Windows::ApplicationModel;
    using namespace winrt::Windows::ApplicationModel::Activation;
}

namespace winrt::Example::implementation {
    /// <summary>
    /// Initializes the singleton application object.  This is the first line of
    /// authored code executed, and as such is the logical equivalent of main() or
    /// WinMain().
    /// </summary>
    App::App() noexcept
    {
#if BUNDLE
        JavaScriptBundleFile(L"index.windows");
        InstanceSettings().UseWebDebugger(false);
        InstanceSettings().UseFastRefresh(false);
#else
        JavaScriptMainModuleName(L"example/js/index");
        InstanceSettings().UseWebDebugger(true);
        InstanceSettings().UseFastRefresh(true);
#endif

#if _DEBUG
        InstanceSettings().EnableDeveloperMenu(true);
#else
        InstanceSettings().EnableDeveloperMenu(false);
#endif

        // RegisterAutolinkedNativeModulePackages(PackageProviders()); // Includes any autolinked modules

        PackageProviders().Append(winrt::LottieReactNative::ReactPackageProvider(winrt::make<winrt::LottieReactNative::LottieCodegenSourceProvider>()));

        InitializeComponent();
    }

    void App::OnLaunched(winrt::LaunchActivatedEventArgs const& e) {
        super::OnLaunched(e);

        auto rootView = winrt::Window::Current().Content();
        auto reactRoot = rootView.try_as<Microsoft::ReactNative::ReactRootView>();

        if (reactRoot == nullptr) {
            reactRoot = Microsoft::ReactNative::ReactRootView();
            reactRoot.ReactNativeHost(Host());
            reactRoot.ComponentName(L"example");

            winrt::Window::Current().Content(reactRoot);
        }
    }

}