/**
 * @format
 */

import 'react-native-gesture-handler'
// import firebase from 'react-native-firebase';
import {AppRegistry} from 'react-native';
import App from './App';
import {name as appName} from './app.json';
import { showNotification } from './src/utils/UtilFunc';

const Constants = require('./src/utils/AppConstants')
const DataController = require('./src/utils/DataStorageController')

import messaging from '@react-native-firebase/messaging';

// messaging().onMessage(async remoteMessage => {
//     // Alert.alert('A new FCM message arrived!', JSON.stringify(remoteMessage));
//     console.log('remoteMessage >> ', remoteMessage)
//     bgMessagingAndroid(remoteMessage);
//   });

  // Register background handler
messaging().setBackgroundMessageHandler(async remoteMessage => {
    console.log('Message handled in the background!', remoteMessage);
    bgMessagingAndroid(remoteMessage);
  });

const bgMessagingAndroid = async (message) => {
    console.log('Message recieved in background');
    console.log(message)

    const data = message.data;
    const type = data.type;
    let notifMessage = message.data.message;
    const title = message.data.title;

    if(type == "booking_notification") {
        const message = data.message;

        if(message.includes("Kindly pay")) {
            const messObj = JSON.parse(message);
            notifMessage = messObj.text;

            console.log(messObj)

            const paymentModel = {
            [Constants.TRANS_PARAMS.BOOKING_ID]: messObj[Constants.TRANS_PARAMS.BOOKING_ID],
            [Constants.TRANS_PARAMS.AMOUNT]: messObj[Constants.TRANS_PARAMS.AMOUNT],
            [Constants.FIELDS.CUSTOMER_ID]: await DataController.getItem(DataController.CUSTOMER_ID),
            [Constants.TRANS_PARAMS.ENC_RESP]: '',
            [Constants.TRANS_PARAMS.MESSAGE]: messObj[Constants.TRANS_PARAMS.MESSAGE],
            [Constants.TRANS_PARAMS.ORDER_ID]: '',
            [Constants.TRANS_PARAMS.STATUS]: ''
            }
            await DataController.setItem(DataController.PAYMENT_TRANS_DATA, JSON.stringify(paymentModel));
        }
    }

    showNotification(notifMessage, title != null? title : "MaalGaadi");
};

AppRegistry.registerHeadlessTask('RNFirebaseBackgroundMessage', () => bgMessagingAndroid);
AppRegistry.registerComponent(appName, () => App);