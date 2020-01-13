import React, { Component } from 'react';
import {
  StyleSheet,
  View,
  StatusBar,
  Image,
} from 'react-native';
import {firebase} from '@react-native-firebase/messaging'
import { getDeviceId } from 'react-native-device-info';

const Constants = require('./utils/AppConstants')
const DataController = require('./utils/DataStorageController')
const logo = require('../assets/logo_splash.png')
const ACCENT = '#FFCB28' // 255, 203, 40
const ACCENT_DARK = '#F1B800'

export default class Splash extends Component {
    static navigationOptions = ({navigation}) => {
        return{
            headerStyle: {display: 'none'},
        }
    }

    constructor(props) {
        super(props)
        this.state = {}
    }

    async componentDidMount() {
        // Check for the permission and if not enabled, get the permission.
        await firebase.messaging().hasPermission()
        .then(enabled => {
            console.log("Firebase Permission checked: ", enabled);
            if(!enabled) {
                console.log("Requesting...");
                this.requestFirebasePermission();
            }
        })
        
        // Register for iOS remote message.
        if (!firebase.messaging().isRegisteredForRemoteNotifications) {
            console.log("Registering for Remote Notifications.")
            await firebase.messaging().registerForRemoteNotifications();
            console.log("Now registered for remtote Notifications.")
        }
        else {
            console.log("Registered for Remote Notification.");
        }

        this.updateFCMToken();

        // FCM token subscriber
        this.unsubscribeFCMRefresh = firebase.messaging().onTokenRefresh((token) => {
            console.log("FCM Token refreshed. Updating...");
            this.updateFCMToken(token);
        })

        setTimeout(async () => {
            const screen = (await DataController.getItem(DataController.IS_LOGIN) === "true")? 
            'HomeDrawerNavigator' : 'RegistrationNavigator'
            this.props.navigation.navigate(screen)
        }, Constants.SPLASH_TIMEOUT)
    }

    // Update FCM token on the server.
    async updateFCMToken(token = '') {
        if(token == ''){
            console.log("No token provided, getting token now...");
            token = await firebase.messaging().getToken();
        }
        DataController.setItem(DataController.FCM_TOKEN, token);

        const reqURL = Constants.BASE_URL + Constants.APP_DOWNLOAD + '?' + 
                        Constants.FIELDS_LOGIN.DEVICE_ID + '=' + getDeviceId() + '&' +
                        Constants.FIELDS_LOGIN.FCM_TOKEN + '=' + token
        
        console.log("Request: ", reqURL)

        const request = await fetch(reqURL, {
            method: 'GET',
            headers: {
                key: Constants.KEY
            }
        })

        await request.json().then(value => {
            console.log("FCM update response: ", value)
        }).catch(err => {
            console.log(err)
            ToastAndroid.show(Constants.UPDATE_CUSTOMER_PROFILE, ToastAndroid.SHORT);
        })
    }

    // Permission specifically for iOS.
    requestFirebasePermission() {
        firebase.messaging().requestPermission()
        .then((granted) => {
            if(granted) {
                console.log("Firebase Permission requested: Granted");
            }
            else {
                console.log("Firebase Permission requested: Not Granted");
                this.requestFirebasePermission();
            }
        })
        .catch(error => {
            console.log("Firebase Permission requested Error: ", error);
        })
    }

    componentWillUnmount() {
        this.unsubscribeFCMRefresh();
    }

    render() {
        return(
            <View style={{
                flex: 1, backgroundColor: ACCENT, justifyContent: 'center', alignItems: 'center'
            }}>
                <StatusBar hidden={true}/>

                <Image source={logo} resizeMode="contain"
                style={{width: '80%'}}/>
            </View>
        )
    }
}

const styles = StyleSheet.create({

});