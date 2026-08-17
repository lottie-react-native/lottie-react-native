import React from 'react';
import { processColor, StyleProp, View, ViewStyle } from 'react-native';
import { callback } from 'react-native-nitro-modules';

import { parsePossibleSources } from './utils';

import type { LottieViewProps } from '../types';
import type { LottieColorFilter } from '../LottieView.nitro';

import {
  LottieView as NativeLottieView,
  type LottieViewRef,
} from '../views/LottieView';

type Props = LottieViewProps & { containerStyle?: StyleProp<ViewStyle> };

const UNRESOLVED_COLOR = Number.NaN;

function processColorFilters(
  filters: LottieViewProps['colorFilters'],
): LottieColorFilter[] {
  return (filters ?? []).map(({ keypath, color }) => {
    const processed = processColor(color);
    if (typeof processed !== 'number') {
      if (__DEV__) {
        console.warn(
          `lottie-react-native: could not resolve colorFilters color ${JSON.stringify(
            color,
          )} for keypath "${keypath}". PlatformColor is not supported.`,
        );
      }
      return { keypath, color: UNRESOLVED_COLOR };
    }
    return { keypath, color: processed };
  });
}

const defaultProps: Props = {
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

export class LottieView extends React.PureComponent<Props, {}> {
  static defaultProps = defaultProps;

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
      colorFilters,
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
        sourceName={sources?.sourceName ?? ''}
        sourceJson={sources?.sourceJson ?? ''}
        sourceURL={sources?.sourceURL ?? ''}
        sourceDotLottieURI={sources?.sourceDotLottieURI ?? ''}
        renderMode={renderMode ?? 'AUTOMATIC'}
        imageAssetsFolder={imageAssetsFolder ?? ''}
        hardwareAccelerationAndroid={hardwareAccelerationAndroid ?? false}
        colorFilters={processColorFilters(colorFilters)}
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
