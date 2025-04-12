import {
  parseColorToHex,
  parsePossibleSources,
  parseRenderModeToInternal,
  parseResizeModeToInternal,
} from './utils';
import type { LottieViewProps } from '../types';
import { PureComponent } from 'react';
import { getHostComponent } from 'react-native-nitro-modules';
import type {
  LottieAnimationViewRef,
  NativeCommands,
  NativeProps,
} from '../specs/LottieReactNative.nitro';
import LottieAnimationViewConfig from '../../nitrogen/generated/shared/json/LottieAnimationViewConfig.json';

const LottieAnimationView = getHostComponent<NativeProps, NativeCommands>(
  'LottieAnimationView',
  () => LottieAnimationViewConfig
);

const defaultProps: LottieViewProps = {
  source: '',
  progress: 0,
  speed: 1,
  loop: true,
  autoPlay: false,
  enableMergePathsAndroidForKitKatAndAbove: false,
  enableSafeModeAndroid: false,
  cacheComposition: true,
  useNativeLooping: false,
  resizeMode: 'contain',
  colorFilters: [],
  textFiltersAndroid: [],
  textFiltersIOS: [],
};

export class LottieView extends PureComponent<LottieViewProps> {
  static defaultProps = defaultProps;

  private lottieAnimationViewRef: LottieAnimationViewRef | undefined;

  constructor(props: LottieViewProps) {
    super(props);
    this.play = this.play.bind(this);
    this.reset = this.reset.bind(this);
    this.pause = this.pause.bind(this);
    this.resume = this.resume.bind(this);
    this.captureRef = this.captureRef.bind(this);

    if (props.hover !== undefined && __DEV__) {
      console.warn('lottie-react-native: hover is only supported on web');
    }
  }

  play(startFrame?: number, endFrame?: number): void {
    this.lottieAnimationViewRef?.play(startFrame ?? -1, endFrame ?? -1);
  }

  reset() {
    this.lottieAnimationViewRef?.reset();
  }

  pause() {
    this.lottieAnimationViewRef?.pause();
  }

  resume() {
    this.lottieAnimationViewRef?.resume();
  }

  private captureRef(ref: LottieAnimationViewRef) {
    this.lottieAnimationViewRef = ref;
    if (this.props.autoPlay === true) {
      this.play();
    }
  }

  render() {
    const {
      style,
      source,
      autoPlay,
      duration,
      textFiltersAndroid,
      textFiltersIOS,
      resizeMode,
      renderMode,
      onAnimationFailure,
      onAnimationFinish,
      onAnimationLoaded,
      onLayout,
      colorFilters,
      ...rest
    } = this.props;

    if (source == null) {
      console.warn(
        'LottieView needs `source` parameter, provided value for source:',
        source
      );
      return null;
    }

    const sources = parsePossibleSources(source);

    const resizeModeInternal = parseResizeModeToInternal(resizeMode);

    const renderModeInternal = parseRenderModeToInternal(renderMode);

    const speed =
      // @ts-ignore
      duration && sources.sourceJson && (source as any).fr
        ? Math.round(
            (((source as any).op / (source as any).fr) * 1000) / duration
          )
        : this.props.speed;

    const colorFiltersInternal = colorFilters?.map((colorFilter) => ({
      ...colorFilter,
      color: parseColorToHex(colorFilter.color),
    }));
    return (
      <LottieAnimationView
        hybridRef={{
          f: this.captureRef,
        }}
        {...rest}
        textFiltersAndroid={textFiltersAndroid}
        textFiltersIOS={textFiltersIOS}
        autoPlay={autoPlay}
        style={style}
        resizeMode={resizeModeInternal}
        renderMode={renderModeInternal}
        enableMergePathsAndroidForKitKatAndAbove
        enableSafeModeAndroid
        colorFilters={colorFiltersInternal}
        speed={speed}
        {...sources}
        onAnimationLoaded={{
          f: onAnimationLoaded,
        }}
        onAnimationFailure={{
          f: onAnimationFailure,
        }}
        onAnimationFinish={{
          f: onAnimationFinish,
        }}
        onLayout={{
          f: onLayout,
        }}
      />
    );
  }
}
