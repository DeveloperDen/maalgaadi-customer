import React, { Component } from 'react';
import {
  StyleSheet,
  View,
  Text,
  Image,
  Modal,
  TouchableHighlight,
  ActivityIndicator,
  Animated,
  Easing
} from 'react-native';
import { TextInput, ScrollView} from 'react-native-gesture-handler';
import uuid from 'uuid-random'
import { TripEstimateDataModel } from '../models/trip_estimate_model';
import { NavigationActions, StackActions } from 'react-navigation';
import ProgressCircle from 'react-native-progress-circle'
import ToastComp from '../utils/ToastComp'

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
            responseMessage: '',
            responseModalVisible: false,
            loadingModalVisible: true,
            modalVisible: false,
            noDrivAvailModalVisible: false,
            noDrivAvailModalMessage: '',
            findDrivModalVisible: false,
            tripEstimate: 0,
            yourPrice: 0,
            payDriver: 0,
            mgMoney: 0,
            inValidPrice: false,
            findDrivTime: 100,
            timer: 0,
            showWaitModal: false,
            waitingArray: null,
            selectedWaitingTime: 0,
            messageBoxTrans: new Animated.Value(-100)
        }
        this.destinations = props.navigation.getParam('destination')
        this.bookingModel = ''
        this.minOffered = 0
        this.maxOffered = 0
        this.payDriver = 0
    }

    setModalVisible = (visible, findDriv = false, loading = false) => {
        this.setState(prevState => {
            if(loading)
                prevState.loadingModalVisible = visible
            else {
                if(findDriv)
                    prevState.findDrivModalVisible = visible
                else
                    prevState.modalVisible = visible
            }
            
            return prevState
        })
    }

    showNoDriverAvailableDialog = (visible, message = '') => {
        this.setState(prevState => {
            prevState.noDrivAvailModalVisible = visible
            prevState.noDrivAvailModalMessage = message
            return prevState
        })
    }

    async componentDidMount() {
        this.bookingModel = JSON.parse(await DataController.getItem(DataController.BOOKING_MODEL))
        this.bookingModel.customer_id = parseInt(this.bookingModel.customer_id)
        this.confSettings = JSON.parse(await DataController.getItem(DataController.CONFIGURE_SETTING))

        this.getOfferedPercentage()
        this.getBookingEstimate()
    }

    getOfferedPercentage = async () => {
        const reqURL = Constants.BASE_URL + Constants.GETOFFEREDPERCENTAGE
    
        const request = await fetch(reqURL, {
            method: 'GET',
            headers: {
                key: Constants.KEY
            }
        })
    
        const response = await request.json().then(value => {
            console.log(value)
            this.minOffered = value.min_offered_amount
            this.maxOffered = value.max_offered_amount
            
        }).catch(err => {
            console.log(err)
            this.showToast(Constants.ERROR_GET_DETAILS);
        })       
    }

    showToast(text) {
        this.toast.show(text);
    }

    showMessage(show=true) {
        if(!show) {
            Animated.timing(this.state.messageBoxTrans, {
                toValue: -100,
                duration: 100,
                easing: Easing.ease,
                useNativeDriver: true,
            }).start();
        }
        else {
            Animated.timing(this.state.messageBoxTrans, {
                toValue: 0,
                duration: 100,
                easing: Easing.ease,
                useNativeDriver: true,
            }).start();
        }
    }

    getBookingEstimate = async () => {
        const reqURL = Constants.BASE_URL + Constants.GET_TRIP_ESTIMATE
        console.log("Request: ", this.bookingModel)
        const request = await fetch(reqURL, {
            method: 'POST',
            headers: {
                key: Constants.KEY,
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(this.bookingModel)
        })

        await request.json().then(value => {
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
                this.showToast(value.message)
            }
        }).catch(err => {
            console.log(err)
            this.showToast(Constants.ERROR_GET_DETAILS);
        })

        this.setModalVisible(false, false, true);
    }

    confirmBooking = async () => {
        this.bookingModel.booking_estimate.data.upper_customer_own_price = this.state.yourPrice

        // TODO: Remove it. Presently, it is unnecessary but still required in request.
        this.bookingModel.booking_estimate.data.cashback_amount = 0

        // "booking_time": "14 Dec 2019 01:00 PM"
        let timeArr = this.bookingModel.booking_time.split(' ');
        const bookTime = timeArr[3];
        let hrsMin = bookTime.split(':');
        let hrs = parseInt(hrsMin[0]);
        if(hrs > 12) {
            hrs = hrs - 12;
            hrs = hrs < 10? '0' + hrs : hrs.toString();
        }
        else {
            hrs = hrs.toString();
        }
        hrsMin[0] = hrs;
        hrsMin = hrsMin.join(':');
        timeArr[3] = hrsMin;
        this.bookingModel.booking_time = timeArr.join(' ');
        this.bookingModel.booking_estimate.data.booking_time = timeArr.join(' ');

        this.bookingModel.booking_estimate.data.customer_balance = parseInt(this.bookingModel.booking_estimate.data.customer_balance);

        this.bookingModel.booking_estimate.data.lower_estimated_distance_in_km = parseInt(this.bookingModel.booking_estimate.data.lower_estimated_distance_in_km);

        this.bookingModel.booking_estimate.data.upper_customer_own_price = parseInt(this.bookingModel.booking_estimate.data.upper_customer_own_price);

        this.bookingModel.booking_estimate.data.upper_estimated_distance_in_km = parseInt(this.bookingModel.booking_estimate.data.upper_estimated_distance_in_km);

        this.bookingModel.booking_estimate.data.upper_estimated_distance_in_meter = this.bookingModel.booking_estimate.data.upper_estimated_distance_in_meter.toString();

        delete this.bookingModel.vehicle.allow_auto_allotment
        delete this.bookingModel.vehicle.allow_driver_distance_from_pickup

        const reqURL = Constants.BASE_URL + Constants.ADD_CUSTOMER_BOOKING
        console.log("Req URL: ", reqURL)
        console.log("Request: ", this.bookingModel)
        const request = await fetch(reqURL, {
            method: 'POST',
            headers: {
                key: Constants.KEY,
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(this.bookingModel)
        })
    
        await request.json().then(value => {
            console.log(value)
            if(value.success) {
                const bookingID = value.data.booking_id
                this.bookingModel.booking_id = bookingID;

                DataController.setItem(DataController.BOOKING_ID, bookingID.toString());

                const dataObj = value.data
                const tripObj = value.trip_data
                const responseCode = dataObj.responseCode
                const responseMsg = value.message

                this.checkResponseCode(responseCode, responseMsg, tripObj)
            }
            else {
                this.setModalVisible(false, true)
                this.showToast(value.message)
            }
        }).catch(err => {
            console.log(err)
            this.showToast(err);
            this.setModalVisible(false, true)
        })  
    }

    editBooking = async () => {
        this.bookingModel.booking_estimate.data.upper_customer_own_price = this.state.yourPrice

        // TODO: Remove it. Presently, it is unnecessary but still required in request.
        this.bookingModel.booking_estimate.data.cashback_amount = 0

        // "booking_time": "14 Dec 2019 01:00 PM"
        let timeArr = this.bookingModel.booking_time.split(' ');
        const bookTime = timeArr[3];
        let hrsMin = bookTime.split(':');
        let hrs = parseInt(hrsMin[0]);
        if(hrs > 12) {
            hrs = hrs - 12;
            hrs = hrs < 10? '0' + hrs : hrs.toString();
        }
        else {
            hrs = hrs.toString();
        }
        hrsMin[0] = hrs;
        hrsMin = hrsMin.join(':');
        timeArr[3] = hrsMin;
        this.bookingModel.booking_time = timeArr.join(' ');
        this.bookingModel.booking_estimate.data.booking_time = timeArr.join(' ');

        this.bookingModel.booking_estimate.data.customer_balance = parseInt(this.bookingModel.booking_estimate.data.customer_balance);

        this.bookingModel.booking_estimate.data.lower_estimated_distance_in_km = parseInt(this.bookingModel.booking_estimate.data.lower_estimated_distance_in_km);

        this.bookingModel.booking_estimate.data.upper_customer_own_price = parseInt(this.bookingModel.booking_estimate.data.upper_customer_own_price);

        this.bookingModel.booking_estimate.data.upper_estimated_distance_in_km = parseInt(this.bookingModel.booking_estimate.data.upper_estimated_distance_in_km);

        this.bookingModel.booking_estimate.data.upper_estimated_distance_in_meter = this.bookingModel.booking_estimate.data.upper_estimated_distance_in_meter.toString();

        delete this.bookingModel.vehicle.allow_auto_allotment
        delete this.bookingModel.vehicle.allow_driver_distance_from_pickup

        const reqURL = Constants.BASE_URL + Constants.EDIT_CUSTOMER_BOOKING
        console.log("Req URL: ", reqURL)
        console.log("Request: ", this.bookingModel)
        const request = await fetch(reqURL, {
            method: 'POST',
            headers: {
                key: Constants.KEY,
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(this.bookingModel)
        })
    
        await request.json().then(value => {
            console.log(value)
            if(value.success) {
                const bookingID = value.data.booking_id
                this.bookingModel.booking_id = bookingID;
                DataController.setItem(DataController.BOOKING_ID, bookingID.toString());

                const dataObj = value.data
                const tripObj = value.trip_data
                const responseCode = dataObj.responseCode
                const responseMsg = value.message

                this.checkResponseCode(responseCode, responseMsg, tripObj)
            }
            else {
                this.setModalVisible(false, true)
                this.showToast(value.message)
            }
        }).catch(err => {
            console.log(err)
            this.showToast(err);
            this.setModalVisible(false, true)
        })  
    }

    checkResponseCode = async (code, message, tripObj) => {
        console.log("Code: ", code)
        switch(code){
            case 0:
                this.showNoDriverAvailableDialog(true, message)
                break;
            case 1:
            case 3:
                this.showToast(message);
                await DataController.setItem(DataController.RUNNING_TRIP_DATA, JSON.stringify(tripObj))
                this.props.navigation.reset([
                    NavigationActions.navigate({routeName: "Main"
                    }),
                    NavigationActions.navigate({routeName: "TripDetails", params: {
                    [DataController.RUNNING_TRIP_DATA]: true,
                }})])
                break;
            case 2:
                this.showNoDriverAvailableDialog(true, message)
                // this.showNoFavDriverAvailableDialog()
                break;
            case 4:
                this.setState(prevState => {
                    prevState.responseMessage = message;
                    prevState.responseModalVisible = true;
                    return prevState;
                })
                break;
            case 5:
                this.showNoDriverAvailableDialog(true, message)
                break;
        }

        this.bookingModel.booking_event_type == BookingModel.BookingEventType.EDIT?
        this.setModalVisible(false, false, true) : this.setModalVisible(false, true);
        clearInterval(this.findDrivInterval);
        clearTimeout(this.findDrivTimeout);
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
                key: Constants.KEY
            }
        })

        await request.json().then(async value => {
            console.log("Response: ", value);
            this.setModalVisible(false, true)
            this.showNoDriverAvailableDialog(false)
            if(value.success) {
                this.showToast("Booking Cancelled!")
                this.props.navigation.popToTop()
            }
            else if(value.data.responseCode === 1) {
                console.log("Case 1: ", value.message)
                this.showToast(value.message);
                // TODO
                // DataController.setItem(DataController.RUNNING_TRIP_DATA, JSON.stringify(tripObj))
                // this.props.navigation.replace("TripDetails", {/* Add Some Params */})
            }
            else {
                console.log(value.message);
                this.showToast(value.message);
            }
        }).catch(err => {
            console.log(err)
            this.showToast(err);
        })
    }

    startFindDrivInterval() {
        // Set an interval to increase progress value after every second. It returns an Interval number.
        this.findDrivInterval = setInterval(() => {
            this.setState(prevState => {
                prevState.findDrivTime -= 1.66 // Each percent is 100% / 60secs = 1.66
                prevState.timer += 1
                return prevState
            })
        }, 1000);

        // After 60 seconds, clear the interval to find driver, using the interval number returned.
        this.findDrivTimeout = setTimeout(() => {
            console.log("Timer Completed!")
            clearInterval(this.findDrivInterval);
            clearTimeout(this.findDrivTimeout);
            this.setModalVisible(false, true);
            this.showNoDriverAvailableDialog(true);
        }, 60000)
    }

    // Called when Waiting time is selected.
    async saveBookingResponse() {
        const bookingID = parseInt(await DataController.getItem(DataController.BOOKING_ID));
        const isAllotToFavDriv = this.bookingModel.allot_to_fav_driver
        const bookEveType = this.bookingModel.booking_event_type

        const reqBody = new FormData()
        reqBody.append(Constants.FIELDS.BOOKING_ID, bookingID)
        reqBody.append(Constants.FIELDS.FAV_DRIV_REQ, isAllotToFavDriv)
        reqBody.append(Constants.FIELDS.WAIT_TIME, this.state.selectedWaitingTime)
        reqBody.append(Constants.FIELDS.BOOK_EVE, bookEveType)

        console.log('Request: ', reqBody)

        const request = await fetch(Constants.BASE_URL + Constants.SAVE_BOOKING_RESPONSE, {
            method: 'POST',
            body: reqBody,
            headers: {
                key: Constants.KEY
            }
        })
        
        await request.json().then(async value => {
            console.log("Response: ", value)

            if(value.success) {
                DataController.setItem(DataController.RUNNING_TRIP_DATA, JSON.stringify(value.data));
                this.props.navigation.popToTop()
                this.showToast(value.message);
            }
            else{
                this.showToast(value.message);
                this.showNoDriverAvailableDialog(true, this.state.noDrivAvailModalMessage);
            }
            
        })
        .catch(err => {
            console.log(err);
            this.showToast(err);
            this.showNoDriverAvailableDialog(true, this.state.noDrivAvailModalMessage);
        })

        this.showWaitDialog(false);
    }

    async showWaitDialog(visible) {
        this.showNoDriverAvailableDialog(false);
        this.setState(prevState => {
            prevState.showWaitModal = visible;

            if(visible) {
                prevState.waitingArray = [];

                console.log("Selected ID: ", this.bookingModel.selected_vehicle_category,
                "Configuration Settings: ", this.confSettings.waiting_array);

                this.confSettings.waiting_array.forEach((value, index, array) => {
                    if(value.vehicle_id == this.bookingModel.selected_vehicle_category) {
                        prevState.waitingArray = value.waiting_list
                    }
                })
            }

            return prevState
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
                                flexDirection: 'row', alignItems: "center", alignSelf: 'center', marginVertical: 15,
                                borderBottomColor: 'rgba(0, 0, 0, 0.2)', borderBottomWidth: 2,
                            }}>
                                <Text style={{fontSize: 35}}>{String.fromCharCode(8377)}</Text>
                                <TextInput value={this.state.yourPrice.toString()}
                                placeholder={this.state.tripEstimate.toString()}
                                style={{
                                    fontSize: 40, padding: 5
                                }} keyboardType="decimal-pad" returnKeyType="done"
                                onChangeText={(text) => {
                                    if(text === '') {
                                        this.setState(prevState => {
                                            prevState.inValidPrice = false
                                            prevState.payDriver = this.payDriver
                                            prevState.yourPrice = text
                                            return prevState
                                        })

                                        this.showMessage();
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

                                        if(inValidPrice)
                                            this.showMessage();
                                        else
                                            this.showMessage(false);
                                    }
                                }}/>
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
                        this.showMessage()
                    }
                    else {
                        let isBookingAllow = false;

                        const customeOwnPrice = this.state.yourPrice;

                        const percentEstmatePrice = this.state.tripEstimate * this.minOffered / 100;

                        const newAmt = this.state.tripEstimate - percentEstmatePrice;
                        
                        if (customeOwnPrice >= newAmt) {
                            isBookingAllow = true;
                        } else {
                            this.showToast("Please Upgrade your price")
                            isBookingAllow = false;
                        }

                        if(isBookingAllow){
                            if (!this.bookingModel.book_later) {
                                if (this.bookingModel.booking_event_type == BookingModel.BookingEventType.EDIT) {
                                    this.setModalVisible(true, false, true);
                                    this.editBooking();
                                } else {
                                    this.setModalVisible(true, true);
                                    this.confirmBooking();
                                }
                            } else {
                                this.confirmBooking();
                            }

                            this.startFindDrivInterval();
                        }
                            
                    }
                }}
                style={{
                    backgroundColor: ACCENT,
                    paddingVertical: 15,
                    justifyContent: 'center',
                    alignItems: 'center',
                    elevation: 10,
                    shadowColor: 'rgb(0, 0, 0)',
                    shadowOffset: {width: 0, height: -2},
                    shadowOpacity: 0.2,
                    shadowRadius: 4,
                }}>
                    <Text style={{fontSize: 18, fontWeight: '700', color: 'white'}}>
                        {this.bookingModel.booking_event_type == BookingModel.BookingEventType.EDIT? 
                        'Confirm' : 'Confirm Booking'}
                    </Text>
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
                                source={Constants.ICONS.close}
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
                        style={{
                            backgroundColor: 'white', width: '70%',
                            paddingTop: 20, borderRadius: 3,
                            elevation: 10, overflow: 'hidden'
                        }}>
                            <Text style={{
                                fontWeight: '700', fontSize: 18, textAlign: 'center',
                                alignSelf: 'center', marginHorizontal: 15
                            }}>
                                {Constants.FIND_DRIVER_TITLE}
                            </Text>
                            
                            <ProgressCircle
                                percent={this.state.findDrivTime}
                                radius={40}
                                borderWidth={10}
                                color={ACCENT}
                                bgColor="#fff" // Overlay White
                                shadowColor="#E8E8E8" // Stroke background color
                                outerCircleStyle={{alignSelf: 'center', marginVertical: 25}}
                            >
                                <Text style={{color: "#E8E8E8"}}>{this.state.timer}s</Text>
                            </ProgressCircle>
                            
                            <Text style={{
                                textAlign: 'center', alignSelf: 'center',
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

                {/* No Driver Found/Available Dialog  */}
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
                        style={{backgroundColor: 'white', width: '70%',
                        paddingTop: 20, borderRadius: 3,
                        elevation: 10, overflow: 'hidden'}}>
                            <Image source={require('../../assets/not-found.png')}
                            style={{
                                width: 80, height: 80, alignSelf: 'center', margin: 15
                            }}/>

                            <Text style={{
                                fontWeight: '700', fontSize: 18, marginHorizontal: 15, alignSelf: 'center'
                            }}>
                                {Constants.NO_DRIVER_FOUND_T}
                            </Text>
                            
                            <Text style={{
                                textAlign: 'center', alignSelf: 'center', marginTop: 5,
                                opacity: 0.3, marginHorizontal: 15
                            }}>
                                {this.state.noDrivAvailModalMessage == ''?
                                Constants.NO_DRIVER_FOUND_D : this.state.noDrivAvailModalMessage}
                            </Text>

                            <TouchableHighlight
                                underlayColor={ACCENT_DARK}
                                onPress={() => {
                                    this.showNoDriverAvailableDialog(false);
                                }}
                                style={{
                                    paddingVertical: 15, alignItems: 'center', justifyContent: 'center',
                                    backgroundColor: ACCENT, marginTop: 10, marginHorizontal: 15
                                }}>
                                    <Text style={{color: 'white'}}>CHANGE PRICE</Text>
                            </TouchableHighlight>
                            
                            <View style={{flexDirection: 'row', marginTop: 20, justifyContent: 'space-between'}}>
                                <TouchableHighlight
                                    underlayColor={ACCENT_DARK}
                                    onPress={() => {
                                        this.showWaitDialog(true)
                                    }}
                                    style={{
                                        paddingVertical: 15, alignItems: 'center', justifyContent: 'center',
                                        backgroundColor: ACCENT, flex: 1, marginEnd: 1
                                    }}>
                                        <Text style={{color: 'white'}}>WAIT</Text>
                                </TouchableHighlight>
                                <TouchableHighlight
                                    underlayColor={ACCENT_DARK}
                                    onPress={() => {
                                        this.cancelBooking()
                                    }}
                                    style={{
                                        paddingVertical: 15, alignItems: 'center', justifyContent: 'center',
                                        backgroundColor: ACCENT, flex: 1, marginStart: 1
                                    }}>
                                        <Text style={{color: 'white'}}>CANCEL</Text>
                                </TouchableHighlight>
                            </View>
                        </View>
                    </View>
                </Modal>

                {/* Dialog to select waiting time */}
                <Modal
                animationType="fade"
                transparent={true}
                visible={this.state.showWaitModal}
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
                                fontWeight: '700', fontSize: 18, marginHorizontal: 15, alignSelf: 'center'
                            }}>
                                Select Waiting Time
                            </Text>
                            
                            <Text style={{
                                textAlign: 'center', alignSelf: 'center', marginTop: 5,
                                opacity: 0.3, marginHorizontal: 15
                            }}>
                                How long do you want us to look for a driver?
                            </Text>

                            <ScrollView horizontal={true} showsHorizontalScrollIndicator={false}>
                                <View style={{flexDirection: 'row', marginTop: 15}}>
                                    {
                                        this.state.waitingArray != null && this.state.waitingArray.map((value, index, arr) => {
                                            return(
                                            <TouchableHighlight key={index} underlayColor='white'
                                            onPress={() => {
                                                this.setState(prevState => {
                                                    prevState.selectedWaitingTime = value;
                                                    return prevState;
                                                })
                                            }}
                                            style={{
                                                borderRadius: 100, padding: 10, margin: 5,
                                                borderColor: 'black', borderWidth: 1, opacity: this.state.selectedWaitingTime == value? 1 : 0.3
                                            }}>
                                                <Text>
                                                    {value}hrs
                                                </Text>
                                            </TouchableHighlight>)
                                        })
                                    }
                                </View>
                            </ScrollView>

                            <View style={{flexDirection: 'row', marginTop: 20, justifyContent: 'space-between'}}>
                                <TouchableHighlight
                                    underlayColor={ACCENT_DARK}
                                    onPress={() => {
                                        this.saveBookingResponse();
                                    }}
                                    style={{
                                        paddingVertical: 15, alignItems: 'center', justifyContent: 'center',
                                        backgroundColor: ACCENT, flex: 1, marginEnd: 1
                                    }}>
                                        <Text style={{color: 'white'}}>DONE</Text>
                                </TouchableHighlight>
                                <TouchableHighlight
                                    underlayColor={ACCENT_DARK}
                                    onPress={() => {
                                        this.showNoDriverAvailableDialog(true, this.state.noDrivAvailModalMessage);
                                        this.showWaitDialog(false);
                                    }}
                                    style={{
                                        paddingVertical: 15, alignItems: 'center', justifyContent: 'center',
                                        backgroundColor: ACCENT, flex: 1, marginStart: 1
                                    }}>
                                        <Text style={{color: 'white'}}>CANCEL</Text>
                                </TouchableHighlight>
                            </View>
                        </View>
                    </View>
                </Modal>
            
                {/* Loading Dialog */}
                <Modal
                animationType="fade"
                transparent={true}
                visible={this.state.loadingModalVisible}
                onRequestClose={() => {
                    return;
                }}>
                    <View style={{
                    backgroundColor: 'rgba(255, 255, 255, 0.9)',
                    height: '100%',
                    alignItems: "center",
                    justifyContent: 'center'
                    }}>
                            <ActivityIndicator size="large" color={ACCENT} style={{alignSelf: 'center', marginTop: 15}}/>
                    </View>
                </Modal>
            
                {/* Response Dialog  */}
                <Modal
                animationType="fade"
                transparent={true}
                visible={this.state.responseModalVisible}
                onRequestClose={() => {
                    this.setState(prevState => {
                        prevState.responseModalVisible = false;
                        return prevState;
                    }, () => {
                        this.props.navigation.reset([
                            NavigationActions.navigate({routeName: "Main"}),
                            NavigationActions.navigate({routeName: "MyBookings"})])
                    })
                }}>
                    <View style={{
                    backgroundColor: 'rgba(0, 0, 0, 0.7)',
                    height: '100%',
                    alignItems: "center",
                    justifyContent: 'center'
                    }}>
                        <View
                        style={{backgroundColor: 'white', width: '70%',
                        paddingTop: 20, borderRadius: 3,
                        elevation: 10, overflow: 'hidden'}}>
                            <Text style={{
                                textAlign: 'center', alignSelf: 'center',
                                marginHorizontal: 15
                            }}>
                                {this.state.responseMessage}
                            </Text>

                            <TouchableHighlight
                                underlayColor={ACCENT_DARK}
                                onPress={() => {
                                    this.setState(prevState => {
                                        prevState.responseModalVisible = false;
                                        return prevState;
                                    }, () => {
                                        this.props.navigation.reset([
                                            NavigationActions.navigate({routeName: "Main"}),
                                            NavigationActions.navigate({routeName: "MyBookings"})])
                                    })
                                }}
                                style={{
                                    paddingVertical: 15, alignItems: 'center', justifyContent: 'center',
                                    backgroundColor: ACCENT, marginTop: 15
                                }}>
                                    <Text style={{color: 'white'}}>OK</Text>
                            </TouchableHighlight>
                        </View>
                    </View>
                </Modal>
                
                <Animated.View
                style={{
                    flexDirection: 'row', alignItems:'center',
                    justifyContent: 'space-between', backgroundColor: 'red',
                    transform: [{translateY: this.state.messageBoxTrans}], position: 'absolute',
                    top: 0, width: '100%', padding: 15
                }}>
                    <Image source={Constants.ICONS.warning}
                    style={{
                        tintColor: 'white',
                        height: 20, width: 20
                    }}/>
                    <Text style={{color: 'white'}}>{Constants.LOW_PRICE}</Text>
                </Animated.View>

                <ToastComp ref={t => this.toast = t}/>
            </View>
        )
    }
}

const styles = StyleSheet.create({
});