import React, {Component} from 'react';
import {
  StyleSheet,
  Text,
  View,
  Image
} from 'react-native';
import { TouchableHighlight } from 'react-native-gesture-handler';

const notification = require('../../assets/notification.png')

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
        icon: {uri: 'https://cdn2.iconfinder.com/data/icons/pittogrammi/142/81-512.png'}
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
            </View>
        );
    }
}

const styles = StyleSheet.create({

});
