import React, { Component } from 'react';
import {
  StyleSheet,
  TouchableOpacity,
  View,
  Text,
  ScrollView
} from 'react-native';

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
      page: 1,
      isLoading: true,
      bookings: []
    }
  }

  async componentDidMount() {
    await this.getPastBookings()
  }

  getPastBookings = async () => {
    const reqBody = new FormData()
    const custId = await DataController.getItem(DataController.CUSTOMER_ID)
    reqBody.append(Constants.FIELDS.CUSTOMER_ID, custId)
    reqBody.append(Constants.FIELDS.PAGE, this.state.page)

    console.log('Request: ', reqBody)

    const request = await fetch(Constants.BASE_URL + Constants.GET_COMPLETED_TRIP, {
        method: 'POST',
        body: reqBody,
        headers: {
            key: "21db33e221e41d37e27094153b8a8a02"
        }
    })
    const response = await request.json().then(async value => {
      if(value.success) {
        this.setState(prevState => {
          prevState.bookings = value.data.data
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

  render() {
    return(
      <View style={{flex: 1}}>
        <ScrollView style={{display: this.state.bookings.length > 0? 'flex' : 'none'}}>
          {
            this.state.bookings.map((value, index) => {
              return(
                <View
                key={index} style={{
                  borderRadius: 3, backgroundColor: 'rgba(0, 0, 0, 0.03)', margin: 5,
                  padding: 15,
                }}>
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
                    }}>
                      <Text style={{color: ACCENT, fontSize: 13}}>Book</Text>
                    </TouchableOpacity> : null}
                  </View>
                </View>
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
      </View>
    )
  }
}

const styles = StyleSheet.create({});

