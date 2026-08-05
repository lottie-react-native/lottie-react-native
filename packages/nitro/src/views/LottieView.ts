import { getHostComponent, type HybridRef } from 'react-native-nitro-modules';

import LottieViewConfig from '../../nitrogen/generated/shared/json/LottieViewConfig.json';
import type { LottieViewMethods, LottieViewProps } from '../LottieView.nitro';

export const LottieView = getHostComponent<LottieViewProps, LottieViewMethods>(
  'LottieView',
  () => LottieViewConfig,
);

export type LottieViewRef = HybridRef<LottieViewProps, LottieViewMethods>;
