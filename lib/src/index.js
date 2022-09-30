export let isFabricEnabled = false;

export function enableFabricForLottieReactNative(shouldEnableFabric = true) {
  isFabricEnabled = shouldEnableFabric;
}

export default require('./LottieView');
