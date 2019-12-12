import React, { Component } from 'react';
import {
  StyleSheet,
  View,
  Image,
  TouchableHighlight,
  Text,
  Picker,
  Linking,
  ToastAndroid
} from 'react-native';
import { ScrollView, TextInput, TouchableOpacity } from 'react-native-gesture-handler';
import { PopOverComp } from '../utils/PopOverComp';

const Constants = require('../utils/AppConstants')
const DataController = require('../utils/DataStorageController')

const ACCENT = '#FFCB28' // 255, 203, 40
const ACCENT_DARK = '#F1B800' 

export default class CreateProfile extends Component {
    static navigationOptions = ({navigation}) => {
        return{
            headerTitle: navigation.getParam(Constants.IS_NEW_USER)? 'Create Profile' : 'Edit Profile',
        }
    }

    constructor(props) {
        super(props)

        this.tripFreqArray = [
            "Select Trip Frequency",
            "5 Trips a Month",
            "30 Trips a Month",
            "60 Trips a Month",
            "More than 60 Trips"
        ]

        this.selectedCityId = "1"
        this.planId = 0
        this.paymentData = ""
        this.tripCode = "",
        this.isExc = false

        this.state = {
            romView: null,
            popOverText: '',
            tutCompFieldActive: null,
            isVisible: false,

            isLoading: false,
            tripFreq: 0,
            name: '',
            address: '',
            number: '',
            email: '',
            org: '',
            goodsType: 'Select Goods Type',
            goodsId: 0
        }
    }

    async componentDidMount() {
        const toGet = new Array()
        toGet.push(DataController.CUSTOMER_NAME,
        DataController.CUSTOMER_MOBILE, DataController.EMAIL, DataController.ORG,
        DataController.ADDRESS, DataController.GOODS_NAME, DataController.GOODS_ID, DataController.TRIP_FREQ)

        DataController.getItems(toGet)
        .then(res => {
            console.log(res)
            this.setState(prevState => {
                prevState.name = res[0][1]
                prevState.number = res[1][1]
                prevState.email = res[2][1]
                prevState.org = res[3][1]
                prevState.address = res[4][1]
                prevState.goodsType = res[5][1]
                prevState.goodsId = res[6][1]
                prevState.tripFreq = this.tripFreqArray.indexOf(res[7][1])
                return(prevState)
            })
        })
        .catch(err => {
            console.log(err)
            ToastAndroid.show(Constants.ERROR_GET_DETAILS, ToastAndroid.SHORT);
        })
    }

    setGoodsType = (goods) => {
        this.setState(prevState => {
            prevState.goodsType = goods.goods_name
            prevState.goodsId = goods.id
            return prevState
        })
    }

    updateUserProfile = async () => {
        this.setState(prevState => {
            prevState.isLoading = true;
            return prevState
        })

        const reqBody = new FormData()
        const custId = await DataController.getItem(DataController.CUSTOMER_ID)
        reqBody.append(Constants.FIELDS.CUSTOMER_ID, custId)
        reqBody.append(Constants.FIELDS.NAME, this.state.name)
        reqBody.append(Constants.FIELDS.ADDRESS, this.state.address)
        reqBody.append(Constants.FIELDS.EMAIL, this.state.email)
        reqBody.append(Constants.FIELDS.ORG, this.state.org)
        reqBody.append(Constants.FIELDS.TRIP_CODE, this.tripCode)
        reqBody.append(Constants.FIELDS.NUMBER, this.state.number)
        reqBody.append(Constants.FIELDS.GOODS_ID, this.state.goodsId)
        reqBody.append(Constants.FIELDS.GOODS_NAME, this.state.goodsType)
        reqBody.append(Constants.FIELDS.TRIP_FREQ, this.tripFreqArray[this.state.tripFreq])
        reqBody.append(Constants.FIELDS.CITY_ID, this.selectedCityId)
        reqBody.append(Constants.FIELDS.PLAN_ID, this.planId)
        reqBody.append(Constants.FIELDS.PAYMENT_DATA, this.paymentData),
        reqBody.append(Constants.FIELDS.IS_EXCLUSIVE, this.isExc)

        console.log('Request: ', reqBody)

        const request = await fetch(Constants.BASE_URL + Constants.UPDATE_CUSTOMER_PROFILE, {
            method: 'POST',
            body: reqBody,
            headers: {
                key: "21db33e221e41d37e27094153b8a8a02"
            }
        })

        const response = await request.json().then(async value => {
            const dataToWrite = new FormData()
            dataToWrite.append(DataController.IS_PROFILE_COMPLETED, "true")
            dataToWrite.append(DataController.IS_LOGIN, "true")
            dataToWrite.append(DataController.CUSTOMER_ID, value.data.id.toString())
            dataToWrite.append(DataController.CUSTOMER_MOBILE, value.data.cust_number)
            dataToWrite.append(DataController.BUFFER_TIME, value.data.configure_setting.buffered_schedule_time.toString())
            dataToWrite.append(DataController.CUSTOMER_NAME, this.state.name)
            dataToWrite.append(DataController.RATING, value.data.rating.toString())
            dataToWrite.append(DataController.EMAIL, value.data.cust_email)
            dataToWrite.append(DataController.ORG, value.data.cust_organization)
            
            // TODO: Decide on the basis of city_list
            dataToWrite.append(DataController.CITY, "Indore")

            dataToWrite.append(DataController.CITY_ID, value.data.city_id.toString())

            dataToWrite.append(DataController.ADDRESS, value.data.cust_address)
            dataToWrite.append(DataController.GOODS_NAME, value.data.goods_name)
            dataToWrite.append(DataController.GOODS_ID, value.data.goods_id.toString())
            dataToWrite.append(DataController.TRIP_FREQ, value.data.selected_trip_frequency)

            await DataController.setItems(dataToWrite)

            console.log("Response: ", value)
            console.log("Written Data: ", dataToWrite)
            console.log("Profile Updated")
        })
        .catch(err => {
            console.log(err);
            ToastAndroid.show(Constants.ERROR_UPDATE_PROFILE, ToastAndroid.SHORT);
        })

        this.setState(prevState => {
            prevState.isLoading = false
            return prevState
        })
        this.props.navigation.replace("Main")
    }

    showPopover(compFieldText, comp) {
        this.setState(prevState => {
          prevState.isVisible = true;
          prevState.fromView = comp;
          prevState.popOverText = compFieldText;
          return prevState;
        });
    }
     
    closePopover() {
        this.setState(prevState => {
            prevState.isVisible = false;
            return prevState;
        });
    }

    render() {
        return(
            <View style={{flex: 1, backgroundColor: 'white'}}>
                <View
                style={{
                    backgroundColor: 'rgba(0, 0, 0, 0.04)', padding: 20, overflow: 'visible',
                    position: 'absolute', width: '100%', top: 0
                }}>
                    <Image source={{uri: 'https://cdn3.iconfinder.com/data/icons/google-material-design-icons/48/ic_account_circle_48px-512.png'}}
                    style={{width: 100, height: 100, opacity: 0.5, alignSelf: 'center', }}/>
                </View>
                
                <ScrollView>
                    <View style={{marginTop: 140, backgroundColor: 'white', paddingHorizontal: 20, paddingTop: 30}}>
                        <TextInput placeholder='NAME'
                        defaultValue={this.state.name}
                        style={styles.inputs}
                        onChangeText={text => this.setState(prevState => {
                            prevState.name = text;
                            return prevState
                        })}/>

                        <TextInput placeholder='MOBILE' keyboardType='decimal-pad' maxLength={10} editable={false}
                        defaultValue={this.state.number}
                        style={styles.inputs}/>

                        <View
                        style={[styles.inputs, {flexDirection: 'row', alignItems: 'center',}]}>

                            <TextInput defaultValue={this.state.email}
                            placeholder='EMAIL' keyboardType='email-address' textContentType='emailAddress'
                            style={{flex: 1}}
                            onChangeText={text => this.setState(prevState => {
                                prevState.email = text;
                                return prevState
                            })}/>

                            <TouchableOpacity
                            ref={emH => {this.emailHint = emH}}
                            onPress={() => {
                                this.showPopover(Constants.HINT_PROF_EMAIL, this.emailHint)
                            }}>
                                <Image source={{uri:'https://cdn3.iconfinder.com/data/icons/google-material-design-icons/48/ic_error_48px-512.png'}}
                                style={{width: 20, height: 20, opacity: 0.5}}/>
                            </TouchableOpacity>
                            
                        </View>

                        <View
                        style={[styles.inputs, {flexDirection: 'row', alignItems: 'center',}]}>

                            <TextInput defaultValue={this.state.org}
                            placeholder='ORGANIZATION'
                            style={{flex: 1}}
                            onChangeText={text => this.setState(prevState => {
                                prevState.org = text;
                                return prevState
                            })}/>

                            <TouchableOpacity
                            ref={oH => {this.orgHint = oH}}
                            onPress={() => {
                                this.showPopover(Constants.HINT_PROF_ORG, this.orgHint)
                            }}>
                                <Image source={{uri:'https://cdn3.iconfinder.com/data/icons/google-material-design-icons/48/ic_error_48px-512.png'}}
                                style={{width: 20, height: 20, opacity: 0.5}}/>
                            </TouchableOpacity>
                            
                        </View>
                        
                        <TextInput placeholder='CITY' editable={false} defaultValue="Indore"
                        style={styles.inputs}/>

                        <TextInput defaultValue={this.state.address}
                        placeholder='ADDRESS' textContentType='fullStreetAddress'
                        style={styles.inputs}
                        onChangeText={text => this.setState(prevState => {
                            prevState.address = text;
                            return prevState
                        })}/>

                        <View
                        style={{
                            borderBottomColor: 'rgba(0, 0, 0, 0.2)', borderBottomWidth: 2,
                            borderRadius: 3,
                            marginBottom: 25,
                        }}>
                            <TouchableHighlight
                            underlayColor='white'
                            onPress={() => {
                                this.props.navigation.navigate('GoodsList', {setGoodsType: this.setGoodsType.bind(this)})
                            }}
                            style={{
                                padding: 10
                            }}>
                                <View
                                style={{
                                    flexDirection: 'row', alignItems: 'center',
                                    justifyContent: 'space-between'
                                }}>
                                    <Text style={{fontSize: 15}}>TYPE OF GOODS</Text>
                                    <Image source={{uri: 'https://cdn2.iconfinder.com/data/icons/ios-7-icons/50/forward-512.png'}}
                                    style={{width: 15, height: 15}}/>
                                </View>
                                
                            </TouchableHighlight>
                            <Text
                            style={{
                                paddingHorizontal: 20,
                                paddingBottom: 10,
                                fontSize: 15,
                                opacity: 0.4
                            }}>
                                {this.state.goodsType}
                            </Text>
                        </View>
                    
                        <View
                        style={{
                            borderBottomColor: 'rgba(0, 0, 0, 0.2)', borderBottomWidth: 2,
                            borderRadius: 3,
                            marginBottom: 10, paddingHorizontal: 10
                        }}>
                            <Text style={{fontSize: 15}}>TRIP FREQUENCY</Text>
                            <Picker
                            selectedValue={this.state.tripFreq}
                            style={{height: 50, width: '100%'}}
                            onValueChange={(itemValue, itemIndex) =>
                                this.setState(prevState => {
                                    prevState.tripFreq = itemValue
                                    return prevState
                                })
                            }>
                                {this.tripFreqArray.map((value, index) => {
                                    return(
                                        <Picker.Item label={value} value={index} key={index}/>
                                    )
                                })}
                                
                            </Picker>
                        </View>
                    
                        <View style={{alignItems: 'center', marginVertical: 30}}>
                            <Text style={{fontSize: 13}}>By clicking Create Profile, you agree to our </Text>
                            <TouchableHighlight underlayColor='white'
                            onPress={() => {
                                Linking.openURL(Constants.TERMSANDCONDITION)
                                .catch((err) => console.log(err));
                            }}>
                                <Text style={{color: ACCENT_DARK, textDecorationLine:"underline", fontSize: 13}}>
                                    Terms and Conditions
                                </Text>
                            </TouchableHighlight>
                        </View>
                    </View>
                </ScrollView>

                {/* Overlay to show while loading, to avoid any touches */}
                <View style={{
                    position: 'absolute', backgroundColor: 'white', width: '100%',
                    opacity: 0.5, height: this.state.isLoading? '100%' : 0,
                }}/>

                {/* Tutorials popover */}
                <PopOverComp isVisible={this.state.isVisible} fromView={this.state.fromView}
                closePopover={this.closePopover.bind(this)} text={this.state.popOverText}/>

                <TouchableHighlight
                disabled={this.state.isLoading}
                underlayColor={ACCENT_DARK}
                onPress={() => {
                    this.updateUserProfile()
                }}
                style={{
                    backgroundColor: this.state.isLoading? 'gray' : ACCENT,
                    paddingVertical: 15,
                    justifyContent: 'center',
                    alignItems: 'center',
                    elevation: 10
                }}>
                    <Text style={{
                        fontSize: 18, fontWeight: '700', color: 'white',
                        opacity: this.state.isLoading? 0.3 : 1
                    }}>
                        {this.state.isLoading? "Saving..." : 
                            this.props.navigation.getParam(Constants.IS_NEW_USER)? 'Create Profile' : 'Save'}
                    </Text>
                </TouchableHighlight>
            </View>
        )
    }
}

const styles = StyleSheet.create({
    inputs: {
        borderBottomColor: 'rgba(0, 0, 0, 0.2)', borderBottomWidth: 2,
        marginBottom: 15
    }
});