module.exports = {
  dependency: {
    platforms: {
      android: {
        sourceDir: './src/android',
      },
      windows: {
        sourceDir: './src/windows',
        solutionFile: 'LottieReactNative.sln',
        projects: [
          {
            projectFile: 'LottieReactNative\\LottieReactNative.csproj',
            directDependency: true,
          },
        ],
      },
    },
  },
};
