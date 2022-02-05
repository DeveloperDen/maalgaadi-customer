import React, {Component} from 'react';
import {StyleSheet, View, Dimensions, Image} from 'react-native';
import MapView, {
  PROVIDER_GOOGLE,
  Marker,
  PROVIDER_DEFAULT,
  MarkerAnimated,
} from 'react-native-maps';
import MapViewDirections from 'react-native-maps-directions';
import {
  BASE_URL,
  TRIP_ROUTE,
  FIELDS,
  KEY,
  GOOGLE_MAPS_APIKEY,
  ERROR_GET_DETAILS,
} from '../utils/AppConstants';
import ToastComp from '../utils/ToastComp';
import {GET_BOOKING_TRACKING_DATA} from './../utils/AppConstants';
import {NavigationEvents} from 'react-navigation';

const ACCENT = '#FFCB28'; // 255, 203, 40
const ACCENT_DARK = '#F1B800';
const {width, height} = Dimensions.get('window');
const ASPECT_RATIO = width / height;
const LATITUDE_DELTA = 0.003;
const LONGITUDE_DELTA = LATITUDE_DELTA * ASPECT_RATIO;
const COMPLETED = 'Completed';
const TAG = 'TrackDriver: ';

export default class TrackDriver extends Component {
  static navigationOptions = ({navigation}) => {
    return {
      headerTitle: 'Track Driver',
    };
  };

  constructor(props) {
    super(props);
    this.mapView = null;
    this.stopTrackingViewChanges = this.stopTrackingViewChanges.bind(this);

    this.state = {
      trackViewChanges: true,
      pickup: {
        latitude: parseFloat(props.navigation.getParam('pickupLat')),
        longitude: parseFloat(props.navigation.getParam('pickupLng')),
      },
      drop: {
        latitude: parseFloat(props.navigation.getParam('dropLat')),
        longitude: parseFloat(props.navigation.getParam('dropLng')),
      },
      waypoints: [],
      driverCoord: {
        latitude: 0,
        longitude: 0,
      },
      status: props.navigation.getParam('status'),
    };
  }

  async componentDidMount() {
    if (this.state.status != COMPLETED) {
      await this.getTripData();
      await this.getLiveTrackingData();
    }

    // Get live tracking data after every 10 seconds
    this.trackingInterval = setInterval(() => {
      console.log('Interval complete. Getting tracking data.');
      this.getLiveTrackingData();
    }, 10000);
  }

  showToast(message) {
    this.toast.show(message);
  }

  getLiveTrackingData = async () => {
    const reqURL =
      BASE_URL +
      GET_BOOKING_TRACKING_DATA +
      '?' +
      FIELDS.BOOKING_ID +
      '=' +
      this.props.navigation.getParam('bookingId');

      console.log(TAG, 'getLiveTrackingData: reqURL >> ', reqURL);

    const request = await fetch(reqURL, {
      method: 'GET',
      headers: {
        key: KEY,
      },
    });

    await request
      .json()
      .then(value => {
        console.log(value);

        if (!value.success) {
          this.showToast(value.message);
        } else {
          const drivLat = parseFloat(value.data.driver_lat);
          const drivLong = parseFloat(value.data.driver_long);

          if (drivLat !== 0.0 && drivLong !== 0.0) {
            this.setState(prevState => {
              prevState.driverCoord = {
                latitude: drivLat,
                longitude: drivLong,
              };
              return prevState;
            });

            this.mapView.animateCamera({
              center: {
                latitude: drivLat,
                longitude: drivLong,
              },
            });
          }
        }
      })
      .catch(err => {
        console.log(err);
        this.showToast(ERROR_GET_DETAILS);
      });
  };

  getTripData = async () => {
    const reqURL =
      BASE_URL +
      TRIP_ROUTE +
      '?' +
      FIELDS.BOOKING_ID +
      '=' +
      this.props.navigation.getParam('bookingId');
      console.log(TAG, 'getTripData: reqURL >> ', reqURL);

    const request = await fetch(reqURL, {
      method: 'GET',
      headers: {
        key: KEY,
      },
    });

    await request
      .json()
      .then(value => {
        console.log(value);

        if (!value.success) {
          // this.showToast(value.message);
        } else {
          if (value.data.routes.length > 2) {
            this.setState(prevState => {
              value.data.routes.slice(1, -1).forEach((route, index) => {
                console.log(TAG, 'route >> ', route);
                latlng = {
                  latitude: parseFloat(route === null ? 0.0 : route.lat),
                  longitude: parseFloat(route === null ? 0.0 : route.lng),
                };
                prevState.waypoints.push(latlng);
              });
              // prevState.pickup = {
              //     latitude: parseFloat(value.data.route[0].lat),
              //     longitude: parseFloat(value.data.route[0].lng)
              // }
              // prevState.drop = {
              //     latitude: parseFloat(value.data.route[-1].lat),
              //     longitude: parseFloat(value.data.route[-1].lng)
              // }
              prevState.pickup = {
                latitude: parseFloat(
                  value.data.routes[0] === null
                    ? 0.0
                    : value.data.routes[0].lat,
                ),
                longitude: parseFloat(
                  value.data.routes[0] === null
                    ? 0.0
                    : value.data.routes[0].lng,
                ),
              };
              prevState.drop = {
                latitude: parseFloat(
                  value.data.routes[-1] === null
                    ? 0.0
                    : value.data.routes[-1].lat,
                ),
                longitude: parseFloat(
                  value.data.routes[-1] === null
                    ? 0.0
                    : value.data.routes[-1].lng,
                ),
              };
              return prevState;
            });
          } else {
            this.showToast('Showing default Route');
          }
        }
      })
      .catch(err => {
        console.log(err);
        this.showToast(ERROR_GET_DETAILS);
      });
  };

  stopTrackingViewChanges() {
    this.setState(prevState => {
      prevState.trackViewChanges = false;
      return prevState;
    });
  }

  componentWillUnmount() {
    clearInterval(this.trackingInterval);
  }

  render() {
    return (
      <View style={{flex: 1}}>
        <MapView
          showsMyLocationButton={false}
          showsUserLocation={true}
          provider={PROVIDER_DEFAULT}
          style={styles.mapReg}
          initialRegion={{
            latitude: this.state.pickup.latitude,
            longitude: this.state.pickup.longitude,
            latitudeDelta: LATITUDE_DELTA,
            longitudeDelta: LONGITUDE_DELTA,
          }}
          ref={c => (this.mapView = c)}>
          <Marker
            coordinate={this.state.driverCoord}
            trackViewChanges={this.state.trackViewChanges}>
            <Image
              source={require('../../assets/driver.png')}
              style={{
                width: 80,
                height: 80,
              }}
              resizeMode="contain" 
              onLoad={this.stopTrackingViewChanges}
            />
          </Marker>

          <Marker coordinate={this.state.pickup} pinColor="green" />
          <Marker coordinate={this.state.drop} />

          <MapViewDirections
            waypoints={this.state.waypoints}
            origin={this.state.pickup}
            destination={this.state.drop}
            apikey={GOOGLE_MAPS_APIKEY}
            strokeWidth={3}
            strokeColor={ACCENT_DARK}
            optimizeWaypoints={true}
            onStart={params => {
              console.log(
                `Started routing between "${params.origin}" and "${
                  params.destination
                }"`,
              );
            }}
            onReady={result => {
              console.log(`Distance: ${result.distance} km`);
              console.log(`Duration: ${result.duration} min.`);

              this.mapView.fitToCoordinates(result.coordinates, {
                edgePadding: {
                  right: width / 20,
                  bottom: height / 20,
                  left: width / 20,
                  top: height / 20,
                },
              });
            }}
            onError={errorMessage => {
              console.log('ERROR: ' + errorMessage);
            }}
          />
        </MapView>

        <ToastComp ref={t => (this.toast = t)} />
      </View>
    );
  }
}

const styles = StyleSheet.create({
  mapReg: {
    ...StyleSheet.absoluteFillObject,
  },
});
