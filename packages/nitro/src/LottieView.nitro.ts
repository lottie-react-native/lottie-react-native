import type {
  HybridView,
  HybridViewMethods,
  HybridViewProps,
} from 'react-native-nitro-modules';

export interface LottieViewProps extends HybridViewProps {
  /**
   * Placeholder prop.
   *
   * This exists only to exercise the Nitro prop pipeline end to end while the
   * module is scaffolding. It is deliberately not a real Lottie prop and has no
   * visual effect. The actual v8 surface (source, speed, loop, progress, and
   * the play/pause/reset methods) lands in a later change.
   */
  placeholder: boolean;
}

export interface LottieViewMethods extends HybridViewMethods {}

export type LottieView = HybridView<LottieViewProps, LottieViewMethods>;
