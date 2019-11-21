import React, { Component } from 'react';
import {
  StyleSheet,
  View,
  Text,
  Image,
  Modal,
  TouchableHighlight,
  ToastAndroid,
  ActivityIndicator
} from 'react-native';
import { TextInput, ScrollView } from 'react-native-gesture-handler';
import uuid from 'uuid-random'
import { TripEstimateDataModel } from '../models/trip_estimate_model';
import { NavigationActions } from 'react-navigation';

const DataController = require('../utils/DataStorageController')
const Constants = require('../utils/AppConstants')
const BookingModel = require('../models/bookings_model')
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
            modalVisible: false,
            noDrivAvailModalVisible: false,
            findDrivModalVisible: false,
            tripEstimate: 0,
            yourPrice: 0,
            payDriver: 0,
            mgMoney: 0,
            inValidPrice: false
        }
        this.destinations = props.navigation.getParam('destination')
        this.bookingModel = ''
        this.minOffered = 0
        this.maxOffered = 0
        this.payDriver = 0
    }

    setModalVisible = (visible, findDriv = false) => {
        this.setState(prevState => {
            if(findDriv)
                prevState.findDrivModalVisible = visible
            else
                prevState.modalVisible = visible
            return prevState
        })
    }

    showNoDriverAvailableDialog = (visible) => {
        this.setState(prevState => {
            prevState.noDrivAvailModalVisible = visible
            return prevState
        })
    }

    async componentDidMount() {
        this.bookingModel = JSON.parse(await DataController.getItem(DataController.BOOKING_MODEL))
        this.bookingModel.customer_id = parseInt(this.bookingModel.customer_id)
        this.getOfferedPercentage()
        this.getBookingEstimate()
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

    getBookingEstimate = async () => {
        const reqURL = Constants.BASE_URL + Constants.GET_TRIP_ESTIMATE
        console.log("Request: ", this.bookingModel)
        const request = await fetch(reqURL, {
            method: 'POST',
            headers: {
                key: "21db33e221e41d37e27094153b8a8a02",
                'Content-Type': 'application/json',

            },
            body: JSON.stringify(this.bookingModel)
        })
    
        const response = await request.json().then(value => {
            console.log(value)
            if(value.success) {
                const UUID = uuid()
                console.log("UUID: ", UUID)
                this.bookingModel.random_code = UUID

                const detailModel = value.data
                let estimateModel = new TripEstimateDataModel()
                estimateModel.setData(detailModel)
                this.bookingModel.booking_estimate = estimateModel.getModel()
                this.setState(prevState => {
                    prevState.tripEstimate = value.data.upper_estimated_bill
                    prevState.yourPrice = value.data.upper_customer_own_price
                    prevState.payDriver = value.data.final_amount
                    prevState.mgMoney = value.data.customer_balance
                    return prevState
                })
                this.payDriver = value.data.final_amount
            }
            else {
                ToastAndroid.show(value.message, ToastAndroid.SHORT)
            }
        }).catch(err => {
            console.log(err)
            ToastAndroid.show(Constants.ERROR_GET_DETAILS, ToastAndroid.SHORT);
        })
    }

    confirmBooking = async () => {
        this.bookingModel.booking_estimate.data.upper_customer_own_price = this.state.yourPrice

        // TODO: Remove it. Presently, it is unnecessary but still required in request.
        this.bookingModel.booking_estimate.data.cashback_amount = 0

        const reqURL = Constants.BASE_URL + Constants.ADD_CUSTOMER_BOOKING
        console.log("Req URL: ", reqURL)
        console.log("Request: ", this.bookingModel)
        const request = await fetch(reqURL, {
            method: 'POST',
            headers: {
                key: "21db33e221e41d37e27094153b8a8a02",
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(this.bookingModel)
        })
    
        const response = await request.json().then(value => {
            console.log(value)
            if(value.success) {
                // TODO: Save bookingID to Storage
                // const bookingID = value.data.booking_id

                const dataObj = value.data
                const tripObj = value.trip_data
                const responseCode = dataObj.responseCode
                const responseMsg = value.message

                this.checkResponseCode(responseCode, responseMsg, tripObj)
            }
            else {
                this.setModalVisible(false, true)
                ToastAndroid.show(value.message, ToastAndroid.SHORT)
            }
        }).catch(err => {
            console.log(err)
            ToastAndroid.show(err, ToastAndroid.SHORT);
            this.setModalVisible(false, true)
        })  
    }

    checkResponseCode = async (code, message, tripObj) => {
        console.log("Code: ", code)
        switch(code){
            case 0:
                this.showNoDriverAvailableDialog()
                break;
            case 1:
                ToastAndroid.show(message, ToastAndroid.SHORT);
                await DataController.setItem(DataController.RUNNING_TRIP_DATA, JSON.stringify(tripObj))
                this.props.navigation.reset([NavigationActions.navigate({routeName: "TripDetails"})])
                break;
            case 2:
                // this.showNoFavDriverAvailableDialog()
                break;
            case 3:
                // Same as case 1
                break;
            case 4:
                // TODO
                // this.props.navigation.replace("MyBookings")
                break;
        }

        this.setModalVisible(false, true)
    }

    cancelBooking = async () => {
        const reqBody = new FormData()
        reqBody.append(Constants.FIELDS.RANDOM_CODE, this.bookingModel.random_code)
        reqBody.append(Constants.FIELDS.BOOK_EVE_TYPE, this.bookingModel.booking_event_type)

        console.log('Request Body: ', reqBody)

        const request = await fetch(Constants.BASE_URL + Constants.DELETE_BOOKING, {
            method: 'POST',
            body: reqBody,
            headers: {
                key: "21db33e221e41d37e27094153b8a8a02"
            }
        })

        const response = await request.json().then(async value => {
            console.log("Response: ", value);
            this.setModalVisible(false, true)
            this.showNoDriverAvailableDialog(false)
            if(value.success) {
                ToastAndroid.show("Booking Cancelled!", ToastAndroid.SHORT)
                this.props.navigation.popToTop()
            }
            else if(value.data.responseCode === 1) {
                console.log("Case 1: ", value.message)
                ToastAndroid.show(value.message, ToastAndroid.SHORT);
                // TODO
                // DataController.setItem(DataController.RUNNING_TRIP_DATA, JSON.stringify(tripObj))
                // this.props.navigation.replace("TripDetails", {/* Add Some Params */})
            }
            else {
                console.log(value.message);
                ToastAndroid.show(value.message, ToastAndroid.SHORT);
            }
        }).catch(err => {
            console.log(err)
            ToastAndroid.show(err, ToastAndroid.SHORT);
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
                                    backgroundColor:'rgba(0, 0, 0, 0.1)',
                                    display: (this.destinations.length - 1) >= 1? 'flex' : 'none'
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
                                    {this.props.navigation.getParam('vehicle').vehicle_name}
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
                                marginBottom: 10, borderBottomColor: 'rgba(0, 0, 0, 0.2)', borderBottomWidth: 2,
                            }}>
                                <Text style={{fontSize: 35}}>{String.fromCharCode(8377)}</Text>
                                <TextInput value={this.state.yourPrice}
                                style={{
                                    fontSize: 40,
                                }} keyboardType="decimal-pad"
                                onChangeText={(text) => {
                                    if(text === '') {
                                        this.setState(prevState => {
                                            prevState.inValidPrice = false
                                            prevState.payDriver = this.payDriver
                                            prevState.yourPrice = text
                                            return prevState
                                        })
                                    }
                                    else {
                                        let inValidPrice = false
                                        const percentEstmatePrice = this.state.tripEstimate * this.minOffered / 100;

                                        let newAmt = this.state.tripEstimate - percentEstmatePrice;

                                        let customerWallet = this.state.mgMoney;
                                        let finalcustomeOwnPrice = 0;

                                        if (text >= newAmt) {
                                            if(customerWallet > 0){
                                                if(text > customerWallet){
                                                    finalcustomeOwnPrice = text - customerWallet;
                                                }else {
                                                    finalcustomeOwnPrice = 0;
                                                }
                
                                            }else {
                                                finalcustomeOwnPrice = text;
                                            }
                                        }
                                        else {
                                            finalcustomeOwnPrice = this.payDriver
                                            inValidPrice = true
                                        }

                                        this.setState(prevState => {
                                            prevState.payDriver = finalcustomeOwnPrice
                                            prevState.yourPrice = text
                                            prevState.inValidPrice = inValidPrice
                                            return prevState
                                        })
                                    }
                                }}/>
                            </View>

                            <Text
                            style={{
                                alignSelf: 'center', color: 'red', fontStyle: 'italic', fontSize: 12,
                                marginBottom: 15, display: this.state.inValidPrice? 'flex' : 'none'
                            }}>
                                Price too Low. Please upgrade it.
                            </Text>

                            <View style={{
                            flex: 1,
                            borderTopColor:'rgba(0, 0, 0, 0.1)',
                            borderTopWidth: 1}}/>
                            <View style={{flexDirection: 'row', alignItems:'center', justifyContent: 'space-between'}}>
                                <Text style={{opacity: 0.5, marginStart: 10, marginVertical:8, fontSize: 12}}>
                                    SUGGESTED PRICE*
                                </Text>
                                <Text style={{fontWeight: '700', marginEnd: 10, marginVertical:8, fontSize: 12}}>
                                    {String.fromCharCode(8377) + this.state.tripEstimate}
                                </Text>
                            </View>
                            <Text style={{marginHorizontal: 10, opacity: 0.3, fontSize: 10, marginBottom: 10}}>
                                *The Suggested Price is only MaalGaadi's suggested price. Rates entered by the user will
                                be the final price subject to change in case of Waiting Charges
                            </Text>   
                        </View>
                        
                        <View
                        style={{
                            flexDirection: 'row', alignItems:'center', justifyContent: 'space-between',
                            marginTop: 20
                        }}>
                            <Text style={{opacity: 0.5, marginStart: 10, fontSize: 16}}>
                                PAY DRIVER
                            </Text>
                            <Text style={{fontWeight: '700', marginEnd: 10, fontSize: 16}}>
                                {String.fromCharCode(8377) + this.state.payDriver}
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
                                {String.fromCharCode(8377) + this.state.mgMoney}
                            </Text>
                        </View>
                    </View>
                </ScrollView>
                
                {/* Confirm Booking button. */}
                <TouchableHighlight
                underlayColor={ACCENT_DARK}
                onPress={() => {
                    if(this.state.inValidPrice || this.state.yourPrice === ''){
                        ToastAndroid.show("Please Upgrade your price", ToastAndroid.SHORT)
                    }
                    else {
                        let isBookingAllow = false;

                        const customeOwnPrice = this.state.yourPrice;

                        const percentEstmatePrice = this.state.tripEstimate * this.minOffered / 100;

                        const newAmt = this.state.tripEstimate - percentEstmatePrice;
                        
                        if (customeOwnPrice >= newAmt) {
                            isBookingAllow = true;
                        } else {
                            ToastAndroid.show("Please Upgrade your price", ToastAndroid.SHORT)
                            isBookingAllow = false;
                        }

                        if(isBookingAllow){
                            if (!this.bookingModel.book_later) {
                                if (this.bookingModel.booking_event_type == BookingModel.BookingEventType.EDIT) {
                                    // TODO
                                    // this.editBooking();
                                    ToastAndroid.show('Will edit Booking.', ToastAndroid.SHORT)
                                } else {
                                    this.setModalVisible(true, true)
                                    this.confirmBooking();
                                }
                            } else {
                                // TODO
                                // this.confirmBooking();
                                ToastAndroid.show("Will book later.", ToastAndroid.SHORT)
                            }
                        }
                            
                    }
                }}
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

                {/* Dialog to Find Driver */}
                <Modal
                animationType="fade"
                transparent={true}
                visible={this.state.findDrivModalVisible}
                onRequestClose={() => {
                    return;
                }}>
                    <View style={{
                    backgroundColor: 'rgba(0, 0, 0, 0.7)',
                    height: '100%',
                    alignItems: "center",
                    justifyContent: 'center'
                    }}>
                        <View
                        style={{backgroundColor: 'white', width: '80%',
                        paddingTop: 20, borderRadius: 3,
                        elevation: 10, overflow: 'hidden'}}>
                            <Text style={{
                                fontWeight: '700', fontSize: 18, textAlign: 'center',
                                alignSelf: 'center', marginHorizontal: 15
                            }}>
                                {Constants.FIND_DRIVER_TITLE}
                            </Text>
                            <ActivityIndicator size="large" color={ACCENT} style={{alignSelf: 'center', marginTop: 15}}/>
                            <Text style={{
                                textAlign: 'center', alignSelf: 'center', marginTop: 15,
                                opacity: 0.3, marginHorizontal: 15
                            }}>
                                {Constants.FIND_DRIVER_DESC}
                            </Text>

                            <TouchableHighlight
                                underlayColor={ACCENT_DARK}
                                onPress={() => {
                                    this.cancelBooking()
                                }}
                                style={{
                                    paddingVertical: 15, alignItems: 'center', justifyContent: 'center',
                                    backgroundColor: ACCENT, marginTop: 15
                                }}>
                                    <Text style={{color: 'white'}}>CANCEL</Text>
                            </TouchableHighlight>
                        </View>
                    </View>
                </Modal>

                {/* No Driver Found Dialog  */}
                <Modal
                animationType="fade"
                transparent={true}
                visible={this.state.noDrivAvailModalVisible}
                onRequestClose={() => {
                    return;
                }}>
                    <View style={{
                    backgroundColor: 'rgba(0, 0, 0, 0.7)',
                    height: '100%',
                    alignItems: "center",
                    justifyContent: 'center'
                    }}>
                        <View
                        style={{backgroundColor: 'white', width: '80%',
                        paddingTop: 20, borderRadius: 3,
                        elevation: 10, overflow: 'hidden'}}>
                            <Text style={{
                                fontWeight: '700', fontSize: 18, textAlign: 'center',
                                alignSelf: 'center', marginHorizontal: 15
                            }}>
                                {Constants.NO_DRIVER_FOUND_T}
                            </Text>
                            <Text style={{
                                textAlign: 'center', alignSelf: 'center', marginTop: 15,
                                opacity: 0.3, marginHorizontal: 15
                            }}>
                                {Constants.NO_DRIVER_FOUND_D}
                            </Text>

                            <TouchableHighlight
                                underlayColor={ACCENT_DARK}
                                onPress={() => {
                                    this.cancelBooking()
                                }}
                                style={{
                                    paddingVertical: 15, alignItems: 'center', justifyContent: 'center',
                                    backgroundColor: ACCENT, marginTop: 15
                                }}>
                                    <Text style={{color: 'white'}}>CANCEL</Text>
                            </TouchableHighlight>
                        </View>
                    </View>
                </Modal>
            </View>
        )
    }
}

const styles = StyleSheet.create({
});
