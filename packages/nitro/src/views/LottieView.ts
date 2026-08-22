import { getHostComponent, type HybridRef } from 'react-native-nitro-modules';

import LottieViewConfig from './LottieViewConfig.json';
import type {
  NativeLottieViewMethods,
  NativeLottieViewProps,
} from '../LottieView.nitro';

export const LottieView = getHostComponent<
  NativeLottieViewProps,
  NativeLottieViewMethods
>('LottieView', () => LottieViewConfig);

export type LottieViewRef = HybridRef<
  NativeLottieViewProps,
  NativeLottieViewMethods
>;
