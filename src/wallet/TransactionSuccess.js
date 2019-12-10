import React, { Component } from 'react';
import {
  StyleSheet,
  View,
  ToastAndroid,
  TouchableHighlight, Image, Text,
  StatusBar,
  Animated, Easing,
  ActivityIndicator
} from 'react-native';
import { getItem, PAYMENT_TRANS_DATA, setItem, WALLET_BALANCE, CUSTOMER_ID, removeItem } from '../utils/DataStorageController';
import { BASE_URL, SEND_TRANSACTION_STATUS } from '../utils/AppConstants';

const ACCENT = '#FFCB28' // 255, 203, 40
const ACCENT_DARK = '#F1B800'
const GREEN = '#24C800' // 36, 200, 0
const GREEN_DARK = '#1EA500' 
const BLUE = '#00B0C8' // 0, 176, 200
const ANIM_DUR = 500

export default class TransactionStatus extends Component {
    static navigationOptions = ({navigation}) => {
        return{
            headerStyle: {display: 'none'},
        }
    }

    constructor(props) {
        super(props)
        this.state = {
            isLoading: true,
            walBalance: 100,
            date: new Date().toLocaleString(),
            amount: 50,
            transId: "41355536663464",
            translateY: new Animated.Value(300),
            opacity: new Animated.Value(0),
            scale: new Animated.Value(0)
        }
    }

    async componentDidMount() {
        this.transData = await getItem(PAYMENT_TRANS_DATA);
        this.transData = JSON.parse(this.transData)
        this.setState(prevState => {
            prevState.amount = this.transData.amount;
            prevState.transId = this.transData[TRANS_PARAMS.ORDER_ID];
            return prevState;
        })

        this.sendTransactionStatus();
    }

    startAnim() {
        Animated.parallel([
            Animated.timing(this.state.translateY, {
                duration: ANIM_DUR,
                toValue: 0,
                useNativeDriver: true,
                easing: Easing.bounce
            }),
            Animated.timing(this.state.opacity, {
                duration: ANIM_DUR,
                toValue: 1,
                useNativeDriver: true,
            }),
            Animated.timing(this.state.scale, {
                duration: ANIM_DUR,
                toValue: 1,
                useNativeDriver: true,
                easing: Easing.bounce
            }),
        ]).start()
    }

    sendTransactionStatus = async () => {
        const id = await getItem(CUSTOMER_ID)
        this.transData[CUSTOMER_ID] = id

        const reqURL = BASE_URL + SEND_TRANSACTION_STATUS;

        const request = await fetch(reqURL, {
            method: 'POST',
            headers: {
                key: "21db33e221e41d37e27094153b8a8a02",
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(this.transData)
        })

        const response = await request.json().then(value => {
            console.log(value)

            if(!value.success){
                ToastAndroid.show(value.message, ToastAndroid.SHORT);
            }
            else {
                const data = value.data;

                setItem(WALLET_BALANCE, data.mg_balance.toString())
                this.setState(prevState => {
                    prevState.walBalance = data.mg_balance
                    prevState.date = data.created_at
                    prevState.isLoading = false
                    return prevState
                })
                this.startAnim()
            }

            removeItem(PAYMENT_TRANS_DATA);
            
        }).catch(err => {
            console.log(err)
        }) 
    }

    render() {
        return(
            <View style={{flex: 1, backgroundColor: ACCENT}}>
                <StatusBar backgroundColor={ACCENT_DARK} 
                barStyle="light-content"/>

                <View style={{margin: 20}}>
                    <TouchableHighlight
                    onPress={() => {
                        this.props.navigation.goBack()
                    }}
                    underlayColor='white'>
                        <Image
                        source={{uri: 'https://cdn3.iconfinder.com/data/icons/google-material-design-icons/48/ic_close_48px-512.png'}}
                        tintColor='white'
                        style={{width: 30, height: 30}}/>
                    </TouchableHighlight>
                </View>

                <View style={{flex: 1, justifyContent: 'space-between'}}>
                    <Animated.View style={{backgroundColor: ACCENT_DARK, borderRadius: 100, padding: 50, alignSelf: 'center', opacity: this.state.opacity, scaleX: this.state.scale, scaleY: this.state.scale}}>
                        <Image
                        source={{uri: 'https://cdn0.iconfinder.com/data/icons/finance-android-l-lollipop-icon-pack/24/wallet-512.png'}}
                        tintColor='white'
                        style={{width: 100, height: 100}}/>
                    </Animated.View>
                    
                    <Animated.View style={{elevation: 5, marginHorizontal: 20, padding: 20, borderRadius: 5, backgroundColor: 'white', marginBottom: 30, translateY: this.state.translateY, opacity: this.state.opacity}}>
                        <View style={{alignItems: 'center',}}>
                            <Text style={{fontWeight: "700", fontSize: 50, color: ACCENT_DARK}}>{String.fromCharCode(8377) + ' ' + this.state.amount}</Text>
                            <Text style={{fontSize: 15, textAlign: 'center', marginHorizontal: 30, marginTop: 5, color: 'black', opacity: 0.3,}}>added successfully to you MaalGaadi Wallet</Text>
                        </View>

                        <View
                        style={{
                            borderTopColor: 'rgba(0, 0, 0, 0.1)',
                            borderTopWidth: 1,
                            marginVertical: 20}}/>

                        <View style={{flexDirection: 'row', justifyContent: 'space-between'}}>
                            <Text style={{textAlign: 'left', color: 'black', opacity: 0.3}}>
                                TRANSACTION ID
                            </Text>
                            <Text style={{fontWeight: "700",}}>
                                {this.state.transId}
                            </Text>
                        </View>
                        <View style={{flexDirection: 'row', justifyContent: 'space-between', marginTop: 10}}>
                            <Text style={{textAlign: 'left', color: 'black', opacity: 0.3}}>
                                DATE
                            </Text>
                            <Text style={{fontWeight: "700"}}>
                                {this.state.date}
                            </Text>
                        </View>

                        <View style={{flexDirection: 'row', justifyContent: 'space-between', marginTop: 10,}}>
                            <Text style={{textAlign: 'left', color: 'black', opacity: 0.3}}>
                                WALLET BALANCE
                            </Text>
                            <Text style={{fontWeight: "700"}}>
                                {this.state.walBalance}
                            </Text>
                        </View>
                    </Animated.View>
                </View>

                <ActivityIndicator size="large" color='white'
                style={{alignSelf: 'center', scaleX: this.state.isLoading? 1 : 0, position: 'absolute', top: 0, bottom: 0, start: 0, end: 0}}/>
            </View>
        )
    }
}

const styles = StyleSheet.create({});

