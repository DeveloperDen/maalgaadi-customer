import React, { Component } from 'react';
import {
  StyleSheet,
  View,
  Animated
} from 'react-native';

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
                <View style={{backgroundColor: 'red', height: 120, width: '100%',alignItems: 'center', justifyContent: 'center', alignSelf: 'center'}}
                onStartShouldSetResponder={(event) => {
                    console.log("___Start X: ", event.nativeEvent.locationX)

                }}
                onTouchEnd={(event) => {
                    console.log("___End X: ", event.nativeEvent.locationX)
                }}
                onMoveShouldSetResponderCapture={(event) => {
                    console.log("Move X: ", event.nativeEvent.locationX)
                }}>
                    <Animated.Image style={{height: 100, width: "100%"}}
                        resizeMode="cover"
                        source={{uri: "https://irisapi.dcnpl.com/IrisAdmin/admin-assets/images/product/head-turn-all/fh-2019-11-19-15-51-14.png"}}
                    />
                </View>
            </View>
        )
    }
}

const styles = StyleSheet.create({});

