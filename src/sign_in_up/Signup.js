import React, { Component } from 'react';
import {
  StyleSheet,
  View,
  Text,
  Image,
} from 'react-native';
import { TextInput, TouchableHighlight, TouchableOpacity } from 'react-native-gesture-handler';
import ToastProp from '../utils/ToastComp'

const Constants = require('../utils/AppConstants')

const ACCENT = '#FFCB28' // 255, 203, 40
const ACCENT_DARK = '#F1B800'
const BLUE = '#0800B2'

export default class Signup extends Component {
    static navigationOptions = ({navigation}) => {
        return{
            headerTitle: 'Signup',
        }
    }

    constructor(props) {
        super(props)
        this.state = {
            showPass: false,
            phone: '',
            pass: '',
            refCode: '',
            isLoading: false,
            message: ''
        }
    }

    registerCustomer = async () => {
        this.setState(prevState => {
            prevState.isLoading = true
            return prevState
        })

        const reqURL = Constants.BASE_URL + Constants.ADD_CUSTOMER_SIGNUP + '?' + 
                        Constants.FIELDS.CUSTOMER_PHONE + '=' + this.state.phone

        const request = await fetch(reqURL, {
            method: 'GET',
            headers: {
                key: Constants.KEY
            }
        })

        await request.json().then(value => {
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
                {parent: Constants.ADD_CUSTOMER_SIGNUP,
                number: this.state.phone,
                refCode: this.state.refCode,
                otp: value.data.otp,
                pass: this.state.pass})
            }
            
        }).catch(err => {
            console.log(err)
            this.setState(prevState => {
                prevState.isLoading = false;
                prevState.message = Constants.ERROR_SIGNUP;
                return prevState
            })
            this.showToast();
        }) 
    }

    showToast = (text = '') => {
        if(text !== '') {
            this.toast.show(text);
        }
        else
            this.toast.show(this.state.message);
    }

    render() {
        return(
            <View style={{flex: 1, justifyContent: 'center'}}>
                <View 
                style={{
                    flexDirection: 'row', alignItems: 'center', borderBottomColor: 'rgba(0, 0, 0, 0.3)',
                    borderBottomWidth: 1, width: '80%', paddingHorizontal: 5, alignSelf: 'center',
                    opacity: this.state.isLoading? 0.3 : 1, paddingBottom: Platform.OS == "ios"? 5 : 0
                }}>
                    <Image source={Constants.ICONS.device}
                    style={{width: 25, height: 25, opacity: 0.3}}/>
                    <TextInput returnKeyType="done"
                    editable={!this.state.isLoading}
                    placeholder="Mobile Number" keyboardType='decimal-pad' maxLength={10}
                    style={{flex: 1, marginStart: 10}}
                    onChangeText={(text) => {
                        this.setState(prevState => {
                            prevState.phone = text
                            return prevState
                        })
                    }}/>
                </View>
                
                <View
                style={{
                    flexDirection: 'row', alignItems: 'center', borderBottomColor: 'rgba(0, 0, 0, 0.3)',
                    borderBottomWidth: 1, width: '80%', marginTop: 10, paddingHorizontal: 5, alignSelf: 'center',
                    opacity: this.state.isLoading? 0.3 : 1, paddingBottom: Platform.OS == "ios"? 5 : 0
                }}>
                    <Image source={Constants.ICONS.key}
                    style={{width: 25, height: 25, opacity: 0.3}}/>

                    <TextInput 
                    editable={!this.state.isLoading} returnKeyType="done"
                    placeholder="Password" secureTextEntry={this.state.showPass? false : true}
                    style={{flex: 1, marginHorizontal: 10}}
                    onChangeText={(text) => {
                        this.setState(prevState => {
                            prevState.pass = text
                            return prevState
                        })
                    }}/>

                    <TouchableOpacity
                    disabled={this.state.isLoading}
                    onPress={() => {
                        this.setState(prevState => {
                            prevState.showPass = !prevState.showPass
                            return prevState
                        })
                    }}>
                        <Image source={
                        this.state.showPass? Constants.ICONS.show_pass : Constants.ICONS.hide_pass}
                    style={{width: 25, height: 25, opacity: 0.3}}/>
                    </TouchableOpacity>
                    
                </View>

                {this.state.showRefCode?
                    <View
                    style={{
                        flexDirection: 'row', alignItems: 'center', borderBottomColor: 'rgba(0, 0, 0, 0.3)',
                        borderBottomWidth: 1, width: '80%', marginTop: 15, paddingHorizontal: 5, alignSelf: 'center',
                        opacity: this.state.isLoading? 0.3 : 1, paddingBottom: Platform.OS == "ios"? 5 : 0
                    }}>
                        <TextInput 
                        editable={!this.state.isLoading}
                        returnKeyType="done"
                        placeholder="Referral Code"
                        style={{flex: 1, marginHorizontal: 5}}
                        onChangeText={text => {
                            this.setState(prevState => {
                                prevState.refCode = text
                                return prevState
                            })
                        }}/>

                        <TouchableOpacity
                        disabled={this.state.isLoading}
                        onPress={() => {
                            this.setState(prevState => {
                                prevState.showRefCode = false
                                prevState.refCode = ''
                                return prevState
                            })
                        }}>
                            <Image source={Constants.ICONS.cancel}
                        style={{width: 20, height: 20, opacity: 0.3}}/>
                        </TouchableOpacity>
                        
                    </View>
                    :
                    <TouchableOpacity
                    disabled={this.state.isLoading}
                    style={{alignSelf: 'center', marginTop: 30,}}
                    onPress={() => {
                        this.setState(prevState => {
                            prevState.showRefCode = true
                            return prevState
                        })
                    }}>
                        <Text style={{color: BLUE, fontSize: 13, opacity: this.state.isLoading? 0.3 : 1}}>
                        Have a referral code?
                        </Text>
                    </TouchableOpacity>
                }

                {/* Signup Button */}
                <TouchableHighlight underlayColor={ACCENT_DARK}
                disabled={this.state.isLoading}
                onPress={() => {
                    if(this.state.pass == '' || this.state.phone == '')
                        this.showToast("Please fill all the fields");
                    else
                        this.registerCustomer()
                }}
                style={{
                    justifyContent:'center', alignItems: 'center',
                    borderRadius: 4, width: '80%', alignSelf: 'center', paddingVertical: 15, marginTop: 60,
                    backgroundColor: this.state.isLoading? 'gray' : ACCENT
                }}>
                    <Text style={{
                        color: 'white', fontSize: 14, fontWeight: '700', opacity: this.state.isLoading? 0.3 : 1
                    }}>
                        {this.state.isLoading? "Processing..." : "Get OTP"}
                    </Text>
                </TouchableHighlight>
            
                {/* Toast box */}
                <ToastProp ref={toast => this.toast = toast}/>
            </View>
        )
    }
}

const styles = StyleSheet.create({

});