const path = require('path');
const { makeMetroConfig } = require("@rnx-kit/metro-config");
const {getDefaultConfig} = require('@react-native/metro-config')

const defaultConfig = getDefaultConfig(__dirname);

const root = path.resolve(__dirname, '../packages/core/');
const pack = require('../packages/core/package.json');

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
    // In order to import dotLottie assets, we will need this
    assetExts: [...defaultConfig.resolver.assetExts, 'lottie'],
    unstable_enableSymlinks: true,
    extraNodeModules: modules.reduce((acc, name) => {
      acc[name] = path.join(__dirname, 'node_modules', name);
      return acc;
    }, {}),
  },
  watchFolders: [root],
});
