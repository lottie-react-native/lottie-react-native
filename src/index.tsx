import { NitroModules } from 'react-native-nitro-modules';
import type { LottieReactNative } from './LottieReactNative.nitro';

const LottieReactNativeHybridObject =
  NitroModules.createHybridObject<LottieReactNative>('LottieReactNative');

export function multiply(a: number, b: number): number {
  return LottieReactNativeHybridObject.multiply(a, b);
}
