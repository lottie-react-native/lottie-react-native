/**
 * @format
 */

import {AppRegistry} from 'react-native';
import App from './App';
import PointerEventsRepro from './PointerEventsRepro';
import {name as appName} from './app.json';

AppRegistry.registerComponent(appName, () => App);
AppRegistry.registerComponent('PointerEvents', () => PointerEventsRepro);
