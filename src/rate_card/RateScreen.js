import React, { Component } from 'react';
import {
  StyleSheet,
  View,
  Text,
  Picker,
  Platform,
  TouchableHighlight, Image, Animated, Easing
} from 'react-native';
import * as Constants from '../utils/AppConstants'
import * as DataController from '../utils/DataStorageController'
import ToastComp from '../utils/ToastComp';

const ACCENT = '#FFCB28' // 2, marginBottom: 155, 203, 40 
const ACCENT_DARK = '#F1B800'
const ANIM_DURATION = 150

export default class RateCard extends Component {
    static navigationOptions = ({navigation}) => {
        return{
            headerTitle: 'Rate Card',
        }
    }

    constructor(props) {
        super(props)
        this.state = {
            rates: '',
            vehicles: '',
            selectedIndex: 'none',
            vehPickerOpen: false,
            scrollY: new Animated.Value(1),
            fabItemTranslate: new Animated.Value(0),
            fabItemOpacity: new Animated.Value(0),
            fabScale: new Animated.Value(0),
            scrollOpacity: new Animated.Value(1),
        }

        this.ratesFields = [
            {
                type: 'Base Fare',
                field: 'base_fare',
                extras: ['Upto 4 Kms']
            },
            {
                type: 'Charges',
                field: 'rate',
                extras: ['Post 4 Kms']
            },
            {
                type: '*Loading',
                field: 'loading_charge',
                extras: []
            },
            {
                type: '*Unloading',
                field: 'unloading_charge',
                extras: []
            },
            {
                type: 'Free Time',
                field: 'loading_unloading_time_allowed',
                extras: ['Loading + Unloading']
            },
            {
                type: 'Waiting Charges',
                field: 'waiting_charge',
                extras: ['For waiting time', 'Per Minute'] 
            },
            {
                type: 'Drop Point Charges',
                field: 'rate_per_drop_point',
                extras: ['After 2 drop points', 'Per Point'] 
            },
            {
                type: 'Hourly Charges',
                field: 'hourly_rate',
                extras: [] 
            },

            {
                type: 'Overloading Charges',
                field: 'overload_charge',
                extras: []
            },
        ]
    }

    componentDidMount() {
        this.getVehicleCategory()
    }

    showToast(message) {
        this.toast.show(message);
    }

    getVehicleCategory = async () => {
        const cityId = 1 // TODO: Remove this line, uncomment next line.
        // const cityId = await DataController.getItem(DataController.CITY_ID)
        const id = await DataController.getItem(DataController.CUSTOMER_ID)
    
        const reqURL = Constants.BASE_URL + Constants.VEHICLE_CATEGORY + '?' + 
                        Constants.FIELDS.CUSTOMER_ID + '=' + id + '&' +
                        Constants.FIELDS.CITY_ID_USER + '=' + cityId
    
        const request = await fetch(reqURL, {
            method: 'GET',
            headers: {
                key: Constants.KEY
            }
        })
    
        await request.json().then(value => {
            console.log(value)
    
            if(!value.success){
                this.showToast(value.message);
            }
            else {
                this.setState(prevState => {
                    prevState.vehicles = value.data
                    prevState.rates = value.data[0]
                    prevState.selectedIndex = 0
                    return prevState
                }, () => {
                    Animated.timing(this.state.fabScale, {
                        toValue: 1,
                        duration: ANIM_DURATION,
                        easing: Easing.bounce,
                        useNativeDriver: true,
                    }).start()
                })
            }
            
        }).catch(err => {
            console.log(err)
            this.showToast(Constants.ERROR_GET_DETAILS);
        })
    }

    toggleFAB() {
        if(this.state.vehPickerOpen) {
            Animated.parallel([
                Animated.timing(this.state.fabItemTranslate, {
                    toValue: 0,
                    duration: ANIM_DURATION,
                    easing: Easing.bounce,
                    useNativeDriver: true
                }),
                Animated.timing(this.state.fabItemOpacity, {
                    toValue: 0,
                    duration: ANIM_DURATION,
                    easing: Easing.ease,
                    useNativeDriver: true
                }),
                Animated.timing(this.state.fabScale, {
                    toValue: 1,
                    duration: ANIM_DURATION,
                    easing: Easing.bounce,
                    useNativeDriver: true
                }),
                Animated.timing(this.state.scrollOpacity, {
                    toValue: 1,
                    duration: ANIM_DURATION,
                    easing: Easing.bounce,
                    useNativeDriver: true
                }),
            ]).start(() => {
                this.setState(prevState => {
                    prevState.vehPickerOpen = !prevState.vehPickerOpen;
                    return prevState;
                })
            });
        }
        else {
            this.setState(prevState => {
                prevState.vehPickerOpen = !prevState.vehPickerOpen;
                return prevState;
            }, () => {
                Animated.parallel([
                    Animated.timing(this.state.fabItemTranslate, {
                        toValue: 10,
                        duration: ANIM_DURATION,
                        easing: Easing.bounce,
                        useNativeDriver: true
                    }),
                    Animated.timing(this.state.fabItemOpacity, {
                        toValue: 1,
                        duration: ANIM_DURATION,
                        easing: Easing.ease,
                        useNativeDriver: true
                    }),
                    Animated.timing(this.state.fabScale, {
                        toValue: 0.8,
                        duration: ANIM_DURATION,
                        easing: Easing.bounce,
                        useNativeDriver: true
                    }),
                    Animated.timing(this.state.scrollOpacity, {
                        toValue: 0.2,
                        duration: ANIM_DURATION,
                        easing: Easing.bounce,
                        useNativeDriver: true
                    }),
                ]).start();
            })
        }
    }

    render() {
        const translateX = this.state.scrollY.interpolate({
            inputRange: [100, 180],
            outputRange: [0, 200],
            extrapolate: 'clamp',
        });

        const opacity = this.state.scrollY.interpolate({
            inputRange: [80, 150],
            outputRange: [1, 0],
            extrapolate: 'clamp',
        });

        return(
            <View style={{flex: 1}}>
                <Animated.ScrollView style={{paddingHorizontal: 10, opacity: this.state.scrollOpacity}}
                scrollEventThrottle={1}
                onScroll={Animated.event(
                    [{nativeEvent: {contentOffset: {y: this.state.scrollY}}}],
                    {useNativeDriver: true}
                )}
                scrollEnabled={this.state.vehPickerOpen? false : true}>
                    {this.ratesFields.map((value, index) => {
                        return(
                            <View key={index}>
                                <View style={{
                                    flexDirection: 'row', paddingVertical: 15, paddingHorizontal: 20,
                                    justifyContent: 'space-between'
                                }}>
                                    <View>
                                        <Text style={{fontSize: 15, fontWeight: '700'}}>
                                            {value.type}
                                        </Text>
                                        {value.extras.length > 0? 
                                        <Text style={{fontSize: 10, opacity: 0.4, marginTop: 10}}>{value.extras[0]}</Text> 
                                        : null}
                                    </View>
                                    <View style={{alignItems: 'flex-end'}}>
                                        <Text style={{fontSize: 15, fontWeight: '700'}}>
                                            {this.state.rates !== ''? this.state.rates[value.field] : '-'}
                                        </Text>
                                        {value.extras.length > 1?
                                        <Text style={{fontSize: 10, opacity: 0.4, marginTop: 10}}>{value.extras[1]}</Text> 
                                        : null}
                                    </View>
                                </View>

                                <View 
                                style={{
                                    marginHorizontal: 15,
                                    borderTopColor:'rgba(0, 0, 0, 0.1)',
                                    borderTopWidth: 1
                                }}/>
                            </View> 
                        )
                    })}

                    <Text style={{textAlign: 'center', alignSelf: 'center', opacity: 0.4, fontSize: 10, padding: 15}}>
                        *Loading/Unloading charges applicable only for fround floor goods with unit weight upto 60Kgs.
                        All other charges like Toll Tax etc. will be charged on actual basis.
                    </Text>

                    <Text style={{textAlign: 'center', alignSelf: 'flex-start', fontWeight: '700', opacity: 0.4, fontSize: 13, marginTop: 15, paddingHorizontal: 15}}>
                        Terms and Conditions:
                    </Text>
                    <Text style={{textAlign: 'left', alignSelf: 'flex-start', fontWeight: '700', opacity: 0.4, fontSize: 13, paddingHorizontal: 15, marginTop: 5, marginBottom: 15}}>
                        {Constants.T_C_RATES}
                    </Text>
                </Animated.ScrollView>

                {/* Floating action button to select vehicles */}
                <Animated.View
                style={{
                    backgroundColor: ACCENT, position: 'absolute', width: 70, height: 70,
                    borderRadius: 100, elevation: 4, alignItems: 'center',
                    justifyContent: 'center', alignSelf: 'flex-end', bottom: 20, end: 20,
                    shadowColor: 'rgb(0, 0, 0)', shadowOffset: {width: 0, height: 4},
                    shadowOpacity: 0.25, shadowRadius: 5,
                    transform: [{translateX: translateX}, {scale: this.state.fabScale}], opacity: opacity
                }}>
                    <TouchableHighlight underlayColor={ACCENT_DARK}
                    onPress={() => {
                        this.toggleFAB();
                    }}
                    underlayColor='rgba(255, 203, 40, 0.8)'>
                        <Image source={require('../../assets/ic_notification.png')}
                        style={{width: 40, height: 40, tintColor: 'white'}}/>
                    </TouchableHighlight>
                </Animated.View>

                {/* Floating action button's items */}
                <Animated.View
                style={{
                    position: 'absolute', alignSelf: 'flex-end', bottom: 100, end: 20,
                    transform: [{translateY: this.state.fabItemTranslate}, {translateX: this.state.vehPickerOpen? 0 : 200}],
                    opacity: this.state.fabItemOpacity,
                }}>
                    {
                        this.state.vehicles !== ''?
                        this.state.vehicles.map((value, i) => (
                            <TouchableHighlight underlayColor='transparent' key={i}
                            onPress={() => {
                                this.setState(prevState => {
                                    prevState.rates = value;
                                    return prevState;
                                })
                                this.toggleFAB();
                            }}>
                                <Animated.View
                                style={{
                                    backgroundColor: ACCENT, paddingHorizontal: 15, paddingVertical: 10,
                                    borderRadius: 5, elevation: 2, alignItems: 'center',
                                    justifyContent: 'center',
                                    shadowColor: 'rgb(0, 0, 0)', shadowOffset: {width: 0, height: 4},
                                    shadowOpacity: 0.25, shadowRadius: 5,
                                    opacity: this.state.vehPickerOpen? 1 : 0, marginVertical: 5,
                                }}>
                                    <Text style={{color: 'white',}}>{value.vehicle_name}</Text>
                                </Animated.View>
                            </TouchableHighlight>
                        )) : null
                    }
                </Animated.View>

                <ToastComp ref={t => this.toast = t}/>
            </View>
        )
    }
}

const styles = StyleSheet.create({});

