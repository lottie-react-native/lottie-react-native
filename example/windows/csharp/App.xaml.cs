using Microsoft.ReactNative;
using Microsoft.UI.Xaml.Controls;
using Windows.ApplicationModel.Activation;
using Windows.UI.Xaml;

namespace Example
{
    /// <summary>
    /// Provides application-specific behavior to supplement the default Application class.
    /// </summary>
    sealed partial class App : ReactApplication
    {
        /// <summary>
        /// Initializes the singleton application object.  This is the first line of authored code
        /// executed, and as such is the logical equivalent of main() or WinMain().
        /// </summary>
        public App()
        {
#if BUNDLE
            JavaScriptBundleFile = "index.windows";
            InstanceSettings.UseWebDebugger = false;
            InstanceSettings.UseFastRefresh = false;
#else
            JavaScriptBundleFile = "example/js/index";
            InstanceSettings.UseWebDebugger = true;
            InstanceSettings.UseFastRefresh = true;
#endif

#if DEBUG
            InstanceSettings.UseDeveloperSupport = true;
#else
            InstanceSettings.UseDeveloperSupport = false;
#endif
            //Microsoft.ReactNative.Managed.AutolinkedNativeModules.RegisterAutolinkedNativeModulePackages(PackageProviders); // Includes any autolinked modules

            PackageProviders.Add(new Microsoft.ReactNative.Managed.ReactPackageProvider()); // Includes any modules in this project
            PackageProviders.Add(new ReactNativePicker.ReactPackageProvider());
            PackageProviders.Add(new SliderWindows.ReactPackageProvider());
            PackageProviders.Add(new LottieReactNative.ReactPackageProvider(new AnimatedVisuals.LottieCodegenSourceProvider()));
            
            InitializeComponent();
        }

        protected override void OnLaunched(LaunchActivatedEventArgs args)
        {
            base.OnLaunched(args);

            var rootView = Window.Current.Content as ReactRootView;
            if (rootView == null)
            {
                rootView = new ReactRootView();
                rootView.ReactNativeHost = this.Host;
                rootView.ComponentName = "example";
                Window.Current.Content = rootView;
            }
            Window.Current.Activate();
        }
    }
}
