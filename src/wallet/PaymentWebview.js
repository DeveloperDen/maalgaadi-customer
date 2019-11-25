import React, { Component } from 'react';
import {
  StyleSheet,
  View,
} from 'react-native';
import { WebView } from 'react-native-webview'
import { BASE_URL, FIELDS, GET_CUSTOMER_BILLING_INFO, CCAVENUE, GET_RSA, TRANS_PARAMS } from './../utils/AppConstants';


const ACCENT = '#FFCB28' // 255, 203, 40
const ACCENT_DARK = '#F1B800' 

export default class Notifications extends Component {
    static navigationOptions = ({navigation}) => {
        return{
            headerStyle: {display: 'none'}
        }
    }

    constructor(props) {
        super(props)
        this.state = {}
    }

    componentDidMount() {
        this.getBillingInfo()
    }

    getBillingInfo = async () => {
        const id = this.props.navigation.getParam(FIELDS.CUSTOMER_ID)

        const reqURL = BASE_URL + GET_CUSTOMER_BILLING_INFO + '?' + 
                        FIELDS.CUSTOMER_ID + '=' + id

        const request = await fetch(reqURL, {
            method: 'GET',
            headers: {
                key: "21db33e221e41d37e27094153b8a8a02"
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
            }
            
        }).catch(err => {
            console.log(err)
            ToastAndroid.show(err, ToastAndroid.SHORT);
        })

        this.renderView()
    }

    renderView = async () => {
        await this.getRSA()
    }

    getRSA = async () => {
        const reqURL = CCAVENUE + GET_RSA + '?' + 
                        TRANS_PARAMS.ORDER_ID + '=' + this.props.navigation.getParam(TRANS_PARAMS.ORDER_ID)

        const request = await fetch(reqURL, {
            method: 'GET',
        })

        const response = await request.json().then(value => {
            console.log(value)
            const amountParam = TRANS_PARAMS.AMOUNT + '=' + this.props.navigation.getParam(TRANS_PARAMS.AMOUNT) + '&'
            const currParam = TRANS_PARAMS.CURRENCY + '=' + TRANS_PARAMS.CURRENT_CURRENCY

            this.rsaUtilEncrypt(amountParam + currParam, value)
        }).catch(err => {
            console.log(err)
            ToastAndroid.show(err, ToastAndroid.SHORT);
        })
    }

    rsaUtilEncrypt() {
        return;
    }

    render() {
        return(
            <View style={{flex: 1}}>
                
            </View>
        )
    }
}

const styles = StyleSheet.create({

});

