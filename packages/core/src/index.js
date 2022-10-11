import React from 'react';
import { View, StyleSheet, processColor } from 'react-native';

const NativeLottieView = require('./LottieAnimationViewNativeComponent').default;
const Commands = require('./LottieAnimationViewNativeComponent').Commands;

export default class LottieView extends React.PureComponent {
  componentDidUpdate(prevProps) {
    if (this.props.autoPlay && this.props.source !== prevProps.source && !!this.props.source) {
      this.play();
    }
  }

  play(startFrame = -1, endFrame = -1) {
    if (this._ref != null) {
      Commands?.play(this._ref, startFrame, endFrame);
    }
  }

  reset() {
    if (this._ref != null) {
      Commands?.reset(this._ref);
    }
  }

  pause() {
    if (this._ref != null) {
      Commands?.pause(this._ref);
    }
  }

  resume() {
    if (this._ref != null) {
      Commands?.resume(this._ref);
    }
  }

  onAnimationFinish = (evt) => {
    if (this.props.onAnimationFinish) {
      this.props.onAnimationFinish(evt.nativeEvent.isCancelled);
    }
  };

  _captureRef = (ref) => {
    this._ref = ref;
    if (this.props.autoPlay) {
      this.play();
    }
  };

  render() {
    const { style, source, autoSize, autoPlay, ...rest } = this.props;

    const sourceName = typeof source === 'string' ? source : undefined;
    const sourceJson =
      typeof source === 'object' && !source.uri ? JSON.stringify(source) : undefined;
    const sourceURL = typeof source === 'object' && source.uri ? source.uri : undefined;

    const aspectRatioStyle = sourceJson ? { aspectRatio: source.w / source.h } : undefined;

    const styleObject = StyleSheet.flatten(style);
    let sizeStyle;
    if (!styleObject || (styleObject.width === undefined && styleObject.height === undefined)) {
      sizeStyle = autoSize && sourceJson ? { width: source.w } : StyleSheet.absoluteFill;
    }

    const speed =
      this.props.duration && sourceJson && this.props.source.fr
        ? Math.round(((this.props.source.op / this.props.source.fr) * 1000) / this.props.duration)
        : this.props.speed;

    const colorFilters = Array.isArray(this.props.colorFilters)
      ? this.props.colorFilters.map(({ keypath, color }) => ({
          keypath,
          color: processColor(color),
        }))
      : undefined;

    /**
     * To avoid passing complex objects via the fabric arch, I would suggest that we use a simple json array
     * which we can transform back into an object when consuming it on the android/ios side.
     */
    const textFilters = Platform.select({
      android: JSON.stringify(this.props.textFiltersAndroid),
      ios: JSON.stringify(this.props.textFiltersIOS),
      default: undefined,
    });

    return (
      <View style={[aspectRatioStyle, sizeStyle, style]}>
        <NativeLottieView
          ref={this._captureRef}
          {...rest}
          colorFilters={JSON.stringify(colorFilters)}
          speed={speed}
          style={[aspectRatioStyle, sizeStyle || { width: '100%', height: '100%' }, style]}
          sourceName={sourceName}
          sourceJson={sourceJson}
          sourceURL={sourceURL}
          textFilters={textFilters}
          progress={this.props.progress}
          onAnimationFinish={this.onAnimationFinish}
        />
      </View>
    );
  }
}

LottieView.defaultProps = {
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
