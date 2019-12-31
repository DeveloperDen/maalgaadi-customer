import React, { Component } from 'react';
import {
  StyleSheet,
  View,
  Text,
  Image,
  StatusBar,
  ToastAndroid,
  Animated,
  Easing
} from 'react-native';
import { TextInput, TouchableHighlight, TouchableOpacity } from 'react-native-gesture-handler';
import {getDeviceId} from 'react-native-device-info';
import {firebase} from '@react-native-firebase/messaging'
import { StackActions} from 'react-navigation';

const Constants = require('../utils/AppConstants')
const DataController = require('../utils/DataStorageController')

const ACCENT = '#FFCB28' // 255, 203, 40
const ACCENT_DARK = '#F1B800'
const BLUE = '#0800B2'

export default class GetOTP extends Component {
    static navigationOptions = ({navigation}) => {
        return{
            headerTitle: 'Verify Number',
        }
    }

    constructor(props) {
        super(props)
        this.state = {
            messageTop: new Animated.Value(-100),
            otp: '',
            message: '',
            isLoading: false
        } 
    }

    async componentDidMount() {
        this.FCM_TOKEN = await firebase.messaging().getToken();
        this.parent = this.props.navigation.getParam("parent")
        this.otp = this.props.navigation.getParam("otp").toString()
        this.number = this.props.navigation.getParam("number")
        this.refCode = this.props.navigation.getParam("refCode")
        this.pass = this.props.navigation.getParam("pass")
    }

    // API call to Signup user and navigate to Main screen.
    signupUser = async () => {
        this.setState(prevState => {
            prevState.isLoading = true
            return prevState
        })

        const reqBody = new FormData()
        reqBody.append(Constants.FIELDS.CUSTOMER_PHONE, this.number)
        reqBody.append(Constants.FIELDS.CUSTOMER_PASSWORD, this.pass)
        reqBody.append(Constants.FIELDS.REF_CODE, this.refCode)
        reqBody.append(Constants.FIELDS_LOGIN.DEVICE_ID, getDeviceId())
        reqBody.append(Constants.FIELDS_LOGIN.DEVICE_FCM_TOKEN, this.FCM_TOKEN)
        reqBody.append(Constants.FIELDS.LAT, 0)
        reqBody.append(Constants.FIELDS.LNG, 0)

        console.log('Request: ', reqBody)

        const request = await fetch(Constants.BASE_URL + Constants.ADD_CUSTOMER_PASSWORD, {
            method: 'POST',
            body: reqBody,
            headers: {
                key: Constants.KEY
            }
        })

        const response = await request.json().then(async value => {
            const dataToWrite = new FormData()
            dataToWrite.append(DataController.IS_LOGIN, "true")
            dataToWrite.append(DataController.CUSTOMER_ID, value.data.id.toString())
            dataToWrite.append(DataController.CUSTOMER_MOBILE, value.data.cust_number)
            dataToWrite.append(DataController.IS_PROFILE_COMPLETED, "false")
            dataToWrite.append(DataController.BUFFER_TIME, value.data.configure_setting.buffered_schedule_time.toString())

            await DataController.setItems(dataToWrite)

            this.setState(prevState => {
                prevState.isLoading = false
                return prevState
            })
            console.log("Response: ", value)
            console.log("Written Data: ", dataToWrite)

            this.props.navigation.navigate("HomeDrawerNavigator")
            
        }).catch(err => {
            console.log(err)
            ToastAndroid.show(Constants.ERROR_SIGNUP, ToastAndroid.SHORT);

            this.setState(prevState => {
                prevState.isLoading = true
                return prevState
            })
        })
    }

    // Navigate to ChangePassword screen.
    resetPassword = () => {
        this.props.navigation.navigate('ChangePassword', {
            number: this.number
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

    // API call to get OTP for Signup
    registerCustomer = async () => {
        this.setState(prevState => {
            prevState.isLoading = true
            return prevState
        })

        const reqURL = Constants.BASE_URL + Constants.ADD_CUSTOMER_SIGNUP + '?' + 
                        Constants.FIELDS.CUSTOMER_PHONE + '=' + this.number

        const request = await fetch(reqURL, {
            method: 'GET',
            headers: {
                key: Constants.KEY
            }
        })

        const response = await request.json().then(value => {
            console.log(value)

            this.otp = value.data.otp.toString()
            this.setState(prevState => {
                prevState.isLoading = false
                prevState.message = value.message
                return prevState
            })
            this.animTop()
        }).catch(err => {
            this.setState(prevState => {
                prevState.isLoading = false
                return prevState
            })
            console.log(err)
            ToastAndroid.show(Constants.ERROR_OTP, ToastAndroid.SHORT);
        })
        
    }

    // API call to get OTP for Forgot Password
    setPasswordByNumber = async () => {
        this.setState(prevState => {
            prevState.isLoading = true
            return prevState
        })

        const reqBody = new FormData()
        reqBody.append(Constants.FIELDS.CUSTOMER_PHONE, this.number)

        console.log('Request Body: ', reqBody)

        const request = await fetch(Constants.BASE_URL + Constants.FORGET_PASSWORD_OTP, {
            method: 'POST',
            body: reqBody,
            headers: {
                key: Constants.KEY
            }
        })

        const response = await request.json().then(value => {
            console.log(value)
            if(!value.success){
                this.setState(prevState => {
                    prevState.isLoading = false
                    prevState.message = value.message
                    return prevState
                })
                this.animTop()
            }
            else {
                this.otp = value.data.otp.toString()
                this.setState(prevState => {
                    prevState.isLoading = false
                    return prevState
                })
            }
            
        })
        .catch(err => {
            this.setState(prevState => {
                prevState.isLoading = false
                return prevState
            })
            console.log(err)
            ToastAndroid.show(Constants.ERROR_OTP, ToastAndroid.SHORT);
        })
    }

    render() {
        return(
            <View style={{flex: 1, }}>
                <StatusBar backgroundColor='white' 
                barStyle="dark-content"/>

                <Text 
                style={{
                    textAlign: "center", marginTop: 50, marginHorizontal: 40, fontSize: 15,
                    opacity: 0.3
                }}>
                    Please enter the OTP recieved on your registered mobile number {this.number}
                </Text>
                
                <View
                style={{
                    flexDirection: 'row', alignItems: 'center', borderBottomColor: 'rgba(0, 0, 0, 0.3)',
                    borderBottomWidth: 1, width: '80%', marginTop: 40, paddingHorizontal: 5, alignSelf: 'center',
                    opacity: this.state.isLoading? 0.3 : 1
                }}>
                    <TextInput editable={!this.state.isLoading}
                    placeholder="Enter OTP" keyboardType='decimal-pad' maxLength={5}
                    style={{flex: 1, marginHorizontal: 10}}
                    onChangeText={text => {
                        this.setState(prevState => {
                            prevState.otp = text
                            return prevState
                        })
                    }}/>
                </View>

                <View 
                style={{
                    flexDirection: 'row', alignSelf: 'center', alignItems: 'center',
                    width: '80%', justifyContent: 'space-between', marginTop: 30,
                    opacity: this.state.isLoading? 0.3 : 1
                }}>
                    <TouchableOpacity
                    disabled={this.state.isLoading}
                    onPress={() => {
                        this.parent === Constants.ADD_CUSTOMER_SIGNUP? 
                            this.registerCustomer() : this.setPasswordByNumber()
                    }}>
                        <Text style={{color: BLUE, fontSize: 13}}>Resend OTP</Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                    disabled={this.state.isLoading}
                    onPress={() => {
                        this.props.navigation.goBack();
                    }}>
                        <Text style={{color: BLUE, fontSize: 13}}>Change Number</Text>
                    </TouchableOpacity>
                </View>
            
                <TouchableHighlight
                disabled={this.state.isLoading}
                underlayColor={ACCENT_DARK}
                onPress={() => {
                    if(this.state.otp !== this.otp) {
                        this.setState(prevState => {
                            prevState.message = Constants.OTP_MISMATCH
                            return prevState
                        })
                        this.animTop()
                    }
                    else {
                        this.parent === Constants.ADD_CUSTOMER_SIGNUP?
                        this.signupUser() : this.resetPassword()
                    }
                    
                }}
                style={{
                    justifyContent:'center', alignItems: 'center',
                    borderRadius: 4, width: '80%', alignSelf: 'center', paddingVertical: 15, marginTop: 25,
                    backgroundColor: this.state.isLoading? 'gray' : ACCENT
                }}>
                    <Text style={{color: 'white', fontSize: 14, fontWeight: '700', opacity: this.state.isLoading? 0.3 : 1}}>
                        {this.state.isLoading? "Processing..." : this.parent === Constants.ADD_CUSTOMER_SIGNUP? 
                        "Next" : "Reset"}
                    </Text>
                </TouchableHighlight>
            
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
            </View>
        )
    }
}

const styles = StyleSheet.create({

});

