import React, {Component} from 'react';
import {
  StyleSheet,
  Text,
  View,
  Image
} from 'react-native';
import { TouchableHighlight } from 'react-native-gesture-handler';

const notification = require('../../assets/notification.png')
const Constants = require('../utils/AppConstants')
const DataController = require('../utils/DataStorageController')

const SMS = 'SMS Alerts'
const APP_NOTIF = 'App Notifications'
const POD_INV = 'Proof of Delivery & Invoices'
const POD_MAIL = 'Invoice and POD mail Subjects'
const OTHERS = 'Others'

const settings = [
    {
        title: SMS,
        icon: {uri: 'https://cdn0.iconfinder.com/data/icons/google-material-design-3-0/48/ic_message_48px-512.png'}
    },
    {
        title: APP_NOTIF,
        icon: notification
    },
    {
        title: POD_INV,
        icon: {uri: 'https://cdn3.iconfinder.com/data/icons/google-material-design-icons/48/ic_markunread_48px-512.png'}
    },
    {
        title: POD_MAIL,
        icon: {uri: 'https://cdn1.iconfinder.com/data/icons/free-98-icons/32/invoice-512.png'}
    },
    {
        title: OTHERS,
        icon: {uri: 'https://cdn4.iconfinder.com/data/icons/essential-app-1/16/dot-more-menu-hide-512.png'}
    },
]

export default class Settings extends Component {
    static navigationOptions = ({navigation}) => {
        return{
            headerTitle: 'Settings',
        }
    }

    constructor(props) {
        super(props)

        this.state = {
            isLoading: true
        }
    }

    async componentDidMount() {
        await this.getSettings();
    }

    getSettings = async () => {
        const reqBody = new FormData()
        const custId = await DataController.getItem(DataController.CUSTOMER_ID)
        reqBody.append(Constants.FIELDS.CUSTOMER_ID, parseInt(custId))

        console.log('Request: ', reqBody)

        const request = await fetch(Constants.BASE_URL + Constants.GET_APP_SETTING_DETAIL, {
            method: 'POST',
            body: reqBody,
            headers: {
                key: "21db33e221e41d37e27094153b8a8a02"
            }
        })
        const response = await request.json().then(async value => {
            const settings = JSON.stringify(value.data, (key, val) => {
                if ((typeof val === "boolean") || (typeof val === "number")) {
                    return String(val);
                }
                return val
            }, null)

            const dataToWrite = settings

            await DataController.setItem(DataController.USER_SETTINGS, dataToWrite)

            console.log("Response: ", value)
            console.log("Data written: ", dataToWrite)
        })
        .catch(err => {
            console.log(err);
            ToastAndroid.show(Constants.ERROR_GET_SETTINGS, ToastAndroid.SHORT);
        })

        this.setState(prevState => {
            prevState.isLoading = false
            return prevState
        })
    }
    
    render() {
        return (
            <View>
                {
                    settings.map((value, index) => {
                        return(
                            <TouchableHighlight
                            underlayColor='rgba(0, 0, 0, 0.04)'
                            key={index}
                            onPress={() => {
                                this.props.navigation.navigate('SettingsAll', {title: value.title})
                            }}>
                                <View>
                                    <View style={{
                                        flexDirection: 'row', alignItems: 'center', paddingHorizontal: 15,
                                        marginTop: 15
                                    }}>
                                        <Image source={value.icon}
                                        style={{
                                            width: 22, height: 22, opacity: 0.3
                                        }}/>
                                        <Text style={{flex: 1, fontSize: 15, marginStart: 20}}>
                                            {value.title}
                                        </Text>
                                        <Image source={{uri: 'https://cdn4.iconfinder.com/data/icons/ionicons/512/icon-ios7-arrow-forward-512.png'}}
                                        style={{width: 25, height: 25}}/>
                                    </View>
                                    <View 
                                    style={{
                                        marginStart: 50,
                                        marginTop: 15,
                                        borderTopColor:'rgba(0, 0, 0, 0.1)',
                                        borderTopWidth: 1
                                    }}/>
                                </View>
                            </TouchableHighlight>
                        )
                    })
                }

                {/* Overlay to show while loading, to avoid any touches */}
                <View style={{
                    position: 'absolute', backgroundColor: 'white', width: '100%',
                    opacity: 0.8, height: this.state.isLoading? '100%' : 0,
                }}/>
            </View>
        );
    }
}

const styles = StyleSheet.create({

});
