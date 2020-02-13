import React, { Component } from 'react';
import {
  StyleSheet,
  View,
  Text
} from 'react-native';

const ACCENT = '#FFCB28' // 255, 203, 40
const ACCENT_DARK = '#F1B800' 

export default class Notifications extends Component {

    constructor(props) {
        super(props)
        this.state = {}
    }

    render() {
        return(
            <View style={{flex: 1}}>
                <View style={{flex: 1, textAlign: "center",
                alignContent: 'center', justifyContent: 'center',
                opacity: 0.3, marginHorizontal: 20}}>
                    <Text style={{textAlign: "center", fontSize: 16,}}>
                        No POD Pending
                    </Text>
                </View>
            </View>
        )
    }
}

const styles = StyleSheet.create({

});

