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
            showPass_NewConf: false
        }
    }

    changePassword = () => {
        ToastAndroid.show('Password should change...', ToastAndroid.SHORT)
        this.props.navigation.navigate("Login")
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
                    borderBottomWidth: 1, width: '80%', marginTop: 10, paddingHorizontal: 5, alignSelf: 'center'
                }}>
                    <TextInput placeholder="New Password" secureTextEntry={true}
                    keyboardType={this.state.showPass_New? 'visible-password' : 'default'}
                    style={{flex: 1, marginHorizontal: 10}}/>

                    <TouchableOpacity
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
                    borderBottomWidth: 1, width: '80%', marginTop: 10, paddingHorizontal: 5, alignSelf: 'center'
                }}>
                    <TextInput placeholder="Confirm Password" secureTextEntry={true}
                    keyboardType={this.state.showPass_NewConf? 'visible-password' : 'default'}
                    style={{flex: 1, marginHorizontal: 10}}/>

                    <TouchableOpacity
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
                    this.changePassword()
                }}
                style={{
                    justifyContent:'center', alignItems: 'center', backgroundColor: ACCENT,
                    borderRadius: 4, width: '80%', alignSelf: 'center', paddingVertical: 15, marginTop: 25
                }}>
                    <Text style={{color: 'white', fontSize: 14, fontWeight: '700'}}>
                        Confirm
                    </Text>
                </TouchableHighlight>
            </View>
        )
    }
}

const styles = StyleSheet.create({

});

