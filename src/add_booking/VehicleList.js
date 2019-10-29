import React, { Component } from 'react';
import {
  StyleSheet,
  View,
  Text,
  Image,
} from 'react-native';
import { TouchableOpacity, ScrollView } from 'react-native-gesture-handler';

const vehicleIcon = require('../../assets/vehicle.png')

const ACCENT = '#FFCB28' // 255, 203, 40 

export default class VehicleList extends Component {
    constructor(props) {
        super(props)
        this.state = {
        }
        this.vehiclesList = [
            {
              distance: 0,
              img: vehicleIcon,
              name: 'Loading Rickshaw'},
            {
              distance: 2,
              img: vehicleIcon,
              name: 'Tata Ace'},
            {
              distance: 0,
              img: vehicleIcon,
              name: 'Ashok Layland Dost'},
            {
              distance: 5,
              img: vehicleIcon,
              name: 'Pick up'},
            {
              distance: 7,
              img: vehicleIcon,
              name: 'Other Vehicle'},
            {
              distance: 0,
              img: vehicleIcon,
              name: 'Another Vehicle'},
      
              {
                distance: 0,
                img: vehicleIcon,
                name: 'Vehicle'}
          ]
    }

    static navigationOptions = ({navigation}) => {
        return{
            headerTitle: 'Vehicles List',
        }
    }

    render() {
        return(
            <ScrollView>
                {this.vehiclesList.map((value, index) => {
                    return(
                        <View key={index}>
                            <TouchableOpacity
                            onPress={() => {
                                this.props.navigation.state.params.setVehicle(this.vehiclesList[index].name)
                                this.props.navigation.goBack()
                            }}
                            style={{flexDirection: 'row', alignItems: 'center', paddingVertical: 10}}>
                                <Image style={{width: 30, height: 30, marginStart: 15}} source={value.img}/>
                                <Text style={{marginStart: 20}}>{value.name}</Text>
                            </TouchableOpacity>
                            <View 
                                style={{
                                borderTopColor:'rgba(0, 0, 0, 0.1)',
                                borderTopWidth: 1}}/>
                        </View> 
                    )
                })} 
            </ScrollView>
        )
    }
}

const styles = StyleSheet.create({
});