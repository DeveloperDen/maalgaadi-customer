import React, { Component } from 'react';
import {
  StyleSheet,
  View,
  Text,
  Image,
  StatusBar,
} from 'react-native';
import { TextInput, TouchableHighlight, TouchableOpacity } from 'react-native-gesture-handler';
import ToastComp from '../utils/ToastComp';

const Constants = require('../utils/AppConstants')

const ACCENT = '#FFCB28' // 255, 203, 40
const ACCENT_DARK = '#F1B800'
const BLUE = '#0800B2'

export default class ForgotPassword extends Component {
    static navigationOptions = ({navigation}) => {
        return{
            headerTitle: 'Forgot Password',
        }
    }

    constructor(props) {
        super(props)
        this.state = {
            number: '',
            invalidText: true,
        }
    }

    setPasswordByNumber = async () => {
        this.setState(prevState => {
            prevState.isLoading = true
            return prevState
        })

        const reqBody = new FormData()
        reqBody.append(Constants.FIELDS.CUSTOMER_PHONE, this.state.number)

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
                this.showToast()
            }
            else {
                this.setState(prevState => {
                    prevState.isLoading = false
                    return prevState
                })
                this.props.navigation.navigate("GetOTP", 
                {
                    parent: Constants.FORGET_PASSWORD_OTP,
                    number: this.state.number,
                    otp: value.data.otp
                })
            }
        }).catch(err => {
            console.log(err)
            this.setState(prevState => {
                prevState.isLoading = false;
                prevState.message = Constants.ERROR_OTP;
                return prevState
            })
            this.showToast()
        })
        
    }

    showToast = (text = '') => {
        if(text !== '')
            this.toast.show(text)
        else
            this.toast.show(this.state.message);
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
                    Please enter your mobile number and press 'Get OTP' button to reset the password
                </Text>
                
                <View
                style={{
                    flexDirection: 'row', alignItems: 'center', borderBottomColor: 'rgba(0, 0, 0, 0.3)',
                    borderBottomWidth: 1, width: '80%', marginTop: 40, paddingHorizontal: 5, alignSelf: 'center',
                    opacity: this.state.isLoading? 0.3 : 1
                }}>
                    <Image source={Constants.ICONS.device}
                    style={{width: 25, height: 25, opacity: 0.3}}/>

                    <TextInput editable={!this.state.isLoading}
                    placeholder="Enter your Mobile Number" keyboardType='decimal-pad' maxLength={10}
                    style={{flex: 1, marginHorizontal: 10}}
                    onChangeText={(text) => {
                        this.setState(prevState => {
                            if(text.length == 10) {
                                prevState.invalidText = false;
                            }
                            else {
                                prevState.invalidText = true;
                            }
                            prevState.number = text
                            return prevState
                        })
                    }}/>
                </View>

                {/* Get OTP Button */}
                <TouchableHighlight underlayColor={ACCENT_DARK}
                disabled={this.state.isLoading || this.state.invalidText}
                onPress={() => {
                    if(this.state.number == '' || this.state.number.length <10)
                        this.showToast("Please enter valid the Mobile Number");
                    else
                        this.setPasswordByNumber()
                }}
                style={{
                    justifyContent:'center', alignItems: 'center',
                    borderRadius: 4, width: '80%', alignSelf: 'center', paddingVertical: 15, marginTop: 50,
                    backgroundColor: (this.state.isLoading || this.state.invalidText)? 'gray' : ACCENT
                }}>
                    <Text style={{color: 'white', fontSize: 14, fontWeight: '700', opacity: this.state.isLoading? 0.3 : 1}}>
                        {this.state.invalidText? "Get OTP" : this.state.isLoading? "Processing..." : "Get OTP"}
                    </Text>
                </TouchableHighlight>
            
                {/* Toast box */}
                <ToastComp ref={toast => this.toast = toast}/>
            </View>
        )
    }
}

const styles = StyleSheet.create({

});

