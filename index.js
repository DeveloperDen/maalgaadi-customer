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

/*
2019-12-11 16:33:30.226 D/RNFirebaseMsgService: onMessageReceived
2019-12-11 16:33:30.250 E/RNFirebaseMsgService: Background messages only work if the message priority is set to 'high'
    java.lang.IllegalStateException: Not allowed to start service Intent { cmp=com.maalgaadi/io.invertase.firebase.messaging.ReactNativeFirebaseMessagingHeadlessService (has extras) }: app is in background uid UidRecord{9fc61ef u0a413 RCVR idle change:uncached procs:1 seq(0,0,0)}
        at android.app.ContextImpl.startServiceCommon(ContextImpl.java:1536)
        at android.app.ContextImpl.startService(ContextImpl.java:1492)
        at android.content.ContextWrapper.startService(ContextWrapper.java:650)
        at io.invertase.firebase.messaging.ReactNativeFirebaseMessagingService.onMessageReceived(ReactNativeFirebaseMessagingService.java:72)
        at com.google.firebase.messaging.FirebaseMessagingService.zzc(com.google.firebase:firebase-messaging@@20.1.0:78)
        at com.google.firebase.messaging.zze.run(com.google.firebase:firebase-messaging@@20.1.0:2)
        at java.util.concurrent.ThreadPoolExecutor.runWorker(ThreadPoolExecutor.java:1162)
        at java.util.concurrent.ThreadPoolExecutor$Worker.run(ThreadPoolExecutor.java:636)
        at com.google.android.gms.common.util.concurrent.zza.run(Unknown Source:6)
        at java.lang.Thread.run(Thread.java:764)
*/