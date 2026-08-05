import React from 'react';
import { StyleProp, View, ViewStyle } from 'react-native';
import { callback } from 'react-native-nitro-modules';

import { parsePossibleSources } from './utils';

import type { LottieViewProps } from '../types';

import {
  LottieView as NativeLottieView,
  type LottieViewRef,
} from '../views/LottieView';

type Props = LottieViewProps & { containerStyle?: StyleProp<ViewStyle> };

const defaultProps: Props = {
  // v7 sets `source` to `undefined` even though the prop is required, and that
  // is load-bearing: it is what makes `source` optional at the JSX call site
  // while `render()` warns and returns null. Kept verbatim. The cast exists
  // only because this package type-checks with `strict: true`.
  source: undefined as unknown as Props['source'],
  progress: 0,
  speed: 1,
  loop: true,
  autoPlay: false,
  enableMergePathsAndroidForKitKatAndAbove: false,
  applyOpacityToLayersAndroid: false,
  enableSafeModeAndroid: false,
  cacheComposition: true,
  useNativeLooping: false,
  resizeMode: 'contain',
  colorFilters: [],
  textFiltersAndroid: [],
  textFiltersIOS: [],
};

/**
 * Presents lottie-react-native v7's public API on top of the Nitro view.
 *
 * Kept as a class component deliberately. It preserves two documented v7
 * patterns that a function component would break:
 * `Animated.createAnimatedComponent(LottieView)` driving `progress`, and the
 * ref being the component instance so `useRef<LottieView>()` works and `play`
 * can be destructured off it.
 */
export class LottieView extends React.PureComponent<Props, {}> {
  static defaultProps = defaultProps;

  /**
   * The Nitro HybridObject behind the view, populated by [captureRef].
   */
  private nativeRef: LottieViewRef | undefined;

  constructor(props: Props) {
    super(props);
    this.play = this.play.bind(this);
    this.reset = this.reset.bind(this);
    this.pause = this.pause.bind(this);
    this.resume = this.resume.bind(this);

    if (props.hover != undefined && __DEV__) {
      console.warn('lottie-react-native: hover is only supported on web');
    }
  }

  /**
   * Each callback is wrapped with `callback(...)` exactly once, in a field, so
   * the `{ f }` object identity is stable for the component's lifetime. Nitro
   * diffs props with `!==` and re-invokes the native setter whenever identity
   * changes, so wrapping inside `render()` would re-fire every setter — and
   * re-invoke `hybridRef` — on every render.
   *
   * Native calls `hybridRef` after the props of the same transaction have been
   * applied, which is why `autoPlay` can call `play()` straight from here,
   * exactly as v7's `captureRef` did.
   */
  private readonly captureRef = callback((ref: LottieViewRef) => {
    this.nativeRef = ref;
    if (this.props.autoPlay === true) {
      this.play();
    }
  });

  private readonly onAnimationFinish = callback((isCancelled: boolean) => {
    this.props.onAnimationFinish?.(isCancelled);
  });

  private readonly onAnimationFailure = callback((error: string) => {
    this.props.onAnimationFailure?.(error);
  });

  private readonly onAnimationLoaded = callback(() => {
    this.props.onAnimationLoaded?.();
  });

  play(startFrame?: number, endFrame?: number): void {
    // `?? -1` rather than `|| -1`, so an explicit frame 0 survives. `-1` is the
    // sentinel native reads as "no explicit frame".
    this.nativeRef?.play(startFrame ?? -1, endFrame ?? -1);
  }

  reset() {
    this.nativeRef?.reset();
  }

  pause() {
    this.nativeRef?.pause();
  }

  resume() {
    this.nativeRef?.resume();
  }

  private renderLottieView() {
    const {
      style,
      source,
      autoPlay,
      duration,
      textFiltersAndroid,
      textFiltersIOS,
      resizeMode,
      renderMode,
      imageAssetsFolder,
      hardwareAccelerationAndroid,
      containerStyle,
      ...rest
    } = this.props;

    const sources = parsePossibleSources(source);

    // Carried over from v7 verbatim, bug included: Math.round quantises the
    // speed to an integer, so a duration that is not an exact divisor of the
    // natural length is wrong, and anything over twice the natural length
    // rounds to 0 and freezes. See TODO.md.
    const speed =
      duration && sources!.sourceJson && (source as any).fr
        ? Math.round(
            (((source as any).op / (source as any).fr) * 1000) / duration,
          )
        : this.props.speed;

    return (
      <NativeLottieView
        hybridRef={this.captureRef}
        {...rest}
        // Every optional prop is always passed, never conditionally. When a
        // prop goes from set to unset React Native sends native a JS `null`,
        // but Nitro's std::optional converter only accepts `undefined` — `null`
        // falls through to asString() and throws inside the C++ props parse.
        // `parsePossibleSources` returns exactly one source key, so spreading
        // it would crash the moment the source kind changed (e.g. a local name
        // swapped for a remote URI). Empty string means "absent" to native.
        sourceName={sources?.sourceName ?? ''}
        sourceJson={sources?.sourceJson ?? ''}
        sourceURL={sources?.sourceURL ?? ''}
        sourceDotLottieURI={sources?.sourceDotLottieURI ?? ''}
        renderMode={renderMode ?? 'AUTOMATIC'}
        imageAssetsFolder={imageAssetsFolder ?? ''}
        hardwareAccelerationAndroid={hardwareAccelerationAndroid ?? false}
        textFiltersAndroid={textFiltersAndroid}
        textFiltersIOS={textFiltersIOS}
        speed={speed}
        style={style}
        onAnimationFinish={this.onAnimationFinish}
        onAnimationFailure={this.onAnimationFailure}
        onAnimationLoaded={this.onAnimationLoaded}
        autoPlay={autoPlay}
        resizeMode={resizeMode}
      />
    );
  }

  render(): React.ReactNode {
    const { source, containerStyle } = this.props;

    if (source == null) {
      console.warn(
        'LottieView needs `source` parameter, provided value for source:',
        source,
      );
      return null;
    }

    if (containerStyle) {
      return (
        <View style={containerStyle} collapsable={false}>
          {this.renderLottieView()}
        </View>
      );
    }

    return this.renderLottieView();
  }
}
