using Microsoft.ReactNative;

namespace LottieReactNativeWindows
{
    public class ReactPackageProvider : IReactPackageProvider
    {
        public void CreatePackage(IReactPackageBuilder packageBuilder)
        {
            packageBuilder.AddViewManager("LottieAnimationView", () => {
                return new LottieAnimationViewManager();
            });
        }
    }
}
