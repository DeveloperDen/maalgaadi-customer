import React, { Component } from 'react';
import {
  StyleSheet,
  View,
  Text,
  Image,
  Modal,
  TouchableOpacity,
  TouchableHighlight,
  ToastAndroid
} from 'react-native';
import {ScrollView, TextInput} from 'react-native-gesture-handler';

const Constants = require('./utils/AppConstants')
const DataController = require('./utils/DataStorageController')

const ACCENT = '#FFCB28' // 255, 203, 40 

export default class FavouriteLocations extends Component {
    static navigationOptions = ({navigation}) => {
        return{
            headerTitle: 'Favourite Locations',
        }
    }

    constructor(props) {
        super(props)
        this.state = {
            isLoading: true,
            editModalVisible: false,
            delModalVisible: false,
            activeIndex: 0,
            locations:  [],
            editedName: '',
            editedNumber: ''
        }
    }

    setModalVisible = async (visible, index, save = false, type) => {
        if(type === 'edit') {
            if(save) {
                await this.editLocation(index, visible)
            }
            else {
                this.setState(prevState => {
                    prevState.editModalVisible = visible
                    prevState.activeIndex = index
                    prevState.editedName = this.state.locations[index].address
                    prevState.editedNumber = this.state.locations[index].number
                    return prevState
                })
            }
        }

        else {
            if(save) {
                this.deleteLocation(index, visible)
            }
            else {
                this.setState(prevState => {
                    prevState.delModalVisible = visible
                    prevState.activeIndex = index
                    return prevState
                })
            }
            
        }   
    }

    editLocation = async (index, visible) => {
        this.setState(prevState => {
            prevState.isLoading = true
            return prevState
        })

        const reqBody = new FormData()
        const custId = await DataController.getItem(DataController.CUSTOMER_ID)
        reqBody.append(Constants.FIELDS.ID, this.state.locations[index].id)
        reqBody.append(Constants.FIELDS.CUSTOMER_ID, custId)
        reqBody.append(Constants.FIELDS.ADDRESS, this.state.editedName)
        reqBody.append(Constants.FIELDS.NUMBER, this.state.editedNumber)
        reqBody.append(Constants.FIELDS.LANDMARK, this.state.locations[index].landmark)
        reqBody.append(Constants.FIELDS.LAT, this.state.locations[index].lat)
        reqBody.append(Constants.FIELDS.LNG, this.state.locations[index].lan)

        console.log('Request: ', reqBody)

        const request = await fetch(Constants.BASE_URL + Constants.EDIT_CUSTOMER_FAVORITE_LOCATION, {
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
                    prevState.locations[index].address = prevState.editedName
                    prevState.locations[index].number = prevState.editedNumber
                    prevState.editModalVisible = visible
                    prevState.activeIndex = index
                    
                    return prevState
                })
                ToastAndroid.show("Favourite Location Updated", ToastAndroid.SHORT);
            }
            else{
                ToastAndroid.show(value.message, ToastAndroid.SHORT);
            }
            
        })
        .catch(err => {
            console.log(err);
            ToastAndroid.show(Constants.ERROR_EDIT_LOC, ToastAndroid.SHORT);
        })

        this.setState(prevState => {
            prevState.isLoading = false
            prevState.editModalVisible = visible
            return prevState
        })
    }

    deleteLocation = async (index, visible) => {
        this.setState(prevState => {
            prevState.isLoading = true
            return prevState
        })

        const reqBody = new FormData()
        reqBody.append(Constants.FIELDS.ID, this.state.locations[index].id)

        console.log('Request: ', reqBody)

        const request = await fetch(Constants.BASE_URL + Constants.DELETE_CUSTOMER_FAVORITE_LOCATION, {
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
                    prevState.locations.splice(index, 1)
                    prevState.delModalVisible = visible
                    prevState.activeIndex = 0
                    return prevState
                })
                ToastAndroid.show("Favourite Location Deleted", ToastAndroid.SHORT);
            }
            else{
                ToastAndroid.show(value.message, ToastAndroid.SHORT);
            }
            
        })
        .catch(err => {
            console.log(err);
            ToastAndroid.show(Constants.ERROR_EDIT_LOC, ToastAndroid.SHORT);
        })

        this.setState(prevState => {
            prevState.isLoading = false
            prevState.delModalVisible = visible
            return prevState
        })
    }

    async componentDidMount() {
        await this.getFavLocations()
    }

    getFavLocations = async () => {
        this.setState(prevState => {
            prevState.isLoading = true
            return prevState
        })

        const id = await DataController.getItem(DataController.CUSTOMER_ID)

        const reqURL = Constants.BASE_URL + Constants.VIEW_FAV_LOCATION_URL + '?' + 
                        Constants.FIELDS.CUSTOMER_ID + '=' + id

        const request = await fetch(reqURL, {
            method: 'GET',
            headers: {
                key: "21db33e221e41d37e27094153b8a8a02"
            }
        })

        const response = await request.json().then(value => {
            console.log(value)

            if(!value.success){
                this.setState(prevState => {
                    prevState.isLoading = false
                    return prevState
                })
                ToastAndroid.show(value.message, ToastAndroid.SHORT);
            }
            else {
                this.setState(prevState => {
                    prevState.isLoading = false
                    prevState.locations = value.data
                    return prevState
                })
            }
            
        }).catch(err => {
            console.log(err)
            this.setState(prevState => {
                prevState.isLoading = false
                return prevState
            })
            ToastAndroid.show(Constants.ERROR_GET_DETAILS, ToastAndroid.SHORT);
        }) 
    }

    render() {
        return(
            <View style={{flex: 1}}>
                {this.state.locations.length > 0?

                // List of elements
                <ScrollView>
                    {this.state.locations.map((location, index) => {
                        return(
                            <View key={index}>
                                <View 
                                style={{flexDirection: 'row', alignItems: 'center', marginVertical: 10}}>
                                    <Image
                                    source={{uri: 'https://cdn2.iconfinder.com/data/icons/pittogrammi/142/94-512.png'}}
                                    style={{width: 20, height:20, margin: 15, opacity: 0.3}}/>

                                    <View style={{flex: 1}}>
                                        <Text style={{fontWeight: "700", fontSize:15}}>
                                            {location.address}
                                        </Text>
                                        <Text style={{fontSize:10, opacity: 0.3}}>
                                            {location.landmark}
                                        </Text>
                                        <Text style={{fontSize:10, opacity: 0.3, marginTop: 5}}>
                                            {location.number}
                                        </Text>
                                    </View>

                                    <TouchableOpacity
                                    onPress={() => {
                                        this.setModalVisible(true, index, null, 'edit')
                                    }}>
                                        <Image source={{uri: 'https://cdn3.iconfinder.com/data/icons/google-material-design-icons/48/ic_mode_edit_48px-512.png'}}
                                        style={{width: 20, height:20, margin: 10, opacity: 0.3}}/>
                                    </TouchableOpacity>
                                    <TouchableOpacity
                                    onPress={() => {
                                        this.setModalVisible(true, index, null, 'del')
                                    }}>
                                        <Image source={{uri: 'https://cdn3.iconfinder.com/data/icons/google-material-design-icons/48/ic_delete_48px-512.png'}}
                                        style={{width: 20, height:20, margin: 10, opacity: 0.3}}/>
                                    </TouchableOpacity>
                                </View> 
                                <View 
                                    style={{
                                    borderTopColor:'rgba(0, 0, 0, 0.1)',
                                    borderTopWidth: 1,
                                    marginHorizontal: 10}}/>
                            </View>
                        )
                    })}
                </ScrollView>

                :

                // Text to show when list is empty
                <View
                style={{
                    flex: 1,
                    justifyContent: 'center', alignItems: 'center',
                    opacity: 0.3, marginHorizontal: 20
                    }}>
                    <Text style={{textAlign: "center", fontSize: 16,}}>
                        {
                            this.state.isLoading? "Getting your favourite locations..." :
                            Constants.FAV_LOC_EMPTY
                        }
                    </Text>
                </View>
                }

                {/* Dialog box to edit locations. */}
                <Modal
                animationType="fade"
                transparent={true}
                visible={this.state.editModalVisible}
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
                        <View 
                        style={{backgroundColor: 'white', width: '80%',
                        paddingHorizontal: 12, paddingVertical: 20, borderRadius: 3,
                        elevation: 10}}>
                            <TextInput editable={false} multiline={true}
                            defaultValue={
                                this.state.locations.length > 0?
                                this.state.locations[this.state.activeIndex].landmark : ''}
                            style={styles.dialogInputs}/>

                            <TextInput placeholder="Name your favourite place"
                            defaultValue={
                                this.state.locations.length > 0?
                                this.state.editedName:
                                ''
                            }
                            onChangeText={(text) => {
                                this.setState(prevState => {
                                    prevState.editedName = text
                                    return prevState
                                })
                            }}
                            style={styles.dialogInputs}/>

                            <TextInput keyboardType="decimal-pad" maxLength={10} placeholder="Mobile number"
                            onChangeText={(text) => {
                                this.setState(prevState => {
                                    prevState.editedNumber = text
                                    return prevState
                                })
                            }}
                            defaultValue={
                                this.state.locations.length > 0?
                                this.state.editedNumber:
                                ''
                            }
                            style={styles.dialogInputs}/>

                            <View style={{flexDirection: 'row', justifyContent: "flex-end"}}>
                                <TouchableHighlight 
                                underlayColor='#E8E8E8'
                                onPress={() => {
                                    this.setModalVisible(false, 0, false, 'edit')
                                }}
                                style={{
                                    padding: 10,
                                    borderRadius: 5,
                                    marginTop:10,
                                    justifyContent: "center"}}>
                                <Text style={{color: '#004EC6', fontWeight: "700"}}> CANCEL </Text>
                                </TouchableHighlight>

                                <TouchableHighlight 
                                underlayColor='#E8E8E8'
                                onPress={() => {
                                    this.setModalVisible(false, this.state.activeIndex, true, 'edit')
                                }}
                                style={{padding: 5, borderRadius: 5,
                                marginTop: 10, justifyContent: "center"}}>
                                <Text style={{color: '#004EC6', fontWeight: "700",}}>
                                    {this.state.isLoading? "SAVING..." : "SAVE"}
                                </Text>
                                </TouchableHighlight>
                            </View>
                            
                            <View style={{
                                position: 'absolute', backgroundColor: 'white',
                                opacity: 0.8, top: 0, left: 0, right: 0,
                                bottom: this.state.isLoading? 0 : '100%',
                            }}/>
                        </View>
                    </View>
                </Modal>
                
                {/* Dialog box to remove favourite locations. */}
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
                                        Remove Location?
                                    </Text>

                                    <TouchableOpacity
                                    onPress={() => {
                                        this.setModalVisible(false, 0, null, 'del')
                                    }}>
                                        <Image source={{uri: 'https://cdn3.iconfinder.com/data/icons/virtual-notebook/16/button_close-512.png'}}
                                        style={{width: 15, height: 15, margin: 20}}/>
                                    </TouchableOpacity>
                                </View>

                                <Text style={{
                                    fontSize: 15, opacity: 0.5, textAlign: 'center',
                                    marginHorizontal: 15, marginVertical: 20 
                                }}>
                                    Are you sure you want to delete this favourite location?
                                </Text>

                                <View style={{flexDirection: 'row'}}>
                                    <TouchableHighlight
                                    underlayColor='rgba(255, 203, 40, 0.8)'
                                    onPress={() => {
                                        this.setModalVisible(false, this.state.activeIndex, true, 'del')
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
                                        this.setModalVisible(false, 0, null, 'del')
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
                                        <Text style={{color: 'white', opacity: 0.4}}>DELETING...</Text>
                                    </View>
                                </View>
                                
                            </View>
                        </View>
                </Modal>
            </View>
        )
    }
}

const styles = StyleSheet.create({
    dialogInputs: {
        borderBottomColor: '#CDCDCD',
        borderBottomWidth: 2,
        margin: 5,
        fontSize: 15
      }
});