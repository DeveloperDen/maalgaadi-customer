/**
 * @format
 */

import 'react-native-gesture-handler'
import messaging from '@react-native-firebase/messaging';
import {AppRegistry} from 'react-native';
import App from './App';
import {name as appName} from './app.json';
import { ToastAndroid } from 'react-native';

messaging().setBackgroundMessageHandler(async (message) => {
    console.log('Message recieved in background');
    console.log(message.data)
    ToastAndroid.show(message.data.message, ToastAndroid.SHORT)
});

AppRegistry.registerComponent(appName, () => App);