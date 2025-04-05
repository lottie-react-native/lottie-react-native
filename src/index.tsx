import { getHostComponent } from 'react-native-nitro-modules';
import LottieAnimationViewConfig from '../nitrogen/generated/shared/json/LottieAnimationViewConfig.json';
import type { NativeProps, NativeCommands } from './LottieReactNative.nitro';

export const LottieAnimationView = getHostComponent<
  NativeProps,
  NativeCommands
>('LottieAnimationView', () => LottieAnimationViewConfig);
