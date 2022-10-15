import React from 'react';
import {
  View,
  StyleSheet,
  NativeSyntheticEvent,
  Animated,
  processColor,
} from 'react-native';

import type { AnimatedLottieViewProps } from './LottieView.types';

import NativeLottieAnimationView, {
  Commands,
} from './specs/LottieAnimationViewNativeComponent';

const AnimatedNativeLottieView = Animated.createAnimatedComponent(
  NativeLottieAnimationView,
);

const defaultProps: AnimatedLottieViewProps = {
  source: undefined,
  progress: 0,
  speed: 1,
  loop: true,
  autoPlay: false,
  autoSize: false,
  enableMergePathsAndroidForKitKatAndAbove: false,
  cacheComposition: true,
  useNativeLooping: false,
  resizeMode: 'contain',
  colorFilters: [],
  textFiltersAndroid: [],
  textFiltersIOS: [],
};

/**
 * View hosting the lottie animation.
 */
export class AnimatedLottieView extends React.PureComponent<
  AnimatedLottieViewProps,
  {}
> {
  static defaultProps = defaultProps;

  _lottieAnimationViewRef:
    | React.ElementRef<typeof NativeLottieAnimationView>
    | undefined;

  constructor(props: AnimatedLottieViewProps) {
    super(props);
    this.play = this.play.bind(this);
    this.reset = this.reset.bind(this);
    this.pause = this.pause.bind(this);
    this.resume = this.resume.bind(this);
    this.onAnimationFinish = this.onAnimationFinish.bind(this);
    this._captureRef = this._captureRef.bind(this);
  }

  componentDidUpdate(prevProps: AnimatedLottieViewProps) {
    if (
      this.props.autoPlay === true &&
      this.props.source !== prevProps.source &&
      !!this.props.source
    ) {
      this.play();
    }
  }

  play(startFrame?: number, endFrame?: number): void {
    Commands.play(
      this._lottieAnimationViewRef,
      startFrame ?? -1,
      endFrame ?? -1,
    );
  }

  reset() {
    Commands.reset(this._lottieAnimationViewRef);
  }

  pause() {
    Commands.pause(this._lottieAnimationViewRef);
  }

  resume() {
    Commands.resume(this._lottieAnimationViewRef);
  }

  onAnimationFinish = (evt: NativeSyntheticEvent<{ isCancelled: boolean }>) => {
    if (this.props.onAnimationFinish) {
      this.props.onAnimationFinish(evt.nativeEvent.isCancelled);
    }
  };

  _captureRef(ref: React.ElementRef<typeof NativeLottieAnimationView>) {
    this._lottieAnimationViewRef = ref;
    if (this.props.autoPlay === true) {
      this.play();
    }
  }

  render(): React.ReactNode {
    const {
      style,
      source,
      autoSize,
      autoPlay,
      duration,
      textFiltersAndroid,
      textFiltersIOS,
      ...rest
    } = this.props;

    const sourceName = typeof source === 'string' ? source : undefined;
    const sourceJson =
      typeof source === 'object' && !(source as any).uri
        ? JSON.stringify(source)
        : undefined;
    const sourceURL =
      typeof source === 'object' && (source as any).uri
        ? (source as any).uri
        : undefined;

    const aspectRatioStyle = sourceJson
      ? { aspectRatio: (source as any).w / (source as any).h }
      : undefined;

    const styleObject = StyleSheet.flatten(style);
    let sizeStyle;
    if (
      !styleObject ||
      (styleObject.width === undefined && styleObject.height === undefined)
    ) {
      sizeStyle =
        autoSize && sourceJson
          ? { width: (source as any).w }
          : StyleSheet.absoluteFill;
    }

    const speed =
      duration && sourceJson && (source as any).fr
        ? Math.round(
            (((source as any).op / (source as any).fr) * 1000) / duration,
          )
        : this.props.speed;

    const colorFilters = Array.isArray(this.props.colorFilters)
      ? this.props.colorFilters.map(({ keypath, color }) =>
          JSON.stringify({
            keypath,
            color: processColor(color),
          }),
        )
      : undefined;

    const convertedTextFiltersAndroid = textFiltersAndroid.map((element) =>
      JSON.stringify(element),
    );

    const convertedTextFiltersIOS = textFiltersIOS.map((element) =>
      JSON.stringify(element),
    );

    return (
      <View style={[aspectRatioStyle, sizeStyle, style]}>
        <AnimatedNativeLottieView
          ref={this._captureRef}
          {...rest}
          colorFilters={colorFilters}
          textFiltersAndroid={convertedTextFiltersAndroid}
          textFiltersIOS={convertedTextFiltersIOS}
          speed={speed}
          style={[
            aspectRatioStyle,
            sizeStyle || { width: '100%', height: '100%' },
            style,
          ]}
          sourceName={sourceName}
          sourceJson={sourceJson}
          sourceURL={sourceURL}
          onAnimationFinish={this.onAnimationFinish}
        />
      </View>
    );
  }
}
