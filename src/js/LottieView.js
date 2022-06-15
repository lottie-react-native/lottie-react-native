import React from 'react';
import {
  findNodeHandle,
  UIManager,
  Animated,
  View,
  Platform,
  StyleSheet,
  requireNativeComponent,
  NativeModules,
  processColor,
} from 'react-native';
import SafeModule from 'react-native-safe-modules';

const getNativeLottieViewForDesktop = () => {
  return requireNativeComponent('LottieAnimationView');
};

const NativeLottieView =
  Platform.OS === 'macos' || Platform.OS === 'windows'
    ? getNativeLottieViewForDesktop()
    : SafeModule.component({ viewName: 'LottieAnimationView', mockComponent: View });

const AnimatedNativeLottieView = Animated.createAnimatedComponent(NativeLottieView);

const LottieViewManager = Platform.select({
  // react-native-windows doesn't work with SafeModule, it always returns the mock component
  macos: NativeModules.LottieAnimationView,
  windows: NativeModules.LottieAnimationView,
  default: SafeModule.module({
    moduleName: 'LottieAnimationView',
    mock: {
      play: () => {},
      reset: () => {},
      pause: () => {},
      resume: () => {},
      getConstants: () => {},
    },
  }),
});

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

const viewConfig = {
  uiViewClassName: 'LottieAnimationView',
  validAttributes: {
    progress: true,
  },
};

const safeGetViewManagerConfig = moduleName => {
  if (UIManager.getViewManagerConfig) {
    // RN >= 0.58
    return UIManager.getViewManagerConfig(moduleName);
  }
  // RN < 0.58
  return UIManager[moduleName];
};

class LottieView extends React.PureComponent {
  constructor(props) {
    super(props);
    this.viewConfig = viewConfig;
  }

  componentDidUpdate(prevProps) {
    if (this.props.autoPlay && this.props.source !== prevProps.source && !!this.props.source) {
      this.play();
    }
  }

  setNativeProps(props) {
    UIManager.updateView(this.getHandle(), this.viewConfig.uiViewClassName, {
      progress: props.progress,
    });
  }

  play(startFrame = -1, endFrame = -1) {
    this.runCommand('play', [startFrame, endFrame]);
  }

  reset() {
    this.runCommand('reset');
  }

  pause() {
    this.runCommand('pause');
  }

  resume() {
    this.runCommand('resume');
  }

  runCommand(name, args = []) {
    const handle = this.getHandle();
    if (!handle) {
      return null;
    }

    return Platform.select({
      android: () =>
        UIManager.dispatchViewManagerCommand(
          handle,
          safeGetViewManagerConfig('LottieAnimationView').Commands[name],
          args,
        ),
      windows: () =>
        UIManager.dispatchViewManagerCommand(
          handle,
          safeGetViewManagerConfig('LottieAnimationView').Commands[name],
          args,
        ),
      ios: () => LottieViewManager[name](this.getHandle(), ...args),
      macos: () => LottieViewManager[name](this.getHandle(), ...args),
    })();
  }

  getHandle() {
    return findNodeHandle(this.root);
  }

  refRoot = (root) => {
    this.root = root;
    if (this.props.autoPlay) {
      this.play();
    }
  }

  onAnimationFinish = (evt) => {
    if (this.props.onAnimationFinish) {
      this.props.onAnimationFinish(evt.nativeEvent.isCancelled);
    }
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

    return (
      <View style={[aspectRatioStyle, sizeStyle, style]}>
        <AnimatedNativeLottieView
          ref={this.refRoot}
          {...rest}
          colorFilters={colorFilters}
          speed={speed}
          style={[aspectRatioStyle, sizeStyle || { width: '100%', height: '100%' }, style]}
          sourceName={sourceName}
          sourceJson={sourceJson}
          sourceURL={sourceURL}
          onAnimationFinish={this.onAnimationFinish}
        />
      </View>
    );
  }
}

LottieView.defaultProps = defaultProps;

module.exports = LottieView;
