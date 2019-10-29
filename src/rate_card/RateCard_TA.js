import React, { Component } from 'react';
import {
  StyleSheet,
  View,
  Text,
  Picker,
  Image
} from 'react-native';
import { ScrollView } from 'react-native-gesture-handler';

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
        }
        this.rates = [
            {
                type: 'Base Fare',
                value: `${String.fromCharCode(8377)} 280`,
                extras: ['Upto 4 Kms']
            },
            {
                type: 'Charges',
                value: `${String.fromCharCode(8377)} 22`,
                extras: ['Post 4 Kms']
            },
            {
                type: '*Loading',
                value: `${String.fromCharCode(8377)} 100`,
                extras: []
            },
            {
                type: '*Unloading',
                value: `${String.fromCharCode(8377)} 100`,
                extras: []
            },
            {
                type: 'Free Time',
                value: '60 mins',
                extras: ['Loading + Unloading']
            },
            {
                type: 'Waiting Charges',
                value: `${String.fromCharCode(8377)} 1.50`,
                extras: ['For waiting time', 'Per Minute'] 
            },
            {
                type: 'Drop Point Charges',
                value: `${String.fromCharCode(8377)} 25`,
                extras: ['After 2 drop points', 'Per Point'] 
            },
            {
                type: 'Hourly Charges',
                value: `${String.fromCharCode(8377)} 150`,
                extras: [] 
            },

            {
                type: 'Ovrloading Charges',
                value: `${String.fromCharCode(8377)} 75`,
                extras: []
            },
        ]
    }

    render() {
        return(
            <View style={{flex: 1}}>
                <ScrollView>
                    {this.rates.map((value, index) => {
                        return(
                            <View key={index}>
                                <View style={{
                                    flexDirection: 'row', paddingVertical: 15, paddingHorizontal: 15,
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
                                    <View>
                                        <Text style={{fontSize: 15, fontWeight: '700'}}>
                                            {value.value}
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
                                    borderTopWidth: 1}}/>
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

