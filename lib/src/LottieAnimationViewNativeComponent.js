// @flow
import React from 'react';
import type {Int32, Float, Double, BubblingEventHandler} from 'react-native/Libraries/Types/CodegenTypes';
import type {ViewProps} from 'react-native/Libraries/Components/View/ViewPropTypes';
import type {HostComponent} from 'react-native';
import codegenNativeComponent from 'react-native/Libraries/Utilities/codegenNativeComponent';
import codegenNativeCommands from 'react-native/Libraries/Utilities/codegenNativeCommands';

type OnAnimationFinishedEvent = $ReadOnly<{|
    isCancelled: boolean,
|}>;

type NativeProps = $ReadOnly<{|
    ...ViewProps, // This is required.
    resizeMode?: string,
    renderMode?: string,
    sourceName?: string,
    sourceJson?: string,
    sourceURL?: string,
    imageAssetsFolder?: string,
    progress?: Float,
    speed?: Double,
    loop?: boolean,
    enableMergePathsAndroidForKitKatAndAbove?: boolean,
    cacheComposition?: boolean,
    colorFilters?: string,
    textFilters?: string,
    onAnimationFinish?: BubblingEventHandler<OnAnimationFinishedEvent>,
|}>;

type LottieViewNativeComponentType = HostComponent<NativeProps>;

interface NativeCommands {
    +play: (
        viewRef: React.ElementRef<LottieViewNativeComponentType>,
        startFrame: Int32,
        endFrame: Int32,
    ) => void;
    +reset: (
        viewRef: React.ElementRef<LottieViewNativeComponentType>,
    ) => void;
    +pause: (
        viewRef: React.ElementRef<LottieViewNativeComponentType>,
    ) => void;
    +resume: (
        viewRef: React.ElementRef<LottieViewNativeComponentType>,
    ) => void;
}

export const Commands: NativeCommands = codegenNativeCommands<NativeCommands>({
    supportedCommands: ['play', 'reset', 'pause', 'resume'],
});

export default (codegenNativeComponent<NativeProps>('LottieAnimationView', {
    excludedPlatforms: ['iOS'], //exclude iOS for now until we add proper ios support in the next version
}): LottieViewNativeComponentType);