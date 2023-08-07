import React from 'react';
import {
  Image,
  NativeSyntheticEvent,
  ViewProps,
  processColor,
} from 'react-native';

import type { LottieViewProps } from './LottieView.types';

import NativeLottieAnimationView, {
  Commands,
} from './specs/LottieAnimationViewNativeComponent';

type Props = LottieViewProps & { containerProps?: ViewProps };

const defaultProps: Props = {
  source: undefined,
  progress: 0,
  speed: 1,
  loop: true,
  autoPlay: false,
  enableMergePathsAndroidForKitKatAndAbove: false,
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

  private captureRef(ref: React.ElementRef<typeof NativeLottieAnimationView>) {
    if (ref === null) {
      return;
    }

    this.lottieAnimationViewRef = ref;
    if (this.props.autoPlay === true) {
      this.play();
    }
  }

  private parsePossibleSources():
    | {
        sourceURL?: string;
        sourceJson?: string;
        sourceName?: string;
        sourceDotLottieURI?: string;
      }
    | undefined {
    const { source } = this.props;

    if (typeof source === 'string') {
      return { sourceName: source };
    }

    if (typeof source === 'object' && !(source as any).uri) {
      return { sourceJson: JSON.stringify(source) };
    }

    if (typeof source === 'object' && (source as any).uri) {
      // uri contains .lottie extension return sourceDotLottieURI
      if ((source as any).uri.includes('.lottie')) {
        return { sourceDotLottieURI: (source as any).uri };
      }

      return { sourceURL: (source as any).uri };
    }

    if (typeof source === 'number') {
      return { sourceDotLottieURI: Image.resolveAssetSource(source).uri };
    }

    return undefined;
  }

  render(): React.ReactNode {
    const {
      style,
      source,
      autoPlay,
      duration,
      textFiltersAndroid,
      textFiltersIOS,
      resizeMode,
      ...rest
    } = this.props;

    const sources = this.parsePossibleSources();

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
        autoPlay={autoPlay}
        resizeMode={resizeMode}
        {...sources}
      />
    );
  }
}
