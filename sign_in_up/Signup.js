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

export default class Signup extends Component {
    static navigationOptions = ({navigation}) => {
        return{
            headerTitle: 'Signup',
        }
    }

    constructor(props) {
        super(props)
        this.state = {
            showPass: false
        }
    }

    render() {
        return(
            <View style={{flex: 1, justifyContent: 'center'}}>
                <View 
                style={{
                    flexDirection: 'row', alignItems: 'center', borderBottomColor: 'rgba(0, 0, 0, 0.3)',
                    borderBottomWidth: 1, width: '80%', paddingHorizontal: 5, alignSelf: 'center'
                }}>
                    <Image source={{uri: 'https://cdn3.iconfinder.com/data/icons/google-material-design-icons/48/ic_stay_primary_portrait_48px-512.png'}}
                    style={{width: 25, height: 25, opacity: 0.3}}/>
                    <TextInput placeholder="Mobile Number" keyboardType='decimal-pad' maxLength={10}
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

                {this.state.showRefCode?
                    <View
                    style={{
                        flexDirection: 'row', alignItems: 'center', borderBottomColor: 'rgba(0, 0, 0, 0.3)',
                        borderBottomWidth: 1, width: '80%', marginTop: 10, paddingHorizontal: 5, alignSelf: 'center'
                    }}>
                        <TextInput placeholder="Referral Code"
                        style={{flex: 1, marginHorizontal: 5}}/>

                        <TouchableOpacity
                        onPress={() => {
                            this.setState(prevState => {
                                prevState.showRefCode = false
                                return prevState
                            })
                        }}>
                            <Image source={{uri: 'https://cdn3.iconfinder.com/data/icons/google-material-design-icons/48/ic_cancel_48px-512.png'}}
                        style={{width: 25, height: 25, opacity: 0.3}}/>
                        </TouchableOpacity>
                        
                    </View>
                    :
                    <TouchableOpacity style={{alignSelf: 'center', marginTop: 30}}
                    onPress={() => {
                        this.setState(prevState => {
                            prevState.showRefCode = true
                            return prevState
                        })
                    }}>
                        <Text style={{color: BLUE, fontSize: 13}}>Have a referral code?</Text>
                    </TouchableOpacity>
                }

                <TouchableHighlight
                style={{
                    justifyContent:'center', alignItems: 'center', backgroundColor: ACCENT,
                    borderRadius: 4, width: '80%', alignSelf: 'center', paddingVertical: 15, marginTop: 60
                }}>
                    <Text style={{color: 'white', fontSize: 14, fontWeight: '700'}}>Get OTP</Text>
                </TouchableHighlight>
            </View>
        )
    }
}

const styles = StyleSheet.create({

});

