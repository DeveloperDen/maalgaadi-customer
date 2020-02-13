import React, { Component } from 'react';
import {
    StyleSheet,
    View,
    Text,
    Image,
    Modal,
    TouchableOpacity,
    TouchableHighlight,
    ActivityIndicator,
    Linking,
    StatusBar
} from 'react-native';
import { ScrollView, } from 'react-native-gesture-handler';
import firebase from 'react-native-firebase'
import ToastComp from '../utils/ToastComp'
const DataController = require('../utils/DataStorageController')
const Constants = require('../utils/AppConstants')
const ACCENT = '#FFCB28' // 255, 203, 40
const ACCENT_DARK = '#F1B800'
const GREEN = '#24C800' // 36, 200, 0
const PENDING = 'Pending'
const CANCELLED = 'Cancelled'
const driverIc = require('../../assets/driver_icon.png')

export default class TripDetails extends Component {
    static navigationOptions = ({ navigation }) => {
        return {
            headerTitle: 'Trip Details',
            headerRight:
                <Text style={{
                    backgroundColor: navigation.getParam('status', '-') == "Pending" ? ACCENT :
                    navigation.getParam('status', '-') == "Cancelled"? 'red' : 
                    navigation.getParam('status', '-') == "Unknown"? 'gray' : GREEN,
                    paddingHorizontal: 12, paddingVertical: 6, marginEnd: 16, borderRadius: 3,
                    color: navigation.getParam('status', '-') == "Unknown"? 'rgba(255, 255, 255, 0.4)' : 'white'
                }}>
                    {navigation.getParam('status', '-')}
                </Text>
        }
    }

    constructor(props) {
        super(props)
        this.state = {
            isLoading: false,
            cancelModalVisible: false,
            pickupLoc: '',
            dropLoc: '',
            bookingID: '',
            bookingDate: '',
            drivName: '',
            vehicle: '',
            vehicleNum: '',
            chargeBill: '',
            chargePayment: '',
            bookingType: '',
            tripCharge: '',
            loading: '-',
            unloading: '-',
            total: '',
            status: ''
        }
        this.tripData = {}
        this.status = props.navigation.getParam('status', '-')
    }

    NavigationBottomBar = () => {
        return (
            <View
            style={
                [styles.row_space, { backgroundColor: 'white', elevation: 10, justifyContent: 'space-evenly',
                shadowRadius: 4, shadowOpacity: 0.2, shadowOffset: {height: -2}, shadowColor: 'rgba(0, 0, 0)'
            }]}>
                <TouchableHighlight underlayColor='rgba(0, 0, 0, 0.02)'
                    disabled={(this.state.status != PENDING && this.state.status != CANCELLED) ? false : true}
                    style={{ opacity: (this.state.status != PENDING && this.state.status != CANCELLED) ? 1 : 0.3 }}
                    onPress={() => this.trackDriver()}>
                    <View style={{ alignItems: 'center', marginHorizontal: 30, marginVertical: 10 }}>
                        <Image source={Constants.ICONS.curr_location}
                            style={{ width: 40, height: 40 }} />
                        <Text style={{ fontSize: 12, marginTop: 5 }}>TRACK</Text>
                    </View>
                </TouchableHighlight>

                <TouchableHighlight underlayColor='rgba(0, 0, 0, 0.02)'
                    disabled={(this.state.status == PENDING) ? false : true}
                    style={{ opacity: (this.state.status == PENDING) ? 1 : 0.3 }}
                    onPress={() => {
                        this.showCancelModal(true)
                    }}>
                    <View style={{ alignItems: 'center', marginHorizontal: 30, marginVertical: 10 }}>
                        <Image source={Constants.ICONS.cancel_outline}
                            style={{ width: 40, height: 40 }} />
                        <Text style={{ fontSize: 12, marginTop: 5 }}>CANCEL</Text>
                    </View>
                </TouchableHighlight>
            </View>
        )
    }

    componentDidMount() {
        if(this.props.navigation.getParam(DataController.RUNNING_TRIP_DATA)) {
            DataController.getItem(DataController.RUNNING_TRIP_DATA)
            .then(res => {
                const value = JSON.parse(res)
                this.tripData = value
                this.props.navigation.setParams({ status: value.status })
                this.setState(prevState => {
                    prevState.bookingDate = value.date
                    prevState.pickupLoc = value.pick_up
                    prevState.dropLoc = value.drop
                    prevState.bookingID = value.trip_id
                    prevState.drivName = value.driver
                    prevState.vehicle = value.vehicle
                    prevState.vehicleNum = value.driver_vehicle_no
                    prevState.chargePayment = value.amount_to_be_paid
                    prevState.bookingType = value.booking_type
                    prevState.chargeBill = value.billOffered
                    prevState.tripCharge = value.amount_to_be_paid
                    prevState.status = value.status

                    if (value.is_offered_billing == "1")
                        prevState.total = value.billOffered
                    else
                        prevState.total = value.total_charge

                    if (value.loading_charge != 0) {
                        if (value.is_offered_billing != '1')
                            prevState.loading = value.loading_charge
                    }
                    if (value.unloading_charge != 0) {
                        if (value.is_offered_billing != '1')
                            prevState.loading = value.unloading_charge
                    }

                    return prevState
                })
            })

            // Subscribe to FCM Message listener
            this.unsubscribeFCM = firebase.messaging().onMessage(async message => {
                console.log("Got message: ", message.data);
        
                const data = message.data;
                const type = data.type;
                if(type == "booking_notification") {
                    let bookStatus = '';
                    const message = data.message;
                    
                    if(message.includes("cancelled")) {
                        bookStatus = "Cancelled";
                    }
                    else if(message.includes("unloaded")) {
                        bookStatus = "Unoading";
                    }
                    else if(message.includes("to delivery point")) {
                        bookStatus = "Reaching Destination";
                    }
                    else if(message.includes("loaded")) {
                        bookStatus = "Loading";
                    }
                    else if(message.includes("Kindly pay")) {
                        bookStatus = "Billing";
                    }
                    else {
                        bookStatus = "Unknown";
                    }

                    this.props.navigation.setParams({ status: bookStatus })
                    this.setState(prevState => {
                        prevState.status = bookStatus
                        return prevState
                    })
                }
            })
        }
        else {
            DataController.getItem(DataController.COMPLETED_TRIP_DATA)
            .then(res => {
                const value = JSON.parse(res)
                this.tripData = value
                this.props.navigation.setParams({ status: value.status })
                this.setState(prevState => {
                    prevState.bookingDate = value.date
                    prevState.pickupLoc = value.pick_up
                    prevState.dropLoc = value.drop
                    prevState.bookingID = value.trip_id
                    prevState.drivName = value.status == "Cancelled"? "Not Available" : value.driver
                    prevState.vehicle = value.vehicle_name
                    prevState.vehicleNum = value.vehicle_reg_no
                    prevState.chargePayment = value.payment
                    prevState.bookingType = value.booking_type
                    prevState.chargeBill = value.billOffered
                    prevState.tripCharge = value.payment
                    prevState.status = value.status

                    if (value.is_offered_billing == "1")
                        prevState.total = value.billOffered
                    else
                        prevState.total = value.total_charge

                    if (value.loading_charge != 0) {
                        if (value.is_offered_billing != '1')
                            prevState.loading = value.loading_charge
                    }
                    if (value.unloading_charge != 0) {
                        if (value.is_offered_billing != '1')
                            prevState.loading = value.unloading_charge
                    }

                    return prevState
                })
            })
        }
    }

    componentWillUnmount() {
        if(this.props.navigation.getParam(DataController.RUNNING_TRIP_DATA)) {
            this.unsubscribeFCM();
        }
    }

    showCancelModal(visible) {
        this.setState(prevState => {
            prevState.cancelModalVisible = visible
            return prevState
        })
    }

    showToast(message) {
        this.toast.show(message);
    }

    cancelBooking = async () => {
        this.setState(prevState => {
            prevState.isLoading = true
            return prevState
        })
        const reason = "";
        const issue_type = "scrapOff";
        const action = "all";

        const reqBody = new FormData()
        reqBody.append(Constants.FIELDS.BOOKING_ID, this.tripData.trip_id)
        reqBody.append(Constants.FIELDS.REASON, reason)
        reqBody.append(Constants.FIELDS.ISSUE_TYPE, issue_type)
        reqBody.append(Constants.FIELDS.ACTION, action)

        console.log('Request: ', reqBody)

        const request = await fetch(Constants.BASE_URL + Constants.CANCEL_BOOKING, {
            method: 'POST',
            body: reqBody,
            headers: {
                key: Constants.KEY
            }
        })
        const response = await request.json().then(async value => {
            this.props.navigation.goBack()
            this.showToast(value.message);
            console.log("Response: ", value)
        })
            .catch(err => {
                console.log(err);
                this.showToast(Constants.ERROR_GET_BOOKINGS);
            })

        this.showCancelModal(false)
        this.setState(prevState => {
            prevState.isLoading = false
            return prevState
        })
    }

    trackDriver() {
        this.props.navigation.navigate('TrackDriver', {
            bookingId: this.tripData.trip_id,
            pickupLat: this.tripData.pickup_lat,
            pickupLng: this.tripData.pickup_lng,
            dropLat: this.tripData.drop_lat,
            dropLng: this.tripData.drop_lng,
        })
    }

    render() {
        return (
            <View style={{ flex: 1, backgroundColor: 'rgba(0, 0, 0, 0.05)' }}>
                <StatusBar backgroundColor='white' barStyle='dark-content'/>

                <ScrollView>
                    <View style={styles.container}>
                        <View style={{ flexDirection: 'row', alignItems: 'center', marginHorizontal: 15 }}>
                            <View style={{
                                backgroundColor: 'green',
                                elevation: 3,
                                borderWidth: 1,
                                borderColor: 'white',
                                width: 12,
                                height: 12,
                                borderRadius: 100
                            }} />
                            <Text style={{ marginHorizontal: 15 }}>{this.state.pickupLoc}</Text>
                        </View>

                        <View style={{
                            flex: 1,
                            borderTopColor: 'rgba(0, 0, 0, 0.1)',
                            borderTopWidth: 1,
                            marginVertical: 15
                        }} />

                        <View style={{ flexDirection: 'row', alignItems: 'center', marginHorizontal: 15 }}>
                            <View style={{
                                backgroundColor: 'red',
                                elevation: 3,
                                borderWidth: 1,
                                borderColor: 'white',
                                width: 12,
                                height: 12,
                                borderRadius: 100
                            }} />
                            <Text style={{ marginHorizontal: 15 }}>{this.state.dropLoc}</Text>
                        </View>
                    </View>

                    <View style={[styles.container, styles.row_space, { paddingHorizontal: 10 }]}>
                        <Text>{this.state.bookingID}</Text>
                        <Text>{this.state.bookingDate}</Text>
                    </View>

                    <View style={styles.container}>
                        <Text style={styles.containerTitle}>DRIVER DETAILS</Text>
                        <View style={{
                            flex: 1,
                            borderTopColor: 'rgba(0, 0, 0, 0.1)',
                            borderTopWidth: 1
                        }} />
                        <View style={{ flexDirection: 'row', marginTop: 15, justifyContent: 'space-between', alignItems: 'center' }}>
                            <Image source={driverIc}
                                style={{
                                    width: 60, height: 60, opacity: 0.4, marginStart: 20,
                                }} />
                            <View style={{marginEnd: 20}}>
                                <Text style={{ fontWeight: "700", fontSize: 15 }}>
                                    {this.state.drivName}
                                </Text>
                                <Text style={{ opacity: 0.4, fontSize: 12, marginTop: 5 }}>
                                    {this.state.vehicle}
                                </Text>
                                <Text style={{ opacity: 0.4, fontSize: 12 }}>
                                    {this.state.vehicleNum}
                                </Text>
                            </View>

                            {this.props.navigation.getParam(DataController.RUNNING_TRIP_DATA) && <TouchableHighlight
                                underlayColor='rgba(36, 200, 0, 0.7)'
                                onPress={() => {
                                    Linking.openURL(`tel: ${this.tripData.driver_number}`)
                                }}
                                style={{
                                    backgroundColor: GREEN,
                                    paddingVertical: 10, marginEnd: 15, borderRadius: 3
                                }}>
                                <View
                                    style={{
                                        flexDirection: 'row', justifyContent: 'space-between',
                                        alignItems: 'center', paddingHorizontal: 15
                                    }}>
                                    <Image source={Constants.ICONS.call}
                                        style={{ width: 18, height: 18, marginEnd: 15, tintColor: 'white'}}/>
                                    <Text style={{ color: 'white', fontWeight: '700' }}>Call</Text>
                                </View>
                            </TouchableHighlight>}
                        </View>
                    </View>

                    <View style={styles.container}>
                        <Text style={styles.containerTitle}>CHARGES</Text>
                        <View style={{
                            flex: 1,
                            borderTopColor: 'rgba(0, 0, 0, 0.1)',
                            borderTopWidth: 1
                        }} />

                        <View style={[styles.row_space, { paddingHorizontal: 20, marginTop: 15 }]}>
                            <View>
                                <Text style={{ opacity: 0.4 }}>BILL</Text>
                                <Text style={{ fontWeight: "700" }}>{this.state.chargeBill}</Text>
                            </View>
                            <View>
                                <Text style={{ opacity: 0.4 }}>PAYMENT</Text>
                                <Text style={{ fontWeight: "700" }}>{this.state.chargePayment}</Text>
                            </View>
                        </View>
                    </View>

                    <View style={[styles.container, { marginBottom: 20 }]}>
                        <Text style={styles.containerTitle}>DETAILS</Text>
                        <View style={{
                            flex: 1,
                            borderTopColor: 'rgba(0, 0, 0, 0.1)',
                            borderTopWidth: 1
                        }} />

                        <View style={{ marginHorizontal: 20, marginTop: 15 }}>
                            <View style={styles.row_space}>
                                <Text style={styles.detailsLeft}>Booking Type</Text>
                                <Text style={styles.detailsRight}>{this.state.bookingType}</Text>
                            </View>
                            <View style={styles.row_space}>
                                <Text style={styles.detailsLeft}>Trip Charge</Text>
                                <Text style={styles.detailsRight}>{this.state.tripCharge}</Text>
                            </View>
                            <View style={styles.row_space}>
                                <Text style={styles.detailsLeft}>Loading</Text>
                                <Text style={styles.detailsRight}>{this.state.loading}</Text>
                            </View>
                            <View style={styles.row_space}>
                                <Text style={styles.detailsLeft}>Unloading</Text>
                                <Text style={styles.detailsRight}>{this.state.unloading}</Text>
                            </View>
                            <View style={styles.row_space}>
                                <Text style={styles.detailsLeft}>Total</Text>
                                <Text style={styles.detailsRight}>{this.state.total}</Text>
                            </View>
                        </View>
                    </View>
                </ScrollView>

                <this.NavigationBottomBar />

                {/* Cancel confirmation dialog */}
                <Modal
                    animationType="fade"
                    transparent={true}
                    visible={this.state.cancelModalVisible}
                    onRequestClose={() => {
                        this.showCancelModal(false)
                    }}>
                    <View style={{
                        backgroundColor: 'rgba(0, 0, 0, 0.7)',
                        height: '100%',
                        alignItems: "center",
                        justifyContent: 'center'
                    }}>
                        <View
                            style={{
                                backgroundColor: 'white', width: '80%',
                                paddingTop: 20, borderRadius: 3,
                                elevation: 10, overflow: 'hidden'
                            }}>
                            <View style={{
                                flexDirection: 'row', justifyContent: 'space-between'
                            }}>
                                <Text style={{ marginStart: 20, fontWeight: '700', fontSize: 15 }}>
                                    {this.props.navigation.getParam('status', "Cancel or Edit")}
                                </Text>
                                <TouchableOpacity
                                    onPress={() => {
                                        this.showCancelModal(false)
                                    }}>
                                    <Image source={Constants.ICONS.close}
                                        style={{ width: 15, height: 15, marginEnd: 20 }} />
                                </TouchableOpacity>
                            </View>

                            <Text style={{
                                textAlign: 'center', alignSelf: 'center', marginVertical: 30,
                                opacity: 0.3, marginHorizontal: 20
                            }}>
                                {Constants.CANCEL_EDIT_CONFIRM}
                            </Text>

                            <TouchableHighlight
                                disabled={this.state.isLoading}
                                underlayColor={ACCENT_DARK}
                                onPress={() => {
                                    this.cancelBooking()
                                }}
                                style={{
                                    paddingVertical: 15, alignItems: 'center', justifyContent: 'center',
                                    backgroundColor: this.state.isLoading ? 'gray' : ACCENT, marginTop: 15
                                }}>
                                {
                                    this.state.isLoading ?
                                        <ActivityIndicator size="small" color='white' />
                                        :
                                        <Text style={{ color: 'white' }}>CANCEL TRIP</Text>
                                }
                            </TouchableHighlight>
                        </View>
                    </View>
                </Modal>

                <ToastComp ref={t => this.toast = t}/>
            </View>
        )
    }
}

const styles = StyleSheet.create({
    row_space: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between'
    },
    container: {
        paddingVertical: 10,
        marginTop: 10,
        backgroundColor: 'white',
        borderRadius: 4,
        marginHorizontal: 10
    },
    containerTitle: {
        fontWeight: '700',
        opacity: 0.4,
        marginStart: 20,
        marginBottom: 10
    },
    detailsLeft: {
        opacity: 0.3,
        marginBottom: 10
    },
    detailsRight: {
        textTransform: "capitalize",
        fontWeight: "700",
        marginBottom: 10,
    }
});