import React, {Component} from 'react'
import {createAppContainer} from 'react-navigation'
import {Text, View} from 'react-native'
import {createMaterialTopTabNavigator} from 'react-navigation-tabs'
import * as Constants from '../utils/AppConstants'
import * as DataController from '../utils/DataStorageController'
import RateScreen from './RateCardScreen'
import ToastComp from '../utils/ToastComp';

export default class RateTabNavigator extends Component{
    constructor(props) {
        super(props)

        this.state = {
            vehiclesList: ''
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
            console.log(value)
    
            if(!value.success){
                this.showToast(value.message);
            }
            else {
                this.setState(prevState => {
                  prevState.vehiclesList = value.data
                  return prevState
                })
            }
            
        }).catch(err => {
            console.log(err)
            this.showToast(Constants.ERROR_GET_DETAILS);
        })
    }

    Tabs = () => {
        const vehiclesList = this.state.vehiclesList
        let vehicles = {}
        vehiclesList.map((val, index) => {
            vehicles[val.vehicle_name] = {
                screen: RateScreen
            }
        })
        
        const rateTabs = createMaterialTopTabNavigator(
            {
                ...vehicles
            },
            {
                lazyLoad: true,
                tabBarOptions: {
                    scrollEnabled: true,
                }
            }
        )

        const TabsContainer = createAppContainer(rateTabs)
        return <TabsContainer/>
    }

    render () {
        return (
        <View>
            {
                this.state.vehiclesList !== ''?
                this.Tabs()
                :
                <Text>Getting Vehicles Category...</Text>
            }

            <ToastComp ref={t => this.toast = t}/>
        </View>
        )
    }
}