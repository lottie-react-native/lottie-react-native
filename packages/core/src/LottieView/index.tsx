import React from 'react';
import {
  NativeSyntheticEvent,
  StyleProp,
  View,
  ViewStyle,
  processColor,
} from 'react-native';

import { parsePossibleSources } from './utils';

import type { LottieViewProps } from '../types';

import NativeLottieAnimationView, {
  Commands,
} from '../specs/LottieAnimationViewNativeComponent';

type Props = LottieViewProps & { containerStyle?: StyleProp<ViewStyle> };

const defaultProps: Props = {
  source: undefined,
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

export class LottieView extends React.PureComponent<Props, {}> {
  static defaultProps = defaultProps;

  private lottieAnimationViewRef:
    | React.ElementRef<typeof NativeLottieAnimationView>
    | undefined;

  constructor(props: Props) {
    super(props);
    this.play = this.play.bind(this);
    this.reset = this.reset.bind(this);
    this.pause = this.pause.bind(this);
    this.resume = this.resume.bind(this);
    this.onAnimationFinish = this.onAnimationFinish.bind(this);
    this.captureRef = this.captureRef.bind(this);

    if (props.hover != undefined && __DEV__) {
      console.warn('lottie-react-native: hover is only supported on web');
    }
  }

  play(startFrame?: number, endFrame?: number): void {
    Commands.play(
      this.lottieAnimationViewRef,
      startFrame ?? -1,
      endFrame ?? -1,
    );
  }

  reset() {
    Commands.reset(this.lottieAnimationViewRef);
  }

  pause() {
    Commands.pause(this.lottieAnimationViewRef);
  }

  resume() {
    Commands.resume(this.lottieAnimationViewRef);
  }

  private onAnimationFinish = (
    evt: NativeSyntheticEvent<{ isCancelled: boolean }>,
  ) => {
    this.props.onAnimationFinish?.(evt.nativeEvent.isCancelled);
  };

  private onAnimationFailure = (
    evt: NativeSyntheticEvent<{ error: string }>,
  ) => {
    this.props.onAnimationFailure?.(evt.nativeEvent.error);
  };

  private onAnimationLoaded = () => {
    this.props.onAnimationLoaded?.();
  };

  private captureRef(ref: React.ElementRef<typeof NativeLottieAnimationView>) {
    if (ref === null) {
      return;
    }

    this.lottieAnimationViewRef = ref;
    if (this.props.autoPlay === true) {
      this.play();
    }
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
      containerStyle,
      ...rest
    } = this.props;

    const sources = parsePossibleSources(source);

    const speed =
      duration && sources.sourceJson && (source as any).fr
        ? Math.round(
            (((source as any).op / (source as any).fr) * 1000) / duration,
          )
        : this.props.speed;

    const colorFilters = this.props.colorFilters?.map((colorFilter) => ({
      ...colorFilter,
      color: processColor(colorFilter.color),
    }));

    return (
      <NativeLottieAnimationView
        ref={this.captureRef}
        {...rest}
        colorFilters={colorFilters}
        textFiltersAndroid={textFiltersAndroid}
        textFiltersIOS={textFiltersIOS}
        speed={speed}
        style={style}
        onAnimationFinish={this.onAnimationFinish}
        onAnimationFailure={this.onAnimationFailure}
        onAnimationLoaded={this.onAnimationLoaded}
        autoPlay={autoPlay}
        resizeMode={resizeMode}
        {...sources}
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
