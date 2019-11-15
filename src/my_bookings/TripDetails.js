import React, { Component } from 'react';
import {
  StyleSheet,
  View,
  Text,
  Image
} from 'react-native';
import { ScrollView, TouchableHighlight } from 'react-native-gesture-handler';

const ACCENT = '#FFCB28' // 255, 203, 40
const ACCENT_DARK = '#F1B800' 

export default class TripDetails extends Component {
    static navigationOptions = ({navigation}) => {
        return{
            headerTitle: 'Trip Details',
            headerRight:
            <Text style={{backgroundColor='gray', padding: 10, marginEnd: 16}}>
                {navigation.getParam('status', '-')}
            </Text>
        }
    }

    constructor(props) {
        super(props)
        this.state = {}
    }

    render() {
        return(
            <View style={{flex: 1, backgroundColor: 'rgba(0, 0, 0, 0.1)'}}>
                <ScrollView>
                    <View style={{padding: 10, marginTop: 10, backgroundColor: 'white', borderRadius: 4}}>
                        <View style={{flexDirection: 'row'}}>
                            <View style={{
                                backgroundColor: 'green',
                                elevation: 3,
                                borderWidth: 1,
                                borderColor: 'white',
                                width: 12,
                                height: 12,
                                borderRadius: 100
                                }}/>
                                <Text>{this.state.pickupLoc}</Text>
                        </View>
                        <View style={{flexDirection: 'row'}}>
                            <View style={{
                                backgroundColor: 'red',
                                elevation: 3,
                                borderWidth: 1,
                                borderColor: 'white',
                                width: 12,
                                height: 12,
                                borderRadius: 100
                                }}/>
                                <Text>{this.state.dropLoc}</Text>
                        </View>
                    </View>

                    <View style={{padding: 10, marginTop: 10, backgroundColor: 'white', borderRadius: 4}}>
                        <Text>DRIVER DETAILS</Text>
                        <View style={{
                            flex: 1,
                            borderTopColor:'rgba(0, 0, 0, 0.1)',
                            borderTopWidth: 1}}/>
                        <View style={{flexDirection: 'row'}}>
                            <Image source={}/>
                            <View>
                                <Text style={{fontWeight: "700"}}>
                                    {this.state.drivName}
                                </Text>
                                <Text>
                                    {this.state.vehicle}
                                </Text>
                                <Text>
                                    {this.state.vehicleNum}
                                </Text>
                            </View>
                            <TouchableHighlight>
                                <View style={{flexDirection: 'row'}}>
                                    <Image source={}/>
                                    <Text>Call</Text>
                                </View>
                            </TouchableHighlight>
                        </View>
                    </View>
                
                    <View style={{padding: 10, marginTop: 10, backgroundColor: 'white', borderRadius: 4}}>
                        <Text>CHARGES</Text>
                        <View style={{
                            flex: 1,
                            borderTopColor:'rgba(0, 0, 0, 0.1)',
                            borderTopWidth: 1}}/>
                        
                        <View style={styles.row_space}>
                            <View>
                                <Text>BILL</Text>
                                <Text>{this.state.chargeBill}</Text>
                            </View>
                            <View>
                                <Text>PAYMENT</Text>
                                <Text>{this.state.chargePayment}</Text>
                            </View>
                        </View>
                    </View>
                
                    <View style={{padding: 10, marginTop: 10, backgroundColor: 'white', borderRadius: 4}}>
                        <Text>DETAILS</Text>
                        <View style={{
                            flex: 1,
                            borderTopColor:'rgba(0, 0, 0, 0.1)',
                            borderTopWidth: 1}}/>
                        <View style={styles.row_space}>
                            <Text>Booking Type</Text>
                            <Text>{this.state.bookingType}</Text>
                        </View>
                        <View style={styles.row_space}>
                            <Text>Trip Charge</Text>
                            <Text>{this.state.tripCharge}</Text>
                        </View>
                        <View style={styles.row_space}>
                            <Text>Loading</Text>
                            <Text>{this.state.loading}</Text>
                        </View>
                        <View style={styles.row_space}>
                            <Text>Unloading</Text>
                            <Text>{this.state.unloading}</Text>
                        </View>
                        <View style={styles.row_space}>
                            <Text>Total</Text>
                            <Text>{this.state.total}</Text>
                        </View>
                    </View>
                </ScrollView>
            </View>
        )
    }
}

const styles = StyleSheet.create({
    row_space: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between'
    }
});

