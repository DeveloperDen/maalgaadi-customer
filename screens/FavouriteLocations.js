import React, { Component } from 'react';
import {
  StyleSheet,
  View,
  Text,
  Image,
  Modal,
  TouchableOpacity,
  TouchableHighlight
} from 'react-native';
import {ScrollView, TextInput} from 'react-native-gesture-handler';

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
            editModalVisible: false,
            delModalVisible: false,
            activeIndex: 0,
            locations:  [
                {
                    name: 'South Tukoganj',
                    address: 'South Tukoganj, 29/6, Sriram Nagar, South Tukoganj',
                    number: '7754727598'
                },
                {
                    name: 'Another Area Name',
                    address: 'Another Area, 30/3, Sriram Nagar, South Tukoganj',
                    number: '9898785462'
                },
                {
                    name: 'Area Name',
                    address: 'An Area, 252/6, Sriram Nagar, South Tukoganj',
                    number: '9985647512'
                },
                {
                    name: 'Test Area Name',
                    address: 'Some Area, 35/6, Colony, Area',
                    number: '89774561556'
                }
              ]
        }
    }

    setModalVisible = (visible, index, save = false, type) => {
        if(type === 'edit') {
            if(save) {
                this.setState(prevState => {
                    prevState.locations[index].name = prevState.editedName
                    prevState.locations[index].number = prevState.editedNumber
                    prevState.editModalVisible = visible
                    prevState.activeIndex = index
                    
                    return prevState
                })
            }
            else {
                this.setState(prevState => {
                    prevState.editModalVisible = visible
                    prevState.activeIndex = index
                    return prevState
                })
            }
        }

        else {
            if(save) {
                this.setState(prevState => {
                    prevState.locations.splice(index, 1)
                    prevState.delModalVisible = visible
                    prevState.activeIndex = 0
                    return prevState
                })
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
                                            {location.name}
                                        </Text>
                                        <Text style={{fontSize:10, opacity: 0.3}}>
                                            {location.address}
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
                        Store your frequently used locations as Favourite and save the hassel of typing
                        long addresses.
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
                                this.state.locations[this.state.activeIndex].address : ''}
                            style={styles.dialogInputs}/>

                            <TextInput placeholder="Name your favourite place"
                            defaultValue={
                                this.state.locations.length > 0?
                                this.state.locations[this.state.activeIndex].name:
                                ''
                            }
                            onChangeText={(text) => {
                                this.setState(prevState => {
                                    prevState.editedName = text
                                    return prevState
                                })
                            }}
                            style={styles.dialogInputs}/>

                            <TextInput placeholder="Mobile number"
                            onChangeText={(text) => {
                                this.setState(prevState => {
                                    prevState.editedNumber = text
                                    return prevState
                                })
                            }}
                            defaultValue={
                                this.state.locations.length > 0?
                                this.state.locations[this.state.activeIndex].number:
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
                                <Text style={{color: '#004EC6', fontWeight: "700",}}> SAVE </Text>
                                </TouchableHighlight>
                            </View>
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
                            width: '75%'
                            }}>
                                <View style={{
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