import React, { Component } from 'react';
import {
  StyleSheet,
  View,
  Text,
  Image,
  ScrollView,
  ToastAndroid
} from 'react-native';
import { TouchableHighlight, TouchableOpacity } from 'react-native-gesture-handler';
import DateTimePicker from '@react-native-community/datetimepicker';

const Constants = require('../utils/AppConstants')
const DataController = require('../utils/DataStorageController')

const START = 'start'
const END = 'end'
const ACCENT = '#FFCB28' // 255, 203, 40
const ACCENT_DARK = '#F1B800'
const GREEN = '#24C800' // 36, 200, 0

export default class TransactionHistory extends Component {
    static navigationOptions = ({navigation}) => {
        return{
            headerTitle: 'Transaction History',
            headerRight:
                <Text style={{fontSize: 18, fontWeight: '700', color: GREEN, marginEnd: 22}}>
                    {String.fromCharCode(8377) + ' ' + navigation.getParam('balance')}
                </Text>
        }
    }

    constructor(props) {
        super(props)
        this.state = {
            emptyMessage: "Select the Dates and tap on the button, to get the records",
            isLoading: false,
            history: [],
            activeDate: '',
            showDateTime: false,
            startDate: {
                date: '',
                str: '--/--/----'
            },
            endDate: {
                date: '',
                str: '--/--/----'
            }
        }
    }

    componentDidMount() {
        var stDate = new Date()
        stDate.setUTCDate(stDate.getUTCDate() - 6) 
        stDate = stDate
        var endDate = new Date()
        this.setState(prevState => {
            prevState.startDate.date = stDate
            prevState.startDate.str = this.formatDate(stDate)
            prevState.endDate.date = endDate
            prevState.endDate.str = this.formatDate(endDate)
            return prevState
        })
    }

    formatDate = (date = new Date(), toSend=false) => {
        if(!toSend) {
            var dd = date.getUTCDate(); 
            var mm = date.getUTCMonth() + 1; 
            var yyyy = date.getUTCFullYear(); 
            if (dd < 10) { 
                dd = '0' + dd; 
            } 
            if (mm < 10) { 
                mm = '0' + mm; 
            } 
            return(dd + '/' + mm + '/' + yyyy);
        }
        else {
            const yyyy = date.getFullYear()
            const MM = (date.getMonth() + 1) < 10 ? '0' + (date.getMonth() + 1) : date.getMonth() + 1
            const dd = date.getDate() < 10 ? '0' + date.getDate() : date.getDate()
            const hhmmss = date.toLocaleTimeString()
            return yyyy + '-' + MM + '-' + dd + ' ' + hhmmss
        }   
    }

    showDateDialog = (show) => {
        this.setState(prevState => {
            prevState.showDateTime = show
            return prevState
        })
    }

    getMinDate = (dateType) => {
        if(dateType === START){
            let d = new Date()
            d.setUTCMonth(d.getUTCMonth() - 2) // Current Date minus 2 Months
            return(d)
        }
        else {
            return(this.state.startDate.date)
        }
    }

    getMaxDate = (dateType) => {
        if(dateType === START){
            return(this.state.endDate.date)
        }
        else {
            return(new Date())
        }
    }

    getDataList = async () => {
        this.setState(prevState => {
            prevState.isLoading = true
            prevState.history = []
            return prevState
        })
        const stDate = this.formatDate(this.state.startDate.date, true)
        const endDate = this.formatDate(this.state.endDate.date, true)
        console.log(stDate, '\n', endDate)

        const id = 3 // TODO: Remove this line. Uncomment below line
        // const id = await DataController.getItem(DataController.CUSTOMER_ID)

        const reqURL = Constants.BASE_URL + Constants.GET_WALLET_LIST + '?' + 
                        Constants.FIELDS.CUSTOMER_ID + '=' + id + '&' +
                        Constants.FIELDS.ST_DATE + '=' + stDate + '&' +
                        Constants.FIELDS.END_DATE + '=' + endDate

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
                    prevState.history = value.data
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
        
        this.setState(prevState => {
            prevState.emptyMessage = Constants.WALLET_RECORD_EMPTY
            return prevState
        })
    }

    render() {
        return(
            <View style={{flex: 1}}>
                <View
                style={{
                    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
                    margin: 10, paddingHorizontal: 10, paddingVertical: 10, elevation: 2,
                    backgroundColor: 'white', borderRadius: 3
                }}>
                    <TouchableOpacity
                    onPress={() => {
                        this.setState(prevState => {
                            prevState.activeDate = START
                            return prevState
                        })
                        this.showDateDialog(true)
                    }}>
                        <View style={{flexDirection: 'row', alignItems: 'center'}}>
                            <Image source={{uri: 'https://cdn3.iconfinder.com/data/icons/google-material-design-icons/48/ic_insert_invitation_48px-512.png'}}
                            style={{width: 20, height: 20,}}/>
                            <Text style={{marginStart: 5, fontSize: 15}}>
                                {this.state.startDate.str}
                            </Text>
                        </View>
                    </TouchableOpacity>

                    <TouchableOpacity
                    onPress={() => {
                        this.setState(prevState => {
                            prevState.activeDate = END
                            return prevState
                        })
                        this.showDateDialog(true)
                    }}>
                        <View style={{flexDirection: 'row', alignItems: 'center'}}>
                            <Image source={{uri: 'https://cdn3.iconfinder.com/data/icons/google-material-design-icons/48/ic_insert_invitation_48px-512.png'}}
                            style={{width: 20, height: 20,}}/>
                            <Text style={{marginStart: 5, fontSize: 15}}>
                                {this.state.endDate.str}
                            </Text>
                        </View>
                    </TouchableOpacity>
                
                    <TouchableHighlight underlayColor={ACCENT_DARK}
                    onPress={() => {
                        this.getDataList()
                    }}
                    style={{padding: 5, borderRadius: 100, backgroundColor: ACCENT}}>
                        <Image source={{uri: 'https://cdn3.iconfinder.com/data/icons/google-material-design-icons/48/ic_arrow_forward_48px-512.png'}}
                        style={{width: 25, height: 25}} tintColor='white'/>
                    </TouchableHighlight>
                </View>
            
                <ScrollView
                style={{display: (!this.state.isLoading && this.state.history.length > 0)? 'flex' : 'none'}}>
                    {this.state.history.map((value, index) => {
                        return(
                            <View key={index} style={{marginTop: 15}}>
                                <View style={{flexDirection:'row', justifyContent: 'space-between', marginHorizontal: 10}}>
                                    <Text style={{fontSize: 13, opacity: 0.4}}>{value.booking_id}</Text>
                                    <Text style={{fontSize: 13, opacity: 0.4}}>
                                        {value.created_at}
                                    </Text>
                                    <Text style={{
                                        backgroundColor: value.remark === 'Trip'? GREEN :
                                        value.type === 'Booking Cashback' || 
                                        value.type === 'Payment' ? BLUE : 'red',
                                        paddingVertical: 3, paddingHorizontal: 20, 
                                        borderRadius: 2, color: 'white', fontSize: 12
                                    }}>
                                    {value.remark}
                                    </Text>
                                </View>
                                
                                <Text style={{fontSize: 18, fontWeight: '700', marginHorizontal: 10, marginTop: 3}}>
                                    {
                                        value.notes === ""?
                                        "Trip Charge" : value.notes
                                    }
                                </Text>
                                
                                <View
                                style={{
                                    flexDirection:'row', justifyContent: 'space-between', marginHorizontal: 10,
                                    marginTop: 5
                                }}>
                                    <Text style={{fontSize: 15}}>
                                        Payment: { String.fromCharCode(8377)  + value.credit}
                                    </Text>
                                    <Text style={{fontSize: 15}}>
                                        Bill: { String.fromCharCode(8377) + value.debit}
                                    </Text>
                                    <Text style={{fontSize: 15}}>
                                        Balance: { String.fromCharCode(8377) + value.final_balance}
                                    </Text>
                                </View>
                                
                                <View 
                                    style={{
                                    borderTopColor:'rgba(0, 0, 0, 0.1)',
                                    borderTopWidth: 1,
                                    marginTop: 15}}/>
                            </View> 
                        )
                    })}
                </ScrollView>

                {/* Date Time picker, shown only when, showDateTime is True. */}
                {this.state.showDateTime &&
                <DateTimePicker
                minimumDate={this.getMinDate(this.state.activeDate)}
                maximumDate={this.getMaxDate(this.state.activeDate)}
                value={this.state.activeDate === END? this.state.endDate.date : this.state.startDate.date}
                onChange={(event, date) => {
                if(event.type === 'set')
                    this.setState(prevState => {
                        if(prevState.activeDate === START){
                            prevState.startDate.date = date
                            prevState.startDate.str = this.formatDate(date)   
                        }
                        else {
                            prevState.endDate.str = this.formatDate(date)
                            prevState.endDate.date = date
                        }
                        
                        prevState.showDateTime = false
                        return prevState
                    })
                }}
                />}

                <View style={{flex: 1, textAlign: "center",
                alignContent: 'center', justifyContent: 'center',
                opacity: 0.3, marginHorizontal: 20, display: this.state.history.length > 0? 'none' : 'flex'}}>
                    <Text style={{textAlign: "center", fontSize: 20,}}>
                        {this.state.isLoading? "Getting Record..." : this.state.emptyMessage}
                    </Text>
                </View>
            </View>
        )
    }
}

const styles = StyleSheet.create({

});

