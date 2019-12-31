import React, { Component } from 'react';
import {
  StyleSheet,
  View,
  Text,
  Image,
  Modal,
  TouchableOpacity,
  TouchableHighlight
} from 'react-native';
import {ScrollView, TextInput} from 'react-native-gesture-handler';

const Constants = require('../utils/AppConstants')
const DataController = require('../utils/DataStorageController')

const ACCENT = '#FFCB28' // 255, 203, 40 

export default class GoodsList extends Component {
    constructor(props) {
        super(props)
        this.state = {
            modalVisible: false,
            othersIndex: 0,
            otherGoods: '',
            goodsList: [],
            waitText: 'Getting Goods Type...'
        }
        
    }

    static navigationOptions = ({navigation}) => {
        return{
            headerTitle: 'Goods List',
        }
    }

    setModalVisible = (visible, index) => {
        this.setState(prevState => {
            prevState.modalVisible = visible
            prevState.othersIndex = index
            return prevState
        })
    }

    async componentDidMount() {
        await this.getGoodsList()
    }

    getGoodsList = async () => {
        const customerId = await DataController.getItem(DataController.CUSTOMER_ID);

        const reqURL = Constants.BASE_URL + Constants.GET_TYPES_OF_GOODS + '?' + 
                        Constants.FIELDS.CUSTOMER_ID + '=' + customerId + '&' +
                        Constants.FIELDS.VEHICLE_ID + '=' + ''
        
        console.log("Request: ", reqURL)

        const request = await fetch(reqURL, {
            method: 'GET',
            headers: {
                key: Constants.KEY
            }
        })

        const response = await request.json().then(value => {
            console.log(value)

            if(!value.success){
                this.setState(prevState => {
                    prevState.waitText = value.message
                    return prevState
                })
            }
            else {
                this.setState(prevState => {
                    prevState.goodsList = value.data
                    return prevState
                })
            }
            
        }).catch(err => {
            console.log(err)
            ToastAndroid.show(Constants.ERROR_GET_GOODS, ToastAndroid.SHORT);
        }) 
    }

    render() {
        return(
            <View style={{flex: 1}}>
                {(this.state.goodsList.length !== 0)?
                    <ScrollView>
                        {this.state.goodsList.map((goods, index) => {
                            return(
                                <View key={index}>
                                    <TouchableOpacity
                                    onPress={() => {
                                        if(this.state.goodsList[index].goods_name !== 'Others' &&
                                        this.state.goodsList[index].goods_name !== 'others') {
                                            this.props.navigation.state.params.setGoodsType(this.state.goodsList[index])
                                            this.props.navigation.goBack()
                                        }
                                        else this.setModalVisible(true, index)
                                    }}
                                    style={{flexDirection: 'row', alignItems: 'center', paddingVertical: 10}}>
                                        <Text style={{marginStart: 20, marginVertical: 10, fontSize: 15}}>
                                            {goods.goods_name}
                                        </Text>
                                    </TouchableOpacity>
                                    <View 
                                        style={{
                                        borderTopColor:'rgba(0, 0, 0, 0.1)',
                                        borderTopWidth: 1}}/>
                                </View> 
                            )
                        })}
                    </ScrollView>
                    :
                    <View style={{justifyContent: 'center', alignItems: 'center', flex: 1}}>
                        <Text style={{fontSize: 20, opacity: 0.3}}>{this.state.waitText}</Text>
                    </View>   
                }
                

                {/* Dialog box for other goods. */}
                <Modal
                    animationType="fade"
                    transparent={true}
                    visible={this.state.modalVisible}
                    onRequestClose={() => {
                    this.setModalVisible(false, 0)
                    }}>
                        <View
                        style={{
                        backgroundColor: 'rgba(0, 0, 0, 0.7)',
                        height: '100%',
                        alignItems: "center",
                        justifyContent: 'center'
                        }}>
                            <View style={{
                            borderRadius: 5, backgroundColor: 'white', overflow: 'hidden',
                            width: '75%'
                            }}>
                                <View style={{
                                flexDirection: 'row', justifyContent: 'space-between', elevation: 2,
                                backgroundColor: 'white'
                                }}>
                                    <Text style={{margin: 20, fontWeight: '700', fontSize: 15}}> Others </Text>
                                    <TouchableOpacity
                                    onPress={() => {
                                        this.setModalVisible(false, 0)
                                    }}>
                                        <Image source={{uri: 'https://cdn3.iconfinder.com/data/icons/virtual-notebook/16/button_close-512.png'}}
                                        style={{width: 15, height: 15, margin: 20}}/>
                                    </TouchableOpacity>
                                </View>

                                <TextInput
                                onChangeText={(text) => {
                                    this.setState(prevState => {
                                        prevState.otherGoods = text
                                        return prevState
                                    })
                                }}
                                placeholder='Please provide the details of goods'
                                multiline={false}
                                numberOfLines={1}
                                style={{marginVertical: 20, marginHorizontal: 10}}/>

                                <TouchableHighlight
                                underlayColor='rgba(255, 203, 40, 0.8)'
                                onPress={() => {
                                    if(this.state.otherGoods != '') {
                                        this.state.goodsList[this.state.othersIndex].goods_name = this.state.otherGoods
                                        this.props.navigation.state.params.setGoodsType(this.state.goodsList[this.state.othersIndex]    )
                                        this.props.navigation.goBack()
                                    }  
                                }}
                                style={{
                                    paddingVertical: 15, alignItems: 'center', justifyContent: 'center',
                                    backgroundColor: ACCENT
                                }}>
                                    <Text style={{color: 'white'}}>OK</Text>
                                </TouchableHighlight>
                            </View>
                        </View>
                </Modal>
            </View>
        )
    }
}

const styles = StyleSheet.create({
});