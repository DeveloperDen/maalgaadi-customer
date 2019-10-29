import React, { Component } from 'react';
import {
  StyleSheet,
  View,
} from 'react-native';

const rupee = require('../res/rupee_outline.png')

const ACCENT = '#FFCB28' // 255, 203, 40
const ACCENT_DARK = '#F1B800' 

export default class Notifications extends Component {
    static navigationOptions = ({navigation}) => {
        return{
            headerTitle: 'Notifications',
        }
    }

    constructor(props) {
        super(props)
        this.state = {}
    }

    render() {
        return(
            <View style={{flex: 1}}>
                
            </View>
        )
    }
}

const styles = StyleSheet.create({

});

