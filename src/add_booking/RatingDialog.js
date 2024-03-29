import React, { Component } from 'react';
import {
  StyleSheet,
  View,
  BackHandler,
  StatusBar,
  Image,
  Text,
  Picker,
  TouchableOpacity,
  Platform,
} from 'react-native';
import { RATING_RESPONSE, CUSTOMER_ID, BOOKING_ID, RATING, getItem, DESCRIPTION} from '../utils/DataStorageController';
import { AirbnbRating } from 'react-native-ratings';
import { TouchableHighlight, TextInput} from 'react-native-gesture-handler';
import { GET_CUSTOMER_RATING, BASE_URL, KEY, ICONS } from './../utils/AppConstants';
import ToastComp from '../utils/ToastComp'

const ACCENT = '#FFCB28' // 255, 203, 40
const ACCENT_DARK = '#F1B800'

export default class RatingDialog extends Component {
    static navigationOptions = ({navigation}) => {
        return{
            headerStyle: {display: 'none'}
        }
    }

    constructor(props) {
        super(props)

        this.ratingCompleted = this.ratingCompleted.bind(this);

        this.state = {
            drivName: '',
            vehicle: '',
            vehNum: '',
            pickupLoc: '',
            dropLoc: '',
            reasonList: 'NA',
            comment: '',
            reason: '',
            selectedIndex: 0,
            rating: 1,
            showingDetails: false,
            isLoading: false,
            reasonPickerOpen: false,
        }

        // To avoid going back on pressing the back button.
        this.backHandler = BackHandler.addEventListener("hardwareBackPress", () => {
            return true;
        })
    }

    showToast(message) {
        this.toast.show(message);
    }

    componentDidMount() {
        const ratResponse = this.props.navigation.getParam(RATING_RESPONSE);
        this.bookingID = ratResponse.data.booking_id;
        this.customerID = ratResponse.data.customer_id;
        this.setState(prevState => {
            prevState.drivName = ratResponse.data.driver_name;
            prevState.vehicle = ratResponse.data.vehicle_name;
            prevState.vehNum = ratResponse.data.vehicle_reg_no;
            prevState.pickupLoc = ratResponse.data.pickup_location;
            prevState.dropLoc = ratResponse.data.drop_location;

            let reasonList = [];
            const reason = ratResponse.reason;
            if(reason != null) {
                reason.forEach((val, ind, arr) => {
                    reasonList.push(val.reason);
                })

                prevState.reasonList = reasonList;
                prevState.reason = reasonList[0];
            }

            return prevState;
        })
    }

    componentWillUnmount() {
        this.backHandler.remove();
    }

    ratingCompleted(rating) {
        this.setState(prevState => {
            prevState.rating = rating;
            if(rating > 2) {
                prevState.comment = '';
                prevState.reason = '';
            }else {
                this.state.reason = this.state.reasonList[this.state.selectedIndex]
            }
            return prevState
        })
    }

    addCustomerRating() {
        console.log("Reason: ", this.state.reason, " Rating: ", this.state.rating, " Comment: ", this.state.comment)

        // Rating is less than average + reason is "Others" + no comment is given.
        if(this.state.rating < 3 && this.state.reason == "Others" && this.state.comment == '') {
            this.showToast("Please add your comment");
            console.log('Rating is less than average + reason is "Others" + no comment is given.');
        }
        else {
            this.addRating();
        }
    }

    async addRating() {
        this.setState(prevState => {
            prevState.isLoading = true;
            return prevState;
        })
    
        const reqURL = BASE_URL + GET_CUSTOMER_RATING + '?' + 
                        CUSTOMER_ID + '=' + this.customerID + '&' +
                        BOOKING_ID + '=' + this.bookingID + '&' +
                        RATING + '=' + this.state.rating + '&' +
                        DESCRIPTION + '=' + (this.state.reason == "Others" ? this.state.comment : this.state.reason);
        console.log("Request: ", reqURL)
    
        const request = await fetch(reqURL, {
            method: 'GET',
            headers: {
                key: KEY
            }
        })
    
        await request.json().then(value => {
            console.log(value)
            
            if(value.success){
                this.props.navigation.goBack();
            }
            
        }).catch(err => {
            console.log(err)
            this.showToast(err);
        })

        this.setState(prevState => {
            prevState.isLoading = true;
            return prevState;
        })
    }

    render() {
        return (
            <View
            style={{
                flex: 1
            }}>
                <StatusBar backgroundColor='rgba(0, 0, 0, 0.6)' barStyle="light-content"/>
    
                <View 
                style={{
                    backgroundColor: 'rgba(0, 0, 0, 0.6)', width: '100%', height: '100%',
                    alignItems: 'center', justifyContent: 'center',
                }}>
                    <View
                    style={{backgroundColor: 'white', width: '75%',
                    paddingTop: 20, borderRadius: 3,
                    elevation: 10, overflow: 'hidden'}}>
                        <View
                        style={{
                            paddingVertical: 10,
                            marginHorizontal: 20,
                            borderColor: 'rgba(0, 0, 0, 0.1)',
                            borderRadius: 4,
                            borderWidth: 1, display: this.state.showingDetails? 'flex' : 'none'
                        }}>
                            <View style={{flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginHorizontal: 15, overflow: 'hidden'}}>
                                <Image source={require('../../assets/driver_icon.png')} style={{width: 40, height: 40, marginEnd: 10}}/>
                                <View style={{flex: 1}}>
                                    <Text style={{fontSize: 16, fontWeight: '700'}} numberOfLines={1} ellipsizeMode='tail'>{this.state.drivName}</Text>
                                    <Text style={{fontSize: 12, opacity: 0.4}} numberOfLines={1} ellipsizeMode='tail'>{this.state.vehicle}</Text>
                                    <Text style={{fontSize: 12, opacity: 0.4}} numberOfLines={1} ellipsizeMode='tail'>{this.state.vehNum}</Text>
                                </View>
                            </View>
                            
                            <View style={{
                                flex: 1,
                                borderTopColor: 'rgba(0, 0, 0, 0.1)',
                                borderTopWidth: 1,
                                marginVertical: 15
                            }} />

                            <View style={{ flexDirection: 'row', alignItems: 'center', marginHorizontal: 15}}>
                                <View style={{
                                    backgroundColor: 'green',
                                    elevation: 1,
                                    borderWidth: 1,
                                    borderColor: 'white',
                                    width: 10,
                                    height: 10,
                                    borderRadius: 100
                                }} />
                                <Text style={{ marginHorizontal: 15 }} numberOfLines={1} ellipsizeMode='tail'>{this.state.pickupLoc}</Text>
                            </View>

                            <View style={{
                                flex: 1,
                                borderTopColor: 'rgba(0, 0, 0, 0.1)',
                                borderTopWidth: 1,
                                marginVertical: 15
                            }} />

                            <View style={{ flexDirection: 'row', alignItems: 'center', marginHorizontal: 15,}}>
                                <View style={{
                                    backgroundColor: 'red',
                                    elevation: 1,
                                    borderWidth: 1,
                                    borderColor: 'white',
                                    width: 10,
                                    height: 10,
                                    borderRadius: 100
                                }} />
                                <Text style={{ marginHorizontal: 15 }} numberOfLines={1} ellipsizeMode='tail'>{this.state.dropLoc}</Text>
                            </View>
                        </View>
                        <TouchableOpacity style={{
                            paddingVertical: 5,
                            marginHorizontal: 20,
                            borderColor: 'rgba(0, 0, 0, 0.5)',
                            borderRadius: 4,
                            borderWidth: 1,
                            alignItems: 'center', justifyContent: 'center'
                        }}
                        onPress={() => {
                            this.setState(prevState => {
                                prevState.showingDetails = !prevState.showingDetails;
                                return prevState
                            })
                        }}>
                            <Text style={{color: 'rgba(0, 0, 0, 0.5)', fontSize: 13}}>{this.state.showingDetails? "HIDE" : "DETAILS" }</Text>
                        </TouchableOpacity>

                        <View style={{marginTop: 10}}>
                            <AirbnbRating
                            selectedColor={ACCENT_DARK}
                            reviewColor={ACCENT_DARK}
                            reviewSize={20}
                            count={5}
                            reviews={["Poor", "Unsatisfactory", "Average", "Good", "Excellent"]}
                            defaultRating={this.state.rating}
                            size={30}
                            onFinishRating={this.ratingCompleted}
                            />
                        </View>

                        {/* Reason picker */}
                        <View style={{marginTop: 15, backgroundColor: Platform.OS == "android"? 'rgba(0, 0, 0, 0.05)' : 'transparent', marginHorizontal: 15, borderRadius: 4}}>
                            { Platform.OS == "android"?
                                    <Picker
                                    selectedValue={this.state.selectedIndex}
                                    style={{
                                        height: 50, marginHorizontal: 15,
                                        display: this.state.rating < 3 && this.state.reasonList !== 'NA'? 'flex' : 'none'
                                    }}
                                    onValueChange={(itemValue, itemIndex) =>
                                        this.setState(prevState => {
                                            prevState.selectedIndex = itemValue
                                            prevState.reason = prevState.reasonList[itemValue]
                                            return prevState
                                        })
                                    }>
                                        {
                                            this.state.reasonList !== 'NA' && this.state.rating < 3 &&
                                            this.state.reasonList.map((value, index) => {
                                                return(
                                                    <Picker.Item label={value} value={index} key={value}/>
                                                )
                                            })
                                        }
                                    </Picker>
                                :
                                    <TouchableOpacity
                                    style={{
                                        backgroundColor: this.state.reasonPickerOpen? 'rgba(0, 0, 0, 0.1)' : 'rgba(0, 0, 0, 0.05)', padding: 15, justifyContent: 'center',
                                        borderRadius: 4, marginTop: 5,
                                        display: this.state.rating < 3 && this.state.reasonList !== 'NA'? 'flex' : 'none'
                                    }}
                                    onPress={() => {
                                        this.setState(prevState => {
                                            prevState.reasonPickerOpen = !prevState.reasonPickerOpen;
                                            return prevState;
                                        })
                                    }}>
                                        <View style={{flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between'}}>
                                            <Text
                                            style={{
                                                fontSize: 16, opacity: 0.6, flex: 1, marginEnd: 5
                                            }}>
                                                {this.state.reasonList[this.state.selectedIndex]}
                                            </Text>

                                            <Image source={ICONS.forward}
                                            style={{width: 18, height: 18, transform: [{rotate: this.state.reasonPickerOpen? '-90deg' : '90deg'}], opacity: 0.6}}/>
                                        </View>
                                    </TouchableOpacity>
                            }
                        </View>

                        {/* Reason Picker for iOS */}
                        <View style={{backgroundColor: 'rgba(0, 0, 0, 0.02)', marginHorizontal: 15,
                        display: this.state.reasonPickerOpen && this.state.reasonList !== 'NA' && this.state.rating < 3 && Platform.OS == "ios"? 'flex' : 'none'
                        }}>
                            {this.state.reasonList !== 'NA' && this.state.reasonList.map((value, index) => {
                                return(
                                    <View style={{backgroundColor: this.state.selectedIndex == index? 'rgba(0, 0, 0, 0.05)' : 'transparent'}} key={index}>
                                        <TouchableOpacity style={{padding: 10}}
                                        onPress={() => {
                                            this.setState(prevState => {
                                                prevState.selectedIndex = index;
                                                prevState.reasonPickerOpen = false;
                                                prevState.reason = prevState.reasonList[index];
                                                return prevState;
                                            })
                                        }}>
                                            <Text>{value}</Text>
                                        </TouchableOpacity>
                                        
                                        <View 
                                        style={{
                                            borderTopColor:'rgba(0, 0, 0, 0.06)',
                                            borderTopWidth: 1
                                        }}/>
                                    </View>
                                )
                            })}
                        </View>

                        {/* Comment input */}
                        <View style={{
                            marginTop: 15, backgroundColor: 'rgba(0, 0, 0, 0.05)',
                            marginHorizontal: 15, borderRadius: 4, paddingHorizontal: 15,
                            borderBottomColor: 'rgba(0, 0, 0, 0.2)', borderBottomWidth: 1,
                            display: this.state.reason == "Others"? 'flex' : 'none',
                            paddingVertical: 15
                        }}>
                            <TextInput
                            placeholder="What went wrong?" numberOfLines={1} returnKeyType="done"
                            onChangeText={(text) => {
                                this.setState(prevState => {
                                    prevState.comment = text;
                                    return prevState;
                                })
                            }}
                            value={this.state.comment}/>
                        </View>

                        <View style={{backgroundColor: 'white', opacity: 0.7, position: 'absolute', top: 0, bottom: 0, width: this.state.isLoading? '100%' : 0}}/>

                        {/* Submit button */}
                        <TouchableHighlight disabled={this.state.isLoading? true : false}
                        onPress={() => {
                            this.addCustomerRating();
                        }}
                        underlayColor={ACCENT} style={{marginTop: 15, backgroundColor: this.state.isLoading? 'gray' : ACCENT_DARK, alignItems: 'center', justifyContent: 'center', paddingVertical: 15}}>
                            <Text style={{color: 'white', fontSize: 16, fontWeight: '700'}}>
                                {this.state.isLoading? "Updating..." : "SUBMIT"}
                            </Text>
                        </TouchableHighlight>

                        <ToastComp ref={t => this.toast = t}/>
                    </View>
                </View>
            </View>
        );
    }
}

const styles = StyleSheet.create({});