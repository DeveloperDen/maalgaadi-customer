import React, { Component } from 'react';
import {
  StyleSheet,
  View,
  StatusBar,
  Image,
} from 'react-native';

const Constants = require('./utils/AppConstants')
const DataController = require('./utils/DataStorageController')
const logo = require('../assets/logo_splash.png')
const ACCENT = '#FFCB28' // 255, 203, 40
const ACCENT_DARK = '#F1B800'

export default class Splash extends Component {
    static navigationOptions = ({navigation}) => {
        return{
            headerStyle: {display: 'none'},
        }
    }

    constructor(props) {
        super(props)
        this.state = {}
    }

    componentDidMount() {
        setTimeout(async () => {
            const screen = (await DataController.getItem(DataController.IS_LOGIN) === "true")? 
            'HomeDrawerNavigator' : 'RegistrationNavigator'
            this.props.navigation.navigate(screen)
        }, Constants.SPLASH_TIMEOUT)
    }

    render() {
        return(
            <View style={{
                flex: 1, backgroundColor: ACCENT, justifyContent: 'center', alignItems: 'center'
            }}>
                <StatusBar hidden={true}/>

                <Image source={logo} resizeMode="contain"
                style={{width: '80%'}}/>
            </View>
        )
    }
}

const styles = StyleSheet.create({

});

