import React, { Component } from 'react';
import DateTimePicker from '@react-native-community/datetimepicker';
import { View, Animated, Modal, TouchableOpacity, Image, Text } from 'react-native';
import { ICONS } from './AppConstants';

const ACCENT = '#FFCB28' // 255, 203, 40
const ACCENT_DARK = '#F1B800'

export default class DateTimePickerComp extends Component {
    constructor(props) {
        super(props);
        
        this.state = {
            showDateTime: false,
            overlayOpacity: new Animated.Value(0),
            pickerTranslateY: new Animated.Value(200),
            date: new Date,
        }
    }

    showToggle(show) {
        if(show) {
            this.setState(prevState => {
                prevState.showDateTime = true;
                return prevState;
            })
        }

        this.animation = Animated.parallel([
            Animated.timing(this.state.overlayOpacity,
                {
                    toValue: show? 0.5 : 0,
                    duration: show? 100 : 200,
                    useNativeDriver: true
                }
            ),
            Animated.timing(this.state.pickerTranslateY,
                {
                    toValue: show? 0 : 200,
                    duration: show? 200 : 100,
                    useNativeDriver: true
                }
            )
        ])
        
        this.animation.start(() => {
            if(!show) {
                this.setState(prevState => {
                    prevState.showDateTime = false;
                    return prevState;
                })
            }
        });
    }

    render() {
        // TODO: Setup for Android
        datePickerAndroid =
            <View/>

        datePickerIOS =
        <Modal
          animationType="none"
          transparent={true}
          visible={this.state.showDateTime}
          onRequestClose={() => {
            this.showToggle(false)
          }}>
              <View style={{justifyContent: 'flex-end', height: '100%'}}>
                <Animated.View style={{opacity: this.state.overlayOpacity, backgroundColor: 'black', height: '100%', width: '100%', position: 'absolute'}}/>
                <Animated.View
                style={{
                    transform: [{translateY: this.state.pickerTranslateY}], backgroundColor: 'white', padding: 15, zIndex: 100, alignSelf: 'center',width: '80%', borderTopStartRadius: 20, borderTopEndRadius: 20,
                    elevation: 20,
                    shadowColor: 'rgb(0, 0, 0)',
                    shadowOffset: {width: 0, height: -4},
                    shadowOpacity: 0.3,
                    shadowRadius: 6,
                }}>
                    <View style={{flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center'}}>
                        <TouchableOpacity
                        onPress={() => {
                            this.showToggle(false);
                        }}>
                            <Image source={ICONS.close} style={{width: 30, height: 30, opacity: 0.2}}/>
                        </TouchableOpacity>
                        <TouchableOpacity
                        onPress={() => {
                            this.props.setDateTime.call(this.state.date);
                        }}>
                            <Text style={{fontSize: 18, fontWeight: '700', padding: 15, color: ACCENT_DARK}}>DONE</Text>
                        </TouchableOpacity>
                    </View>
                    <DateTimePicker
                    value={this.state.date}
                    mode="datetime"
                    minimumDate={new Date()}
                    onChange={(event, date) => {
                        this.setState(prevState => {
                            prevState.date = date;
                            return prevState;
                        })
                    }}/>
                </Animated.View>
            </View>
        </Modal>

        if(Platform.OS == "android") {
            return(datePickerAndroid);
        }else {
            return(datePickerIOS);
        }
    }
}