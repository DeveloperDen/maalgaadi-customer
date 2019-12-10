/**
 * @format
 */

import 'react-native-gesture-handler'
import messaging from '@react-native-firebase/messaging';
import {AppRegistry} from 'react-native';
import App from './App';
import {name as appName} from './app.json';
import { showNotification } from './src/utils/UtilFunc';

messaging().setBackgroundMessageHandler(async (message) => {
    console.log('Message recieved in background');
    console.log(message.data)
    showNotification(message.data.message, "MaalGaadi")
});
AppRegistry.registerComponent(appName, () => App);