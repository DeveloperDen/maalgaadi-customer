import React, { Component } from 'react';
import {
  StyleSheet,
  View,
  Text,
  TouchableHighlight, 
  Image,
} from 'react-native';
import { ScrollView } from 'react-native-gesture-handler';


const ACCENT = '#FFCB28' // 255, 203, 40
const ACCENT_DARK = '#F1B800'
const GREEN = '#24C800' // 36, 200, 0
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
            underlayColor='white'
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
            curBalance: 100,

            history: [
                {
                    id: '189450',
                    time: new Date(),
                    type: 'Trip',
                    title: 'Trip Charge',
                    payment: 170,
                    bill: 170,
                    balance: 100
                },

                {
                    id: '18958',
                    time: new Date(),
                    type: 'Cancellation',
                    title: 'Trip Charge',
                    payment: 75,
                    bill: 75,
                    balance: 100
                },

                {
                    id: '18952',
                    time: new Date(),
                    type: 'Payment',
                    title: 'Amount recieved online - 132944569830685',
                    payment: 50,
                    bill: 0,
                    balance: 150
                },

                {
                    id: '18965',
                    time: new Date(),
                    type: 'Payment',
                    title: 'Trip Charge',
                    payment: 260,
                    bill: 260,
                    balance: 100
                },

                {
                    id: '18987',
                    time: new Date(),
                    type: 'Trip',
                    title: 'Trip Charge',
                    payment: 160,
                    bill: 160,
                    balance: 100
                }
            ]
        }
    }

    render() {
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
                style={{display: this.state.history.length > 0? 'flex' : 'none'}}>
                    {this.state.history.map((value, index) => {
                        return(
                            <View key={index} style={{marginTop: 15}}>
                                <View style={{flexDirection:'row', justifyContent: 'space-between', marginHorizontal: 10}}>
                                    <Text style={{fontSize: 13, opacity: 0.4}}>{value.id}</Text>
                                    <Text style={{fontSize: 13, opacity: 0.4}}>
                                    {value.time.toUTCString().split(' ').slice(1, 5).join(' ')}
                                    </Text>
                                    <Text style={{
                                        backgroundColor: value.type === 'Trip'? GREEN :
                                        value.type === 'Cancellation'? 'red' : BLUE,
                                        paddingVertical: 3, paddingHorizontal: 20, 
                                        borderRadius: 2, color: 'white', fontSize: 12
                                    }}>
                                    {value.type}
                                    </Text>
                                </View>
                                
                                <Text style={{fontSize: 18, fontWeight: '700', marginHorizontal: 10, marginTop: 3}}>
                                    {value.title}
                                </Text>
                                
                                <View style={{
                                    flexDirection:'row', justifyContent: 'space-between', marginHorizontal: 10,
                                    marginTop: 5
                                }}>
                                    <Text style={{fontSize: 15}}>
                                        Payment: { String.fromCharCode(8377)  + value.payment}
                                    </Text>
                                    <Text style={{fontSize: 15}}>
                                        Bill: { String.fromCharCode(8377) + value.bill}
                                    </Text>
                                    <Text style={{fontSize: 15}}>
                                        Balance: { String.fromCharCode(8377) + value.balance}
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

                <TouchableHighlight
                underlayColor='black'
                onPress={() => {
                    this.props.navigation.navigate("TransactionHistory", {balance: this.state.curBalance})
                }}
                style={{
                    position: 'absolute', alignSelf: 'center', bottom: 40, borderRadius: 100,
                    opacity: this.state.history.length > 0? 1 : 0
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
            
                <View style={{flex: 1, textAlign: "center",
                alignContent: 'center', justifyContent: 'center',
                opacity: 0.3, marginHorizontal: 20, display: this.state.history.length > 0? 'none' : 'flex'}}>
                    <Text style={{textAlign: "center", fontSize: 20,}}>
                        Looks like you have not booked any MaalGaadi yet. Make your first booking today!
                    </Text>
                </View>
            </View>
        )
    }
}

const styles = StyleSheet.create({

});

