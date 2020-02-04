import React, { Component } from 'react';
import {
    StyleSheet,
    View,
    Dimensions,
    Image
} from 'react-native';
import MapView, { PROVIDER_GOOGLE, Marker } from 'react-native-maps';
import MapViewDirections from 'react-native-maps-directions';
import { BASE_URL, TRIP_ROUTE, FIELDS, KEY } from '../utils/AppConstants';
import ToastComp from '../utils/ToastComp'

const ACCENT = '#FFCB28' // 255, 203, 40
const ACCENT_DARK = '#F1B800'
const GOOGLE_MAPS_APIKEY = 'AIzaSyCJYc7hsuiHCwUQWQ0NTk0TW0ne0y43NAE';
const { width, height } = Dimensions.get('window');
const ASPECT_RATIO = width / height;
const LATITUDE_DELTA = 0.0030;
const LONGITUDE_DELTA = LATITUDE_DELTA * ASPECT_RATIO;

export default class Notifications extends Component {
    static navigationOptions = ({ navigation }) => {
        return {
            headerTitle: 'Track Driver',
        }
    }

    constructor(props) {
        super(props)
        this.mapView = null;
        this.stopTrackingViewChanges = this.stopTrackingViewChanges.bind(this);

        this.state = {
            trackViewChanges: true,
            pickup: {
                latitude: parseFloat(props.navigation.getParam('pickupLat')),
                longitude: parseFloat(props.navigation.getParam('pickupLng'))
            },
            drop: {
                latitude: parseFloat(props.navigation.getParam('dropLat')),
                longitude: parseFloat(props.navigation.getParam('dropLng'))
            },
            waypoints: []
        }
    }

    componentDidMount() {
        this.getTripData()
    }

    showToast(message) {
        this.toast.show(message);
    }

    getTripData = async () => {

        const reqURL = BASE_URL + TRIP_ROUTE + '?' +
            FIELDS.BOOKING_ID + '=' + this.props.navigation.getParam('bookingId');

        const request = await fetch(reqURL, {
            method: 'GET',
            headers: {
                key: KEY
            }
        })

        const response = await request.json().then(value => {
            console.log(value)

            if (!value.success) {
                this.showToast(value.message);
            }
            else {
                if (value.data.routes.length > 2) {
                    this.setState(prevState => {
                        value.data.routes.slice(1, -1).forEach((route, index) => {
                            latlng = {
                                latitude: parseFloat(route.lat),
                                longitude: parseFloat(route.lng),
                            }
                            prevState.waypoints.push(latlng)
                        })
                        prevState.pickup = {
                            latitude: parseFloat(value.data.route[0].lat),
                            longitude: parseFloat(value.data.route[0].lng)
                        }
                        prevState.drop = {
                            latitude: parseFloat(value.data.route[-1].lat),
                            longitude: parseFloat(value.data.route[-1].lng)
                        }
                        return prevState
                    })
                }
                else {
                    this.showToast("Showing default Route")
                }
            }

        }).catch(err => {
            console.log(err)
            this.showToast(Constants.ERROR_GET_DETAILS);
        })
    }

    stopTrackingViewChanges() {
        this.setState(prevState => {
            prevState.trackViewChanges = false
            return prevState
        })
    }

    render() {
        return (
            <View style={{ flex: 1 }}>
                <MapView
                showsMyLocationButton={false}
                showsUserLocation={true}
                provider={PROVIDER_GOOGLE}
                style={styles.mapReg}
                initialRegion={{
                    latitude: (this.state.pickup.latitude),
                    longitude: this.state.pickup.longitude,
                    latitudeDelta: LATITUDE_DELTA,
                    longitudeDelta: LONGITUDE_DELTA,
                }}
                ref={c => this.mapView = c}>
                    <Marker coordinate={{
                      latitude: parseFloat(this.state.pickup.latitude),
                      longitude: parseFloat(this.state.pickup.longitude),
                    }} tracksViewChanges={this.state.trackViewChanges}>
                      <Image source={require('../../assets/pin_red.png')} style={{width: 50, height: 50}}
                      resizeMode="contain"/>
                    </Marker>

                    <Marker coordinate={{
                      latitude: parseFloat(this.state.drop.latitude),
                      longitude: parseFloat(this.state.drop.longitude),
                    }} tracksViewChanges={this.state.trackViewChanges}>
                      <Image source={require('../../assets/pin_green.png')} style={{width: 50, height: 50}}
                      resizeMode="contain" onLoad={this.stopTrackingViewChanges}/>
                    </Marker>
                    
                    <MapViewDirections
                        waypoints={this.state.waypoints}
                        origin={this.state.pickup}
                        destination={this.state.drop}
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

                <ToastComp ref={t => this.toast = t}/>
            </View>
        )
    }
}

const styles = StyleSheet.create({
    mapReg: {
        ...StyleSheet.absoluteFillObject,
    },
});

