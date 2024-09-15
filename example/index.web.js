import {AppRegistry} from 'react-native';
import App from './App';

AppRegistry.registerComponent('example', () => App);

AppRegistry.runApplication('example', {
	rootTag: document.getElementById('root'),
});
