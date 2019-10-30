import React, { Component } from 'react';
import {
  StyleSheet,
  View,
  Text,
  Image,
  StatusBar
} from 'react-native';
import { TextInput, TouchableHighlight, TouchableOpacity } from 'react-native-gesture-handler';
import {getDeviceId} from 'react-native-device-info';

const Constants = require('../utils/AppConstants')

const ACCENT = '#FFCB28' // 255, 203, 40
const ACCENT_DARK = '#F1B800'
const BLUE = '#0800B2'

export default class Login extends Component {
    constructor(props) {
        super(props)
        this.state = {
            showPass: false
        }

        this.Constants = Constants
    }

    callLoginAPI = () => {
        const reqBody = {
            [Constants.FIELDS.CUSTOMER_PHONE] : this.state.phone,
            [Constants.FIELDS.CUSTOMER_PASSWORD] : this.state.pass,
            [Constants.FIELDS.DEVICE_FCM_TOKEN] : '',
            [Constants.FIELDS.DEVICE_ID] : getDeviceId()
        }
        console.log('Request Body: ', reqBody)

        return fetch(Constants.BASE_URL + Constants.CUSTOMER_LOGIN, {
            method: 'POST',
            body: JSON.stringify(reqBody)
        }).then((response) => response.json())
        .then((responseJson) => {
            console.log(responseJson);
        })
    }

    render() {
        return(
            <View style={{flex: 1, justifyContent: 'center'}}>
                <StatusBar backgroundColor='white' 
                barStyle="dark-content"/>

                <View
                style={{
                    height: 50, width: '60%', backgroundColor: ACCENT, alignItems: 'center', justifyContent: 'center',
                    borderRadius: 100, marginBottom: 70, alignSelf: 'center'
                }}>
                    <Text>
                        LOGO
                    </Text>
                </View>
                
                <View 
                style={{
                    flexDirection: 'row', alignItems: 'center', borderBottomColor: 'rgba(0, 0, 0, 0.3)',
                    borderBottomWidth: 1, width: '80%', paddingHorizontal: 5, alignSelf: 'center'
                }}>
                    <Image source={{uri: 'https://cdn3.iconfinder.com/data/icons/google-material-design-icons/48/ic_stay_primary_portrait_48px-512.png'}}
                    style={{width: 25, height: 25, opacity: 0.3}}/>
                    <TextInput placeholder="Mobile Number" keyboardType='decimal-pad' maxLength={10}
                    onChangeText={(text) => {
                        this.setState(prevState => {
                            prevState.phone = text
                            return prevState
                        })
                    }}
                    style={{flex: 1, marginStart: 10}}/>
                </View>
                
                <View
                style={{
                    flexDirection: 'row', alignItems: 'center', borderBottomColor: 'rgba(0, 0, 0, 0.3)',
                    borderBottomWidth: 1, width: '80%', marginTop: 10, paddingHorizontal: 5, alignSelf: 'center'
                }}>
                    <Image source={{uri: 'https://cdn3.iconfinder.com/data/icons/google-material-design-icons/48/ic_vpn_key_48px-512.png'}}
                    style={{width: 25, height: 25, opacity: 0.3}}/>

                    <TextInput placeholder="Password" secureTextEntry={true}
                    keyboardType={this.state.showPass? 'visible-password' : 'default'}
                    onChangeText={(text) => {
                        this.setState(prevState => {
                            prevState.pass = text
                            return prevState
                        })
                    }}
                    style={{flex: 1, marginHorizontal: 10}}/>

                    <TouchableOpacity
                    onPress={() => {
                        this.setState(prevState => {
                            prevState.showPass = !prevState.showPass
                            return prevState
                        })
                    }}>
                        <Image source={{uri: 
                        this.state.showPass? 'https://cdn3.iconfinder.com/data/icons/google-material-design-icons/48/ic_remove_red_eye_48px-512.png' :
                        'https://cdn3.iconfinder.com/data/icons/google-material-design-icons/48/ic_visibility_off_48px-512.png'}}
                    style={{width: 25, height: 25, opacity: 0.3}}/>
                    </TouchableOpacity>
                    
                </View>

                <TouchableHighlight
                underlayColor={ACCENT_DARK}
                onPress={this.callLoginAPI}
                style={{
                    justifyContent:'center', alignItems: 'center', backgroundColor: ACCENT,
                    borderRadius: 4, width: '80%', alignSelf: 'center', paddingVertical: 15, marginTop: 25
                }}>
                    <Text style={{color: 'white', fontSize: 14, fontWeight: '700'}}>Login</Text>
                </TouchableHighlight>

                <View 
                style={{
                    flexDirection: 'row', alignSelf: 'center', alignItems: 'center',
                    width: '80%', justifyContent: 'space-between', marginTop: 30
                }}>
                    <TouchableOpacity
                    onPress={() => {
                        this.props.navigation.navigate('Signup')
                    }}>
                        <Text style={{color: BLUE, fontSize: 13}}>Create Account</Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                    onPress={() => {
                        this.props.navigation.navigate('ForgotPassword')
                    }}>
                        <Text style={{color: BLUE, fontSize: 13}}>Forgot Password?</Text>
                    </TouchableOpacity>
                </View>
            </View>
        )
    }
}

const styles = StyleSheet.create({

});

