const path = require('path');
const { makeMetroConfig } = require("@rnx-kit/metro-config");
module.exports = makeMetroConfig({
  transformer: {
    getTransformOptions: async () => ({
      transform: {
        experimentalImportSupport: false,
        inlineRequires: false,
      },
    }),
  },
  watchFolders: [path.join(__dirname, 'node_modules', 'lottie-react-native')],
});
