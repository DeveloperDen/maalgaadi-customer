import React, { Component } from 'react';
import {
  StyleSheet,
  View,
  NativeModules,
  Text, ActivityIndicator,
  StatusBar,
  Platform
} from 'react-native';
import { StackActions } from 'react-navigation';
import { BASE_URL, FIELDS, GET_CUSTOMER_BILLING_INFO, CCAVENUE, GET_RSA, TRANS_PARAMS } from './../utils/AppConstants';
import * as Constants from '../utils/AppConstants'
import ToastComp from '../utils/ToastComp';

const ACCENT = '#FFCB28' // 255, 203, 40
const ACCENT_DARK = '#F1B800' 

export default class PaymentWebview extends Component {
    static navigationOptions = ({navigation}) => {
        return{
            headerStyle: {display: 'none'}
        }
    }

    constructor(props) {
        super(props)

        this.NativePaymentView = NativeModules.NativePaymentView

        this.state = {
            message: 'Initializing payment...'
        }
    }

    componentDidMount() {
        this.getBillingInfo()
    }

    showToast(message) {
        this.toast.show(message);
    }

    getBillingInfo = async () => {
        console.log("Getting billing info...", this.props.navigation.getParam(FIELDS.CUSTOMER_ID))
        this.setState(prevState => {
            prevState.message = "Getting billing info..."
            return prevState
        })

        const id = this.props.navigation.getParam(FIELDS.CUSTOMER_ID)

        const reqURL = BASE_URL + GET_CUSTOMER_BILLING_INFO + '?' + 
                        FIELDS.CUSTOMER_ID + '=' + id

        const request = await fetch(reqURL, {
            method: 'GET',
            headers: {
                key: Constants.KEY
            }
        })

        const response = await request.json().then(value => {
            console.log(value)

            if(!value.success){
                this.showToast(value.message);
            }
            else {
                this.custNum = value.data.cust_number
                this.custName = value.data.cust_name
                this.custEmail = value.data.cust_email
                this.custAddress = value.data.cust_address
                this.zipCode = value.data.zip_code
                this.city = value.data.city
                this.state = value.data.state

                console.log("Got billing info.")
                this.setState(prevState => {
                    prevState.message = "Got billing info."
                    return prevState
                })
                console.log("Getting RSA...")
                this.getRSA()
            }
            
        }).catch(err => {
            console.log(err)
            this.showToast(err);
        })
    }

    getRSA = async () => {
        this.setState(prevState => {
            prevState.message = "Getting RSA..."
            return prevState
        })
        const reqURL = CCAVENUE + GET_RSA + '?' + 
                        TRANS_PARAMS.ORDER_ID + '=' + this.props.navigation.getParam(TRANS_PARAMS.ORDER_ID)

        const request = await fetch(reqURL, {
            method: 'GET',
        })

        await request.text().then(value => {
            console.log("Got RSA: ", value)
            this.setState(prevState => {
                prevState.message = 'Got RSA, now rendering WebView...';
                return prevState
            })
            const params = {
                rsa : value,
                orderId: this.props.navigation.getParam(Constants.TRANS_PARAMS.ORDER_ID),
                custName: this.custName,
                custNum: this.custNum,
                custEmail: this.custEmail,
                custAddress: this.custAddress,
                zipCode: this.zipCode,
                city: this.city,
                state: this.state,
                amount: this.props.navigation.getParam(TRANS_PARAMS.AMOUNT),
                amountCurrParam: TRANS_PARAMS.AMOUNT + '=' + this.props.navigation.getParam(TRANS_PARAMS.AMOUNT) + '&' + TRANS_PARAMS.CURRENCY + '=' + TRANS_PARAMS.CURRENT_CURRENCY,
                redirectURL: Constants.CURRENT_REDIRECT_URL,
                cancelURL: Constants.CURRENT_CANCEL_URL,
                booking_id: this.props.navigation.getParam(Constants.TRANS_PARAMS.BOOKING_ID)
            }

            // Before navigating to Payment Webview, navigate back to Add Money, which can further go back to Home Screen
            this.props.navigation.state.params.onGoBack();
            this.props.navigation.dispatch(StackActions.popToTop());
            this.NativePaymentView.navigateToPaymentScreen(Platform.OS == "ios"? params : JSON.stringify(params))
        }).catch(err => {
            console.log(err)
            this.showToast(err);
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
                    style={{backgroundColor: 'white', width: '80%',
                    paddingTop: 20, borderRadius: 3,
                    elevation: 10, overflow: 'hidden'}}>
                        <ActivityIndicator size="large" color={ACCENT} style={{alignSelf: 'center', marginTop: 15}}/>
                        <Text style={{
                            textAlign: 'center', alignSelf: 'center', marginVertical: 15,
                            opacity: 0.3, marginHorizontal: 15,
                        }}>
                            {this.state.message}
                        </Text>
                    </View>
                </View>
            
                <ToastComp ref={t => this.toast = t}/>
            </View>
        );
    }
}

const styles = StyleSheet.create({});

