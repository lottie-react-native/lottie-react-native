import {AppRegistry} from 'react-native';
import App from './src/App';
import {name as appName} from './app.json';
import {DotLottieExample} from './src/DotLottieExample';

// AppRegistry.registerComponent(appName, () => App);
AppRegistry.registerComponent(appName, () => DotLottieExample);
