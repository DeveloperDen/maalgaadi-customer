import React, { Component } from 'react';
import {
  StyleSheet,
  TouchableOpacity,
  TouchableHighlight,
  Image,
  View,
  Text,
  StatusBar,
  Dimensions,
  Keyboard,
  ScrollView,
  Animated,
  Modal,
  ActivityIndicator,
  ToastAndroid
} from 'react-native';

const Constants = require('../utils/AppConstants')
const DataController = require('../utils/DataStorageController')
const PENDING = 'Pending'
const ACCENT = '#FFCB28' // 255, 203, 40
const ACCENT_DARK = '#F1B800'
const GREEN = '#24C800' // 36, 200, 0

export default class RunningMyBookings extends Component {
  constructor(props) {
    super(props)
    this.state = {
      cancelModalVisible: false,
      activeIndex: 0,
      bookings: [],
      isLoading: true
    }
  }

  componentDidMount() {
    this.getRunningTrip()
  }

  getRunningTrip = async () => {
    const reqBody = new FormData()
    const custId = await DataController.getItem(DataController.CUSTOMER_ID)
    reqBody.append(Constants.FIELDS.CUSTOMER_ID, custId)

    console.log('Request: ', reqBody)

    const request = await fetch(Constants.BASE_URL + Constants.GET_RUNNING_TRIP, {
        method: 'POST',
        body: reqBody,
        headers: {
            key: "21db33e221e41d37e27094153b8a8a02"
        }
    })
    const response = await request.json().then(async value => {
      if(value.success) {
        this.setState(prevState => {
          prevState.bookings = value.data
          return prevState
        })
      }
      else {
        ToastAndroid.show(value.message, ToastAndroid.SHORT);
      }
      console.log("Response: ", value)
    })
    .catch(err => {
        console.log(err);
        ToastAndroid.show(Constants.ERROR_GET_BOOKINGS, ToastAndroid.SHORT);
    })

    this.setState(prevState => {
        prevState.isLoading = false
        return prevState
    })
  }

  showCancelModal(visible, index = 0){
    this.setState(prevState => {
      prevState.cancelModalVisible = visible
      prevState.activeIndex = index
      return prevState
    })
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
    reqBody.append(Constants.FIELDS.BOOKING_ID, this.state.bookings[this.state.activeIndex].trip_id)
    reqBody.append(Constants.FIELDS.REASON, reason)
    reqBody.append(Constants.FIELDS.ISSUE_TYPE, issue_type)
    reqBody.append(Constants.FIELDS.ACTION, action)

    console.log('Request: ', reqBody)

    const request = await fetch(Constants.BASE_URL + Constants.CANCEL_BOOKING, {
        method: 'POST',
        body: reqBody,
        headers: {
            key: "21db33e221e41d37e27094153b8a8a02"
        }
    })
    const response = await request.json().then(async value => {
      if(value.success)
        this.setState(prevState => {
          prevState.bookings.splice(this.state.activeIndex, 1)
          return prevState
        })
      ToastAndroid.show(value.message, ToastAndroid.SHORT);
      console.log("Response: ", value)
    })
    .catch(err => {
        console.log(err);
        ToastAndroid.show(Constants.ERROR_GET_BOOKINGS, ToastAndroid.SHORT);
    })

    this.showCancelModal(false)
    this.setState(prevState => {
      prevState.isLoading = false
      return prevState
    })
  }

  render() {
    return(
      <View style={{flex: 1}}>
        <ScrollView style={{display: this.state.bookings.length > 0? 'flex' : 'none'}}>
          {
            this.state.bookings.map((value, index) => {
              value.status === "On the way"?
                this.state.bookings[index].is_edit = true : this.state.bookings[index].is_edit = false

              return(
                <TouchableHighlight key={index} underlayColor='rgba(0, 0, 0, 0.06)'
                onPress={async () => {
                  await DataController.setItem(DataController.RUNNING_TRIP_DATA, JSON.stringify(value))
                  this.props.navigation.navigate("TripDetails")
                }}
                style={{
                  borderRadius: 3, backgroundColor: 'rgba(0, 0, 0, 0.03)', margin: 5,
                  padding: 15,
                }}>
                  <View>
                    <View style={{flexDirection: 'row', justifyContent: 'space-between'}}>
                      <View>
                        <Text style={{opacity: 0.4, fontSize: 13, marginBottom: 5}}>{value.date}</Text>
                        <Text style={{fontWeight: '700', fontSize: 13}}>{value.vehicle}</Text>
                        <Text style={{opacity: 0.4, fontSize: 13}}>{value.trip_id}</Text>
                      </View>
                      <View style={{alignItems: 'flex-end'}}>
                        <View style={{flexDirection: 'row', alignItems: 'center'}}>
                          <Text style={{fontWeight: '700', fontSize: 13, marginBottom: 5}}>
                            {
                              value.is_offered_billing == '1'?
                              String.fromCharCode(8377) + ' ' + value.billOffered :
                              String.fromCharCode(8377) + ' ' + value.bill
                            }
                          </Text>
                          <Text style={{
                            fontWeight: '700', fontSize: 15, marginBottom: 5, color: GREEN,
                            marginStart: 15
                          }}>
                            {
                              "OTP: " + value.driver_otp
                            }
                          </Text>
                        </View>
                          
                        <Text style={{fontWeight: '700', fontSize: 13}}>
                          {value.driver}
                        </Text>
                        <Text style={{opacity: 0.3, fontSize: 13}}>
                          {value.driver_vehicle_no}
                        </Text>
                      </View>
                    </View>

                    <View>
                      <View style={{flexDirection: 'row', alignItems: 'center', marginTop: 15, marginHorizontal: 10}}>
                        <View style={{
                          backgroundColor: GREEN,
                          elevation: 3,
                          borderWidth: 1,
                          borderColor: 'white',
                          width: 12,
                          height: 12,
                          borderRadius: 100
                          }}/>
                        
                        <Text
                        style={{marginStart: 10, fontWeight: '700', fontSize: 13}}>
                          {value.pick_up}
                        </Text>
                      </View>

                      <View style={{flexDirection: 'row', alignItems: 'center', marginTop: 10, marginHorizontal: 10}}>
                        <View style={{
                          backgroundColor: 'red',
                          elevation: 3,
                          borderWidth: 1,
                          borderColor: 'white',
                          width: 12,
                          height: 12,
                          borderRadius: 100
                          }}/>
                        
                        <Text
                        style={{marginStart: 10, fontWeight: '700', fontSize: 13}}>
                          {value.drop}
                        </Text>
                      </View>
                    </View>

                    <View style={{
                      flexDirection: 'row', justifyContent: 'space-between', marginTop: 10,
                      alignItems: 'center'
                    }}>
                      <Text style={{
                        backgroundColor: value.status === PENDING? ACCENT : GREEN,
                        paddingVertical: 3, paddingHorizontal: 20, borderRadius: 3, 
                        fontSize: 12, color: 'white', textAlignVertical: 'center',
                      }}>
                        {value.status}
                      </Text>
                      
                      <View style={{flexDirection: 'row', alignItems: 'center'}}>
                        <TouchableOpacity
                        onPress={() => {
                          this.showCancelModal(true, index)
                        }}
                        style={{
                          borderWidth: 1, borderColor: ACCENT, borderRadius: 3,
                          paddingVertical: 5, paddingHorizontal: 10
                        }}>
                          <Text style={{color: ACCENT, fontSize: 13}}>Cancel</Text>
                        </TouchableOpacity>
                        <TouchableOpacity
                        style={{
                          borderWidth: 1, borderColor: ACCENT, borderRadius: 3,
                          paddingVertical: 5, paddingHorizontal: 10, marginStart: 10
                        }}>
                          <Text style={{color: ACCENT, fontSize: 13}}>Edit</Text>
                        </TouchableOpacity>
                      </View>
                    </View>
                  </View>
                </TouchableHighlight>
            )})
          }
        </ScrollView>

        {/* Text Shown when Loading, or when Bookings array is empty */}
        <View style={{flex: 1, textAlign: "center",
        alignContent: 'center', justifyContent: 'center',
        opacity: 0.3, marginHorizontal: 20, display: this.state.bookings.length > 0? 'none' : 'flex'}}>
            <Text style={{textAlign: "center", fontSize: 20,}}>
                {this.state.isLoading? "Getting your Running Trips..." : Constants.RUNNING_BOOK_EMPTY}
            </Text>
        </View>
      
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
                style={{backgroundColor: 'white', width: '80%',
                paddingTop: 20, borderRadius: 3,
                elevation: 10, overflow: 'hidden'}}>
                    <View style={{
                    flexDirection: 'row', justifyContent: 'space-between'
                    }}>
                        <Text style={{marginStart: 20, fontWeight: '700', fontSize: 15}}>
                          {this.state.bookings.length != 0?
                          this.state.bookings[this.state.activeIndex].status.toUpperCase() : ''}
                        </Text>
                        <TouchableOpacity
                        onPress={() => {
                            this.showCancelModal(false)
                        }}>
                            <Image source={{uri: 'https://cdn3.iconfinder.com/data/icons/virtual-notebook/16/button_close-512.png'}}
                            style={{width: 15, height: 15, marginEnd: 20}}/>
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
                        backgroundColor: this.state.isLoading? 'gray' : ACCENT, marginTop: 15
                    }}>
                      {
                        this.state.isLoading?
                        <ActivityIndicator size="small" color='white'/>
                        :
                        <Text style={{color: 'white'}}>CANCEL TRIP</Text>
                      }
                    </TouchableHighlight>
                </View>
            </View>
        </Modal>
      </View>
    )
  }
}

const styles = StyleSheet.create({});

