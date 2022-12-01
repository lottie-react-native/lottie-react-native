import type {
  BubblingEventHandler,
  Int32,
  Double,
  Float,
} from 'react-native/Libraries/Types/CodegenTypes';
import codegenNativeComponent, {
  NativeComponentType,
} from 'react-native/Libraries/Utilities/codegenNativeComponent';
import codegenNativeCommands from 'react-native/Libraries/Utilities/codegenNativeCommands';
import type { ViewProps } from 'react-native';

export type OnAnimationFinishEvent = Readonly<{
  isCancelled: boolean;
}>;

export interface NativeProps extends ViewProps {
  resizeMode?: string;
  renderMode?: string;
  sourceName?: string;
  sourceJson?: string;
  sourceURL?: string;
  imageAssetsFolder?: string;
  progress?: Float;
  speed?: Double;
  loop?: boolean;
  enableMergePathsAndroidForKitKatAndAbove?: boolean;
  hardwareAccelerationAndroid?: boolean;
  cacheComposition?: boolean;
  colorFilters?: ReadonlyArray<string>;
  textFiltersAndroid?: ReadonlyArray<string>;
  textFiltersIOS?: ReadonlyArray<string>;
  onAnimationFinish?: BubblingEventHandler<
    OnAnimationFinishEvent,
    'onAnimationFinish'
  >;
}

type LottieViewNativeComponentType = NativeComponentType<NativeProps>;

interface NativeCommands {
  play: (
    viewRef: React.ElementRef<LottieViewNativeComponentType>,
    startFrame: Int32,
    endFrame: Int32,
  ) => void;
  reset: (viewRef: React.ElementRef<LottieViewNativeComponentType>) => void;
  pause: (viewRef: React.ElementRef<LottieViewNativeComponentType>) => void;
  resume: (viewRef: React.ElementRef<LottieViewNativeComponentType>) => void;
}

export const Commands: NativeCommands = codegenNativeCommands<NativeCommands>({
  supportedCommands: ['play', 'reset', 'pause', 'resume'],
});

export default codegenNativeComponent<NativeProps>('LottieAnimationView');
