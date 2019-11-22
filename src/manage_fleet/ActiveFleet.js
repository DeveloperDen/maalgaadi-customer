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
  ToastAndroid,
  Keyboard,
  Alert
} from 'react-native';
import { ScrollView } from 'react-native-gesture-handler';
import { NO_ACIVE_FLEET, GET_ACTIVE_DRIVER_LIST, ERROR_GET_DETAILS, BASE_URL, FIELDS, DELETE_ACTIVE_DRIVERS, ERR_ACTIVE_FLEET, GET_DRIVER_DATA_BY_MGCODE, ADD_FAVORITE_DRIVER }
from '../utils/AppConstants';
import * as DataController from '../utils/DataStorageController'

const ACCENT = '#FFCB28' // 255, 203, 40 

export default class RunningMyBookings extends Component {
    constructor(props) {
        super(props)
        this.state = {
            addModalVisible: false,
            delModalVisible: false,
            excDriverSelected: false,
            isLoading: true,
            activeFleet: [],
            activeIndex: 0,
            drivCode: '',
            driverDetail: ''
        }
    }

    setModalVisible = (visible, add=true) => {
        if(add) {
            this.setState(prevState => {
                prevState.addModalVisible = visible
                return prevState
            })
        }
        else {
            this.setState(prevState => {
                prevState.delModalVisible = visible
                return prevState
            })
        }
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

    delFavDriver = async () => {
        this.setState(prevState => {
            prevState.isLoading = true
            return prevState
        })

        const custId = await DataController.getItem(DataController.CUSTOMER_ID) 
        const reqBody = new FormData()
        reqBody.append(FIELDS.DRIVER_ID, this.state.activeFleet[this.state.activeIndex].driver_id)
        reqBody.append(FIELDS.CUSTOMER_ID, custId)

        console.log('Request: ', reqBody)

        const request = await fetch(BASE_URL + DELETE_ACTIVE_DRIVERS, {
            method: 'POST',
            body: reqBody,
            headers: {
                key: "21db33e221e41d37e27094153b8a8a02"
            }
        })
        const response = await request.json().then(async value => {
            console.log("Response: ", value)

            if(value.success) {
                this.setState(prevState => {
                    prevState.activeFleet.splice(this.state.activeIndex, 1)
                    prevState.activeIndex = 0
                    return prevState
                })
                ToastAndroid.show("Driver Removed", ToastAndroid.SHORT);
            }
            else{
                ToastAndroid.show(value.message, ToastAndroid.SHORT);
            }
            
        })
        .catch(err => {
            console.log(err);
            ToastAndroid.show(ERR_ACTIVE_FLEET, ToastAndroid.SHORT);
        })

        this.setState(prevState => {
            prevState.isLoading = false
            prevState.delModalVisible = false
            return prevState
        })
    }

    getFavDriverDetail = async () => {
        this.setState(prevState => {
            prevState.isLoading = true;
            prevState.driverDetail = ''
            return prevState
        })
        const customerId = await DataController.getItem(DataController.CUSTOMER_ID);

        const reqURL = BASE_URL + GET_DRIVER_DATA_BY_MGCODE + '?' + 
                        FIELDS.CUSTOMER_ID + '=' + customerId + '&' +
                        FIELDS.MG_CODE + '=' + this.state.drivCode
        
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
                    prevState.driverDetail = value.data
                    return prevState
                })
            }
            
        }).catch(err => {
            console.log(err)
            ToastAndroid.show(ERR_ACTIVE_FLEET, ToastAndroid.SHORT);
        })

        this.setState(prevState => {
            prevState.isLoading = false;
            return prevState
        })
    }

    addFavDriver = async () => {
        this.setState(prevState => {
            prevState.isLoading = true;
            prevState.driverDetail = ''
            return prevState
        })
        const customerId = await DataController.getItem(DataController.CUSTOMER_ID);

        const reqURL = BASE_URL + ADD_FAVORITE_DRIVER + '?' + 
                        FIELDS.CUSTOMER_ID + '=' + customerId + '&' +
                        FIELDS.MG_CODE + '=' + this.state.drivCode + '&' +
                        FIELDS.STATUS_EXC + '=' + 0
        
        console.log("Request: ", reqURL)

        const request = await fetch(reqURL, {
            method: 'GET',
            headers: {
                key: "21db33e221e41d37e27094153b8a8a02"
            }
        })

        const response = await request.json().then(value => {
            console.log(value)
            Alert.alert("Add Driver", value.message, [
                {text: "OK"}
            ])
            
        }).catch(err => {
            console.log(err)
            ToastAndroid.show(ERR_ACTIVE_FLEET, ToastAndroid.SHORT);
        })

        this.setState(prevState => {
            prevState.isLoading = false;
            prevState.drivCode = ''
            return prevState
        })
        this.setModalVisible(false)
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
                                        prevState.activeIndex = index
                                        return prevState
                                    });
                                    this.setModalVisible(true, false);
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
                visible={this.state.addModalVisible}
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

                            <View style={{
                                flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
                                marginHorizontal: 20
                            }}>
                                <View>
                                    <TextInput maxLength={6}
                                    placeholder="Enter driver code"
                                    style={{
                                        marginTop: 20, borderWidth: 1, borderRadius: 3, borderColor: ACCENT,
                                        paddingHorizontal: 15
                                    }}
                                    onChangeText={(text) => {
                                        this.setState(prevState => {
                                            prevState.drivCode = text
                                            return prevState
                                        })
                                    }}/>
                                    <Text style={{
                                        opacity: 0.3, fontSize: 10, marginTop: 5,
                                    }}>
                                        The driver code should look like: MG576 or JP127
                                    </Text>
                                </View>
                                <TouchableOpacity disabled={this.state.drivCode === '' || this.state.isLoading}
                                onPress={() => {
                                    Keyboard.dismiss()
                                    this.getFavDriverDetail()
                                }}
                                style={{
                                    padding: 10, borderRadius: 100, marginStart: 15,
                                    backgroundColor: (this.state.drivCode == '' || this.state.isLoading)? 'gray' : ACCENT,
                                    alignItems: 'center', justifyContent: 'center',
                                }}>
                                    <Image source={{uri: 'https://cdn3.iconfinder.com/data/icons/google-material-design-icons/48/ic_done_48px-512.png'}}
                                    tintColor='white'
                                    style={{
                                        width: 20, height: 20,
                                        opacity: (this.state.drivCode == '' || this.state.isLoading)? 0.5 : 1
                                    }}/>
                                </TouchableOpacity>
                            </View>

                            {this.state.driverDetail != '' &&
                                <View style={{
                                    flexDirection: 'row', alignItems: 'center', marginTop: 10,
                                    paddingHorizontal: 20, paddingVertical: 10,
                                    backgroundColor: 'rgba(0, 0, 0, 0.04)'
                                }}>
                                    <Image source={{uri: 'https://cdn3.iconfinder.com/data/icons/google-material-design-icons/48/ic_account_circle_48px-512.png'}}
                                    style={{
                                        width: 45, height: 45, marginEnd: 30
                                    }}/>
                                    <View style={{flex: 1}}>
                                        <Text style={{fontSize: 16, fontWeight: "700"}}>
                                        {this.state.driverDetail.driver_name}
                                        </Text>
                                        <Text style={{fontSize: 12, opacity: 0.4, marginVertical: 5}}>{this.state.driverDetail.vehicle_name}</Text>
                                        <Text style={{fontSize: 12, opacity: 0.4}}>{this.state.driverDetail.vehicle_reg_no}</Text>
                                    </View>
                                </View>
                            }

                            <View style={{flexDirection: 'row', marginTop: 20}}>
                                <TouchableHighlight disabled={this.state.driverDetail === ''}
                                underlayColor='rgba(255, 203, 40, 0.8)'
                                onPress={() => {
                                    this.setState(prevState => {
                                        prevState.driverDetail = '';
                                        return prevState;
                                    })
                                    this.addFavDriver()
                                }}
                                style={{
                                    paddingVertical: 15, alignItems: 'center',
                                    flex: 1, marginEnd: 1,  justifyContent: 'center',
                                    backgroundColor: this.state.driverDetail != ''? ACCENT : 'rgba(255, 203, 40, 0.7)',
                                }}>
                                    <Text style={{color: 'white',}}>ADD</Text>
                                </TouchableHighlight>

                                <TouchableHighlight
                                underlayColor='rgba(255, 203, 40, 0.8)'
                                onPress={() => {
                                    this.setState(prevState => {
                                        prevState.driverDetail = '';
                                        prevState.drivCode = ''
                                        return prevState;
                                    })
                                    this.setModalVisible(false)
                                }}
                                style={{
                                    paddingVertical: 15, alignItems: 'center',
                                    flex: 1, justifyContent: 'center',
                                    backgroundColor: ACCENT
                                }}>
                                    <Text style={{color: 'white'}}>CANCEL</Text>
                                </TouchableHighlight>
                            
                                {/* Adding text overlay */}
                                <View style={{
                                    backgroundColor: 'gray', position: 'absolute', top: 0,
                                    bottom: this.state.isLoading? 0 : '100%', overflow: 'hidden',
                                    left: 0, right: 0, alignItems: 'center', justifyContent: 'center'
                                }}>
                                    <Text style={{color: 'white', opacity: 0.4}}>LOADING...</Text>
                                </View>
                            </View>
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
                        width: '75%',
                        }}>
                            <View
                            style={{
                            flexDirection: 'row', justifyContent: 'space-between', elevation: 2,
                            backgroundColor: 'white'
                            }}>
                                <Text style={{margin: 20, fontWeight: '700', fontSize: 15}}>
                                    Remove Driver?
                                </Text>

                                <TouchableOpacity
                                onPress={() => {
                                    this.setModalVisible(false, false)
                                }}>
                                    <Image source={{uri: 'https://cdn3.iconfinder.com/data/icons/virtual-notebook/16/button_close-512.png'}}
                                    style={{width: 15, height: 15, margin: 20}}/>
                                </TouchableOpacity>
                            </View>

                            <Text style={{
                                fontSize: 15, opacity: 0.5, textAlign: 'center',
                                marginHorizontal: 15, marginVertical: 20 
                            }}>
                                Are you sure you want to remove this driver from the fleet?
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
        </View>
    )
    }
}

const styles = StyleSheet.create({});

