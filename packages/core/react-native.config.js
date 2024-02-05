let supportsCodegenConfig = false;
try {
  const rnCliAndroidVersion =
    require('@react-native-community/cli-platform-android/package.json').version;
  const [major] = rnCliAndroidVersion.split('.');
  supportsCodegenConfig = major >= 9;
} catch (e) {
  // ignore
}

module.exports = {
  dependency: {
    platforms: {
      android: supportsCodegenConfig
        ? {
            libraryName: 'lottiereactnative',
            componentDescriptors: ['LottieAnimationViewComponentDescriptor'],
          }
        : {},
      macos: null,
      windows: {
        sourceDir: 'windows',
        solutionFile: 'cppwinrt/LottieReactNative.sln',
        projects: [
          {
            projectFile: 'cppwinrt/LottieReactNative.vcxproj',
            directDependency: false,
          },
        ],
      },
    },
  },
};
