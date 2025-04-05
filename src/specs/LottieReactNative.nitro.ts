import type {
  HybridRef,
  HybridView,
  HybridViewMethods,
  HybridViewProps,
} from 'react-native-nitro-modules';

type ColorFilterStruct = {
  keypath: string;
  color: string;
};

type TextFilterIOSStruct = {
  keypath: string;
  text: string;
};

type TextFilterAndroidStruct = {
  find: string;
  replace: string;
};

export interface NativeProps extends HybridViewProps {
  resizeMode?: string;
  renderMode?: string;
  sourceName?: string;
  sourceJson?: string;
  sourceURL?: string;
  sourceDotLottieURI?: string;
  imageAssetsFolder?: string;
  progress?: number;
  speed?: number;
  loop?: boolean;
  autoPlay?: boolean;
  enableMergePathsAndroidForKitKatAndAbove?: boolean;
  enableSafeModeAndroid?: boolean;
  hardwareAccelerationAndroid?: boolean;
  cacheComposition?: boolean;
  colorFilters?: Array<ColorFilterStruct>;
  textFiltersAndroid?: Array<TextFilterAndroidStruct>;
  textFiltersIOS?: Array<TextFilterIOSStruct>;
  onAnimationFinish?: (isCancelled: boolean) => void;
  onAnimationFailure?: (error: string) => void;
  onAnimationLoaded?: () => void;
}

export interface NativeCommands extends HybridViewMethods {
  play(startFrame: number, endFrame: number): void;
  reset(): void;
  pause(): void;
  resume(): void;
}

export type LottieAnimationView = HybridView<NativeProps, NativeCommands>;
export type LottieAnimationViewRef = HybridRef<NativeProps, NativeCommands>;
