import { getHostComponent, type HybridRef } from 'react-native-nitro-modules';

import LottieViewConfig from '../../nitrogen/generated/shared/json/LottieViewConfig.json';
import type {
  NativeLottieViewMethods,
  NativeLottieViewProps,
} from '../LottieView.nitro';

/**
 * The raw Nitro host component. Internal — consumers get the wrapper in
 * `../LottieView`, which presents v7's public API.
 */
export const LottieView = getHostComponent<
  NativeLottieViewProps,
  NativeLottieViewMethods
>('LottieView', () => LottieViewConfig);

export type LottieViewRef = HybridRef<
  NativeLottieViewProps,
  NativeLottieViewMethods
>;
