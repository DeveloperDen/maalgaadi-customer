import React, { Component } from 'react';
import {
  StyleSheet,
  View,
  Text,
  Image,
} from 'react-native';
import { TouchableOpacity, ScrollView } from 'react-native-gesture-handler';
import ToastComp from '../utils/ToastComp'

const DataController = require('../utils/DataStorageController')
const Constants = require('../utils/AppConstants')
const vehicleIcon = require('../../assets/vehicle.png')

const ACCENT = '#FFCB28' // 255, 203, 40

export default class VehicleList extends Component {
    constructor(props) {
        super(props)
        this.state = {
          vehiclesList: '',
          waitText: 'Getting Vehicle Category...'
        }
    }

    static navigationOptions = ({navigation}) => {
        return{
            headerTitle: 'Vehicles List',
        }
    }

    componentDidMount() {
      this.getVehicleCategory()
    }

    showToast(message) {
      this.toast.show(message);
    }

    getVehicleCategory = async () => {
      const cityId = 1 // TODO: Remove this line, uncomment next line.
      // const cityId = await DataController.getItem(DataController.CITY_ID)
      const id = await DataController.getItem(DataController.CUSTOMER_ID)
  
      const reqURL = Constants.BASE_URL + Constants.VEHICLE_CATEGORY + '?' + 
                      Constants.FIELDS.CUSTOMER_ID + '=' + id + '&' +
                      Constants.FIELDS.CITY_ID_USER + '=' + cityId
  
      const request = await fetch(reqURL, {
          method: 'GET',
          headers: {
              key: Constants.KEY
          }
      })
  
      const response = await request.json().then(value => {
          console.log(JSON.stringify(value))
  
          if(!value.success){
              this.setState(prevState => {
                prevState.waitText = value.message
                return prevState
              })
          }
          else {
              this.setState(prevState => {
                prevState.vehiclesList = value.data
                prevState.waitText = value.message
                return prevState
              })
          }
          
      }).catch(err => {
          console.log(err)
          this.showToast(Constants.ERROR_GET_DETAILS);
      })
    }

    render() {
        return(
          <View style={{flex: 1}}>
            {
              this.state.vehiclesList !== ''?
              <ScrollView>
                  {this.state.vehiclesList.map((value, index) => {
                      return(
                          <View key={index}>
                              <TouchableOpacity
                              onPress={() => {
                                  this.props.navigation.state.params.setVehicle(this.state.vehiclesList[index])
                                  this.props.navigation.goBack()
                              }}
                              style={{flexDirection: 'row', alignItems: 'center', paddingVertical: 10}}>
                                  <Image style={{width: 30, height: 30, marginStart: 15}} source={vehicleIcon}/>
                                  <Text style={{marginStart: 20}}>{value.vehicle_name}</Text>
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

            <ToastComp ref={t => this.toast = t}/>
          </View>
        )
    }
}

const styles = StyleSheet.create({
});