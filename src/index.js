export let isFabricEnabled = false;

export function enableFabricForLottieReactNative(shouldEnableFabric = true) {
  isFabricEnabled = shouldEnableFabric;
}

module.exports = require('./LottieView');
