/**
 * Metro configuration for React Native
 * https://github.com/facebook/react-native
 *
 * @format
 */

module.exports = {
  transformer: {
    getTransformOptions: async () => ({
      transform: {
        experimentalImportSupport: false,
        inlineRequires: true,
      },
    }),
  },
  resolver: {
    /**
     * Returns a regular expression for modules that should be ignored by the
     * packager on a given platform.
     */
    blockList: /_book\//,
  },
};
