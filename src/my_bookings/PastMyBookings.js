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

export default class PastMyBookings extends Component {
  constructor(props) {
    super(props)
    this.state = {
      bookings: [
        {
          status: CANCELLED,
          time: new Date(),
          fare: '160',
          vehicle: 'Loading Rickshaw',
          id: '189688',
          origin: 'Indore, Madhya Pradesh, India',
          destination: 'Indore, Madhyda Pradesh, India',
        },
        {
          status: COMPLETED,
          time: new Date(),
          fare: '160',
          vehicle: 'Loading Rickshaw',
          id: '189682',
          origin: 'Palasia Square, Indore, Madhya Pradesh, India',
          destination: 'Patnipura Square, Indore, Madhyda Pradesh, India',
          driverName: 'Name Lastname',
          vehicleNumber: 'MP09CK0001',
          rating: 3
        },

        {
          status: COMPLETED,
          time: new Date(),
          fare: '220',
          vehicle: 'Tata Ace',
          id: '1895422',
          origin: '29/6, Sriram Nagar, South Tukoganj, Indore, Madhya Pradesh 452001, India',
          destination: 'Patnipura Square, Indore, Madhyda Pradesh, India',
          driverName: 'Some Name',
          vehicleNumber: 'MP09CK0001',
          rating: 5
        },

        {
          status: CANCELLED,
          time: new Date(),
          fare: '532',
          vehicle: 'Ashok Layland',
          id: '189518',
          origin: 'Nanda Nagar, Patnipura, Indore, Madhya Pradesh, India',
          destination: 'Indore, Madhyda Pradesh, India',
        },
      ]
    }
  }

  render() {
    return(
      <View style={{flex: 1}}>
        <ScrollView>
          {
            this.state.bookings.map((value, index) => {
              return(
                <View key={index} style={{
                  borderRadius: 3, backgroundColor: 'rgba(0, 0, 0, 0.03)', margin: 5,
                  padding: 15,
                }}>
                  <View style={{flexDirection: 'row', justifyContent: 'space-between'}}>
                    <View>
                      <Text style={{opacity: 0.4, fontSize: 13, marginBottom: 5}}>{value.time.toUTCString()}</Text>
                      <Text style={{fontWeight: '700', fontSize: 13}}>{value.vehicle}</Text>
                      <Text style={{opacity: 0.4, fontSize: 13}}>{value.id}</Text>
                    </View>
                    <View style={{alignItems: 'flex-end'}}>
                      <Text style={{fontWeight: '700', fontSize: 13, marginBottom: 5}}>
                        {String.fromCharCode(8377) + ' ' + value.fare}
                      </Text>
                      {value.driverName? 
                      <Text style={{fontWeight: '700', fontSize: 13}}>
                        {value.driverName}
                      </Text> : null}
                      {value.vehicleNumber? 
                      <Text style={{opacity: 0.3, fontSize: 13}}>
                        {value.vehicleNumber}
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
                        {value.origin}
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
                        {value.destination}
                      </Text>
                    </View>
                  </View>

                  {value.rating?
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
                Looks like you have not booked any MaalGaadi yet. Make your first booking today!
            </Text>
        </View>
      </View>
    )
  }
}

const styles = StyleSheet.create({});

