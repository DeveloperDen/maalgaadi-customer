import React, { Component } from 'react';
import {
  StyleSheet,
  TouchableOpacity,
  TouchableHighlight,
  Image,
  View,
  Text,
  StatusBar,
  Dimensions,
  Keyboard,
  ScrollView,
  Animated,
  Modal
} from 'react-native';

const ACCENT = '#FFCB28'

export default class RunningMyBookings extends Component {
  constructor(props) {
    super(props)
    this.state = {}
  }

  render() {
    return(
        <View style={{flex: 1, textAlign: "center",
        alignContent: 'center', justifyContent: 'center',
        opacity: 0.3, marginHorizontal: 20}}>
            <Text style={{textAlign: "center", fontSize: 20,}}>
              Details for all your ongoing trips will be shown here. Book a MaalGaadi now!
            </Text>
        </View>
    )
  }
}

const styles = StyleSheet.create({});

