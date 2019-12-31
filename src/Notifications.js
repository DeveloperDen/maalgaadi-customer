import React, { Component } from 'react';
import {
  StyleSheet,
  View,
  ToastAndroid,
  ActivityIndicator
} from 'react-native';
import { FIELDS, BASE_URL, GET_NOTIFICATION_LIST, ERROR_GET_DETAILS, KEY} from './utils/AppConstants';
import { getItem, CUSTOMER_ID } from './utils/DataStorageController';

const ACCENT = '#FFCB28' // 255, 203, 40
const ACCENT_DARK = '#F1B800' 

export default class Notifications extends Component {
    static navigationOptions = ({navigation}) => {
        return{
            headerTitle: 'Notifications',
        }
    }

    constructor(props) {
        super(props)
        this.state = {
            isLoading: true
        }
    }

    componentDidMount() {
        this.getNotificationsList();
    }

    getNotificationsList = async () => {

        const reqBody = new FormData()
        reqBody.append(FIELDS.CUSTOMER_ID, await getItem(CUSTOMER_ID))

        console.log('Request Body: ', reqBody)

        const request = await fetch(BASE_URL + GET_NOTIFICATION_LIST, {
            method: 'POST',
            body: reqBody,
            headers: {
                key: KEY
            }
        })

        const response = await request.json().then(async value => {
            console.log("Response Body: ", value);

            if(value.success) {
                console.log("Got Notifications!");
            }
            else {
                console.log("Could not get Notifications!");
            }
        }).catch(err => {
            console.log(err)
            ToastAndroid.show(ERROR_GET_DETAILS, ToastAndroid.SHORT);
        })

        this.setState(prevState => {
            prevState.isLoading = false
            return prevState
        })
    }

    render() {
        return(
            <View style={{flex: 1}}>
                <ActivityIndicator size="large" color={ACCENT_DARK}
                style={{alignSelf: 'center', scaleX: this.state.isLoading? 1 : 0, position: 'absolute', top: 0, bottom: 0, start: 0, end: 0}}/>
            </View>
        )
    }
}

const styles = StyleSheet.create({});