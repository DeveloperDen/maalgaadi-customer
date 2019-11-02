import React, { Component } from 'react';
import {
  StyleSheet,
  View,
  Image,
  Text,
  ScrollView,
  TouchableHighlight
} from 'react-native';

const ACCENT = '#FFCB28' // 255, 203, 40
const ACCENT_DARK = '#F1B800'
const ORG = "Organization"
const EMAIL = "Email"
const ADDRESS = "Address"
const GOODS = "Goods"
const TRIP_FREQ = "Trip Frequency"
const DataController = require('./utils/DataStorageController')

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
                source={{uri: 'https://cdn3.iconfinder.com/data/icons/google-material-design-icons/48/ic_mode_edit_48px-512.png'}}
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
                [{uri: 'https://cdn3.iconfinder.com/data/icons/google-material-design-icons/48/ic_markunread_48px-512.png'},
                EMAIL, EMAIL],
                [{uri: 'https://cdn3.iconfinder.com/data/icons/google-material-design-icons/48/ic_work_48px-512.png'},
                ORG, ORG],
                [{uri: 'https://cdn3.iconfinder.com/data/icons/google-material-design-icons/48/ic_home_48px-512.png'},
                ADDRESS, ADDRESS],
                [{uri: 'https://cdn3.iconfinder.com/data/icons/google-material-design-icons/48/ic_now_widgets_48px-512.png'},
                GOODS, GOODS],
                [{uri: 'https://cdn3.iconfinder.com/data/icons/google-material-design-icons/48/ic_local_shipping_48px-512.png'},
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
    }

    render() {
        return(
            <View style={{flex: 1}}>
                <View
                style={{
                    backgroundColor: ACCENT, padding: 20, overflow: 'visible', alignItems: 'center'
                }}>
                    <Image source={{uri: 'https://cdn3.iconfinder.com/data/icons/google-material-design-icons/48/ic_account_circle_48px-512.png'}}
                    style={{width: 80, height: 80, opacity: 0.8, alignSelf: 'center', }}
                    tintColor='white'/>
                    <Text style={{fontSize: 18, fontWeight: '700', color: 'white', marginTop: 15}}>{this.state.name}</Text>
                    <Text style={{fontSize: 13, color: 'white'}}>{"(+91 " + this.state.number + ")"}</Text>
                </View>

                <ScrollView style={{flex: 1, marginTop: 30}}>
                    {
                        this.state.data.map((value, index) => {
                            return(
                                <View key={index} style={{
                                    flexDirection: 'row', alignItems: 'center', marginBottom: 20,
                                    marginHorizontal: 15
                                }}>
                                    <Image source={value[0]} style={{width: 25, height: 25, opacity: 0.3}}/>
                                    <View style={{
                                    borderBottomColor: 'rgba(0, 0, 0, 0.3)', borderBottomWidth: 2, flex: 1,
                                    paddingStart: 5, marginStart: 20
                                }}>
                                        <Text style={{fontSize: 13, opacity: 0.3}}>{value[1]}</Text>
                                        <Text style={{fontSize: 16, marginTop: 5}}>{value[2]}</Text>
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

