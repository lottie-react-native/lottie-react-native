using Microsoft.ReactNative;
using Microsoft.ReactNative.Managed;

namespace LottieReactNative
{
    public sealed partial class ReactPackageProvider : IReactPackageProvider
    {
        public void CreatePackage(IReactPackageBuilder packageBuilder)
        {
            packageBuilder.AddViewManager(nameof(LottieAnimationViewManager), () => new LottieAnimationViewManager());
        }

        /// <summary>
        /// This method is implemented by the C# code generator
        /// </summary>
        partial void CreatePackageImplementation(IReactPackageBuilder packageBuilder);
    }
}
