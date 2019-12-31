import React, { Component } from 'react';
import {
  StyleSheet,
  View,
  ToastAndroid,
  NativeModules
} from 'react-native';
import { WebView } from 'react-native-webview'
import { BASE_URL, FIELDS, GET_CUSTOMER_BILLING_INFO, CCAVENUE, GET_RSA, TRANS_PARAMS } from './../utils/AppConstants';
import { encrypt } from '../utils/CCAvUtil';
import * as Constants from '../utils/AppConstants'

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

        this.NativeTest = NativeModules.NativeTest

        this.state = {
            webViewSource: {
                uri: '',
                method: '',
                body: ''
            }
        }
    }

    componentDidMount() {
        this.getBillingInfo()
    }

    getBillingInfo = async () => {
        console.log("Getting billing info...")

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
                ToastAndroid.show(value.message, ToastAndroid.SHORT);
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
                console.log("Getting RSA...")
                this.getRSA()
            }
            
        }).catch(err => {
            console.log(err)
            ToastAndroid.show(err, ToastAndroid.SHORT);
        })
    }

    getRSA = async () => {
        const reqURL = CCAVENUE + GET_RSA + '?' + 
                        TRANS_PARAMS.ORDER_ID + '=' + this.props.navigation.getParam(TRANS_PARAMS.ORDER_ID)

        const request = await fetch(reqURL, {
            method: 'GET',
        })

        const response = await request.text().then(value => {
            console.log("Got RSA: ", value)

            const amountParam = TRANS_PARAMS.AMOUNT + '=' + this.props.navigation.getParam(TRANS_PARAMS.AMOUNT) + '&'
            const currParam = TRANS_PARAMS.CURRENCY + '=' + TRANS_PARAMS.CURRENT_CURRENCY

            this.setupWebView(encrypt(amountParam + currParam, value))
        }).catch(err => {
            console.log(err)
            ToastAndroid.show(err, ToastAndroid.SHORT);
        })
    }

    setupWebView(encVal) {
        const postParams = this.toPostParams(encVal)
        this.setState(prevState => {
            prevState.webViewSource = {
                uri: Constants.PAYMENT_GATEWAY_URL,
                method: 'POST',
                body: postParams
            }   
            return prevState
        })
    }

    toPostParams(encVal) {
        let reqData = new URLSearchParams()
        reqData.append(Constants.TRANS_PARAMS.ACCESS_CODE, Constants.PAYMENT_GATEWAY_ACCESS_CODE)
        reqData.append(Constants.TRANS_PARAMS.MERCHANT_ID, Constants.MERCHANT_ID)
        reqData.append(Constants.TRANS_PARAMS.ORDER_ID, this.props.navigation.getParam(Constants.TRANS_PARAMS.ORDER_ID))
        reqData.append(Constants.TRANS_PARAMS.REDIRECT_URL, Constants.CURRENT_REDIRECT_URL)
        reqData.append(Constants.TRANS_PARAMS.CANCEL_URL, Constants.CURRENT_CANCEL_URL)
        reqData.append(Constants.TRANS_PARAMS.ENC_VAL, encodeURIComponent(encVal))
        reqData.append(Constants.TRANS_PARAMS.BILLING_NAME, this.custName.replace(' ', ''))
        reqData.append(Constants.TRANS_PARAMS.BILLING_ZIP, this.zipCode)
        reqData.append(Constants.TRANS_PARAMS.BILLING_ADDRESS, this.custAddress)
        reqData.append(Constants.TRANS_PARAMS.BILLING_TEL, this.custNum)
        reqData.append(Constants.TRANS_PARAMS.BILLING_EMAIL, this.custEmail)
        reqData.append(Constants.TRANS_PARAMS.BILLING_CITY, this.city)
        reqData.append(Constants.TRANS_PARAMS.BILLING_STATE, this.state)
        reqData.append(Constants.TRANS_PARAMS.BILLING_COUNTRY, "India")
        
        console.log(reqData.toString())
        return reqData.toString()
    }

    processResponse(data) {
        return;
    }

    render() {
        return(
            <WebView javaScriptEnabled={true} ref={webV => (this.webView = webV)} source={this.state.webViewSource}
            onLoadEnd={syntheticEvent => {
                const url = syntheticEvent.nativeEvent.url
                console.log(url)
                
                if(url.includes("successPaymentResponseFromCCAPI")
                || url.includes("cancelPaymentResponseFromCCAPI")) {
                    const getData = `
                    window.ReactNativeWebView.postMessage('' + document.getElementsByTagName('html')[0].innerHTML);
                    true;
                    `
                    this.webView.injectJavaScript(getData)
                }
            }}
            onMessage={(event) => {
                const data = event.nativeEvent.data
                console.log(data);
                data = JSON.parse(data)
                this.processResponse(data)
            }}/>
        )
    }
}

const styles = StyleSheet.create({});

