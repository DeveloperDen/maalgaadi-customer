import React, { Component } from 'react';
import {
  StyleSheet,
  View,
  Text,
  TouchableHighlight, 
  Image,
  ToastAndroid,
  TextInput
} from 'react-native';
import { getItem,  CUSTOMER_ID} from '../utils/DataStorageController'
import { TRANS_PARAMS, FIELDS } from './../utils/AppConstants';

const rupee = require('../../assets/rupee_outline.png')

const ACCENT = '#FFCB28' // 255, 203, 40
const ACCENT_DARK = '#F1B800'
const GREEN = '#24C800' // 36, 200, 0
const BLUE = '#004599' // 0, 69, 153
const BLUE_LIGHT = '#D6E9FF' 

export default class AddMoney extends Component {
    static navigationOptions = ({navigation}) => {
        return{
            headerTitle: 'Add Money',
        }
    }

    constructor(props) {
        super(props)
        this.state = {
            curBalance: props.navigation.getParam('balance', 0),
            isActiveInput: false,
            amount: ''
        }

        this.orderID = null
        this.custID = null
    }

    componentDidMount() {
        this.generateOrderID()
    }

    async generateOrderID() {
        const custID = await getItem(CUSTOMER_ID)
        const timeStamp = new Date()
        timeStamp = timeStamp.valueOf()

        this.orderID = custID + timeStamp
        this.custID = custID
    }

    initTrans() {
        this.props.navigation.navigate("PaymentWebview", {
            [TRANS_PARAMS.ORDER_ID]: this.orderID,
            [TRANS_PARAMS.AMOUNT]: this.state.amount,
            [TRANS_PARAMS.PAY_NOW]: false,
            [FIELDS.CUSTOMER_ID]: this.custID,
        })
    }

    render() {
        return(
            <View style={{flex: 1}}>
                {/* Header showing balance */}
                <View
                style={{
                    flexDirection: 'row', backgroundColor: BLUE_LIGHT, justifyContent: 'space-between',
                    paddingVertical: 20, alignItems: 'center', padding: 15
                }}>
                    <View style={{
                        justifyContent: 'center', alignItems: 'center', flexDirection: 'row',
                    }}>
                        <Image
                        source={{uri: 'https://cdn0.iconfinder.com/data/icons/finance-android-l-lollipop-icon-pack/24/wallet-512.png'}}
                        tintColor={BLUE}
                        style={{width: 30, height: 30}}/>

                        <Text style={{fontSize: 18, color: BLUE, marginStart: 15}}>Wallet Balance</Text>
                    </View>

                    <Text style={{fontSize: 20, fontWeight: '700', color: BLUE}}>
                        {String.fromCharCode(8377) + ' ' + this.state.curBalance}
                    </Text>
                </View>
            
                <View
                style={{
                    flexDirection: 'row', alignItems: 'center',
                    alignSelf: 'center', marginTop: 50,
                    borderBottomColor: this.state.isActiveInput? ACCENT : 'rgba(0, 0, 0, 0.3)',
                    borderBottomWidth: 2, paddingHorizontal: 5, width: '70%'
                }}>
                    <Image source={rupee}
                    style={{width: 30, height: 30, marginEnd: 15,}}
                    tintColor={this.state.isActiveInput? ACCENT : 'rgba(0, 0, 0, 0.3)'}/>

                    <TextInput
                    keyboardType="number-pad"
                    
                    onChangeText={(text) => {
                        this.setState(prevState => {
                            prevState.amount = text
                            return prevState
                        })
                    }}

                    onFocus={() => {
                        this.setState(prevState => {
                            prevState.isActiveInput = true
                            return prevState
                        })
                    }}

                    onBlur={() => {
                        this.setState(prevState => {
                            prevState.isActiveInput = false
                            return prevState
                        })
                    }}
                    placeholder="Amount" multiline={false} placeholderTextColor='rgba(0, 0, 0, 0.3)'
                    style={{fontSize: 25, flex: 1}}/>
                </View>
                
                {/* Add Money button */}
                <TouchableHighlight
                underlayColor={ACCENT_DARK}
                onPress={() => {
                    if(this.state.amount.length > 0)
                        this.initTrans()
                    else
                        ToastAndroid.show('Please enter amount', ToastAndroid.SHORT)
                }}
                style={{
                    backgroundColor: this.state.amount.length > 0? ACCENT : '#C9C9C9',
                    position: 'absolute', alignSelf: 'center', bottom: 0, width: '100%', alignItems: 'center',
                    justifyContent: 'center', elevation: 5, paddingVertical: 20
                }}>
                    <Text style={{color: 'white', fontSize: 15}}>ADD MONEY</Text>
                </TouchableHighlight>
            </View>
        )
    }
}

const styles = StyleSheet.create({});

