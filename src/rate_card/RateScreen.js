import React, { Component } from 'react';
import {
  StyleSheet,
  View,
  Text,
  Picker,
} from 'react-native';
import { ScrollView } from 'react-native-gesture-handler';
import * as Constants from '../utils/AppConstants'
import * as DataController from '../utils/DataStorageController'

const ACCENT = '#FFCB28' // 255, 203, 40 

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
                key: "21db33e221e41d37e27094153b8a8a02"
            }
        })
    
        const response = await request.json().then(value => {
            console.log(value)
    
            if(!value.success){
                ToastAndroid.show(value.message, ToastAndroid.SHORT);
            }
            else {
                this.setState(prevState => {
                    prevState.vehicles = value.data
                    prevState.rates = value.data[0]
                    prevState.selectedIndex = 0
                    return prevState
                })
            }
            
        }).catch(err => {
            console.log(err)
            ToastAndroid.show(Constants.ERROR_GET_DETAILS, ToastAndroid.SHORT);
        })
    }

    render() {
        return(
            <View style={{flex: 1}}>
                <View
                style={{
                    width: '95%', backgroundColor: 'white',
                    elevation: 2, alignSelf: 'center', borderRadius: 3,
                    marginTop: 15, paddingHorizontal: 5
                }}>
                    <Picker
                    selectedValue={this.state.selectedIndex}
                    style={{
                        height: 50, width: '100%',
                    }}
                    onValueChange={(itemValue, itemIndex) =>
                        this.setState(prevState => {
                            prevState.selectedIndex = itemValue
                            prevState.rates = prevState.vehicles[itemValue]
                            return prevState
                        })
                    }>
                        {
                            this.state.vehicles !== ''?
                            this.state.vehicles.map((value, index) => {
                                return(
                                    <Picker.Item label={value.vehicle_name} value={index} />
                                )
                            }) :
                            <Picker.Item label="Getting Vehicles..." value='none' />
                        }
                    </Picker>
                </View>

                <ScrollView style={{display: this.state.rates === ''? "none" : "flex"}}>
                    {this.ratesFields.map((value, index) => {
                        console.log(value.field, this.state.rates)
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
                                            {this.state.rates[value.field]}
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
                </ScrollView>
            </View>
        )
    }
}

const styles = StyleSheet.create({

});

