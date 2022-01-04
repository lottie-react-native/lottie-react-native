module.exports = {
  dependency: {
    platforms: {
      android: {
        sourceDir: './src/android',
      },
      windows: {
        sourceDir: './src/windows',
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
  project: {
    android: {
      sourceDir: './example/android',
    },
  },
};
