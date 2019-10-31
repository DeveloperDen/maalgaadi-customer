import React, { Component } from 'react';
import {
  StyleSheet,
  View,
  Text,
  Image,
  StatusBar,
  Animated, Easing
} from 'react-native';
import { TextInput, TouchableHighlight, TouchableOpacity } from 'react-native-gesture-handler';

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
            messageTop: new Animated.Value(-100),
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
                key: "21db33e221e41d37e27094153b8a8a02"
            }
        })

        const response = await request.json().then(value => {
            console.log(value)
            this.setState(prevState => {
                prevState.isLoading = false
                return prevState
            })
        })

        this.props.navigation.navigate("Login", {
            status: Constants.FORGET_PASSWORD_URL
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
            <View style={{flex: 1, }}>
                <StatusBar backgroundColor='white' 
                barStyle="dark-content"/>

                <Text 
                style={{
                    textAlign: "center", marginTop: 50, marginHorizontal: 40, fontSize: 15,
                    opacity: 0.3
                }}>
                    Please enter a new Password
                </Text>

                <View
                style={{
                    flexDirection: 'row', alignItems: 'center', borderBottomColor: 'rgba(0, 0, 0, 0.3)',
                    borderBottomWidth: 1, width: '80%', marginTop: 10, paddingHorizontal: 5, alignSelf: 'center',
                    opacity: this.state.isLoading? 0.3 : 1
                }}>
                    <TextInput
                    editable={!this.state.isLoading}
                    placeholder="New Password" secureTextEntry={true}
                    keyboardType={this.state.showPass_New? 'visible-password' : 'default'}
                    style={{flex: 1, marginHorizontal: 10}}
                    onChangeText={text => {
                        this.setState(prevState => {
                            prevState.pass = text
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
                        <Image source={{uri: 
                        this.state.showPass_New? 'https://cdn3.iconfinder.com/data/icons/google-material-design-icons/48/ic_remove_red_eye_48px-512.png' :
                        'https://cdn3.iconfinder.com/data/icons/google-material-design-icons/48/ic_visibility_off_48px-512.png'}}
                    style={{width: 25, height: 25, opacity: 0.3}}/>
                    </TouchableOpacity>
                    
                </View>
            
                <View
                style={{
                    flexDirection: 'row', alignItems: 'center', borderBottomColor: 'rgba(0, 0, 0, 0.3)',
                    borderBottomWidth: 1, width: '80%', marginTop: 10, paddingHorizontal: 5, alignSelf: 'center',
                    opacity: this.state.isLoading? 0.3 : 1
                }}>
                    <TextInput editable={!this.state.isLoading}
                    placeholder="Confirm Password" secureTextEntry={true}
                    keyboardType={this.state.showPass_NewConf? 'visible-password' : 'default'}
                    style={{flex: 1, marginHorizontal: 10}}
                    onChangeText={text => {
                        this.setState(prevState => {
                            prevState.confPass = text
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
                        <Image source={{uri: 
                        this.state.showPass_NewConf? 'https://cdn3.iconfinder.com/data/icons/google-material-design-icons/48/ic_remove_red_eye_48px-512.png' :
                        'https://cdn3.iconfinder.com/data/icons/google-material-design-icons/48/ic_visibility_off_48px-512.png'}}
                    style={{width: 25, height: 25, opacity: 0.3}}/>
                    </TouchableOpacity>
                    
                </View>

                <TouchableHighlight underlayColor={ACCENT_DARK}
                onPress={() => {
                    if(this.state.confPass !== this.state.pass) {
                        this.setState(prevState => {
                            prevState.message = Constants.PASS_MISMATCH
                            return prevState
                        })
                        this.animTop()
                    }
                    else this.changePassword();
                }}
                style={{
                    justifyContent:'center', alignItems: 'center',
                    borderRadius: 4, width: '80%', alignSelf: 'center', paddingVertical: 15, marginTop: 25,
                    backgroundColor: this.state.isLoading? 'gray' : ACCENT
                }}>
                    <Text style={{color: 'white', fontSize: 14, fontWeight: '700', opacity: this.state.isLoading? 0.3 : 1}}>
                        {this.state.isLoading? "Processing..." : "Confirm"}
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

