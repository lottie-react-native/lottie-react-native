import React from 'react';
import {AppRegistry} from 'react-native';
import {enableFabricForLottieReactNative} from 'lottie-react-native';
import LottieView from 'lottie-react-native';

enableFabricForLottieReactNative(true);

AppRegistry.registerComponent('example', () => (
  <LottieView
    autoPlay={true}
    source={require('./9squares-AlBoardman.json')}
    loop={true}
  />
));
