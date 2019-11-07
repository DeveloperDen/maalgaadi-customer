import React, { Component } from 'react';
import {
  StyleSheet,
  View,
  Text,
  TouchableHighlight, 
  Image,
  ToastAndroid,
  Animated
} from 'react-native';
import { ScrollView } from 'react-native-gesture-handler';

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
            <TouchableHighlight
            onPress={() => {
                navigation.navigate('AddMoney')
            }}
            underlayColor={GREEN_DARK}
            style={{
                backgroundColor: GREEN, marginEnd: 20,
                paddingVertical: 8, paddingHorizontal: 12,
                borderRadius: 3
            }}>
                <Text style={{color: 'white', fontSize: 13}}> Add Money </Text>
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

    async componentDidMount() {
        await this.getWalletList()
    }

    getWalletList = async () => {
        this.setState(prevState => {
            prevState.isLoading = true
            return prevState
        })

        const id = 3 // TODO: Remove this line. Uncomment below line
        // const id = await DataController.getItem(DataController.CUSTOMER_ID)

        const reqURL = Constants.BASE_URL + Constants.GET_WALLET_LIST + '?' + 
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
            ToastAndroid.show(Constants.ERROR_GET_DETAILS, ToastAndroid.SHORT);
        }) 
    }

    render() {
        const filterBottom = this.state.scrollY.interpolate({
            inputRange: [0, 80],
            outputRange: [40, -40],
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
                    paddingVertical: 20
                }}>
                    <View style={{ backgroundColor: ACCENT_DARK, borderRadius: 100, padding: 15, margin: 10}}>
                        <Image
                        source={{uri: 'https://cdn0.iconfinder.com/data/icons/finance-android-l-lollipop-icon-pack/24/wallet-512.png'}}
                        tintColor='white'
                        style={{width: 50, height: 50}}/>
                    </View>
                    
                    <View style={{margin: 10, justifyContent: 'center', alignItems: 'center'}}>
                        <Text style={{fontSize: 16, color: 'white'}}>CURRENT BALANCE</Text>
                        <Text style={{fontSize: 38, fontWeight: '700', color: 'white'}}>
                            {String.fromCharCode(8377) + ' ' + this.state.curBalance}
                        </Text>
                    </View>
                </View>

                <ScrollView
                onScroll={Animated.event(
                    [{nativeEvent: {contentOffset: {y: this.state.scrollY}}}],
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
                </ScrollView>

                <Animated.View
                style={{
                    position: 'absolute', alignSelf: 'center', bottom: filterBottom,
                    opacity: this.state.history.length > 0? filterOp : 0
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
                            justifyContent: 'center',  elevation: 3 
                        }}>
                            <Image source={{uri: 'https://cdn1.iconfinder.com/data/icons/gradak-music/32/music-38-512.png'}}
                            style={{width: 20, height: 20, marginEnd: 10}}
                            tintColor='white'/>
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
            </View>
        )
    }
}

const styles = StyleSheet.create({

});

