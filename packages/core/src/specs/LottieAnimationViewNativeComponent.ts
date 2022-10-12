import type {
  BubblingEventHandler,
  Int32,
  Double,
  Float,
} from 'react-native/Libraries/Types/CodegenTypes';
import codegenNativeComponent from 'react-native/Libraries/Utilities/codegenNativeComponent';
import codegenNativeCommands from 'react-native/Libraries/Utilities/codegenNativeCommands';
import type { ViewProps, HostComponent } from 'react-native';

type OnAnimationFinishEvent = Readonly<{
  isCancelled: boolean;
}>;

// The following types need more work to actually work with the new arch
/* type ColorFilter = Readonly<{
  keypath: string;
  color: Int32;
}>;

type TextFilterAndroid = Readonly<{
  find: string;
  replace: string;
}>;

type TextFilterIOS = Readonly<{
  keypath: string;
  text: string;
}>; */

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
  cacheComposition?: boolean;
  colorFilters?: ReadonlyArray<string>;
  textFiltersAndroid?: ReadonlyArray<string>;
  textFiltersIOS?: ReadonlyArray<string>;
  onAnimationFinish?: BubblingEventHandler<
    OnAnimationFinishEvent,
    'onAnimationFinish'
  >;
}

type LottieViewNativeComponentType = HostComponent<NativeProps>;

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

export default codegenNativeComponent<NativeProps>(
  'LottieAnimationView',
) as HostComponent<NativeProps>;
