import React, { Component } from 'react';
import {
  StyleSheet,
  View,
  Text,
  Image,
  StatusBar,
  ToastAndroid
} from 'react-native';
import { TextInput, TouchableHighlight, TouchableOpacity } from 'react-native-gesture-handler';

const Constants = require('../utils/AppConstants')

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
            parent: this.props.navigation.getParam("parent")
        }
    }

    signupUser = () => {
        ToastAndroid.show('Will Signup User...', ToastAndroid.SHORT);
        this.props.navigation.navigate("CreateProfile")
    }

    resetPassword = () => {
        ToastAndroid.show('Will reset password...', ToastAndroid.SHORT)
        this.props.navigation.navigate('ChangePassword')
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
                    Please enter the OTP recieved on your registered mobile number {this.props.navigation.getParam("number")}
                </Text>
                
                <View
                style={{
                    flexDirection: 'row', alignItems: 'center', borderBottomColor: 'rgba(0, 0, 0, 0.3)',
                    borderBottomWidth: 1, width: '80%', marginTop: 40, paddingHorizontal: 5, alignSelf: 'center'
                }}>
                    <TextInput placeholder="Enter OTP" keyboardType='decimal-pad' maxLength={5}
                    style={{flex: 1, marginHorizontal: 10}}/>
                </View>

                <View 
                style={{
                    flexDirection: 'row', alignSelf: 'center', alignItems: 'center',
                    width: '80%', justifyContent: 'space-between', marginTop: 30
                }}>
                    <TouchableOpacity
                    onPress={() => {
                        ToastAndroid.show('Will resend OTP', ToastAndroid.SHORT);
                    }}>
                        <Text style={{color: BLUE, fontSize: 13}}>Resend OTP</Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                    onPress={() => {
                        this.props.navigation.goBack();
                    }}>
                        <Text style={{color: BLUE, fontSize: 13}}>Change Number</Text>
                    </TouchableOpacity>
                </View>
            
                <TouchableHighlight underlayColor={ACCENT_DARK}
                onPress={() => {
                    this.state.parent === Constants.ADD_CUSTOMER_SIGNUP?
                    this.signupUser() : this.resetPassword()
                }}
                style={{
                    justifyContent:'center', alignItems: 'center', backgroundColor: ACCENT,
                    borderRadius: 4, width: '80%', alignSelf: 'center', paddingVertical: 15, marginTop: 25
                }}>
                    <Text style={{color: 'white', fontSize: 14, fontWeight: '700'}}>
                        {this.state.parent === Constants.ADD_CUSTOMER_SIGNUP? 
                        "Next" : "Reset"}
                    </Text>
                </TouchableHighlight>
            </View>
        )
    }
}

const styles = StyleSheet.create({

});

