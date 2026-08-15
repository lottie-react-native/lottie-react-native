import type {
  HybridView,
  HybridViewMethods,
  HybridViewProps,
} from 'react-native-nitro-modules';

export type ResizeMode = 'cover' | 'contain' | 'center';

export type RenderMode = 'AUTOMATIC' | 'HARDWARE' | 'SOFTWARE';

export interface LottieColorFilter {
  keypath: string;
  color: number;
}

export interface TextFilterIOS {
  keypath: string;
  text: string;
}

export interface TextFilterAndroid {
  find: string;
  replace: string;
}

export interface NativeLottieViewProps extends HybridViewProps {
  resizeMode?: ResizeMode;
  renderMode?: RenderMode;

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
  applyOpacityToLayersAndroid?: boolean;
  enableSafeModeAndroid?: boolean;
  hardwareAccelerationAndroid?: boolean;
  cacheComposition?: boolean;

  colorFilters?: LottieColorFilter[];
  textFiltersAndroid?: TextFilterAndroid[];
  textFiltersIOS?: TextFilterIOS[];

  onAnimationFinish?: (isCancelled: boolean) => void;
  onAnimationFailure?: (error: string) => void;
  onAnimationLoaded?: () => void;
}

export interface NativeLottieViewMethods extends HybridViewMethods {
  play(startFrame: number, endFrame: number): void;
  reset(): void;
  pause(): void;
  resume(): void;
}

export type LottieView = HybridView<
  NativeLottieViewProps,
  NativeLottieViewMethods
>;
