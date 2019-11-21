import React, { Component } from 'react';
import {
  StyleSheet,
  TouchableOpacity,
  TouchableHighlight,
  Image,
  View,
  Text,
  TextInput,
  Modal,
  Switch,
  ToastAndroid
} from 'react-native';
import { ScrollView } from 'react-native-gesture-handler';
import { NO_ACIVE_FLEET, GET_ACTIVE_DRIVER_LIST, ERROR_GET_DETAILS, BASE_URL, FIELDS } from '../utils/AppConstants';
import * as DataController from '../utils/DataStorageController'

const ACCENT = '#FFCB28' // 255, 203, 40 

export default class RunningMyBookings extends Component {
    constructor(props) {
    super(props)
    this.state = {
        modalVisible: false,
        excDriverSelected: false,
        isLoading: true,
        activeFleet: []
    }
    }

    setModalVisible = (visible) => {
        this.setState(prevState => {
            prevState.modalVisible = visible
            return prevState
        })
    }

    componentDidMount() {
        this.getFavDrivers()
    }

    getFavDrivers = async () => {
        const customerId = await DataController.getItem(DataController.CUSTOMER_ID);

        const reqURL = BASE_URL + GET_ACTIVE_DRIVER_LIST + '?' + 
                        FIELDS.CUSTOMER_ID + '=' + customerId
        
        console.log("Request: ", reqURL)

        const request = await fetch(reqURL, {
            method: 'GET',
            headers: {
                key: "21db33e221e41d37e27094153b8a8a02"
            }
        })

        const response = await request.json().then(value => {
            console.log(value)

            if(!value.success){
                ToastAndroid.show(value.message, ToastAndroid.SHORT)
            }
            else {
                this.setState(prevState => {
                    prevState.activeFleet = value.data
                    return prevState
                })
            }
            
        }).catch(err => {
            console.log(err)
            ToastAndroid.show(ERROR_GET_DETAILS, ToastAndroid.SHORT);
        })

        this.setState(prevState => {
            prevState.isLoading = false;
            return prevState
        })
    }

    render() {
    return(
        <View style={{flex: 1}}>
            <ScrollView style={{display: this.state.activeFleet.length > 0? 'flex' : 'none'}}>
                {this.state.activeFleet.map((member, index) => {
                    return(
                        <View key={index}>
                            <View style={{flexDirection: 'row', alignItems: 'center', marginVertical: 10}}>
                                <Image source={{uri: 'https://cdn1.iconfinder.com/data/icons/user-pictures/100/boy-512.png'}}
                                style={{
                                    width: 45, height: 45, margin: 15
                                }}/>
                                <View style={{flex: 1}}>
                                    <Text style={{fontSize: 16, fontWeight: "700"}}>
                                    {member.name}
                                    </Text>
                                    <Text style={{fontSize: 12, opacity: 0.4, marginVertical: 5}}>{member.vehicle_name}</Text>
                                    <Text style={{fontSize: 12, opacity: 0.4}}>{member.vehicle_reg_no}</Text>
                                </View>
                                <TouchableOpacity
                                onPress={() => {
                                    this.setState(prevState => {
                                        prevState.activeFleet.splice(index, 1)
                                        return prevState
                                    })
                                }}>
                                    <Image source={{uri: 'https://cdn3.iconfinder.com/data/icons/google-material-design-icons/48/ic_delete_48px-512.png'}}
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
            opacity: 0.3, marginHorizontal: 20, display: this.state.activeFleet.length > 0? 'none' : 'flex'}}>
                <Text style={{textAlign: "center", fontSize: 16,}}>
                    {this.state.isLoading? 'Getting Active fleet members...' : NO_ACIVE_FLEET}
                </Text>
            </View>

            {/* Dialog box to add driver. */}
            <Modal
                animationType="fade"
                transparent={true}
                visible={this.state.modalVisible}
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
                        <View style={{backgroundColor: 'white', borderRadius: 5, overflow: 'hidden'}}>
                            <View style={{
                                flexDirection: 'row', alignItems: 'center',
                                justifyContent: 'space-between', marginTop: 20, marginHorizontal: 20,
                            }}>
                                <Text>Exclusive Driver</Text>
                                <Switch
                                trackColor= {{false: 'rgba(0, 0, 0, 0.3', true: 'rgba(255, 203, 40, 0.5)'}}
                                thumbColor= {this.state.excDriverSelected? ACCENT : '#F0F0F0'}
                                value={this.state.excDriverSelected? true : false}
                                onChange={() => {
                                    this.setState(prevState => {
                                        prevState.excDriverSelected = !prevState.excDriverSelected
                                        return prevState
                                    })
                                }}/>
                            </View>
                            <View>
                                <TextInput
                                placeholder="Enter driver code"
                                style={{
                                    marginTop: 20, borderWidth: 1, borderRadius: 3, borderColor: ACCENT,
                                    marginHorizontal: 20, paddingHorizontal: 15
                                }}/>
                                <Text style={{
                                    opacity: 0.3, fontSize: 10, marginTop: 5,
                                    marginHorizontal: 20
                                }}>
                                    The driver code should look like: MG576 or JP127
                                </Text>
                            </View>
                            <TouchableOpacity
                            onPress={() => {
                                this.setModalVisible(false)
                            }}
                            style={{
                                padding: 10, backgroundColor: ACCENT,
                                alignItems: 'center', justifyContent: 'center',
                                paddingVertical: 15, marginTop: 20
                            }}>
                                <Image source={{uri: 'https://cdn3.iconfinder.com/data/icons/google-material-design-icons/48/ic_done_48px-512.png'}}
                                tintColor='white'
                                style={{width: 20, height: 20}}/>
                            </TouchableOpacity>
                            </View>
                    </View>
            </Modal>

            {/* Floating action button to show add driver dialog */}
            <TouchableHighlight
            onPress={() => {
                this.setModalVisible(true)
            }}
            underlayColor='rgba(255, 203, 40, 0.8)'
            style={{
                backgroundColor: ACCENT, position: 'absolute', width: 60, height: 60,
                borderRadius: 100, elevation: 4, alignItems: 'center',
                justifyContent: 'center', alignSelf: 'flex-end', bottom: 20, end: 20, 
            }}>
                <Image source={{uri: 'https://cdn3.iconfinder.com/data/icons/google-material-design-icons/48/ic_add_48px-512.png'}}
                tintColor='white'
                style={{width: 20, height: 20}}/>
            </TouchableHighlight>
        </View>
    )
    }
}

const styles = StyleSheet.create({});

