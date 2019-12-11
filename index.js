/**
 * @format
 */

import 'react-native-gesture-handler'
import messaging from '@react-native-firebase/messaging';
import {AppRegistry} from 'react-native';
import App from './App';
import {name as appName} from './app.json';
import { showNotification } from './src/utils/UtilFunc';

messaging().setBackgroundMessageHandler((message) => {
    console.log('Message recieved in background');
    console.log(message)
    showNotification(message.data.message, "MaalGaadi")

    return Promise.resolve();
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