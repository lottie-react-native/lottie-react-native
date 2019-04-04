import React from 'react';
import {
  findNodeHandle,
  UIManager,
  Animated,
  View,
  Platform,
  StyleSheet,
  ViewPropTypes,
} from 'react-native';
import SafeModule from 'react-native-safe-module';
import PropTypes from 'prop-types';

const NativeLottieView = SafeModule.component({
  viewName: 'LottieAnimationView',
  mockComponent: View,
});
const AnimatedNativeLottieView = Animated.createAnimatedComponent(NativeLottieView);

const LottieViewManager = SafeModule.module({
  moduleName: 'LottieAnimationView',
  mock: {
    play: () => {},
    reset: () => {},
    getConstants: () => {},
  },
});

const ViewStyleExceptBorderPropType = (props, propName, componentName, ...rest) => {
  const flattened = StyleSheet.flatten(props[propName] || {});
  const usesBorder = Object.keys(flattened).some(key => key.startsWith('border'));
  if (usesBorder) {
    return Error(
      `${componentName} does not allow any border related style properties to be specified. ` +
        "Border styles for this component will behave differently across platforms. If you'd " +
        'like to render a border around this component, wrap it with a View.',
    );
  }
  return ViewPropTypes.style(props, propName, componentName, ...rest);
};

const NotAllowedPropType = (props, propName, componentName) => {
  const value = props[propName];
  if (value != null) {
    return Error(`${componentName} cannot specify '${propName}'.`);
  }
  return null;
};

const propTypes = {
  ...ViewPropTypes,
  style: ViewStyleExceptBorderPropType,
  children: NotAllowedPropType,
  resizeMode: PropTypes.oneOf(['cover', 'contain', 'center']),
  progress: PropTypes.oneOfType([PropTypes.number, PropTypes.object]),
  speed: PropTypes.number,
  duration: PropTypes.number,
  loop: PropTypes.bool,
  autoPlay: PropTypes.bool,
  autoSize: PropTypes.bool,
  enableMergePathsAndroidForKitKatAndAbove: PropTypes.bool,
  source: PropTypes.oneOfType([PropTypes.object, PropTypes.string]).isRequired,
  hardwareAccelerationAndroid: PropTypes.bool,
  cacheStrategy: PropTypes.oneOf(['none', 'weak', 'strong']),
  onAnimationFinish: PropTypes.func,
};

const defaultProps = {
  progress: 0,
  speed: 1,
  loop: true,
  autoPlay: false,
  autoSize: false,
  enableMergePathsAndroidForKitKatAndAbove: false,
  resizeMode: 'contain',
};

const viewConfig = {
  uiViewClassName: 'LottieAnimationView',
  validAttributes: {
    progress: true,
  },
};

class LottieView extends React.Component {
  constructor(props) {
    super(props);
    this.viewConfig = viewConfig;
    this.refRoot = this.refRoot.bind(this);
    this.onAnimationFinish = this.onAnimationFinish.bind(this);
  }

  componentDidUpdate(prevProps) {
    if (this.props.source.nm !== prevProps.source.nm && this.props.autoPlay) {
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

  runCommand(name, args = []) {
    const handle = this.getHandle();
    if (!handle) {
      return null;
    }

    return Platform.select({
      android: () =>
        UIManager.dispatchViewManagerCommand(
          handle,
          UIManager.LottieAnimationView.Commands[name],
          args,
        ),
      ios: () => LottieViewManager[name](this.getHandle(), ...args),
    })();
  }

  getHandle() {
    return findNodeHandle(this.root);
  }

  refRoot(root) {
    this.root = root;
    if (this.props.autoPlay) {
      this.play();
    }
  }

  onAnimationFinish(evt) {
    if (this.props.onAnimationFinish) {
      this.props.onAnimationFinish(evt.nativeEvent.isCancelled);
    }
  }

  render() {
    const { style, source, autoSize, ...rest } = this.props;

    const sourceName = typeof source === 'string' ? source : undefined;
    const sourceJson = typeof source === 'string' ? undefined : JSON.stringify(source);

    const aspectRatioStyle = sourceJson ? { aspectRatio: source.w / source.h } : undefined;

    const styleObject = StyleSheet.flatten(style);
    let sizeStyle;
    if (!styleObject || (styleObject.width === undefined && styleObject.height === undefined)) {
      sizeStyle = autoSize && sourceJson ? { width: source.w } : StyleSheet.absoluteFill;
    }

    const speed =
      this.props.duration && sourceJson && this.props.source.fr
        ? Math.round(this.props.source.op / this.props.source.fr * 1000 / this.props.duration)
        : this.props.speed;

    return (
      <View style={[aspectRatioStyle, sizeStyle, style]}>
        <AnimatedNativeLottieView
          ref={this.refRoot}
          {...rest}
          speed={speed}
          style={[aspectRatioStyle, sizeStyle || { width: '100%', height: '100%' }, style]}
          sourceName={sourceName}
          sourceJson={sourceJson}
          onAnimationFinish={this.onAnimationFinish}
        />
      </View>
    );
  }
}

LottieView.propTypes = propTypes;
LottieView.defaultProps = defaultProps;

module.exports = LottieView;
