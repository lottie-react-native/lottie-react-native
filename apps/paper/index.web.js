import {AppRegistry} from 'react-native';
import LottieAnimatedExample from './src/LottieAnimatedExample';

AppRegistry.registerComponent('example', () => LottieAnimatedExample);

AppRegistry.runApplication('example', {
  rootTag: document.getElementById('root'),
});
