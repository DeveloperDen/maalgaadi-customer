import React, { Component,} from 'react';
import {
  StyleSheet,
  View,
  Text,
  Image,
  StatusBar,
  Animated,
  Easing,
  ToastAndroid
} from 'react-native';
import { TextInput, TouchableHighlight, TouchableOpacity } from 'react-native-gesture-handler';
import {getDeviceId} from 'react-native-device-info';
import {firebase} from '@react-native-firebase/messaging'
import {NavigationEvents} from 'react-navigation';

const Constants = require('../utils/AppConstants')
const DataController = require('../utils/DataStorageController')
const logo = require('../../assets/logo_login.png')
const graphics = require('../../assets/login_graphics.png')
const ACCENT = '#FFCB28' // 255, 203, 40
const ACCENT_DARK = '#F1B800'
const BLUE = '#0800B2'

export default class Login extends Component {
    constructor(props) {
        super(props)
        this.state = {
            showPass: false,
            modalVisible: false,
            message: '',
            messageTop: new Animated.Value(-100) 
        }

        this.FCM_TOKEN = ''
    }

    async componentDidMount() {
        this.FCM_TOKEN = await firebase.messaging().getToken();

        if(this.props.navigation.getParam("status", "") === Constants.LOGOUT_API) {
            console.log(Constants.LOGOUT_SUCCESS);

            this.setState(prevState => {
                prevState.message = Constants.LOGOUT_SUCCESS
                return prevState
            })

            this.animTop()
        }
    }

    callLoginAPI = async () => {
        this.setState(prevState => {
            prevState.isLoading = true
            return prevState
        })

        const reqBody = new FormData()
        reqBody.append(Constants.FIELDS_LOGIN.CUSTOMER_PHONE, this.state.phone)
        reqBody.append(Constants.FIELDS_LOGIN.CUSTOMER_PASSWORD, this.state.pass)
        reqBody.append(Constants.FIELDS_LOGIN.DEVICE_ID, getDeviceId())
        reqBody.append(Constants.FIELDS_LOGIN.DEVICE_FCM_TOKEN, this.FCM_TOKEN)

        console.log('Request Body: ', reqBody)

        const request = await fetch(Constants.BASE_URL + Constants.CUSTOMER_LOGIN, {
            method: 'POST',
            body: reqBody,
            headers: {
                key: Constants.KEY
            }
        })

        await request.json().then(async value => {
            if(value.success) {
                const dataToWrite = new FormData()
                dataToWrite.append(DataController.IS_LOGIN, "true")
                dataToWrite.append(DataController.CUSTOMER_ID, value.data.id.toString())
                dataToWrite.append(DataController.CUSTOMER_MOBILE, value.data.cust_number)
                dataToWrite.append(DataController.BUFFER_TIME, value.data.configure_setting.buffered_schedule_time.toString())
                
                console.log("Configuration Settings: ", JSON.stringify(value.data.configure_setting));
                dataToWrite.append(DataController.CONFIGURE_SETTING, JSON.stringify(value.data.configure_setting))

                if(value.data.cust_name !== "") {
                    dataToWrite.append(DataController.IS_PROFILE_COMPLETED, "true")
                    dataToWrite.append(DataController.CUSTOMER_NAME, value.data.cust_name)
                    dataToWrite.append(DataController.RATING, value.data.rating.toString())
                    dataToWrite.append(DataController.EMAIL, value.data.cust_email)
                    dataToWrite.append(DataController.ORG, value.data.cust_organization)
                    
                    // TODO: Decide on the basis of city_list
                    dataToWrite.append(DataController.CITY, "Indore")

                    dataToWrite.append(DataController.CITY_ID, value.data.city_id.toString())
                    
                    dataToWrite.append(DataController.ADDRESS, value.data.cust_address)
                    dataToWrite.append(DataController.GOODS_NAME, value.data.goods_name)
                    dataToWrite.append(DataController.GOODS_ID, value.data.goods_id.toString())
                    dataToWrite.append(DataController.TRIP_FREQ, value.data.selected_trip_frequency)
                } else dataToWrite.append(DataController.IS_PROFILE_COMPLETED, "false")
                

                await DataController.setItems(dataToWrite)

                this.setState(prevState => {
                    prevState.isLoading = false
                    return prevState
                })
                console.log("Response: ", value)
                console.log("Written Data: ", dataToWrite)

                this.props.navigation.navigate("HomeDrawerNavigator")
            }
            else {
                console.log(value)
                this.setState(prevState => {
                    prevState.isLoading = false
                    prevState.message = value.message
                    return prevState
                })
                this.animTop()
            }
        }).catch(err => {
            console.log(err)
            this.setState(prevState => {
                prevState.isLoading = false
                return prevState
            })
            ToastAndroid.show(Constants.ERROR_LOGIN, ToastAndroid.SHORT);
        })  
    }

    animTop = () => {
        Animated.sequence([
            Animated.timing(
                this.state.messageTop,
                {
                    toValue: -100,
                    easing: Easing.ease,
                    duration: 200,
                }
            ),
            Animated.timing(
                this.state.messageTop,
                {
                    toValue: 0,
                    easing: Easing.ease,
                    duration: 200
                }
            ),
            Animated.timing(
                this.state.messageTop,
                {
                    toValue: -100,
                    easing: Easing.ease,
                    duration: 200,
                    delay: Constants.MESSAGE_DURATION
                }
            )
        ]).start()
    }

    render() {
        return(
            <View style={{flex: 1, justifyContent: 'center'}}>
                <StatusBar backgroundColor='white' 
                barStyle="dark-content"/>

                {/* Background graphics */}
                <View
                style={{
                    backgroundColor: 'white', alignSelf: 'center', position: 'absolute',
                    bottom: 0
                }}>
                    <Image source={graphics} style={{height: 100}} resizeMode="contain"/>
                </View>

                {/* Logo */}
                <View
                style={{
                    backgroundColor: 'white', marginBottom: 50, alignSelf: 'center'
                }}>
                    <Image source={logo} style={{height: 70}} resizeMode="contain"/>
                </View>
                
                <View 
                style={{
                    flexDirection: 'row', alignItems: 'center', borderBottomColor: 'rgba(0, 0, 0, 0.3)',
                    borderBottomWidth: 1, width: '80%', paddingHorizontal: 5, alignSelf: 'center',
                    opacity: this.state.isLoading? 0.3 : 1
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
                    borderBottomWidth: 1, width: '80%', marginTop: 10, paddingHorizontal: 5, alignSelf: 'center',
                    opacity: this.state.isLoading? 0.3 : 1
                }}>
                    <Image source={{uri: 'https://cdn3.iconfinder.com/data/icons/google-material-design-icons/48/ic_vpn_key_48px-512.png'}}
                    style={{width: 25, height: 25, opacity: 0.3}}/>

                    <TextInput 
                    editable={!this.state.isLoading}
                    placeholder="Password" secureTextEntry={true}
                    keyboardType={this.state.showPass? 'visible-password' : 'default'}
                    onChangeText={(text) => {
                        this.setState(prevState => {
                            prevState.pass = text
                            return prevState
                        })
                    }}
                    style={{flex: 1, marginHorizontal: 10}}/>

                    <TouchableOpacity
                    disabled={this.state.isLoading}
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
                disabled={this.state.isLoading}
                underlayColor={ACCENT_DARK}
                onPress={this.callLoginAPI}
                style={{
                    justifyContent:'center', alignItems: 'center', borderRadius: 4, width: '80%',
                    alignSelf: 'center', paddingVertical: 15, marginTop: 25,
                    backgroundColor: this.state.isLoading? 'gray' : ACCENT
                }}>
                    <Text style={{
                        color: 'white', fontSize: 14, fontWeight: '700',
                        opacity: this.state.isLoading? 0.3 : 1
                    }}>
                        {this.state.isLoading? "Processing..." : "Login"}
                    </Text>
                </TouchableHighlight>
 
                <View 
                style={{
                    flexDirection: 'row', alignSelf: 'center', alignItems: 'center',
                    width: '80%', justifyContent: 'space-between', marginTop: 30,
                    opacity: this.state.isLoading? 0.3 : 1
                }}>
                    <TouchableOpacity
                    disabled={this.state.isLoading}
                    onPress={() => {
                        this.props.navigation.navigate('Signup')
                    }}>
                        <Text style={{color: BLUE, fontSize: 13}}>Create Account</Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                    disabled={this.state.isLoading}
                    onPress={() => {
                        this.props.navigation.navigate('ForgotPassword')
                    }}>
                        <Text style={{color: BLUE, fontSize: 13}}>Forgot Password?</Text>
                    </TouchableOpacity>
                </View>

                {/* Message box */}
                <Animated.View
                style={{
                    backgroundColor: ACCENT, left: 0, right: 0, position: 'absolute', top: this.state.messageTop,
                    height: 100, flexDirection: 'row',
                    alignItems: 'center', paddingHorizontal: 20
                }}>
                    <Image source={{uri: 'https://cdn3.iconfinder.com/data/icons/google-material-design-icons/48/ic_warning_48px-512.png'}}
                    tintColor='white' style={{width: 30, height: 30, marginEnd: 20}}/>
                    <Text style={{fontSize: 15, color: 'white', flex: 1}}>{this.state.message}</Text>
                </Animated.View>
            
                <NavigationEvents onDidFocus={() => {
                    if(this.props.navigation.getParam("status", "") === Constants.FORGET_PASSWORD_URL) {
                        console.log(Constants.PASS_CHANGE_SUCCESS);
        
                        this.setState(prevState => {
                            prevState.message = Constants.PASS_CHANGE_SUCCESS
                            return prevState
                        })
        
                        this.animTop()
                    }
                }}/>
            </View>
        )
    }
}

const styles = StyleSheet.create({

});