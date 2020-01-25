import React, { Component } from 'react';
import DateTimePicker from '@react-native-community/datetimepicker';
import { View, Animated, Modal, TouchableOpacity, Image, Text, Easing, Platform } from 'react-native';
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
            boxOpacity: new Animated.Value(0),
            date: this.props.value? this.props.value : new Date,
            mode: 'date',
        }
    }

    showToggle(show) {
        if(Platform.OS == "android") {
            this.setState(prevState => {
                prevState.showDateTime = show;
                return prevState;
            })
        }
        else { // For iOS
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
                        useNativeDriver: true,
                        easing: Easing.ease
                    }
                ),
                Animated.timing(this.state.boxOpacity,
                    {
                        toValue: show? 1 : 0,
                        duration: 100,
                        useNativeDriver: true,
                    }
                )
            ])
            
            this.animation.start(() => {
                if(!show) {
                    this.setState(prevState => {
                        prevState.overlayOpacity= new Animated.Value(0);
                        prevState.pickerTranslateY= new Animated.Value(200);
                        prevState.boxOpacity= new Animated.Value(0);
                        prevState.showDateTime= false;
                        return prevState;
                    })
                }
            });
        }
    }

    render() {
        const datePickerAndroid =
        this.state.showDateTime &&
            <DateTimePicker
            minimumDate={this.props.minimumDate? this.props.minimumDate : new Date}
            maximumDate={this.props.maximumDate? this.props.maximumDate : null}
            value={this.state.date}
            mode={Platform.OS == 'ios'? 'datetime' : this.state.mode}
            onChange={(event, date) => {
                if(event.type == "set") {
                    if(this.state.mode == 'time') { // Since, time dialog was shown, date and time are set, don't show the dialog.
                        this.showToggle(false);
                        this.setState(prevState => {
                            prevState.mode = 'date';
                            return prevState;
                        }, () => {
                            this.updatedDate.setHours(this.state.date.getHours());
                            this.updatedDate.setMinutes(this.state.date.getMinutes());
                            this.props.dateTimeSetter(this.updatedDate);
                        })
                    }

                    else {
                        this.setState(prevState => {
                            prevState.mode = 'time';
                            return prevState;
                        });
                        this.updatedDate = date;
                    }
                }
                else if(event.type == "dismissed") {
                    this.showToggle(false);

                    this.setState(prevState => {
                        prevState.mode = 'date';
                        return prevState;
                    })
                }
            }}/>

        datePickerIOS =
        <Modal
          transparent={true}
          visible={this.state.showDateTime}
          onRequestClose={() => {
            this.showToggle(false)
          }}>
              <View style={{justifyContent: 'flex-end', height: '100%',}}>
                <Animated.View style={{opacity: this.state.overlayOpacity, backgroundColor: 'black', height: '100%', width: '100%', position: 'absolute'}}/>
                <Animated.View
                style={{
                    transform: [{translateY: this.state.pickerTranslateY}], backgroundColor: 'white', padding: 15, zIndex: 100, alignSelf: 'center',width: '80%', borderTopStartRadius: 20, borderTopEndRadius: 20,
                    elevation: 20,
                    shadowColor: 'rgb(0, 0, 0)',
                    shadowOffset: {width: 0, height: -4},
                    shadowOpacity: 0.3,
                    shadowRadius: 6,
                    opacity: this.state.boxOpacity
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
                            this.props.dateTimeSetter(this.state.date);
                            this.showToggle(false);
                        }}>
                            <Text style={{fontSize: 18, fontWeight: '700', padding: 15, color: ACCENT_DARK}}>DONE</Text>
                        </TouchableOpacity>
                    </View>
                    
                    <DateTimePicker
                    minimumDate={this.props.minimumDate? this.props.minimumDate : new Date}
                    maximumDate={this.props.maximumDate? this.props.maximumDate : null}
                    value={this.state.date}
                    mode="datetime"
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