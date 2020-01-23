import React, { Component } from 'react';
import {
  StyleSheet,
  View,
  Image,
  Text,
  ScrollView,
  TouchableHighlight,
  ToastAndroid
} from 'react-native';

const ACCENT = '#FFCB28' // 255, 203, 40
const ACCENT_DARK = '#F1B800'
const ORG = "Organization"
const EMAIL = "Email"
const ADDRESS = "Address"
const GOODS = "Goods"
const TRIP_FREQ = "Trip Frequency"
const DataController = require('./utils/DataStorageController')
const Constants = require('./utils/AppConstants')

export default class Profile extends Component {
    static navigationOptions = ({navigation}) => {
        return{
            headerTitle: 'Profile',
            headerRight: 
            <TouchableHighlight
            onPress={() => {
                navigation.navigate("CreateProfile")
            }}
            underlayColor='white'>
                <Image
                source={Constants.ICONS.edit}
                tintColor='black'
                style={{width: 24, height: 24, marginEnd: 16}}/>
            </TouchableHighlight>
        }
    }

    constructor(props) {
        super(props)
        this.state = {
            name: '',
            number: '',
            data: [
                [Constants.ICONS.email,
                EMAIL, EMAIL],
                [Constants.ICONS.work,
                ORG, ORG],
                [Constants.ICONS.home,
                ADDRESS, ADDRESS],
                [Constants.ICONS.goods,
                GOODS, GOODS],
                [Constants.ICONS.shipping,
                TRIP_FREQ, TRIP_FREQ]
            ]
        }
    }

    componentDidMount() {
        const toGet = new Array()
        toGet.push(DataController.CUSTOMER_NAME,
            DataController.CUSTOMER_MOBILE, DataController.EMAIL, DataController.ORG,
            DataController.ADDRESS, DataController.GOODS_NAME, DataController.TRIP_FREQ)

            DataController.getItems(toGet)
            .then(res => {
                console.log(res)
                this.setState(prevState => {
                    prevState.name = res[0][1]
                    prevState.number = res[1][1]
                    prevState.data[0][2] = res[2][1]
                    prevState.data[1][2] = res[3][1]
                    prevState.data[2][2] = res[4][1]
                    prevState.data[3][2] = res[5][1]
                    prevState.data[4][2] = res[6][1]

                    return(prevState)
                })
            })
            .catch(err => {
                console.log(err)
                ToastAndroid.show(Constants.ERROR_GET_DETAILS, ToastAndroid.SHORT);
            })
    }

    render() {
        return(
            <View style={{flex: 1}}>
                <View
                style={{
                    backgroundColor: ACCENT, padding: 20, overflow: 'visible', alignItems: 'center'
                }}>
                    <Image source={Constants.ICONS.driver_search}
                    style={{width: 80, height: 80, opacity: 0.8, alignSelf: 'center', tintColor: 'white'}}/>
                    <Text style={{fontSize: 18, fontWeight: '700', color: 'white', marginTop: 15}}>{this.state.name}</Text>
                    <Text style={{fontSize: 13, color: 'white'}}>{"(+91 " + this.state.number + ")"}</Text>
                </View>

                <ScrollView style={{flex: 1, marginTop: 30}}>
                    {
                        this.state.data.map((value, index) => {
                            return(
                                <View key={index} style={{
                                    flexDirection: 'row', alignItems: 'center', marginBottom: 25,
                                    marginHorizontal: 15
                                }}>
                                    <Image source={value[0]} style={{width: 25, height: 25, opacity: 0.3}}/>
                                    <View style={{
                                    borderBottomColor: 'rgba(0, 0, 0, 0.3)', borderBottomWidth: 2, flex: 1,
                                    paddingStart: 5, marginStart: 20
                                }}>
                                        <Text style={{fontSize: 13, opacity: 0.3}}>{value[1]}</Text>
                                        <Text style={{fontSize: 16, marginTop: 10}}>{value[2]}</Text>
                                    </View>
                                </View>
                            )
                            
                        })
                    }
                </ScrollView>
            </View>
        )
    }
}

const styles = StyleSheet.create({

});