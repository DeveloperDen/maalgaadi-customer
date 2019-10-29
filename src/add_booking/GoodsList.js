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

const vehicleIcon = require('../../assets/vehicle.png')

const ACCENT = '#FFCB28' // 255, 203, 40 

export default class GoodsList extends Component {
    constructor(props) {
        super(props)
        this.state = {
            modalVisible: false,
            otherGoods: ''
        }
        this.goodsList = [
            'Electrical/Electronics', 'Timber/Plywood', 'Medical', 'Furniture', 'Utensils(Bartan)',
            'House Shifting', 'Boxes', 'Pipes/Tent Poles', 'Paper/Packaging', 'Batteries/Heavy Boxes', 
            'Cable Rools (Round)', 'Barbed/Steel Wires', 'Machines/Equipments/Spare Parts',
            'Powder', 'Tiles', 'FMCG', 'Ceramics', 'Chemicals/Paint', 'Logistivs/Movers & Packers', 
            'Perishable Food Items', 'Event Management', 'Plastic/Tubber Packing Material',
            'Construction', 'Catering/Restaurant', 'Textile/Garments', 'Others', 
            'Boxes (max. size 30x20x30 cm or under 10 kg)'
          ]
    }

    static navigationOptions = ({navigation}) => {
        return{
            headerTitle: 'Goods List',
        }
    }

    setModalVisible = (visible) => {
        this.setState(prevState => {
            prevState.modalVisible = visible
            return prevState
        })
    }

    render() {
        return(
            <View>
                <ScrollView>
                    {this.goodsList.map((goods, index) => {
                        return(
                            <View key={index}>
                                <TouchableOpacity
                                onPress={() => {
                                    if(this.goodsList[index] != 'Others') {
                                        this.props.navigation.state.params.setGoodsType(this.goodsList[index])
                                        this.props.navigation.goBack()
                                    }
                                    else this.setModalVisible(true)
                                }}
                                style={{flexDirection: 'row', alignItems: 'center', paddingVertical: 10}}>
                                    <Text style={{marginStart: 20, marginVertical: 10, fontSize: 15}}>{goods}</Text>
                                </TouchableOpacity>
                                <View 
                                    style={{
                                    borderTopColor:'rgba(0, 0, 0, 0.1)',
                                    borderTopWidth: 1}}/>
                            </View> 
                        )
                    })}
                </ScrollView>

                {/* Dialog box for other goods. */}
                <Modal
                    animationType="fade"
                    transparent={true}
                    visible={this.state.modalVisible}
                    onRequestClose={() => {
                    this.setModalVisible(false)
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
                                        this.setModalVisible(false)
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
                                        this.props.navigation.state.params.setGoodsType(this.state.otherGoods)
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