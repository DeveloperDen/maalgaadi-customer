import React, { Component } from 'react';
import {
  StyleSheet,
  TouchableOpacity,
  TouchableHighlight,
  Image,
  View,
  Text,
  Modal,
} from 'react-native';
import { ScrollView } from 'react-native-gesture-handler';
import { ERROR_GET_DETAILS, BASE_URL, FIELDS, DELETE_ACTIVE_DRIVERS, KEY, ICONS, GET_PENDING_DRIVER_LIST, NO_REQUEST_FLEET, ERR_REQUEST_FLEET }
from '../utils/AppConstants';
import * as DataController from '../utils/DataStorageController'
import ToastComp from '../utils/ToastComp';

const ACCENT = '#FFCB28' // 255, 203, 40
const ACCENT_DARK = '#F1B800'

export default class RequestsFleet extends Component {
    constructor(props) {
        super(props)
        this.state = {
            addModalVisible: false,
            delModalVisible: false,
            excDriverSelected: false,
            isLoading: true,
            requestFleet: [],
            activeIndex: 0,
        }
    }

    setModalVisible = (visible) => {
      this.setState(prevState => {
          prevState.delModalVisible = visible
          return prevState
      })
    }

    componentDidMount() {
        this.getDrivRequests()
    }

    getDrivRequests = async () => {
        const customerId = await DataController.getItem(DataController.CUSTOMER_ID);

        const reqURL = BASE_URL + GET_PENDING_DRIVER_LIST + '?' + 
                        FIELDS.CUSTOMER_ID + '=' + customerId
        
        console.log("Request: ", reqURL)

        const request = await fetch(reqURL, {
            method: 'GET',
            headers: {
                key: KEY
            }
        })

        await request.json().then(value => {
            console.log(value)

            if(!value.success){
                this.showToast(value.message)
            }
            else {
                this.setState(prevState => {
                    prevState.requestFleet = value.data
                    return prevState
                })
            }
            
        }).catch(err => {
            console.log(err)
            this.showToast(ERROR_GET_DETAILS);
        })

        this.setState(prevState => {
            prevState.isLoading = false;
            return prevState
        })
    }

    delFavDriver = async () => {
      this.setState(prevState => {
          prevState.isLoading = true
          return prevState
      })

      const custId = await DataController.getItem(DataController.CUSTOMER_ID) 
      const reqBody = new FormData()
      reqBody.append(FIELDS.DRIVER_ID, this.state.requestFleet[this.state.activeIndex].driver_id)
      reqBody.append(FIELDS.CUSTOMER_ID, custId)

      console.log('Request: ', reqBody)

      const request = await fetch(BASE_URL + DELETE_ACTIVE_DRIVERS, {
          method: 'POST',
          body: reqBody,
          headers: {
              key: KEY
          }
      })
      await request.json().then(async value => {
          console.log("Response: ", value)

          if(value.success) {
              this.setState(prevState => {
                  prevState.requestFleet.splice(this.state.activeIndex, 1)
                  prevState.activeIndex = 0
                  return prevState
              })
              this.showToast("Driver Removed");
          }
          else{
              this.showToast(value.message);
          }
          
      })
      .catch(err => {
          console.log(err);
          this.showToast(ERR_REQUEST_FLEET);
      })

      this.setState(prevState => {
          prevState.isLoading = false
          prevState.delModalVisible = false
          return prevState
      })
  }

    showToast(text) {
        this.toast.show(text);
    }

    render() {
    return(
        <View style={{flex: 1}}>
            <ScrollView style={{display: this.state.requestFleet.length > 0? 'flex' : 'none'}}>
                {this.state.requestFleet.map((member, index) => {
                    return(
                        <View key={index}>
                            <View style={{flexDirection: 'row', alignItems: 'center', marginVertical: 10}}>
                                <Image source={ICONS.driver_search}
                                style={{
                                    width: 45, height: 45, margin: 15
                                }}/>
                                
                                <View style={{flex: 1}}>
                                    <Text style={{fontSize: 16, fontWeight: "700"}}>
                                        {member.name}
                                    </Text>
                                    <Text style={{fontSize: 12, opacity: 0.4, marginVertical: 5}}>{member.vehicle_name}</Text>
                                    <Text style={{fontSize: 12, opacity: 0.4}}>{member.vehicle_reg_no}</Text>

                                    <Text style={{borderColor: member.state == "Declined"? 'red' : ACCENT_DARK, borderWidth: 1, color: member.state == "Declined"? 'red' : ACCENT_DARK, textAlign: 'center', padding: 3, borderRadius: 10, marginTop: 10}}>
                                        {member.status}
                                    </Text>
                                </View>
                                
                                <TouchableOpacity
                                onPress={() => {
                                    this.setState(prevState => {
                                        prevState.activeIndex = index
                                        return prevState
                                    });
                                    this.setModalVisible(true, false);
                                }}>
                                    <Image source={ICONS.delete}
                                    style={{width: 25, height: 25, opacity: 0.3, margin: 15}}/>
                                </TouchableOpacity>
                            </View>
                            <View 
                            style={{
                            borderTopColor:'rgba(0, 0, 0, 0.1)',
                            borderTopWidth: 1}}/>
                        </View>
                    )
                })}
            </ScrollView>

            {/* Text to show when list is empty */}
            <View style={{flex: 1, textAlign: "center",
            alignContent: 'center', justifyContent: 'center',
            opacity: 0.3, marginHorizontal: 20, display: this.state.requestFleet.length > 0? 'none' : 'flex'}}>
                <Text style={{textAlign: "center", fontSize: 16,}}>
                    {this.state.isLoading? 'Getting fleet requests...' : NO_REQUEST_FLEET}
                </Text>
            </View>
        
            {/* Dialog box to remove driver. */}
            <Modal
                animationType="fade"
                transparent={true}
                visible={this.state.delModalVisible}
                onRequestClose={() => {
                this.setModalVisible(false)
                }}>
                    <View
                    style={{
                    backgroundColor: 'rgba(0, 0, 0, 0.7)',
                    height: '100%',
                    alignItems: "center",
                    justifyContent: 'center'
                    }}>
                        <View style={{
                        borderRadius: 5, backgroundColor: 'white', overflow: 'hidden',
                        width: '70%',
                        }}>
                            <View
                            style={{
                            flexDirection: 'row', justifyContent: 'space-between', elevation: 2,
                            shadowColor: 'rgba(0, 0, 0)', shadowOffset: {height: 2}, shadowOpacity: 0.2, shadowRadius: 2,
                            backgroundColor: 'white', padding: 15,
                            }}>
                                <Text style={{fontWeight: '700', fontSize: 15}}>
                                    Remove Driver?
                                </Text>

                                <TouchableOpacity
                                onPress={() => {
                                    this.setModalVisible(false, false)
                                }}>
                                    <Image source={ICONS.close}
                                    style={{width: 20, height: 20}}/>
                                </TouchableOpacity>
                            </View>

                            <Text style={{
                                fontSize: 15, opacity: 0.5, textAlign: 'center',
                                marginHorizontal: 15, marginVertical: 25
                            }}>
                                Are you sure you want to remove this driver?
                            </Text>

                            <View style={{flexDirection: 'row'}}>
                                <TouchableHighlight
                                underlayColor='rgba(255, 203, 40, 0.8)'
                                onPress={() => {
                                    this.delFavDriver()
                                }}
                                style={{
                                    paddingVertical: 15, alignItems: 'center', justifyContent: 'center',
                                    backgroundColor: ACCENT, flex: 1, marginEnd: 1
                                }}>
                                    <Text style={{color: 'white'}}>YES</Text>
                                </TouchableHighlight>

                                <TouchableHighlight
                                underlayColor='rgba(255, 203, 40, 0.8)'
                                onPress={() => {
                                    this.setModalVisible(false, false)
                                }}
                                style={{
                                    paddingVertical: 15, alignItems: 'center', justifyContent: 'center',
                                    backgroundColor: ACCENT, flex: 1, marginStart: 1
                                }}>
                                    <Text style={{color: 'white'}}>NO</Text>
                                </TouchableHighlight>
                            
                                {/* Deleting text overlay */}
                                <View style={{
                                    backgroundColor: 'gray', position: 'absolute', top: 0,
                                    bottom: this.state.isLoading? 0 : '100%', overflow: 'hidden',
                                    left: 0, right: 0, alignItems: 'center', justifyContent: 'center'
                                }}>
                                    <Text style={{color: 'white', opacity: 0.4}}>REMOVING...</Text>
                                </View>
                            </View>
                            
                        </View>
                    </View>
            </Modal>
            
            {/* Toast Box */}
            <ToastComp ref={t => this.toast = t}/>
        </View>
    )
    }
}

const styles = StyleSheet.create({});