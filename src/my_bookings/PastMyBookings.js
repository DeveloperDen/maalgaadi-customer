import React, { Component } from 'react';
import {
  StyleSheet,
  TouchableOpacity,
  View,
  Text,
  ScrollView,
  TouchableHighlight,
  ActivityIndicator,
  Modal,
} from 'react-native';
import { BookingEventType } from '../models/bookings_model';
import { KEY } from '../utils/AppConstants';
import ToastComp from '../utils/ToastComp';
import { formatDate, unFormatDate } from './../utils/UtilFunc';

const ACCENT = '#FFCB28' // 255, 203, 40
const GREEN = '#24C800' // 36, 200, 0
const CANCELLED = 'Cancelled'
const COMPLETED = 'Completed'
const Constants = require('../utils/AppConstants')
const DataController = require('../utils/DataStorageController')

export default class PastMyBookings extends Component {

  constructor(props) {
    super(props)
    this.state = {
      gettingPages: false,
      isLoading: true,
      bookings: []
    }

    this.page = 1;
  }

  async componentDidMount() {
    await this.getPastBookings()
  }

  showToast(message) {
    this.toast.show(message);
  }

  getPastBookings = async () => {
    this.setState(prevState => {
      prevState.gettingPages = true;
      return prevState;
    })
    const reqBody = new FormData()
    const custId = await DataController.getItem(DataController.CUSTOMER_ID)
    reqBody.append(Constants.FIELDS.CUSTOMER_ID, custId)
    reqBody.append(Constants.FIELDS.PAGE, this.page)

    console.log('Request: ', reqBody)

    const request = await fetch(Constants.BASE_URL + Constants.GET_COMPLETED_TRIP, {
        method: 'POST',
        body: reqBody,
        headers: {
            key: KEY
        }
    })
    await request.json().then(async value => {
      if(value.success) {
        this.setState(prevState => {
          prevState.bookings.push(...value.data.data);
          return prevState
        })
      }
      else {
        this.showToast(value.message);
      }
      console.log("Response: ", JSON.stringify(value));
    })
    .catch(err => {
        console.log(err);
        this.showToast(Constants.ERROR_GET_BOOKINGS);
    })

    this.setState(prevState => {
        prevState.isLoading = false;
        prevState.gettingPages = false;
        return prevState;
    })
  }

  reBook(bookID) {
    this.getBookingDetails(bookID);
  }

  getBookingDetails = async (bookID) => {
    const reqURL = Constants.BASE_URL + Constants.GET_BOOKING_DETAIL + '?' +
        Constants.FIELDS.BOOKING_ID + '=' + bookID + '&' +
        Constants.FIELDS.BOOKING_TYPE + '=' + BookingEventType.RE_BOOK;

    const request = await fetch(reqURL, {
        method: 'GET',
        headers: {
            key: KEY
        }
    })

    await request.json().then(async value => {
        console.log("Booking details: ", value)
        console.log("Landmark list: ", value.data.landmark_list)

        if (!value.success) {
            this.showToast(value.message);
        }
        else {
          let model = value.data;
          model.booking_event_type = BookingEventType.RE_BOOK
          model.booking_time = formatDate();

          model.booking_id = 0;

          await DataController.getItem(DataController.VEHICLE).then((vehicles) => {
            vehicles = JSON.parse(vehicles)
            vehicles.forEach((veh, index) => {
              if(model.selected_vehicle_category == veh.id)
                model.vehicle = veh
                return;
            })
          })

          let landmarkList = [];
          value.data.landmark_list.forEach((landmark, ind) => {
            landmarkList.push({
              address: landmark.landmark,
              latitude: landmark.latitude,
              longitude: landmark.longitude,
            })
          })
          model.landmark_list = landmarkList;

          await DataController.setItem(DataController.BOOKING_MODEL, JSON.stringify(model))
          this.props.navigation.navigate('AddBooking', {
            covered: model.covered? 'Covered' : 'Uncovered',
            origin: model.landmark_list[0],
            destination: model.landmark_list.slice(1),
            vehicle: model.vehicle,
            dateTime: unFormatDate(new Date()) // Using present date time since model.booking_time = formatDate() used the same on line 114.
          });
        }

    }).catch(err => {
        console.log(err)
        this.showToast(Constants.ERROR_GET_DETAILS);
    })
  }

  render() {
    return(
      <View style={{flex: 1}}>
        <ScrollView style={{display: this.state.bookings.length > 0? 'flex' : 'none', opacity: this.state.gettingPages? 0.05 : 1}}
        onMomentumScrollEnd={(event) => {
          if(event.nativeEvent.layoutMeasurement.height + event.nativeEvent.contentOffset.y >= event.nativeEvent.contentSize.height) {
            this.page += 1
            this.getPastBookings();
          }
        }}>
          {
            this.state.bookings.map((value, index) => {
              return(
                <TouchableHighlight underlayColor='rgba(0, 0, 0, 0.06)'
                key={index} style={{
                  borderRadius: 3, backgroundColor: 'rgba(0, 0, 0, 0.03)', margin: 5,
                  padding: 15,
                }}
                onPress={async () => {
                  await DataController.setItem(DataController.COMPLETED_TRIP_DATA, JSON.stringify(value))
                    this.props.navigation.navigate("TripDetails", {
                      [DataController.RUNNING_TRIP_DATA]: false
                    })
                }}>

                  <View>
                    <View style={{flexDirection: 'row', justifyContent: 'space-between'}}>
                      <View>
                        <Text style={{opacity: 0.4, fontSize: 13, marginBottom: 5}}>{value.date}</Text>
                        <Text style={{fontWeight: '700', fontSize: 13}}>{value.vehicle_name}</Text>
                        <Text style={{opacity: 0.4, fontSize: 13}}>{value.trip_id}</Text>
                      </View>
                      <View style={{alignItems: 'flex-end'}}>
                        <Text style={{fontWeight: '700', fontSize: 13, marginBottom: 5}}>
                          {String.fromCharCode(8377) + ' ' + value.billOffered}
                        </Text>
                        {value.driver !== ""? 
                        <Text style={{fontWeight: '700', fontSize: 13}}>
                          {value.driver}
                        </Text> : null}
                        {value.driver_number !== ""? 
                        <Text style={{opacity: 0.3, fontSize: 13}}>
                          {value.driver_number}
                        </Text> : null}
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

                    {value.rating !== 0?
                    <View style={{flexDirection: 'row', marginTop: 15, alignItems: 'center'}}>
                      <Text style={{fontSize: 13, opacity: 0.3, marginEnd: 10}}>
                      You Rated this Trip
                      </Text>
                      {[1,2,3,4,5].map((x, i) => {
                        return(
                          <Text key={i} style={{
                            color: i < value.rating? ACCENT : 'rgba(0, 0, 0, 0.1)',
                            fontSize: 18
                          }}>
                            {String.fromCharCode(9733)}
                          </Text>
                        )
                      })}
                    </View>
                    :
                    null}

                    <View style={{
                      flexDirection: 'row', justifyContent: 'space-between', marginTop: 10,
                      alignItems: 'center'
                    }}>
                      <Text style={{
                        backgroundColor: value.status === COMPLETED? GREEN : 'red',
                        paddingVertical: 3, paddingHorizontal: 20, borderRadius: 3, 
                        fontSize: 12, color: 'white', textAlignVertical: 'center',
                      }}>
                        {value.status}
                      </Text>
                      
                      {value.status === COMPLETED?
                      <TouchableOpacity
                      style={{
                        borderWidth: 1, borderColor: ACCENT, borderRadius: 3,
                        paddingVertical: 5, paddingHorizontal: 10
                      }}
                      onPress={() => {
                        this.reBook(value.trip_id)
                      }}>
                        <Text style={{color: ACCENT, fontSize: 13}}>Book</Text>
                      </TouchableOpacity> : null}
                    </View>
                  </View>
                
                </TouchableHighlight>
            )})
          }
        </ScrollView>

        <View style={{flex: 1, textAlign: "center",
        alignContent: 'center', justifyContent: 'center',
        opacity: 0.3, marginHorizontal: 20, display: this.state.bookings.length > 0? 'none' : 'flex'}}>
            <Text style={{textAlign: "center", fontSize: 20,}}>
                {this.state.isLoading? "Getting your Past Bookings..." : Constants.PAST_BOOK_EMPTY}
            </Text>
        </View>

        {/* Progress circle */}
        <Modal
          animationType="fade"
          transparent={true}
          visible={this.state.gettingPages && this.state.bookings.length > 0}
          onRequestClose={() => {
              return;
          }}>
            <View
            style={{
            height: '100%',
            alignItems: "center",
            justifyContent: 'center'
            }}>
                <ActivityIndicator color={ACCENT} size="large"/>
            </View>
        </Modal>

        <ToastComp ref={t => this.toast = t}/>
      </View>
    )
  }
}

const styles = StyleSheet.create({});