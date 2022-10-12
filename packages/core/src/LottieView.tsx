import React from 'react';
import { View, StyleSheet, NativeSyntheticEvent } from 'react-native';

import type {
  AnimatedLottieViewProps,
  AnimationObject,
} from './LottieView.types';

import NativeLottieAnimationView, {
  Commands,
} from './specs/LottieAnimationViewNativeComponent';

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

  componentDidUpdate(prevProps: AnimatedLottieViewProps) {
    if (
      this.props.autoPlay === true &&
      this.props.source !== prevProps.source &&
      !!this.props.source
    ) {
      this.play();
    }
  }

  public play(startFrame?: number, endFrame?: number): void {
    if (this._lottieAnimationViewRef) {
      Commands?.play(
        this._lottieAnimationViewRef,
        startFrame ?? -1,
        endFrame ?? -1,
      );
    }
  }

  public reset() {
    if (this._lottieAnimationViewRef) {
      Commands?.reset(this._lottieAnimationViewRef);
    }
  }

  public pause() {
    if (this._lottieAnimationViewRef) {
      Commands?.pause(this._lottieAnimationViewRef);
    }
  }

  public resume() {
    if (this._lottieAnimationViewRef) {
      Commands?.resume(this._lottieAnimationViewRef);
    }
  }

  _onAnimationFinish = (
    evt: NativeSyntheticEvent<{ isCancelled: boolean }>,
  ) => {
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
      textFiltersAndroid,
      textFiltersIOS,
      colorFilters,
      ...rest
    } = this.props;

    const sourceName = typeof source === 'string' ? source : undefined;
    const sourceJson =
      typeof source === 'object' ? JSON.stringify(source) : undefined;
    const sourceURL =
      typeof source === 'object' && (source as any).uri
        ? ((source as any).uri as string)
        : undefined;

    const aspectRatioStyle = sourceJson
      ? {
          aspectRatio:
            (source as AnimationObject).w / (source as AnimationObject).h,
        }
      : undefined;

    const styleObject = StyleSheet.flatten(style);
    let sizeStyle;
    if (
      !styleObject ||
      (styleObject.width === undefined && styleObject.height === undefined)
    ) {
      sizeStyle =
        autoSize && sourceJson
          ? { width: (source as AnimationObject).w }
          : StyleSheet.absoluteFill;
    }

    const speed =
      this.props.duration && sourceJson && (source as AnimationObject).fr
        ? Math.round(
            (((source as AnimationObject).op / (source as AnimationObject).fr) *
              1000) /
              this.props.duration,
          )
        : this.props.speed;

    /*     const colorFilters = Array.isArray(this.props.colorFilters)
      ? this.props.colorFilters.map(({ keypath, color }) => ({
          keypath,
          color: processColor(color) as number,
        }))
      : undefined; */

    return (
      <View style={[aspectRatioStyle, sizeStyle, style]}>
        <NativeLottieAnimationView
          ref={this._captureRef}
          {...rest}
          //colorFilters={colorFilters}
          speed={speed}
          style={[
            aspectRatioStyle,
            sizeStyle || { width: '100%', height: '100%' },
            style,
          ]}
          sourceName={sourceName}
          sourceJson={sourceJson}
          sourceURL={sourceURL}
          progress={this.props.progress}
          onAnimationFinish={this._onAnimationFinish}
        />
      </View>
    );
  }
}
