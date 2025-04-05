import type {
  HybridRef,
  HybridView,
  HybridViewMethods,
  HybridViewProps,
} from 'react-native-nitro-modules';

export interface NativeProps extends HybridViewProps {
  sourceName?: string;
  sourceJson?: string;
  sourceURL?: string;
  sourceDotLottieURI?: string;
}

export interface NativeCommands extends HybridViewMethods {
  play(startFrame: number, endFrame: number): void;
}

export type LottieAnimationView = HybridView<NativeProps, NativeCommands>;
export type LottieAnimationViewRef = HybridRef<NativeProps, NativeCommands>;
