import React, { Component } from 'react';
import {
  StyleSheet,
  View,
  Dimensions
} from 'react-native';
import MapView, {PROVIDER_GOOGLE, Marker } from 'react-native-maps';
import MapViewDirections from 'react-native-maps-directions';
import { BASE_URL, TRIP_ROUTE, FIELDS } from '../utils/AppConstants';

const ACCENT = '#FFCB28' // 255, 203, 40
const ACCENT_DARK = '#F1B800'
const GOOGLE_MAPS_APIKEY = 'AIzaSyCJYc7hsuiHCwUQWQ0NTk0TW0ne0y43NAE';
const { width, height } = Dimensions.get('window');
const ASPECT_RATIO = width / height;
const LATITUDE_DELTA = 0.0030;
const LONGITUDE_DELTA = LATITUDE_DELTA * ASPECT_RATIO;

export default class Notifications extends Component {
    static navigationOptions = ({navigation}) => {
        return{
            headerTitle: 'Track Driver',
        }
    }

    constructor(props) {
        super(props)
        this.mapView = null;
        this.state = {
            waypoints: []
        }
    }

    componentDidMount() {
        this.getTripData()
    }

    getTripData = async () => {
    
        const reqURL = BASE_URL + TRIP_ROUTE + '?' + 
                        FIELDS.BOOKING_ID + '=' + this.props.navigation.getParam('bookingId');
    
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
                this.props.navigation.setParams({
                    origin: value.data.routes[0],
                    destination: value.data.routes[-1]
                })
                this.setState(prevState => {
                    prevState.waypoints = value.data.routes.slice(1, -1)
                    return prevState
                })
            }
            
        }).catch(err => {
            console.log(err)
            ToastAndroid.show(Constants.ERROR_GET_DETAILS, ToastAndroid.SHORT);
        })
      }

    render() {
        return(
            <View style={{flex: 1}}>
                <MapView
                    showsMyLocationButton={false}
                    showsUserLocation={true}
                    provider={PROVIDER_GOOGLE}
                    style={styles.mapReg}
                    initialRegion={{
                        latitude: 0,
                        longitude: 0,
                        latitudeDelta: LATITUDE_DELTA,
                        longitudeDelta: LONGITUDE_DELTA,
                    }}
                    ref={c => this.mapView = c}>
                    <MapViewDirections
                        waypoints={this.state.waypoints}
                        origin={this.props.navigation.getParam('origin')}
                        destination={this.props.navigation.getParam('destination')}
                        apikey={GOOGLE_MAPS_APIKEY}
                        strokeWidth={3}
                        strokeColor={'black'}
                        optimizeWaypoints={true}
                        onStart={(params) => {
                            console.log(`Started routing between "${params.origin}" and "${params.destination}"`);
                        }}
                        onReady={result => {
                            console.log(`Distance: ${result.distance} km`)
                            console.log(`Duration: ${result.duration} min.`)
                            
                            this.mapView.fitToCoordinates(result.coordinates, {
                                edgePadding: {
                                right: (width / 20),
                                bottom: (height / 20),
                                left: (width / 20),
                                top: (height / 20),
                                }
                            });
                        }}
                        onError={(errorMessage) => {
                        console.log('ERROR: ' + errorMessage);
                        }}
                    />

                </MapView>
            </View>
        )
    }
}

const styles = StyleSheet.create({
    mapReg: {
        ...StyleSheet.absoluteFillObject,
    },
});

