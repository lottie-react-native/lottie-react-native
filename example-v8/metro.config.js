const path = require("path");
const { makeMetroConfig } = require("@rnx-kit/metro-config");
const { getDefaultConfig } = require("@react-native/metro-config");

const defaultConfig = getDefaultConfig(__dirname);

const root = path.resolve(__dirname, "../packages/nitro/");
const pack = require("../packages/nitro/package.json");

const modules = Object.keys(pack.peerDependencies);

module.exports = makeMetroConfig({
  transformer: {
    getTransformOptions: async () => ({
      transform: {
        experimentalImportSupport: false,
        inlineRequires: false,
      },
    }),
  },
  resolver: {
    assetExts: [...defaultConfig.resolver.assetExts, "lottie"],
    unstable_enableSymlinks: true,
    extraNodeModules: modules.reduce((acc, name) => {
      acc[name] = path.join(__dirname, "node_modules", name);
      return acc;
    }, {}),
  },
  watchFolders: [root],
});
