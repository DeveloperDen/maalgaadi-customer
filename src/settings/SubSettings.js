import React, { Component } from 'react';
import {
  StyleSheet,
  View,
  Switch,
  TouchableHighlight,
  Text
} from 'react-native';
import SMS from './settings_components/SMS'
import AppNotif from './settings_components/AppNotif'
import PODInv from './settings_components/PODInvoice'
import PODMail from './settings_components/PODMail';
import Others from './settings_components/Others';

const ACCENT = '#FFCB28' // 255, 203, 40
const ACCENT_DARK = '#F1B800' 

const DataController = require('../utils/DataStorageController')
const _SMS = 'SMS Alerts'
const APP_NOTIF = 'App Notifications'
const POD_INV = 'Proof of Delivery & Invoices'
const POD_MAIL = 'Invoice and POD mail Subjects'
const OTHERS = 'Others'

export default class SubSettings extends Component {
    static navigationOptions = ({navigation}) => {
        return{
            headerTitle: navigation.getParam('title', 'Settings'),
        }
    }

    constructor(props) {
        super(props)

        this.state = {
            settings: this.props.navigation.getParam('settings'),
        }
    }

    onSwitchChange = (field) => {
        this.setState(prevState => {
            prevState.settings[field] = !prevState.settings[field]
            return prevState
        })
    }

    async componentWillUnmount() {
        this.props.navigation.state.params.onGoBack(this.state.settings)
    }

    render() {
        return(
            <View style={{flex: 1}}>
                {this.props.navigation.getParam('title') === _SMS && 
                <SMS settings={this.state.settings} onSwitchChange={this.onSwitchChange}/>}
                
                {this.props.navigation.getParam('title') === APP_NOTIF && 
                <AppNotif settings={this.state.settings} onSwitchChange={this.onSwitchChange}/>}

                {this.props.navigation.getParam('title') === POD_INV &&
                <PODInv settings={this.state.settings} onSwitchChange={this.onSwitchChange}/>}
                
                {this.props.navigation.getParam('title') === POD_MAIL && 
                <PODMail settings={this.state.settings} onSwitchChange={this.onSwitchChange}/>}

                {this.props.navigation.getParam('title') === OTHERS && 
                <Others settings={this.state.settings} onSwitchChange={this.onSwitchChange}/>}
            </View>
        )
    }
}

const styles = StyleSheet.create({

});

