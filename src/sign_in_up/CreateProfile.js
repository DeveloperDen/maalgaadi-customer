import React, { Component } from 'react';
import {
  StyleSheet,
  View,
  Image,
  TouchableHighlight,
  Text,
  Picker,
  Linking,
  ToastAndroid
} from 'react-native';
import { ScrollView, TextInput, TouchableOpacity } from 'react-native-gesture-handler';

const Constants = require('../utils/AppConstants')

const ACCENT = '#FFCB28' // 255, 203, 40
const ACCENT_DARK = '#F1B800' 

export default class CreateProfile extends Component {
    static navigationOptions = ({navigation}) => {
        return{
            headerTitle: 'Create Profile',
        }
    }

    constructor(props) {
        super(props)

        this.tripFreqArray = [
            "Select Trip Frequency",
            "5 Trips a Month",
            "30 Trips a Month",
            "60 Trips a Month",
            "More than 60 Trips"
        ]

        this.state = {
            tripFreq: 0,
        }
    }

    setGoodsType = (goods) => {
        this.props.navigation.setParams({goodsType: goods})
    }

    render() {
        return(
            <View style={{flex: 1, backgroundColor: 'white'}}>
                <View
                style={{
                    backgroundColor: 'rgba(0, 0, 0, 0.04)', padding: 20, overflow: 'visible',
                    position: 'absolute', width: '100%', top: 0
                }}>
                    <Image source={{uri: 'https://cdn3.iconfinder.com/data/icons/google-material-design-icons/48/ic_account_circle_48px-512.png'}}
                    style={{width: 100, height: 100, opacity: 0.5, alignSelf: 'center', }}/>
                </View>
                
                <ScrollView>
                    <View style={{marginTop: 140, backgroundColor: 'white', paddingHorizontal: 20, paddingTop: 30}}>
                        <TextInput placeholder='NAME'
                        style={styles.inputs}/>
                        <TextInput placeholder='MOBILE' keyboardType='decimal-pad' maxLength={10}
                        style={styles.inputs}/>

                        <View
                        style={[styles.inputs, {flexDirection: 'row', alignItems: 'center',}]}>

                            <TextInput placeholder='EMAIL' keyboardType='email-address' textContentType='emailAddress'
                            style={{flex: 1}}/>

                            <TouchableOpacity
                            onPress={() => {
                                this.setState(prevState => {
                                    ToastAndroid.show("Invoices and proof of deliveries will be sent on this Email Id.",
                                    ToastAndroid.LONG)
                                })
                            }}>
                                <Image source={{uri:'https://cdn3.iconfinder.com/data/icons/google-material-design-icons/48/ic_error_48px-512.png'}}
                                style={{width: 20, height: 20, opacity: 0.5}}/>
                            </TouchableOpacity>
                            
                        </View>

                        <View
                        style={[styles.inputs, {flexDirection: 'row', alignItems: 'center',}]}>

                            <TextInput placeholder='ORGANIZATION'
                            style={{flex: 1}}/>

                            <TouchableOpacity
                            onPress={() => {
                                this.setState(prevState => {
                                    ToastAndroid.show("Organization Name will be printed on Invoices",
                                    ToastAndroid.LONG)
                                })
                            }}>
                                <Image source={{uri:'https://cdn3.iconfinder.com/data/icons/google-material-design-icons/48/ic_error_48px-512.png'}}
                                style={{width: 20, height: 20, opacity: 0.5}}/>
                            </TouchableOpacity>
                            
                        </View>
                        
                        <TextInput placeholder='CITY' editable={false}
                        style={styles.inputs}/>
                        <TextInput placeholder='ADDRESS' textContentType='fullStreetAddress'
                        style={styles.inputs}/>

                        <View
                        style={{
                            borderBottomColor: 'rgba(0, 0, 0, 0.2)', borderBottomWidth: 2,
                            borderRadius: 3,
                            marginBottom: 25,
                        }}>
                            <TouchableHighlight
                            underlayColor='white'
                            onPress={() => {
                                this.props.navigation.navigate('SelectGoods', {setGoodsType: this.setGoodsType.bind(this)})
                            }}
                            style={{
                                padding: 10
                            }}>
                                <View
                                style={{
                                    flexDirection: 'row', alignItems: 'center',
                                    justifyContent: 'space-between'
                                }}>
                                    <Text style={{fontSize: 15}}>TYPE OF GOODS</Text>
                                    <Image source={{uri: 'https://cdn2.iconfinder.com/data/icons/ios-7-icons/50/forward-512.png'}}
                                    style={{width: 15, height: 15}}/>
                                </View>
                                
                            </TouchableHighlight>
                            <Text
                            style={{
                                paddingHorizontal: 20,
                                paddingBottom: 10,
                                fontSize: 15,
                                opacity: 0.4
                            }}>
                                {this.props.navigation.getParam('goodsType', 'Electrical/Electronics')}
                            </Text>
                        </View>
                    
                        <View
                        style={{
                            borderBottomColor: 'rgba(0, 0, 0, 0.2)', borderBottomWidth: 2,
                            borderRadius: 3,
                            marginBottom: 10, paddingHorizontal: 10
                        }}>
                            <Text style={{fontSize: 15}}>TRIP FREQUENCY</Text>
                            <Picker
                            selectedValue={this.state.tripFreq}
                            style={{height: 50, width: '100%'}}
                            onValueChange={(itemValue, itemIndex) =>
                                this.setState(prevState => {
                                    prevState.tripFreq = itemValue
                                    return prevState
                                })
                            }>
                                {this.tripFreqArray.map((value, index) => {
                                    return(
                                        <Picker.Item label={value} value={index} key={index}/>
                                    )
                                })}
                                
                            </Picker>
                        </View>
                    
                        <View style={{alignItems: 'center', marginVertical: 30}}>
                            <Text style={{fontSize: 13}}>By clicking Create Profile, you agree to our </Text>
                            <TouchableHighlight underlayColor='white'
                            onPress={() => {
                                Linking.openURL(Constants.TERMSANDCONDITION)
                                .catch((err) => console.log(err));
                            }}>
                                <Text style={{color: ACCENT_DARK, textDecorationLine:"underline", fontSize: 13}}>
                                    Terms and Conditions
                                </Text>
                            </TouchableHighlight>
                        </View>
                    </View>
                </ScrollView>

                <TouchableHighlight
                underlayColor={ACCENT_DARK}
                onPress={() => {
                    ToastAndroid.show("Profile has been created", ToastAndroid.SHORT)
                }}
                style={{
                    backgroundColor: ACCENT,
                    paddingVertical: 15,
                    justifyContent: 'center',
                    alignItems: 'center',
                    elevation: 10
                }}>
                    <Text style={{fontSize: 18, fontWeight: '700', color: 'white'}}>Create Profile</Text>
                </TouchableHighlight>
            </View>
        )
    }
}

const styles = StyleSheet.create({
    inputs: {
        borderBottomColor: 'rgba(0, 0, 0, 0.2)', borderBottomWidth: 2,
        marginBottom: 15
    }
});

