const path = require('path');
const { getConfig } = require('react-native-builder-bob/babel-config');
const pkg = require('lottie-react-native/package.json');

const root = path.resolve(__dirname, '..');

module.exports = getConfig(
  {
    presets: ['module:@react-native/babel-preset'],
  },
  { root, pkg }
);
