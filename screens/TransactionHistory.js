import React, { Component } from 'react';
import {
  StyleSheet,
  View,
  Text
} from 'react-native';

const rupee = require('../res/rupee_outline.png')

const ACCENT = '#FFCB28' // 255, 203, 40
const ACCENT_DARK = '#F1B800'
const GREEN = '#24C800' // 36, 200, 0

export default class TransactionHistory extends Component {
    static navigationOptions = ({navigation}) => {
        return{
            headerTitle: 'Transaction History',
            headerRight:
                <Text style={{fontSize: 18, fontWeight: '700', color: GREEN, marginEnd: 22}}>
                    {String.fromCharCode(8377) + ' ' + navigation.getParam('balance')}
                </Text>
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

