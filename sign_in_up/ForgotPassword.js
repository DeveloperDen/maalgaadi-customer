import React, { Component } from 'react';
import {
  StyleSheet,
  View,
  Text,
  Image,
  StatusBar
} from 'react-native';
import { TextInput, TouchableHighlight, TouchableOpacity } from 'react-native-gesture-handler';

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
        }
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
                    borderBottomWidth: 1, width: '80%', marginTop: 40, paddingHorizontal: 5, alignSelf: 'center'
                }}>
                    <Image source={{uri: 'https://cdn3.iconfinder.com/data/icons/google-material-design-icons/48/ic_stay_primary_portrait_48px-512.png'}}
                    style={{width: 25, height: 25, opacity: 0.3}}/>

                    <TextInput placeholder="Enter your Mobile Number" keyboardType='decimal-pad' maxLength={10}
                    style={{flex: 1, marginHorizontal: 10}}/>
                </View>

                <TouchableHighlight
                style={{
                    justifyContent:'center', alignItems: 'center', backgroundColor: ACCENT,
                    borderRadius: 4, width: '80%', alignSelf: 'center', paddingVertical: 15, marginTop: 50
                }}>
                    <Text style={{color: 'white', fontSize: 14, fontWeight: '700'}}>Get OTP</Text>
                </TouchableHighlight>
            </View>
        )
    }
}

const styles = StyleSheet.create({

});

