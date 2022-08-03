import {AppRegistry} from 'react-native';
import LottieAnimatedExample from './src/LottieAnimatedExample';
import {enableFabricForLottieReactNative} from 'lottie-react-native';

enableFabricForLottieReactNative(true);

AppRegistry.registerComponent('example', () => LottieAnimatedExample);
