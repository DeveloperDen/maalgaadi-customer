import React, { Component } from 'react';
import {
  StyleSheet,
  View,
  Text
} from 'react-native';
import { ScrollView } from 'react-native-gesture-handler';

const Constants = require('./utils/AppConstants')
const ACCENT = '#FFCB28' // 255, 203, 40
const ACCENT_DARK = '#F1B800' 

export default class Notifications extends Component {
    static navigationOptions = ({navigation}) => {
        return{
            headerTitle: 'Terms and Conditions',
        }
    }

    constructor(props) {
        super(props)
        this.state = {}
    }

    render() {
        return(
            <ScrollView style={{flex: 1}}>
                {
                    Constants.T_C.map((value, index) => {return(
                        <View style={{flexDirection: 'row', marginHorizontal: 30, marginTop: 20}}>
                            <Text style={{fontWeight: '700', fontSize: 16}}>{index + 1 + '. '}</Text>
                            <Text style={{fontSize: 16, textAlign: 'left'}}>{value}</Text>
                        </View>
                    )})
                }
            </ScrollView>
        )
    }
}

const styles = StyleSheet.create({

});

