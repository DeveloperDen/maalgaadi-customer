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

    componentDidMount() {
        firebase.messaging().hasPermission()
        .then(enabled => {
            if(enabled) {
                console.log("Firebase Permission: Granted");
            }
            else {
                this.requestFirebasePermission();
            }
        })

        this.unsubscribeFCMRefresh = firebase.messaging().onTokenRefresh((token) => {
            this.updateFCMToken(token);
        })
        this.updateFCMToken();

        setTimeout(async () => {
            const screen = (await DataController.getItem(DataController.IS_LOGIN) === "true")? 
            'HomeDrawerNavigator' : 'RegistrationNavigator'
            this.props.navigation.navigate(screen)
        }, Constants.SPLASH_TIMEOUT)
    }

    async updateFCMToken(token = '') {
        if(!token == '')
            token = await firebase.messaging().getToken();
        DataController.setItem(DataController.FCM_TOKEN, token);

        const reqURL = Constants.BASE_URL + Constants.APP_DOWNLOAD + '?' + 
                        Constants.FIELDS_LOGIN.DEVICE_ID + '=' + getDeviceId() + '&' +
                        Constants.FIELDS_LOGIN.FCM_TOKEN + '=' + token
        
        console.log("Request: ", reqURL)

        const request = await fetch(reqURL, {
            method: 'GET',
            headers: {
                key: "21db33e221e41d37e27094153b8a8a02"
            }
        })

        const response = await request.json().then(value => {
            console.log("FCM update response: ", value)
        }).catch(err => {
            console.log(err)
            ToastAndroid.show(Constants.UPDATE_CUSTOMER_PROFILE, ToastAndroid.SHORT);
        })
    }

    requestFirebasePermission() {
        firebase.messaging().requestPermission()
        .then(() => {
            console.log("Firebase Permission: Granted");
        })
        .catch(error => {
            console.log("Firebase Permission Error: ", error);
            this.requestFirebasePermission();
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

