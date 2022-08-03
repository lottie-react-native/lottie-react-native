import React from 'react';
import {
  Animated,
  View,
  StyleSheet,
  requireNativeComponent,
  processColor,
  UIManager,
  findNodeHandle,
} from 'react-native';

const isFabricEnabled = require("./index").isFabricEnabled;

const NativeLottieView = isFabricEnabled ?
    require("./LottieAnimationViewNativeComponent").default :
    requireNativeComponent("LottieAnimationView")

const AnimatedNativeLottieView = Animated.createAnimatedComponent(NativeLottieView);

const Commands = isFabricEnabled ?
    require("./LottieAnimationViewNativeComponent").Commands :
    undefined

const defaultProps = {
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

class LottieView extends React.PureComponent {
  _ref: ?React.ElementRef<typeof AnimatedNativeLottieView>;

  componentDidUpdate(prevProps) {
    if (this.props.autoPlay && this.props.source !== prevProps.source && !!this.props.source) {
      this.play();
    }
  }

  play(startFrame: number = -1, endFrame: number = -1) {
    if(isFabricEnabled) {
      if (this._ref != null) {
        Commands?.play(this._ref, startFrame, endFrame);
      }
    } else {
      console.log(global.nativeFabricUIManager != null)
      UIManager.dispatchViewManagerCommand(this.getHandle(), 'play', [startFrame, endFrame]);
    }
  }

  reset() {
    if(isFabricEnabled) {
      if (this._ref != null) {
        Commands?.reset(this._ref);
      }
    } else {
      UIManager.dispatchViewManagerCommand(this.getHandle(), 'reset', []);
    }
  }

  pause() {
    if(isFabricEnabled) {
      if (this._ref != null) {
        Commands?.pause(this._ref);
      }
    } else {
      UIManager.dispatchViewManagerCommand(this.getHandle(), 'pause', []);
    }
  }

  resume() {
    if(isFabricEnabled) {
      if (this._ref != null) {
        Commands?.resume(this._ref);
      }
    } else {
      UIManager.dispatchViewManagerCommand(this.getHandle(), 'resume', []);
    }
  }

  onAnimationFinish = (evt: any) => {
    if (this.props.onAnimationFinish) {
      this.props.onAnimationFinish(evt.nativeEvent.isCancelled);
    }
  }

  // Ref handling for new arch
  _captureRef = (ref) => {
    this._ref = ref;
    if (this.props.autoPlay) {
      this.play();
    }
  }

  // Ref handling for old arch
  getHandle = () => {
    return findNodeHandle(this._ref)
  }

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
    const textFiltersNewArch = Platform.select({ 
      android: JSON.stringify(this.props.textFiltersAndroid), 
      ios: JSON.stringify(this.props.textFiltersIOS),
      default: undefined
    })

    return (
      <View style={[aspectRatioStyle, sizeStyle, style]}>
        <AnimatedNativeLottieView
          ref={this._captureRef}
          {...rest}
          colorFilters={isFabricEnabled ? JSON.stringify(colorFilters) : colorFilters}
          speed={speed}
          style={[aspectRatioStyle, sizeStyle || { width: '100%', height: '100%' }, style]}
          sourceName={sourceName}
          sourceJson={sourceJson}
          sourceURL={sourceURL}
          textFilters={isFabricEnabled ? textFiltersNewArch : undefined}
          progress={this.props.progress}
          onAnimationFinish={this.onAnimationFinish}
        />
      </View>
    );
  }
}

LottieView.defaultProps = defaultProps;

module.exports = LottieView;
