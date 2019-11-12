import React, { Component } from 'react';
import {
  StyleSheet,
  View,
  Text,
  Image,
  Modal,
  TouchableHighlight,
  ToastAndroid
} from 'react-native';
import { TextInput, ScrollView } from 'react-native-gesture-handler';

const DataController = require('../utils/DataStorageController')
const Constants = require('../utils/AppConstants')
const ACCENT = '#FFCB28' // 255, 203, 40
const ACCENT_DARK = '#F1B800'
const vehicleIcon = require('../../assets/vehicle.png')

export default class FareEstimation extends Component {
    static navigationOptions = ({navigation}) => {
        return{
            headerTitle: 'Trip Estimate',
        }
    }

    constructor(props) {
        super(props)
        this.state = {
            modalVisible: false
        }
        this.destinations = props.navigation.getParam('destination')
        this.bookingModel = ''
    }

    setModalVisible = (visible) => {
        this.setState(prevState => {
            prevState.modalVisible = visible
            return prevState
        })
    }

    async componentDidMount() {
        this.getOfferedPercentage()
        this.bookingModel = JSON.parse(await DataController.getItem(DataController.BOOKING_MODEL))
    }

    getOfferedPercentage = async () => {
        const reqURL = Constants.BASE_URL + Constants.GETOFFEREDPERCENTAGE
    
        const request = await fetch(reqURL, {
            method: 'GET',
            headers: {
                key: "21db33e221e41d37e27094153b8a8a02"
            }
        })
    
        const response = await request.json().then(value => {
            console.log(value)
            this.minOffered = value.min_offered_amount
            this.maxOffered = value.max_offered_amount
            
        }).catch(err => {
            console.log(err)
            ToastAndroid.show(Constants.ERROR_GET_DETAILS, ToastAndroid.SHORT);
        })       
    }

    render() {
        return(
            <View style={{flex: 1}}>
                <ScrollView>
                    <View style={{marginHorizontal: 15, marginTop: 10, marginBottom: 20}}>
                        <View style={{borderRadius: 5, borderColor:'rgba(0, 0, 0, 0.1)',
                                borderWidth: 1}}>
                            <View
                            style={{
                            flexDirection: 'row',
                            alignItems: "center",
                            marginVertical: 12,
                            marginHorizontal: 10
                            }}>
                                <View style={{
                                backgroundColor: 'green',
                                elevation: 3,
                                borderWidth: 1,
                                borderColor: 'white',
                                width: 12,
                                height: 12,
                                borderRadius: 100
                                }}/>
                                <Text ellipsizeMode='tail'
                                style={{flex: 1, marginStart: 12, fontSize: 15}}>
                                    {this.props.navigation.getParam('origin').address}
                                </Text>
                            </View>
                            
                            <View style={{flexDirection: 'row', alignItems: 'center', marginVertical: 5}}>
                                <View style={{
                                    flex: 1,
                                    borderTopColor:'rgba(0, 0, 0, 0.1)',
                                    borderTopWidth: 1}}/>
                                
                                <TouchableHighlight
                                underlayColor="rgba(0, 0, 0, 0.15)"
                                onPress={() => this.setModalVisible(true)}
                                style={{
                                    borderRadius: 100, paddingHorizontal: 25, paddingVertical: 3,
                                    backgroundColor:'rgba(0, 0, 0, 0.1)'
                                }}>
                                    <Text style={{color: 'rgba(0, 0, 0, 0.5)', fontSize: 12}}>
                                        {this.destinations.length - 1} Way Point
                                    </Text>
                                </TouchableHighlight>
                                
                                <View style={{
                                    flex: 1,
                                    borderTopColor:'rgba(0, 0, 0, 0.1)',
                                    borderTopWidth: 1}}/>
                            </View>

                            <View
                            style={{
                            flexDirection: 'row',
                            alignItems: "center",
                            marginVertical: 12,
                            paddingEnd: 20,
                            marginHorizontal: 10
                            }}>
                                <View style={{
                                backgroundColor: 'red',
                                elevation: 3,
                                borderWidth: 1,
                                borderColor: 'white',
                                width: 12,
                                height: 12,
                                borderRadius: 100
                                }}/>
                                <Text ellipsizeMode='tail'
                                style={{flex: 1, marginStart: 12, fontSize: 15}}>
                                    {this.destinations[this.destinations.length - 1].address}
                                </Text>
                            </View>
                        </View>

                        <View
                        style={{
                            flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
                            paddingHorizontal: 20, marginTop: 10, borderRadius: 5, borderColor:'rgba(0, 0, 0, 0.1)',
                            borderWidth: 1, paddingVertical: 10
                        }}>
                            <Image source={vehicleIcon} style={{width: 50, height: 50}}/>
                            <View>
                                <Text style={{fontSize: 20, fontWeight: '700'}}>
                                    {this.props.navigation.getParam('vehicle')}
                                </Text>
                                <Text style={{fontSize: 15, opacity: 0.4, marginTop: 5}}>
                                    {this.props.navigation.getParam('covered')}
                                </Text>
                            </View>   
                        </View>
                    
                        <View style={{borderRadius: 5, borderColor:'rgba(0, 0, 0, 0.1)',
                                borderWidth: 1, marginTop: 10}}>
                            <Text style={{opacity: 0.5, marginStart: 10, marginVertical:8, fontSize: 12}}>
                                ENTER YOUR OWN PRICE
                            </Text>
                            <View style={{
                            flex: 1,
                            borderTopColor:'rgba(0, 0, 0, 0.1)',
                            borderTopWidth: 1}}/>

                            <View
                            style={{
                                flexDirection: 'row', alignItems: "center", alignSelf: 'center',
                                marginBottom: 10
                            }}>
                                <Text style={{fontSize: 35}}>{String.fromCharCode(8377)}</Text>
                                <TextInput defaultValue='0' style={{
                                    fontSize: 40, borderBottomColor: 'rgba(0, 0, 0, 0.2)', borderBottomWidth: 2
                                }} keyboardType="decimal-pad"/>
                            </View>

                            <View style={{
                            flex: 1,
                            borderTopColor:'rgba(0, 0, 0, 0.1)',
                            borderTopWidth: 1}}/>
                            <View style={{flexDirection: 'row', alignItems:'center', justifyContent: 'space-between'}}>
                                <Text style={{opacity: 0.5, marginStart: 10, marginVertical:8, fontSize: 12}}>
                                    SUGGESTED PRICE*
                                </Text>
                                <Text style={{fontWeight: '700', marginEnd: 10, marginVertical:8, fontSize: 12}}>
                                    {String.fromCharCode(8377)}377
                                </Text>
                            </View>
                            <Text style={{marginHorizontal: 10, opacity: 0.3, fontSize: 10, marginBottom: 10}}>
                                *The Suggested Price is only MaalGaadi's suggested price. Rates entered by the user will
                                be the final price subject to change in case of Waiting Charges
                            </Text>   
                        </View>
                        
                        <View style={{
                            flexDirection: 'row', alignItems:'center', justifyContent: 'space-between',
                            marginTop: 20
                        }}>
                            <Text style={{opacity: 0.5, marginStart: 10, fontSize: 16}}>
                                PAY DRIVER
                            </Text>
                            <Text style={{fontWeight: '700', marginEnd: 10, fontSize: 16}}>
                                {String.fromCharCode(8377)}388
                            </Text>
                        </View>
                        <View
                        style={{
                            flexDirection: 'row', alignItems:'center', justifyContent: 'space-between',
                            marginTop: 10
                        }}>
                            <Text style={{opacity: 0.5, marginStart: 10, fontSize: 16}}>
                                MG WALLET BALANCE
                            </Text>
                            <Text style={{fontWeight: '700', marginEnd: 10, fontSize: 16}}>
                                {String.fromCharCode(8377)}0
                            </Text>
                        </View>
                    </View>
                </ScrollView>
                
                {/* Confirm Booking button. */}
                <TouchableHighlight
                underlayColor={ACCENT_DARK}
                onPress={() => {return}}
                style={{
                    backgroundColor: ACCENT,
                    paddingVertical: 15,
                    justifyContent: 'center',
                    alignItems: 'center',
                    elevation: 10
                }}>
                    <Text style={{fontSize: 18, fontWeight: '700', color: 'white'}}>Confirm Booking</Text>
                </TouchableHighlight>

                {/* Dialog to show Drop Points */}
                <Modal
                animationType="fade"
                transparent={true}
                visible={this.state.modalVisible}
                onRequestClose={() => {
                    this.setModalVisible(false)
                }}>
                    <View style={{
                    backgroundColor: 'rgba(0, 0, 0, 0.7)',
                    height: '100%',
                    alignItems: "center",
                    justifyContent: 'center'
                    }}>
                        <View
                        style={{backgroundColor: 'white', width: '80%',
                        paddingHorizontal: 12, paddingBottom: 20, borderRadius: 3,
                        elevation: 10}}>
                            <TouchableHighlight
                            style={{alignSelf: 'flex-end', marginTop: 10,}}
                            onPress={() => {this.setModalVisible(false)}}
                            underlayColor='white'>
                                <Image
                                source={{uri: 'https://cdn3.iconfinder.com/data/icons/google-material-design-icons/48/ic_close_48px-512.png'}}
                                tintColor='black'
                                style={{width: 22, height: 22}}/>
                            </TouchableHighlight>

                            {this.destinations.slice(0, -1).map((item, index) => {
                                return(
                                    <View key={index}
                                    style={{
                                    flexDirection: 'row',
                                    alignItems: "center",
                                    marginVertical: 12,
                                    marginStart: 15,
                                    paddingEnd: 20
                                    }}>
                                        <View style={{
                                            backgroundColor: 'red',
                                            elevation: 3,
                                            borderWidth: 1,
                                            borderColor: 'white',
                                            width: 15,
                                            height: 15,
                                            borderRadius: 100
                                            }}/>
                                        <Text ellipsizeMode='tail'
                                        style={{flex: 1, marginStart: 12, fontSize: 15}}>
                                            {item.address}
                                        </Text>
                                    </View>
                                )
                            })}
                        </View>
                    </View>
                </Modal>
                    
            </View>
        )
    }
}

const styles = StyleSheet.create({

});

