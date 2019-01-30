import React from 'react';
import {
    requireNativeComponent,
    findNodeHandle,
    UIManager,
    Animated,
    View,
    Platform,
    StyleSheet,
    ViewPropTypes,
    NativeModules,
} from 'react-native';
import PropTypes from 'prop-types';

const LottieAnimationViewManager = NativeModules.LottieAnimationViewManager;


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


const viewConfig = {
    uiViewClassName: 'LottieViewAndroid',
    validAttributes: {
        progress: true,
    },
};

const LottieAnimationView = requireNativeComponent('LottieAnimationView', LottieViewAndroid);

const AnimatedNativeLottieView = Animated.createAnimatedComponent(LottieAnimationView);

var LottieViewKey = 'LottieViewKey';

export default class LottieViewAndroid extends React.Component {
    static defaultProps = {
        progress: 0,
        speed: 1,
        loop: true,
        autoPlay: false,
        autoSize: false,
        enableMergePathsAndroidForKitKatAndAbove: false,
        resizeMode: 'contain',
    }
    static propTypes = {
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
    }

    constructor(props) {
        super(props);
        this.viewConfig = viewConfig;
        this.root = 'LottieViewAndroid';
    }

    componentDidUpdate(prevProps) {
        if (this.props.source.nm !== prevProps.source.nm && this.props.autoPlay) {
            this.play();
        }
    }

    componentDidMount(){
        if(this.props.autoPlay){
            this.play();
        }
    }

    setNativeProps(props) {
        UIManager.updateView(findNodeHandle(this.refs[LottieViewKey]), this.viewConfig.uiViewClassName, {
            progress: props.progress,
        });
    }

    play(startFrame = -1, endFrame = -1) {
        let handle = findNodeHandle(this.refs[LottieViewKey]);
        if (handle) {
            UIManager.dispatchViewManagerCommand(
                handle,
                UIManager.LottieAnimationView.Commands.play,
                [startFrame, endFrame],
            );
        } else {
            console.log('LottieAnimationViewManager : handle is null');
        }
    }

    reset() {
        console.log('LottieAnimationViewManager : reset');
        let handle = findNodeHandle(this.refs[LottieViewKey]);
        if (handle) {
            UIManager.dispatchViewManagerCommand(
                handle,
                UIManager.LottieAnimationView.Commands.reset,
                null,
            );
        } else {
            console.log('LottieAnimationViewManager : handle is null');
        }
    }


    render() {
        const {style, source, autoSize, ...rest} = this.props;

        const sourceName = typeof source === 'string' ? source : undefined;
        const sourceJson = typeof source === 'string' ? undefined : JSON.stringify(source);

        const aspectRatioStyle = sourceJson ? {aspectRatio: source.w / source.h} : undefined;

        const styleObject = StyleSheet.flatten(style);
        let sizeStyle;
        if (!styleObject || (styleObject.width === undefined && styleObject.height === undefined)) {
            sizeStyle = autoSize && sourceJson ? {width: source.w} : StyleSheet.absoluteFill;
        }

        const speed =
            this.props.duration && sourceJson && this.props.source.fr
                ? Math.round(this.props.source.op / this.props.source.fr * 1000 / this.props.duration)
                : this.props.speed;

        return (
            <View style={[aspectRatioStyle, sizeStyle, style]}>
                <AnimatedNativeLottieView
                    ref={LottieViewKey}
                    {...rest}
                    speed={speed}
                    style={[aspectRatioStyle, sizeStyle || {width: '100%', height: '100%'}, style]}
                    sourceName={sourceName}
                    sourceJson={sourceJson}
                />
            </View>
        );
    }
}

