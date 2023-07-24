import React from 'react';
import { NativeSyntheticEvent, ViewProps, processColor } from 'react-native';

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

/**
 * View hosting the lottie animation.
 */
export class LottieView extends React.PureComponent<Props, {}> {
  static defaultProps = defaultProps;

  _lottieAnimationViewRef:
    | React.ElementRef<typeof NativeLottieAnimationView>
    | undefined;

  constructor(props: Props) {
    super(props);
    this.play = this.play.bind(this);
    this.reset = this.reset.bind(this);
    this.pause = this.pause.bind(this);
    this.resume = this.resume.bind(this);
    this.onAnimationFinish = this.onAnimationFinish.bind(this);
    this._captureRef = this._captureRef.bind(this);
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
    if (ref === null) {
      return;
    }

    this._lottieAnimationViewRef = ref;
    if (this.props.autoPlay === true) {
      this.play();
    }
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

    const sourceName = typeof source === 'string' ? source : undefined;
    const sourceJson =
      typeof source === 'object' && !(source as any).uri
        ? JSON.stringify(source)
        : undefined;
    const sourceURL =
      typeof source === 'object' && (source as any).uri
        ? (source as any).uri
        : undefined;

    const speed =
      duration && sourceJson && (source as any).fr
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
        ref={this._captureRef}
        {...rest}
        colorFilters={colorFilters}
        textFiltersAndroid={textFiltersAndroid}
        textFiltersIOS={textFiltersIOS}
        speed={speed}
        style={style}
        sourceName={sourceName}
        sourceJson={sourceJson}
        sourceURL={sourceURL}
        onAnimationFinish={this.onAnimationFinish}
        autoPlay={autoPlay}
        resizeMode={resizeMode}
      />
    );
  }
}
