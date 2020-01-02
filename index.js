/**
 * @format
 */

import 'react-native-gesture-handler'
import messaging from '@react-native-firebase/messaging';
import {AppRegistry} from 'react-native';
import App from './App';
import {name as appName} from './app.json';
import { showNotification } from './src/utils/UtilFunc';
const Constants = require('./src/utils/AppConstants')
const DataController = require('./src/utils/DataStorageController')

messaging().setBackgroundMessageHandler(async (message) => {
    console.log('Message recieved in background');
    console.log(message)
    showNotification(message.data.message, "MaalGaadi")

    const data = message.data;
    const type = data.type;
    if(type == "booking_notification") {
        const title = data.title;
        const message = data.message;

        if(message.includes("Kindly pay")) {
            const messObj = JSON.parse(message);
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
            this.paymentModel = paymentModel;
            await DataController.setItem(DataController.PAYMENT_TRANS_DATA, JSON.stringify(paymentModel));
        }
    }
});
AppRegistry.registerComponent(appName, () => App);