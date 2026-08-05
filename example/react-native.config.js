const project = (() => {
  try {
    const { configureProjects } = require("react-native-test-app");
    return configureProjects({
      android: {
        sourceDir: "android",
      },
      ios: {
        sourceDir: "ios",
        // `react-native-test-app` generates the Xcode project during
        // `pod install`, which the scripts here run explicitly. Leaving the
        // CLI's automatic pod installation on makes it run CocoaPods a second
        // time, and that path requires a Gemfile we do not have.
        automaticPodsInstallation: false,
      },
      windows: {
        sourceDir: "windows",
        solutionFile: "windows/Example.sln",
      },
    });
  } catch (_) {
    return undefined;
  }
})();

module.exports = {
  ...(project ? { project } : undefined),
};
