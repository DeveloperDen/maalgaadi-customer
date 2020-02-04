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

export default class ChangePassword extends Component {
    static navigationOptions = ({navigation}) => {
        return{
            headerTitle: 'Change Password',
        }
    }

    constructor(props) {
        super(props)
        this.state = {
            showPass_New: false,
            showPass_NewConf: false,
            pass: '',
            confPass: '',
            message: '',
            invalidText: true
        }

        this.number = this.props.navigation.getParam("number");
    }

    changePassword = async () => {
        this.setState(prevState => {
            prevState.isLoading = true
            return prevState
        })

        const reqBody = new FormData()
        reqBody.append(Constants.FIELDS.CUSTOMER_PHONE, this.number)
        reqBody.append(Constants.FIELDS.CUSTOMER_PASSWORD, this.state.pass)

        console.log('Request Body: ', reqBody)

        const request = await fetch(Constants.BASE_URL + Constants.FORGET_PASSWORD_URL, {
            method: 'POST',
            body: reqBody,
            headers: {
                key: Constants.KEY
            }
        })

        const response = await request.json().then(value => {
            console.log(value)
            this.setState(prevState => {
                prevState.isLoading = false
                return prevState
            })
            this.props.navigation.navigate("Login", {
            status: Constants.FORGET_PASSWORD_URL
            })
        }).catch(err => {
            console.log(err)
            this.setState(prevState => {
                prevState.isLoading = false
                return prevState
            })
            this.showToast(Constants.ERROR_UPDATE_PROFILE);
        })
    }

    showToast = (text = '') => {
        if(text !== '')
            this.toast.show(text);
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
                    Please enter a new Password of length more than 6 characters
                </Text>

                <View
                style={{
                    flexDirection: 'row', alignItems: 'center', borderBottomColor: 'rgba(0, 0, 0, 0.3)',
                    borderBottomWidth: 1, width: '80%', marginTop: 15, paddingHorizontal: 5, alignSelf: 'center',
                    opacity: this.state.isLoading? 0.3 : 1, paddingBottom: Platform.OS == "ios"? 5 : 0
                }}>
                    <TextInput
                    editable={!this.state.isLoading} returnKeyType="done"
                    placeholder="New Password" secureTextEntry={this.state.showPass_New? false : true}
                    style={{flex: 1, marginHorizontal: 10}}
                    onChangeText={text => {
                        this.setState(prevState => {
                            prevState.pass = text;

                            if(text.length >= 6 && (text == prevState.confPass)) {
                                prevState.invalidText = false;
                            }
                            else {
                                prevState.invalidText = true;
                            }

                            return prevState;
                        })
                    }}/>

                    <TouchableOpacity
                    disabled={this.state.isLoading}
                    onPress={() => {
                        this.setState(prevState => {
                            prevState.showPass_New = !prevState.showPass_New
                            return prevState
                        })
                    }}>
                        <Image source={
                        this.state.showPass_New? Constants.ICONS.show_pass : Constants.ICONS.hide_pass}
                    style={{width: 25, height: 25, opacity: 0.3}}/>
                    </TouchableOpacity>
                    
                </View>
            
                <View
                style={{
                    flexDirection: 'row', alignItems: 'center', borderBottomColor: 'rgba(0, 0, 0, 0.3)',
                    borderBottomWidth: 1, width: '80%', marginTop: 10, paddingHorizontal: 5, alignSelf: 'center',
                    opacity: this.state.isLoading? 0.3 : 1, paddingBottom: Platform.OS == "ios"? 5 : 0
                }}>
                    <TextInput editable={!this.state.isLoading} returnKeyType="done"
                    placeholder="Confirm Password" secureTextEntry={this.state.showPass_NewConf? false : true}
                    style={{flex: 1, marginHorizontal: 10}}
                    onChangeText={text => {
                        this.setState(prevState => {
                            prevState.confPass = text;

                            if(text.length >= 6 && (text == prevState.pass)) {
                                prevState.invalidText = false;
                            }
                            else
                                prevState.invalidText = true;
                            
                            return prevState;
                        })
                    }}/>

                    <TouchableOpacity
                    disabled={this.state.isLoading}
                    onPress={() => {
                        this.setState(prevState => {
                            prevState.showPass_NewConf = !prevState.showPass_NewConf
                            return prevState
                        })
                    }}>
                        <Image source={
                        this.state.showPass_NewConf? Constants.ICONS.show_pass : Constants.ICONS.hide_pass}
                    style={{width: 25, height: 25, opacity: 0.3}}/>
                    </TouchableOpacity>
                    
                </View>

                <TouchableHighlight underlayColor={ACCENT_DARK}
                disabled={this.state.isLoading || this.state.invalidText}
                onPress={() => {
                    if(this.state.confPass == '' || this.state.pass == '')
                        this.showToast("Please fill the fields");
                    else if(this.state.confPass !== this.state.pass)
                        this.showToast(Constants.PASS_MISMATCH);
                    else this.changePassword();
                }}
                style={{
                    justifyContent:'center', alignItems: 'center',
                    borderRadius: 4, width: '80%', alignSelf: 'center', paddingVertical: 15, marginTop: 25,
                    backgroundColor: (this.state.isLoading || this.state.invalidText)? 'gray' : ACCENT
                }}>
                    <Text style={{color: 'white', fontSize: 14, fontWeight: '700', opacity: (this.state.isLoading || this.invalidText)? 0.3 : 1}}>
                        {this.state.invalidText? "Confirm" : this.state.isLoading? "Processing..." : "Confirm"}
                    </Text>
                </TouchableHighlight>
            
                {/* Toast box */}
                <ToastComp ref={t => this.toast = t}/>
            </View>
        )
    }
}

const styles = StyleSheet.create({

});

