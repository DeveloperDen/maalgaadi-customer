import React, { Component } from 'react';
import {
  StyleSheet,
  View,
  Text,
  TouchableHighlight, 
  Image,
  Animated
} from 'react-native';
import { ScrollView } from 'react-native-gesture-handler';
import ToastComp from '../utils/ToastComp';

const Constants = require('../utils/AppConstants')
const DataController = require('../utils/DataStorageController')

const ACCENT = '#FFCB28' // 255, 203, 40
const ACCENT_DARK = '#F1B800'
const GREEN = '#24C800' // 36, 200, 0
const GREEN_DARK = '#1EA500' 
const BLUE = '#00B0C8' // 0, 176, 200

export default class MGWallet extends Component {
    static navigationOptions = ({navigation}) => {
        return{
            headerTitle: 'MG Wallet',
            headerRight: 
            <TouchableHighlight disabled={navigation.state.params? false : true}
            onPress={() => {
                navigation.navigate('AddMoney', {balance: navigation.state.params? navigation.state.params.balance : 0})
            }}
            underlayColor={GREEN_DARK}
            style={{
                backgroundColor: navigation.state.params? GREEN : 'gray', marginEnd: 20,
                paddingVertical: 8, paddingHorizontal: 12,
                borderRadius: 3
            }}>
                <Text
                style={{color: 'white', fontSize: 13, opacity: navigation.state.params? 1 : 0.4}}>
                    Add Money
                </Text>
            </TouchableHighlight>
        }
    }

    constructor(props) {
        super(props)
        this.state = {
            scrollY: new Animated.Value(0),
            isLoading: true,
            curBalance: 0,
            history: []
        }
    }

    showToast(message) {
        this.toast.show(message);
    }

    async componentDidMount() {
        await this.getWalletList()
    }

    getWalletList = async () => {
        this.setState(prevState => {
            prevState.isLoading = true
            return prevState
        })
        const id = 3 // TODO: Uncomment the line below, and remove this line
        // const id = await DataController.getItem(DataController.CUSTOMER_ID)

        const reqURL = Constants.BASE_URL + Constants.GET_WALLET_LIST + '?' + 
                        Constants.FIELDS.CUSTOMER_ID + '=' + id

        const request = await fetch(reqURL, {
            method: 'GET',
            headers: {
                key: Constants.KEY
            }
        })

        const response = await request.json().then(value => {
            console.log(value)

            if(!value.success){
                this.setState(prevState => {
                    prevState.isLoading = false
                    return prevState
                })
                this.showToast(value.message);
            }
            else {
                DataController.setItem(DataController.WALLET_BALANCE, value.data[0].final_balance.toString())

                this.props.navigation.setParams({
                    balance: value.data[0].final_balance
                })
                this.setState(prevState => {
                    prevState.isLoading = false
                    prevState.history = value.data
                    prevState.curBalance = value.data[0].final_balance
                    return prevState
                })
            }
            
        }).catch(err => {
            console.log(err)
            this.setState(prevState => {
                prevState.isLoading = false
                return prevState
            })
            this.showToast(Constants.ERROR_GET_DETAILS);
        }) 
    }

    render() {
        const filterBottom = this.state.scrollY.interpolate({
            inputRange: [0, 80],
            outputRange: [0, 100],
            extrapolate: 'clamp',
        });

        const filterOp = this.state.scrollY.interpolate({
            inputRange: [0, 70],
            outputRange: [1, 0],
            extrapolate: 'clamp',
        });

        return(
            <View style={{flex: 1}}>
                {/* Header showing balance */}
                <View style={{
                    flexDirection: 'row', backgroundColor: ACCENT, justifyContent: 'center',
                    paddingVertical: 20, shadowColor: 'rgb(0, 0, 0)',
                    shadowOffset: {width: 0, height: 2},
                    shadowOpacity: 0.2,
                    shadowRadius: 6,
                }}>
                    <View style={{ backgroundColor: ACCENT_DARK, borderRadius: 100, padding: 15, margin: 10}}>
                        <Image
                        source={Constants.ICONS.my_wallet}
                        style={{width: 50, height: 50, tintColor: 'white'}}/>
                    </View>
                    
                    <View style={{margin: 10, justifyContent: 'center', alignItems: 'center'}}>
                        <Text style={{fontSize: 16, color: 'white'}}>CURRENT BALANCE</Text>
                        <Text style={{fontSize: 38, fontWeight: '700', color: 'white'}}>
                            {String.fromCharCode(8377) + ' ' + this.state.curBalance}
                        </Text>
                    </View>
                </View>

                <Animated.ScrollView
                scrollEventThrottle={1}
                onScroll={Animated.event(
                    [{nativeEvent: {contentOffset: {y: this.state.scrollY}}}],
                    {useNativeDriver: true}
                )}
                style={{display: this.state.history.length > 0? 'flex' : 'none'}}>
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
                </Animated.ScrollView>

                {/* Filter button */}
                <Animated.View
                style={{
                    position: 'absolute', alignSelf: 'center', transform: [{translateY: filterBottom}],
                    opacity: this.state.history.length > 0? filterOp : 0, bottom: 40
                }}>
                    <TouchableHighlight
                    underlayColor='black'
                    onPress={() => {
                        this.props.navigation.navigate("TransactionHistory", {balance: this.state.curBalance})
                    }}
                    style={{
                        borderRadius: 100,
                    }}>
                        <View
                        style={{
                            backgroundColor: '#151515', borderRadius: 100,
                            flexDirection: 'row', paddingVertical: 12, paddingHorizontal: 35,
                            justifyContent: 'center',  elevation: 3,
                            shadowColor: 'rgb(0, 0, 0)', shadowOffset: {width: 0, height: 4},
                            shadowOpacity: 0.4, shadowRadius: 6,
                        }}>
                            <Image source={Constants.ICONS.filter}
                            style={{width: 20, height: 20, marginEnd: 10, tintColor: 'white'}}/>
                            <Text style={{color: 'white'}}>FILTER</Text>
                        </View>
                    </TouchableHighlight>
                </Animated.View>

                <View style={{flex: 1, textAlign: "center",
                alignContent: 'center', justifyContent: 'center',
                opacity: 0.3, marginHorizontal: 20, display: this.state.history.length > 0? 'none' : 'flex'}}>
                    <Text style={{textAlign: "center", fontSize: 20,}}>
                        {this.state.isLoading? "Getting Wallet Details..." : Constants.WALLET_EMPTY}
                    </Text>
                </View>
            
                <ToastComp ref={t => this.toast = t}/>
            </View>
        )
    }
}

const styles = StyleSheet.create({});

