import { parseColorToHex, parsePossibleSources } from './utils';
import type { LottieViewProps } from '../types';
import type { FC } from 'react';
import { getHostComponent } from 'react-native-nitro-modules';
import type {
  NativeCommands,
  NativeProps,
} from '../specs/LottieReactNative.nitro';
import LottieAnimationViewConfig from '../../nitrogen/generated/shared/json/LottieAnimationViewConfig.json';

const LottieAnimationView = getHostComponent<NativeProps, NativeCommands>(
  'LottieAnimationView',
  () => LottieAnimationViewConfig
);

export const LottieView: FC<LottieViewProps> = ({}) => {
  return (
    <LottieAnimationView
      {...parsePossibleSources(source)}
      autoPlay={true} // Temporary till i create the callback wrappers and allow passing ref
      loop={isLoop}
      style={styles.lottie}
      resizeMode={'NOT_SET'}
      renderMode={'NOT_SET'}
      enableMergePathsAndroidForKitKatAndAbove
      enableSafeModeAndroid
      colorFilters={colorFilter.map((item) => ({
        ...item,
        color: parseColorToHex(item.color),
      }))}
      // onAnimationLoaded={{
      //   f: () => {
      //     console.log('Lottie loaded');
      //   },
      // }}
      // onAnimationFailure={{
      //   f: (error) => {
      //     console.log(`Lottie Errored: ${error}`);
      //   },
      // }}
      // onAnimationFinish={{
      //   f: (isCancelled) => {
      //     console.log(
      //       `Lottie Finished with isCancelled set to ${isCancelled}`
      //     );
      //   },
      // }}
    />
  );
};
