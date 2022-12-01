module.exports = {
  extends: ['@react-native-community'],
  plugins: ['@react-native/eslint-plugin-specs'],
  rules: {
    'react-native/no-inline-styles': 'off',
    '@react-native/specs/react-native-modules': 'error',
  },
  overrides: [
    {
      files: ['src/specs/**/*.js'],
      rules: {
        '@react-native/specs/react-native-modules': 'error',
      },
    },
  ],
};
