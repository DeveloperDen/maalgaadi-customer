import React, {Component} from 'react';
import {
  StyleSheet,
  TouchableOpacity,
  TouchableHighlight,
  Image,
  View,
  Text,
  StatusBar,
  Dimensions,
  ScrollView,
  Animated,
  Modal,
  NativeEventEmitter,
  NativeModules,
  PermissionsAndroid,
  Alert,
  Platform,
} from 'react-native';
import MapView, {
  PROVIDER_GOOGLE,
  Marker,
  PROVIDER_DEFAULT,
} from 'react-native-maps';
import Geolocation from 'react-native-geolocation-service';
import Geocoder from 'react-native-geocoding';
import {TextInput} from 'react-native-gesture-handler';
import DateTimePickerComp from './utils/DateTimePickerComp';
import NetInfo from '@react-native-community/netinfo';
import {LandmarkModel} from './models/landmark_model';
import DotLoader from './home/components/DotLoader';
import {
  formatDate,
  showNotification,
  isServiceAvailable,
} from './utils/UtilFunc';
import {PopOverComp} from './utils/PopOverComp';
// import firebase from 'react-native-firebase';
import messaging from '@react-native-firebase/messaging';
import {check, request, PERMISSIONS, RESULTS} from 'react-native-permissions';
import ToastComp from './utils/ToastComp';
import {getDeviceId} from 'react-native-device-info';
import {getDistance} from 'geolib';

const BookingModel = require('./models/bookings_model');
const Constants = require('./utils/AppConstants');
const DataController = require('./utils/DataStorageController');
const vehicleIcon = require('../assets/vehicle.png');
const instantIcon = require('../assets/instant.png');
const greenPin = require('../assets/pin_green.png');
const redPin = require('../assets/pin_red.png');
const driverMarker = require('../assets/driver.png');

const {width, height} = Dimensions.get('window');
const ASPECT_RATIO = width / height;
const LATITUDE_DELTA = 0.003;
const LONGITUDE_DELTA = LATITUDE_DELTA * ASPECT_RATIO;
const YOUR_LOCATION = 'Your location';
const CHO_DEST = 'Choose destination';
const DESTINATION = 'destination';
const ORIGIN = 'origin';
const SCALE_ANIM_DELAY = 100;
const TRANS_ANIM_DELAY = 50;

const I_TRANS_ORIG = 0;
const I_TRANS_DEST = -20;
const F_TRANS_ORIG = -5;
const F_TRANS_DEST = -5;

const ACCENT = '#FFCB28'; // 255, 203, 40
const ACCENT_DARK = '#F1B800';
const TAG = 'Home:';

export default class Home extends Component {
  constructor(props) {
    super(props);

    Geocoder.init(Constants.GOOGLE_MAPS_APIKEY);

    this.requestLocationPermission = this.requestLocationPermission.bind(this);
    this.checkLocationPermission = this.checkLocationPermission.bind(this);
    this.getCurrentLocation = this.getCurrentLocation.bind(this);
    this.stopTrackingViewChanges = this.stopTrackingViewChanges.bind(this);
    this.setDateTime = this.setDateTime.bind(this);

    this.mapView = null;
    this.freeDrivers = [];

    this.formatDate = formatDate;

    this.state = {
      isLoading: false,
      showRatingModal: true,
      isPaymentDialogShowing: false,
      fromView: null,
      popOverText: '',
      tutCompFieldActive: null,
      isVisible: false,

      trackViewChanges: true,
      coordinates: {
        latitude: 22.7196,
        longitude: 75.8577,
      },
      isCoveredVehicle: false,
      freeDrivers: [],
      vehiclesList: [],
      selectedVehicleIndex: 0,
      selectedVehicle: '',
      selectedVehicleID: 0,
      editedName: '',
      editedNumber: '',
      selectedDateTime: new Date(),
      showDateTime: false,
      dateTimePickerMode: 'date',

      modalVisible: false,

      inactiveInput: {
        container: {
          elevation: 2,
          shadowColor: 'rgb(0, 0, 0)',
          shadowOffset: {width: 0, height: 2},
          shadowOpacity: 0.25,
          shadowRadius: 2,
          backgroundColor: '#F7F7F7',
        },
        text: {
          fontSize: 13,
        },
        icons: {
          width: 13,
          height: 13,
        },
      },
      activeInput: {
        container: {
          elevation: 5,
          shadowColor: 'rgb(0, 0, 0)',
          shadowOffset: {width: 0, height: 3},
          shadowOpacity: 0.4,
          shadowRadius: 5,
          backgroundColor: 'white',
        },
        text: {
          fontSize: 15,
        },
        icons: {
          width: 15,
          height: 15,
        },
      },

      isActiveInput: ORIGIN,
      isServiceAvailable: false,

      scaleXAnimOrig: new Animated.Value(1),
      scaleXAnimDest: new Animated.Value(0.95),
      translateYAnimOrig: new Animated.Value(I_TRANS_ORIG),
      translateYAnimDest: new Animated.Value(I_TRANS_DEST),

      preLoc: '',
      destLoc: '',

      duration: '',
      distance: '',

      display: 'flex',

      origin: '',
      destination: '',

      placeholder: [YOUR_LOCATION, CHO_DEST],
    };

    this.mapStyleList = [
      {elementType: 'geometry', stylers: [{color: '#242f3e'}]},
      {elementType: 'labels.text.stroke', stylers: [{color: '#242f3e'}]},
      {elementType: 'labels.text.fill', stylers: [{color: '#746855'}]},
      {
        featureType: 'administrative.locality',
        elementType: 'labels.text.fill',
        stylers: [{color: '#d59563'}],
      },
      {
        featureType: 'poi',
        elementType: 'labels.text.fill',
        stylers: [{color: '#d59563'}],
      },
      {
        featureType: 'poi.park',
        elementType: 'geometry',
        stylers: [{color: '#263c3f'}],
      },
      {
        featureType: 'poi.park',
        elementType: 'labels.text.fill',
        stylers: [{color: '#6b9a76'}],
      },
      {
        featureType: 'road',
        elementType: 'geometry',
        stylers: [{color: '#38414e'}],
      },
      {
        featureType: 'road',
        elementType: 'geometry.stroke',
        stylers: [{color: '#212a37'}],
      },
      {
        featureType: 'road',
        elementType: 'labels.text.fill',
        stylers: [{color: '#9ca5b3'}],
      },
      {
        featureType: 'road.highway',
        elementType: 'geometry',
        stylers: [{color: '#746855'}],
      },
      {
        featureType: 'road.highway',
        elementType: 'geometry.stroke',
        stylers: [{color: '#1f2835'}],
      },
      {
        featureType: 'road.highway',
        elementType: 'labels.text.fill',
        stylers: [{color: '#f3d19c'}],
      },
      {
        featureType: 'transit',
        elementType: 'geometry',
        stylers: [{color: '#2f3948'}],
      },
      {
        featureType: 'transit.station',
        elementType: 'labels.text.fill',
        stylers: [{color: '#d59563'}],
      },
      {
        featureType: 'water',
        elementType: 'geometry',
        stylers: [{color: '#17263c'}],
      },
      {
        featureType: 'water',
        elementType: 'labels.text.fill',
        stylers: [{color: '#515c6d'}],
      },
      {
        featureType: 'water',
        elementType: 'labels.text.stroke',
        stylers: [{color: '#17263c'}],
      },
    ];

    // Listener to events emitted by PaymentWebviewScreen
    const {NativePaymentView} = NativeModules;
    // Page Finished Loading
    this.eventEmitter = new NativeEventEmitter(NativePaymentView);
    this.eventEmitter.addListener('PageFinished', event => {
      console.log('Got URL message: ', event.url);
      this.showToast(event.url);
    });
    // Transaction finished
    this.eventEmitter.addListener('TransFinished', event => {
      const params = event.transParams;
      console.log('Transaction Params: ', params);
      this.setState(prevState => {
        prevState.isPaymentDialogShowing = false;
        return prevState;
      });
      DataController.setItem(
        DataController.PAYMENT_TRANS_DATA,
        JSON.stringify(params),
      ).then(value => {
        console.log('Payment Data saved: ', value);

        if (params.status) {
          this.props.navigation.navigate({
            routeName: 'TransactionSuccess',
          });
        } else {
          this.props.navigation.navigate({
            routeName: 'TransactionFailed',
          });
        }
      });
    });
  }

  setModalVisible = async (visible, save = false) => {
    if (save) {
      await this.addLocation(visible);
    } else {
      this.setState(prevState => {
        prevState.modalVisible = visible;
        return prevState;
      });
    }
  };

  addLocation = async visible => {
    this.setState(prevState => {
      prevState.isLoading = true;
      return prevState;
    });

    const reqBody = new FormData();
    const custId = await DataController.getItem(DataController.CUSTOMER_ID);
    reqBody.append(Constants.FIELDS.CUSTOMER_ID, custId);
    reqBody.append(Constants.FIELDS.ADDRESS, this.state.editedName);
    reqBody.append(Constants.FIELDS.NUMBER, this.state.editedNumber);

    const region =
      this.state.isActiveInput === ORIGIN
        ? this.state.preLoc
        : this.state.destLoc;
    reqBody.append(Constants.FIELDS.LANDMARK, region.address);
    reqBody.append(Constants.FIELDS.LAT, region.latitude);
    reqBody.append(Constants.FIELDS.LNG, region.longitude);

    console.log('Request: ', reqBody);

    const request = await fetch(
      Constants.BASE_URL + Constants.ADD_CUSTOMER_FAVORITE_LOCATION,
      {
        method: 'POST',
        body: reqBody,
        headers: {
          key: Constants.KEY,
        },
      },
    );
    const response = await request
      .json()
      .then(async value => {
        console.log('Response: ', value);

        if (value.success) {
          this.setState(prevState => {
            prevState.modalVisible = visible;

            return prevState;
          });
          this.showToast('Favourite Location Added');
        } else {
          this.showToast(value.message);
        }
      })
      .catch(err => {
        console.log(err);
        this.showToast(Constants.ERROR_EDIT_LOC);
      });

    this.setState(prevState => {
      prevState.isLoading = false;
      prevState.modalVisible = visible;
      return prevState;
    });
  };

  async checkLocationPermission() {
    try {
      if (Platform.OS == 'android') {
        await PermissionsAndroid.request(
          PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION,
          {
            title: 'MapsGo',
            message:
              'MaalGaadi will access your location to locate drivers near you and provide you an amazing transportation experience. Tap OK to allow us.',
            buttonNeutral: 'Ask Me Later',
            buttonNegative: 'Cancel',
            buttonPositive: 'OK',
          },
        ).then(result => {
          switch (result) {
            case RESULTS.UNAVAILABLE:
              this.showLocationAlert(
                'Sorry, location feature is not available on your device. MaalGaadi may not work as expected.',
              );
              break;

            case RESULTS.DENIED:
              this.showLocationAlert(
                'MaalGaadi uses location to get the drivers around you and provide an amazing transportation experience.',
                true,
              );
              break;

            case RESULTS.GRANTED:
              console.log('The permission is granted');
              Geolocation.getCurrentPosition(
                position => {
                  console.log(position);
                  this.mapView.animateToRegion(
                    {
                      latitude: position.coords.latitude,
                      longitude: position.coords.longitude,
                      latitudeDelta: LATITUDE_DELTA,
                      longitudeDelta: LONGITUDE_DELTA,
                    },
                    500,
                  );
                },
                error => {
                  console.log(error.code, error.message);
                },
                {enableHighAccuracy: true, timeout: 15000, maximumAge: 10000},
              );
              break;

            case RESULTS.BLOCKED:
              console.log(
                'The permission is denied and not requestable anymore',
              );
              this.showLocationAlert(
                'MaalGaadi is unable to request for the location permission to work. Please try restarting the application or reinstalling it.',
              );
              break;
          }
        });
      } else {
        // Else for iOS.
        check(PERMISSIONS.IOS.LOCATION_WHEN_IN_USE).then(result => {
          console.log('iOS Location Permission results: ');

          switch (result) {
            case RESULTS.UNAVAILABLE:
              this.showLocationAlert(
                'Sorry, location feature is not available on your device. MaalGaadi may not work as expected.',
              );
              break;

            case RESULTS.DENIED:
              this.showLocationAlert(
                'MaalGaadi uses location to get the drivers around you and provide an amazing transportation experience.',
                true,
              );
              break;

            case RESULTS.GRANTED:
              console.log('The permission is granted');
              Geolocation.getCurrentPosition(
                position => {
                  console.log('Geolocation current position: ', position);
                  this.mapView.animateToRegion(
                    {
                      latitude: position.coords.latitude,
                      longitude: position.coords.longitude,
                      latitudeDelta: LATITUDE_DELTA,
                      longitudeDelta: LONGITUDE_DELTA,
                    },
                    500,
                  );
                },
                error => {
                  console.log('Geolocation error: ', error.code, error.message);
                },
                {enableHighAccuracy: true, timeout: 15000, maximumAge: 10000},
              );
              break;

            case RESULTS.BLOCKED:
              console.log(
                'The permission is denied and not requestable anymore',
              );
              this.showLocationAlert(
                'MaalGaadi is unable to request for the location permission to work. Please try restarting the application or reinstalling it.',
              );
              break;
          }
        });
      }
    } catch (err) {
      console.log(err);
    }
  }

  showLocationAlert(message, toRequest = false) {
    Alert.alert('MaalGaadi', message, [
      {
        text: 'OK',
        onPress: () => {
          toRequest ? this.requestLocationPermission() : null;
        },
      },
    ]);
  }

  requestLocationPermission() {
    console.log('Requesting location permission...');

    if (Platform.OS == 'android') this.checkLocationPermission();
    else
      request(PERMISSIONS.IOS.LOCATION_WHEN_IN_USE)
        .then(() => {
          this.checkLocationPermission();
        })
        .catch(err => {
          console.log(err);
        });
  }

  getCurrentLocation(input) {
    Geolocation.getCurrentPosition(
      position => {
        console.log('Current position: ', position);
        Geocoder.from(position.coords.latitude, position.coords.longitude)
          .then(res => {
            var address = res.results[0].formatted_address;
            console.log('Current address: ', address);

            this.setState(prevState => {
              if (input === ORIGIN) {
                prevState.origin = address;
                prevState.preLoc = address;
              } else {
                prevState.destination = address;
                prevState.destLoc = address;
              }

              return prevState;
            });
          })
          .catch(error => console.log(error));
        this.setState(prevState => {
          if (input === ORIGIN) prevState.origin = position.coo;
        });
      },
      error => {
        // See error code charts below.
        console.log(error.code, error.message);
      },
      {enableHighAccuracy: true, timeout: 15000, maximumAge: 10000},
    );
  }

  async componentDidMount() {
    if (this.props.navigation.state.params) {
      this.props.navigation.getParam('toMyBookings', '')
        ? this.props.navigation.navigate('MyBookings')
        : null;
    }

    // Profile completed check
    const isProfileCompleted = await DataController.getItem(
      DataController.IS_PROFILE_COMPLETED,
    );
    isProfileCompleted === 'false'
      ? this.props.navigation.navigate('CreateProfile', {
          [Constants.IS_NEW_USER]: true,
        })
      : null;
    console.log('Profile completed: ', isProfileCompleted);

    // Listener for Network change
    this.netInfoSub = NetInfo.addEventListener(state => {
      if (!state.isConnected) this.props.navigation.navigate('NoNetworkModal');
    });

    await this.checkLocationPermission();

    // Will Focus listener
    this.willFocusListener = this.props.navigation.addListener(
      'didFocus',
      async () => {
        if (this.props.navigation.state.params) {
          this.props.navigation.getParam('toMyBookings', '')
            ? this.props.navigation.navigate('MyBookings')
            : null;
          this.mapView.animateToRegion(
            {
              latitude: this.props.navigation.getParam('latitude'),
              longitude: this.props.navigation.getParam('longitude'),
              latitudeDelta: LATITUDE_DELTA,
              longitudeDelta: LONGITUDE_DELTA,
            },
            500,
          );
        }

        // Profile update check
        const isProfileUpdated = await DataController.getItem(
          DataController.IS_PROFILE_UPDATED,
        );
        if (isProfileUpdated === 'true') {
          this.showToast('Profile updated successfully');
          DataController.setItem(DataController.IS_PROFILE_UPDATED, 'false');
        }

        // Profile completed check
        const isProfileCompleted = await DataController.getItem(
          DataController.IS_PROFILE_COMPLETED,
        );
        isProfileCompleted === 'false'
          ? this.props.navigation.navigate('CreateProfile', {
              [Constants.IS_NEW_USER]: true,
            })
          : null;
        console.log('Profile completed: ', isProfileCompleted);

        this.getRatingResponse();

        // On focusing, check if any payment is pending, if so then, show the dialog.
        DataController.getItem(DataController.PAYMENT_TRANS_DATA)
          .then(value => {
            console.log(TAG, 'Payment Data >> ', value);
            if (value != null) {
              this.paymentModel = JSON.parse(value);
              this.showPaymentDialog();
            } else console.log('Payment Transaction Data not found');
          })
          .catch(err => {
            this.showToast(err);
          });
      },
    );

    this.getVehicleCategory();
    this.getFreeDrivers();

    // Subscribe to FCM Message listener
    // this.unsubscribeFCM = firebase.messaging().onMessage(async message => {
    this.unsubscribeFCM = messaging().onMessage(async message => {
      let notifMessage = message.data.message;
      const title = message.data.title;

      console.log(' HOme >> Got message: ', message.data);

      const data = message.data;
      const type = data.type;
      if (type == 'booking_notification') {
        const message = data.message;

        if (message.includes('Kindly pay')) {
          const messObj = JSON.parse(message);
          notifMessage = messObj.text;

          const paymentModel = {
            [Constants.TRANS_PARAMS.BOOKING_ID]:
              messObj[Constants.TRANS_PARAMS.BOOKING_ID],
            [Constants.TRANS_PARAMS.AMOUNT]:
              messObj[Constants.TRANS_PARAMS.AMOUNT],
            [Constants.FIELDS.CUSTOMER_ID]: await DataController.getItem(
              DataController.CUSTOMER_ID,
            ),
            [Constants.TRANS_PARAMS.ENC_RESP]: '',
            [Constants.TRANS_PARAMS.MESSAGE]:
              messObj[Constants.TRANS_PARAMS.MESSAGE],
            [Constants.TRANS_PARAMS.ORDER_ID]: '',
            [Constants.TRANS_PARAMS.STATUS]: '',
          };
          this.paymentModel = paymentModel;
          await DataController.setItem(
            DataController.PAYMENT_TRANS_DATA,
            JSON.stringify(paymentModel),
          );
          this.showPaymentDialog();
          this.getRatingResponse();
        }
      }

      showNotification(notifMessage, title != null ? title : 'MaalGaadi');

      Alert.alert(data.title, notifMessage, [
        {
          text: 'Ok',
          onPress: () => {
            return;
          },
        },
      ]);
    });

    // Subscribe to FCM token updates
    // this.unsubscribeFCMRefresh = firebase.messaging().onTokenRefresh((token) => {
    this.unsubscribeFCMRefresh = messaging().onTokenRefresh(token => {
      console.log('FCM Token refreshed. Updating...');
      this.updateFCMToken(token);
    });

    this.getRatingResponse();
  }

  componentWillUnmount() {
    this.unsubscribeFCM();
    this.unsubscribeFCMRefresh();
    this.netInfoSub();

    this.eventEmitter.removeAllListeners('PageFinished');
    this.eventEmitter.removeAllListeners('TransFinished');
  }

  // Update FCM token on the server.
  async updateFCMToken(token = '') {
    if (token == '') {
      console.log('No token provided, getting token now...');
      // token = await firebase.messaging().getToken();
      token = await messaging().getToken();
    }
    DataController.setItem(DataController.FCM_TOKEN, token);

    const reqURL =
      Constants.BASE_URL +
      Constants.APP_DOWNLOAD +
      '?' +
      Constants.FIELDS_LOGIN.DEVICE_ID +
      '=' +
      getDeviceId() +
      '&' +
      Constants.FIELDS_LOGIN.FCM_TOKEN +
      '=' +
      token;

    console.log('Request: ', reqURL);

    const request = await fetch(reqURL, {
      method: 'GET',
      headers: {
        key: Constants.KEY,
      },
    });

    await request
      .json()
      .then(value => {
        console.log('FCM update response: ', value);
      })
      .catch(err => {
        console.log(err);
        this.showToast(Constants.UPDATE_CUSTOMER_PROFILE);
      });
  }

  async getRatingResponse() {
    const reqBody = new FormData();
    reqBody.append(
      Constants.FIELDS.CUSTOMER_ID,
      await DataController.getItem(DataController.CUSTOMER_ID),
    );

    console.log('getRatingResponse: Request Body: ', reqBody);

    const request = await fetch(
      Constants.BASE_URL + Constants.GET_LAST_RATING,
      {
        method: 'POST',
        body: reqBody,
        headers: {
          key: Constants.KEY,
        },
      },
    );

    await request
      .json()
      .then(async value => {
        console.log('Rating response Body: ', value);

        if (value.success) {
          this.ratingResponse = value;
          this.showRatingDialog();
        } else {
          console.log(value.message);
        }
      })
      .catch(err => {
        console.log(err);
        this.showToast(err);
      });
  }

  showRatingDialog(visible = true) {
    this.props.navigation.navigate('RatingDialog', {
      [DataController.RATING_RESPONSE]: this.ratingResponse,
    });
  }

  async generateOrderID() {
    const custID = await DataController.getItem(DataController.CUSTOMER_ID);
    let timeStamp = new Date();
    timeStamp = timeStamp.valueOf();

    return custID + timeStamp;
  }

  showPaymentDialog() {
    if (this.state.isPaymentDialogShowing) {
      return;
    } else {
      Alert.alert(
        'Make Payment',
        'Please complete the payment to MaalGaadi driver',
        [
          {
            text: 'PAY ONLINE',
            style: 'default',
            onPress: async () => {
              const orderID = await this.generateOrderID();

              console.log('Completing booking payment, order ID: ', orderID);

              this.props.navigation.navigate('PaymentWebview', {
                [Constants.TRANS_PARAMS.ORDER_ID]: orderID,
                [Constants.TRANS_PARAMS.AMOUNT]: this.paymentModel[
                  Constants.TRANS_PARAMS.AMOUNT
                ],
                [Constants.TRANS_PARAMS.PAY_NOW]: true,
                [Constants.FIELDS.CUSTOMER_ID]: this.paymentModel[
                  Constants.FIELDS.CUSTOMER_ID
                ],
                [Constants.FIELDS.BOOKING_ID]: this.paymentModel[
                  Constants.FIELDS.BOOKING_ID
                ],
                onGoBack: () => {
                  return;
                },
              });
            },
          },
          {
            text: 'COD',
            style: 'cancel',
            onPress: () => {
              console.log('Deleting transaction data.');
              this.setState(prevState => {
                prevState.isPaymentDialogShowing = false;
                return prevState;
              });
              DataController.removeItem(DataController.PAYMENT_TRANS_DATA);
            },
          },
        ],
        {
          onDismiss: () => {
            console.log(TAG, 'showPaymentDialog: onDismiss >> ');
            this.setState(prevState => {
              prevState.isPaymentDialogShowing = false;
              return prevState;
            });
          }
        }
      );
      
      this.setState(prevState => {
        prevState.isPaymentDialogShowing = true;
        return prevState;
      });
    }
  }

  getVehicleCategory = async () => {
    const cityId = 1; // TODO: Remove this line, uncomment next line.
    // const cityId = await DataController.getItem(DataController.CITY_ID)
    const id = await DataController.getItem(DataController.CUSTOMER_ID);

    const reqURL =
      Constants.BASE_URL +
      Constants.VEHICLE_CATEGORY +
      '?' +
      Constants.FIELDS.CUSTOMER_ID +
      '=' +
      id +
      '&' +
      Constants.FIELDS.CITY_ID_USER +
      '=' +
      cityId;

    const request = await fetch(reqURL, {
      method: 'GET',
      headers: {
        key: Constants.KEY,
      },
    });

    await request
      .json()
      .then(async value => {
        console.log('Vehicle Category response: ', value);

        if (!value.success) {
          this.showToast(value.message);
        } else {
          await DataController.setItem(
            DataController.VEHICLE,
            JSON.stringify(value.data),
          );

          this.setState(prevState => {
            prevState.vehiclesList = value.data;
            prevState.selectedVehicle = value.data[0].vehicle_name;
            prevState.selectedVehicleID = value.data[0].id;
            prevState.selectedVehicleIndex = 0;
            return prevState;
          });
        }
      })
      .catch(err => {
        console.log(err);
        this.showToast(Constants.ERROR_GET_DETAILS);
      });
  };

  getFreeDrivers = async () => {
    const reqURL = Constants.BASE_URL + Constants.GET_FREE_DRIVER_LOCATION;

    const request = await fetch(reqURL, {
      method: 'GET',
      headers: {
        key: Constants.KEY,
      },
    });

    await request
      .json()
      .then(value => {
        console.log('Free Drivers response: ', value);

        if (!value.success) {
          this.showToast(value.message);
        } else {
          this.freeDrivers = value.data;
          this.setState(prevState => {
            prevState.selectedVehicleID = value.data[0].vehicle_category_id;
            return prevState;
          });
          this.showFreeDrivOnMap();
          this.getETA();
        }
      })
      .catch(err => {
        console.log(err);
        this.showToast(Constants.ERROR_GET_DETAILS);
      });
  };

  showFreeDrivOnMap() {
    this.setState(prevState => {
      prevState.trackViewChanges = true;
      prevState.freeDrivers = [];
      this.freeDrivers.forEach(value => {
        if (value.vehicle_category_id === prevState.selectedVehicleID)
          prevState.freeDrivers.push(value);
      });
      return prevState;
    });
  }

  async getETA() {
    console.log('Getting ETA...');

    if (this.freeDrivers == null) return;

    let destination = {
      latitude: 0,
      longitude: 0,
    };

    const camera = await this.mapView.getCamera();
    const currentLatLng = camera.center;

    if (this.freeDrivers.length != 0) {
      for (let i = 0; i < this.freeDrivers.length; i++) {
        destination.latitude = this.freeDrivers[i].lat;
        destination.longitude = this.freeDrivers[i].lng;
        this.freeDrivers[i].eta = this.calculateEta(
          getDistance(currentLatLng, destination) / 1000,
        );
      }
    }

    let check = false;
    let etaCovered = 9999;
    let etaUncovered = 9999;

    this.setState(prevState => {
      prevState.vehiclesList.forEach(vehicle => {
        this.freeDrivers.forEach(freeDriver => {
          if (vehicle.id == freeDriver.vehicle_category_id) {
            if (vehicle.covered && freeDriver.covered) {
              if (etaCovered > freeDriver.eta) {
                etaCovered = freeDriver.eta.toFixed(0);
                if (etaCovered <= 1) vehicle.etaCovered = 1;
                else vehicle.etaCovered = etaCovered;
                check = true;
              }
            } else if (!vehicle.covered && !freeDriver.covered) {
              if (etaUncovered > freeDriver.eta) {
                etaUncovered = freeDriver.eta.toFixed(1);
                if (etaUncovered <= 1) vehicle.etaUncovered = 1;
                else vehicle.etaUncovered = etaUncovered;
                check = true;
              }
            }
          }
        });
        etaCovered = 9999;
        etaUncovered = 9999;
      });

      if (check) {
        console.log('Returning ETA...');
        return prevState;
      }
    });
  }

  calculateEta(distanceKm) {
    const peakDistance = 80; // km
    const timePerKm = 4; // min
    const bufferTime = 240; // min
    let returnTime = 0;
    if (distanceKm <= 80) {
      returnTime =
        timePerKm * distanceKm +
        (((distanceKm * 100) / peakDistance) * bufferTime) / 100;
    } else {
      returnTime = timePerKm * distanceKm + bufferTime;
    }
    return returnTime;
  }

  animStart = (inputType, reverse = false) => {
    if (!reverse) {
      if (inputType !== this.state.isActiveInput) {
        Animated.parallel([
          Animated.timing(this.state.translateYAnimDest, {
            toValue: F_TRANS_DEST,
            duration: TRANS_ANIM_DELAY,
            useNativeDriver: true,
          }),

          Animated.timing(this.state.translateYAnimOrig, {
            toValue: F_TRANS_ORIG,
            duration: TRANS_ANIM_DELAY,
            useNativeDriver: true,
          }),

          Animated.timing(this.state.scaleXAnimDest, {
            toValue: inputType === DESTINATION ? 1 : 0.95,
            duration: SCALE_ANIM_DELAY,
            useNativeDriver: true,
          }),

          Animated.timing(this.state.scaleXAnimOrig, {
            toValue: inputType === ORIGIN ? 1 : 0.95,
            duration: SCALE_ANIM_DELAY,
            useNativeDriver: true,
          }),
        ]).start(() => {
          this.setState(prevState => {
            prevState.isActiveInput = inputType;
            return prevState;
          });
          this.animStart(inputType, true);
        });
      }
    } else {
      Animated.parallel([
        Animated.timing(this.state.translateYAnimOrig, {
          toValue: I_TRANS_ORIG,
          duration: TRANS_ANIM_DELAY,
          useNativeDriver: true,
        }),
        Animated.timing(this.state.translateYAnimDest, {
          toValue: I_TRANS_DEST,
          duration: TRANS_ANIM_DELAY,
          useNativeDriver: true,
        }),
      ]).start();
    }
  };

  // On Map Region change listener by any way, ie. by dragging or programmetically.
  mapRegionChangeCompleteListener = region => {
    console.log(region);
    Geocoder.from(region.latitude, region.longitude)
      .then(res => {
        var address = res.results[0].formatted_address;
        this.setState(prevState => {
          region = {
            address: address,
            latitude: region.latitude,
            longitude: region.longitude,
          };

          prevState.isActiveInput === ORIGIN
            ? (prevState.preLoc = region)
            : (prevState.destLoc = region);
          return prevState;
        });
        console.log(
          'Home: ',
          'mapRegionChange: isServiceAvailable>> ',
          isServiceAvailable(region),
        );
        this.setState(prevState => {
          prevState.isServiceAvailable = isServiceAvailable(region);
          return prevState;
        });

        this.getETA();
      })
      .catch(error => console.log(error));
  };

  showDateTimePicker = show => {
    this.dateTimePicker.showToggle(show);
  };

  // To set date time from the DateTimePicker component.
  setDateTime = date => {
    console.log('Home: ', 'setDateTime >> ', date);
    this.setState(prevState => {
      prevState.selectedDateTime = date;
      return prevState;
    });

    this.bookNow(false, date);
  };

  bookNow = async (isBookNow = true, date = new Date()) => {
    console.log(
      'Home: ',
      'isBookNow >> ',
      isBookNow,
      this.state.selectedDateTime,
      date,
    );
    let bookingModel = BookingModel.bookingJSON;
    bookingModel.selected_vehicle_category = this.state.selectedVehicleID;
    bookingModel.selected_vehicle_category_name = this.state.selectedVehicle;
    bookingModel.vehicle = this.state.vehiclesList[
      this.state.selectedVehicleIndex
    ];
    bookingModel.vehicle.isSelected = true;
    bookingModel.vehicle.eta = 0;
    bookingModel.vehicle.etaCovered = 1;
    bookingModel.vehicle.etaCoveredWithLoading = 9999;
    bookingModel.vehicle.etaUncovered = 9999;
    bookingModel.vehicle.etaUncoveredWithLoading = 9999;
    bookingModel.vehicle.extra_km_rate = 0;
    bookingModel.vehicle.extra_time_rate = 0;
    bookingModel.vehicle.fare = 0;
    bookingModel.vehicle.waiting_time_charge = 0;

    const cityId = 1; // TODO: Remove this line, uncomment next line.
    // const cityId = await DataController.getItem(DataController.CITY_ID)
    bookingModel.city_id = cityId;

    const bookingTime = this.formatDate(
      // isBookNow ? new Date() : this.state.selectedDateTime,
      isBookNow ? new Date() : date,
    );
    bookingModel.booking_time = bookingTime;
    // bookingModel.book_later = false;
    bookingModel.book_later = !isBookNow;

    bookingModel.customer_id = await DataController.getItem(
      DataController.CUSTOMER_ID,
    );
    bookingModel.covered = this.state.isCoveredVehicle;

    if (DataController.getItem(DataController.CREDIT_LIM) > 0)
      bookingModel.payment_at_pickup = true;

    let landmarkList = new Array();

    let pickupModel = new LandmarkModel();
    pickupModel.setFavourite(false); // TODO: Decide on the basis of Favourites' list
    pickupModel.setLat(this.state.preLoc.latitude.toString());
    pickupModel.setLng(this.state.preLoc.longitude.toString());
    pickupModel.setLandmark(this.state.preLoc.address);
    pickupModel.setPickup(true);

    // TODO
    // if (pickupLocationModel != null && pickupLocationModel.isFavorite()) {
    //   pickupModel.setMobileNumber(pickupLocationModel.getNumber());
    // }

    landmarkList.push(pickupModel.getModel());
    if (this.state.destLoc !== '') {
      let dropModel = new LandmarkModel();
      dropModel.setFavourite(false); // TODO: Decide on the basis of Favourites' list
      dropModel.setLat(this.state.destLoc.latitude.toString());
      dropModel.setLng(this.state.destLoc.longitude.toString());
      dropModel.setLandmark(this.state.destLoc.address);
      landmarkList.push(dropModel.getModel());
    }

    bookingModel.landmark_list = landmarkList;
    bookingModel.booking_type = BookingModel.BookingType.NORMAL;

    await DataController.setItem(
      DataController.BOOKING_MODEL,
      JSON.stringify(bookingModel),
    );
    console.log('Data Written: ', bookingModel);

    this.props.navigation.navigate('AddBooking', {
      covered: this.state.isCoveredVehicle ? 'Covered' : 'Uncovered',
      origin: this.state.preLoc,
      destination: [this.state.destLoc],
      vehicle: this.state.vehiclesList[this.state.selectedVehicleIndex],
      dateTime: isBookNow ? new Date() : this.state.selectedDateTime,
    });
  };

  stopTrackingViewChanges() {
    this.setState(prevState => {
      prevState.trackViewChanges = false;
      return prevState;
    });
  }

  showPopover(compField, comp) {
    this.setState(prevState => {
      prevState.isVisible = true;
      prevState.fromView = comp;
      prevState.popOverText = Constants[compField];
      prevState.tutCompFieldActive = compField;
      return prevState;
    });
  }

  closePopover() {
    this.setState(prevState => {
      prevState.isVisible = false;
      return prevState;
    });

    DataController.setItem(this.state.tutCompFieldActive, 'true');
  }

  // For Android
  renderHeaderFooter() {
    return (
      <View style={styles.headerfootercont}>
        <View style={[styles.header]}>
          <TouchableHighlight
            style={styles.iconHamMenu}
            underlayColor="rgba(255, 255, 255, 0.05)"
            onPress={() => {
              this.props.navigation.openDrawer();
            }}>
            <Image
              style={{width: 22, height: 22}}
              source={Constants.ICONS.ham_menu}
              tintColor="black"
            />
          </TouchableHighlight>

          <Animated.View
            style={{
              transform: [
                {translateY: this.state.translateYAnimOrig},
                {scaleX: this.state.scaleXAnimOrig},
              ],
              zIndex: this.state.isActiveInput === ORIGIN ? 99 : 1,
            }}>
            <TouchableHighlight
              underlayColor="white"
              style={[
                styles.locationInputsContainer,
                this.state.isActiveInput === ORIGIN
                  ? this.state.activeInput.container
                  : this.state.inactiveInput.container,
              ]}
              onPress={() => {
                requestAnimationFrame(() => {
                  if (this.state.isActiveInput !== ORIGIN) {
                    this.animStart(ORIGIN);

                    if (this.state.preLoc !== '')
                      this.mapView.animateToRegion(
                        {
                          latitude: this.state.preLoc.latitude,
                          longitude: this.state.preLoc.longitude,
                          latitudeDelta: LATITUDE_DELTA,
                          longitudeDelta: LONGITUDE_DELTA,
                        },
                        500,
                      );
                  } else
                    this.props.navigation.navigate('Search', {screen: 'Home'});
                });
              }}>
              <View style={styles.locationInputs}>
                <View
                  style={[
                    styles.destOrigLocationDots,
                    {backgroundColor: 'green'},
                    this.state.isActiveInput === ORIGIN
                      ? this.state.activeInput.icons
                      : this.state.inactiveInput.icons,
                  ]}
                />

                <Text
                  numberOfLines={1}
                  ellipsizeMode="tail"
                  style={[
                    styles.inputs,
                    this.state.isActiveInput === ORIGIN
                      ? this.state.activeInput.text
                      : this.state.inactiveInput.text,
                  ]}>
                  {this.state.preLoc === ''
                    ? 'Pickup location'
                    : this.state.preLoc.address}
                </Text>

                <TouchableOpacity
                  style={{
                    display:
                      this.state.isActiveInput !== ORIGIN ? 'none' : 'flex',
                  }}
                  ref={picFav => {
                    this.pickupFav = picFav;
                  }}
                  onPress={() => {
                    DataController.getItem(DataController.TUT_FAV_LOC)
                      .then(status => {
                        if (status == 'true') {
                          if (
                            this.state.preLoc != '' &&
                            this.state.isActiveInput === ORIGIN
                          )
                            this.setModalVisible(true);
                        } else {
                          this.showPopover(
                            DataController.TUT_FAV_LOC,
                            this.pickupFav,
                          );
                        }
                      })
                      .catch(err => {
                        console.log(err);
                      });
                  }}>
                  <View>
                    <Image
                      source={Constants.ICONS.favourite}
                      style={[
                        styles.iconfav,
                        this.state.isActiveInput === ORIGIN
                          ? this.state.activeInput.icons
                          : this.state.inactiveInput.icons,
                      ]}
                      tintColor="black"
                    />
                  </View>
                </TouchableOpacity>
              </View>
            </TouchableHighlight>
          </Animated.View>

          <Animated.View
            style={{
              transform: [
                {translateY: this.state.translateYAnimDest},
                {scaleX: this.state.scaleXAnimDest},
              ],
              zIndex: this.state.isActiveInput === DESTINATION ? 99 : 1,
            }}>
            <TouchableHighlight
              underlayColor="white"
              style={[
                styles.locationInputsContainer,
                this.state.isActiveInput === DESTINATION
                  ? this.state.activeInput.container
                  : this.state.inactiveInput.container,
                this.state.isActiveInput === DESTINATION
                  ? null
                  : {justifyContent: 'flex-end', paddingTop: 0},
              ]}
              onPress={() => {
                requestAnimationFrame(() => {
                  if (this.state.isActiveInput !== DESTINATION) {
                    this.animStart(DESTINATION);

                    if (this.state.destLoc !== '')
                      this.mapView.animateToRegion(
                        {
                          latitude: this.state.destLoc.latitude,
                          longitude: this.state.destLoc.longitude,
                          latitudeDelta: LATITUDE_DELTA,
                          longitudeDelta: LONGITUDE_DELTA,
                        },
                        500,
                      );
                  } else
                    this.props.navigation.navigate('Search', {screen: 'Home'});
                });
              }}>
              <View style={styles.locationInputs}>
                <View
                  style={[
                    styles.destOrigLocationDots,
                    {backgroundColor: 'red'},
                    this.state.isActiveInput === DESTINATION
                      ? this.state.activeInput.icons
                      : this.state.inactiveInput.icons,
                  ]}
                />

                <Text
                  numberOfLines={1}
                  ellipsizeMode="tail"
                  style={[
                    styles.inputs,
                    this.state.isActiveInput === DESTINATION
                      ? this.state.activeInput.text
                      : this.state.inactiveInput.text,
                  ]}>
                  {this.state.destLoc === ''
                    ? 'Drop location'
                    : this.state.destLoc.address}
                </Text>

                <TouchableOpacity
                  style={{
                    display:
                      this.state.isActiveInput !== DESTINATION
                        ? 'none'
                        : 'flex',
                  }}
                  ref={drFav => {
                    this.dropFav = drFav;
                  }}
                  onPress={() => {
                    DataController.getItem(DataController.TUT_FAV_LOC)
                      .then(status => {
                        if (status == 'true') {
                          if (
                            this.state.destLoc != '' &&
                            this.state.isActiveInput === DESTINATION
                          )
                            this.setModalVisible(true);
                        } else {
                          this.showPopover(
                            DataController.TUT_FAV_LOC,
                            this.dropFav,
                          );
                        }
                      })
                      .catch(err => {
                        console.log(err);
                      });
                  }}>
                  <View>
                    <Image
                      source={Constants.ICONS.favourite}
                      style={[
                        styles.iconfav,
                        this.state.isActiveInput === DESTINATION
                          ? this.state.activeInput.icons
                          : this.state.inactiveInput.icons,
                      ]}
                      tintColor="black"
                    />
                  </View>
                </TouchableOpacity>
              </View>
            </TouchableHighlight>
          </Animated.View>
        </View>

        <View
          style={{flex: 1, alignItems: 'flex-end', justifyContent: 'flex-end'}}>
          <TouchableHighlight
            underlayColor="white"
            style={styles.fab}
            onPress={() => {
              this.checkLocationPermission();
            }}>
            <Image
              source={Constants.ICONS.curr_location}
              style={[
                styles.icon,
                {alignSelf: 'flex-end', tintColor: '#0092FE'},
              ]}
            />
          </TouchableHighlight>
        </View>

        {this.state.isServiceAvailable ? (
          <View style={[styles.footer]}>
            {/* Covered/Uncovered switch is not needed presently and is not displayed */}
            <TouchableHighlight
              ref={covVeh => {
                this.covVehSwitch = covVeh;
              }}
              underlayColor={
                this.state.isCoveredVehicle ? ACCENT : 'transparent'
              }
              style={{
                borderWidth: 2,
                display: 'none',
                borderColor: this.state.isCoveredVehicle ? ACCENT : 'black',
                backgroundColor: this.state.isCoveredVehicle
                  ? ACCENT
                  : 'transparent',
                paddingVertical: 4,
                paddingHorizontal: 10,
                borderRadius: 5,
                opacity: this.state.isCoveredVehicle ? 1 : 0.2,

                // Uncomment below line when showing this switch
                // display: this.state.vehiclesList.length > 0? 'flex' : 'none'
              }}
              onPress={() => {
                DataController.getItem(DataController.TUT_COV_VEH)
                  .then(status => {
                    if (status == 'true') {
                      this.setState(prevState => {
                        prevState.isCoveredVehicle = !prevState.isCoveredVehicle;
                        prevState.vehiclesList[
                          prevState.selectedVehicleIndex
                        ].covered = !prevState.isCoveredVehicle;
                        return prevState;
                      });

                      this.getETA();
                    } else {
                      this.showPopover(
                        DataController.TUT_COV_VEH,
                        this.covVehSwitch,
                      );
                    }
                  })
                  .catch(err => {
                    console.log(err);
                  });
              }}>
              <View
                style={{flexDirection: 'row', justifyContent: 'space-between'}}>
                <Text
                  style={{
                    fontSize: 12,
                    color: this.state.isCoveredVehicle ? 'white' : 'black',
                    fontWeight: '700',
                  }}>
                  Covered Vehicle
                </Text>

                <Image
                  source={Constants.ICONS.tick}
                  style={{
                    width: 15,
                    height: 15,
                    tintColor: this.state.isCoveredVehicle ? 'white' : 'black',
                  }}
                />
              </View>
            </TouchableHighlight>

            <ScrollView
              style={{
                marginVertical: 10,
                display: this.state.vehiclesList.length > 0 ? 'flex' : 'none',
              }}
              horizontal={true}
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={{
                flexDirection: 'row',
                flexGrow: 1,
              }}>
              {this.state.vehiclesList.map((vehicle, index) => {
                return (
                  <TouchableHighlight
                    key={index}
                    underlayColor="white"
                    onPress={() => {
                      this.setState(prevState => {
                        prevState.selectedVehicle = vehicle.vehicle_name;
                        prevState.selectedVehicleID = vehicle.id;
                        prevState.selectedVehicleIndex = index;
                        return prevState;
                      });
                      this.showFreeDrivOnMap();
                    }}
                    style={{
                      alignItems: 'center',
                      paddingHorizontal: 10,
                      flex: 1,
                    }}
                    key={vehicle.vehicle_name}>
                    <View style={{alignItems: 'center'}}>
                      {(this.state.isCoveredVehicle ? (
                        vehicle.etaCovered
                      ) : (
                        vehicle.etaUncovered
                      )) ? (
                        <Text style={{fontSize: 10, marginVertical: 6.5}}>
                          {this.state.isCoveredVehicle
                            ? vehicle.etaCovered >= 60
                              ? (vehicle.etaCovered / 60).toFixed(0) + 'hrs'
                              : vehicle.etaCovered + 'mins'
                            : vehicle.etaUncovered >= 60
                            ? (vehicle.etaUncovered / 60).toFixed(0) + 'hrs'
                            : vehicle.etaUncovered + 'mins'}
                        </Text>
                      ) : (
                        <DotLoader />
                      )}

                      <View
                        style={{
                          backgroundColor:
                            this.state.selectedVehicle === vehicle.vehicle_name
                              ? ACCENT
                              : 'transparent',
                          borderRadius: 100,
                          marginBottom: 5,
                        }}>
                        <Image
                          source={vehicleIcon}
                          style={styles.iconsVehicle}
                        />
                      </View>

                      <Text style={{fontSize: 10, textAlign: 'center'}}>
                        {vehicle.vehicle_name.replace(' ', '\n')}
                      </Text>
                    </View>
                  </TouchableHighlight>
                );
              })}
            </ScrollView>

            <View style={{flexDirection: 'row', height: 45}}>
              <TouchableHighlight
                ref={bookBt => {
                  this.bookNowButton = bookBt;
                }}
                underlayColor={ACCENT_DARK}
                onPress={() => {
                  this.bookNow();
                }}
                style={{
                  backgroundColor: ACCENT,
                  width: '68%',
                  marginRight: '1%',
                  borderRadius: 5,
                  alignItems: 'center',
                  justifyContent: 'center',
                }}>
                <Text style={{color: 'white', fontSize: 15, fontWeight: '700'}}>
                  Book
                </Text>
              </TouchableHighlight>

              <TouchableHighlight
                ref={setDT => {
                  this.setDateTimeButton = setDT;
                }}
                underlayColor={ACCENT_DARK}
                onPress={() => {
                  DataController.getItem(DataController.TUT_SET_DATETIME)
                    .then(status => {
                      if (status == 'true') {
                        this.showDateTimePicker(true, 'date');
                      } else {
                        this.showPopover(
                          DataController.TUT_SET_DATETIME,
                          this.setDateTimeButton,
                        );
                      }
                    })
                    .catch(err => {
                      console.log(err);
                    });
                }}
                style={{
                  backgroundColor: ACCENT,
                  width: '15%',
                  marginRight: '1%',
                  borderRadius: 5,
                  alignItems: 'center',
                  justifyContent: 'center',
                }}>
                <Image style={styles.icon} source={Constants.ICONS.clock} />
              </TouchableHighlight>

              <TouchableHighlight
                ref={qBook => {
                  this.quickBook = qBook;
                }}
                onPress={() => {
                  DataController.getItem(DataController.TUT_Q_BOOK)
                    .then(status => {
                      if (status == 'true') {
                        this.props.navigation.navigate('MyBookings', {
                          quickBook: true,
                        });
                      } else {
                        this.showPopover(
                          DataController.TUT_Q_BOOK,
                          this.quickBook,
                        );
                      }
                    })
                    .catch(err => {
                      console.log(err);
                    });
                }}
                underlayColor={ACCENT_DARK}
                style={{
                  backgroundColor: ACCENT,
                  width: '15%',
                  borderRadius: 5,
                  alignItems: 'center',
                  justifyContent: 'center',
                }}>
                <Image style={styles.icon} source={instantIcon} />
              </TouchableHighlight>
            </View>
          </View>
        ) : (
          <View style={[styles.footer]}>
            <Text
              style={{color: 'red', textAlign: 'center', fontWeight: 'bold'}}>
              Sorry, We don't serve this location yet.
            </Text>
          </View>
        )}
      </View>
    );
  }

  // For iOS
  renderHeader() {
    return (
      <View style={[styles.header, {marginTop: 20}]}>
        <TouchableHighlight
          style={styles.iconHamMenu}
          underlayColor="rgba(255, 255, 255, 0.05)"
          onPress={() => {
            this.props.navigation.openDrawer();
          }}>
          <Image
            style={{width: 22, height: 22}}
            source={Constants.ICONS.ham_menu}
            tintColor="black"
          />
        </TouchableHighlight>

        <Animated.View
          style={{
            transform: [
              {translateY: this.state.translateYAnimOrig},
              {scaleX: this.state.scaleXAnimOrig},
            ],
            zIndex: this.state.isActiveInput === ORIGIN ? 99 : 1,
          }}>
          <TouchableHighlight
            underlayColor="white"
            style={[
              styles.locationInputsContainer,
              this.state.isActiveInput === ORIGIN
                ? this.state.activeInput.container
                : this.state.inactiveInput.container,
            ]}
            onPress={() => {
              requestAnimationFrame(() => {
                if (this.state.isActiveInput !== ORIGIN) {
                  this.animStart(ORIGIN);

                  if (this.state.preLoc !== '')
                    this.mapView.animateToRegion(
                      {
                        latitude: this.state.preLoc.latitude,
                        longitude: this.state.preLoc.longitude,
                        latitudeDelta: LATITUDE_DELTA,
                        longitudeDelta: LONGITUDE_DELTA,
                      },
                      500,
                    );
                } else
                  this.props.navigation.navigate('Search', {screen: 'Home'});
              });
            }}>
            <View style={styles.locationInputs}>
              <View
                style={[
                  styles.destOrigLocationDots,
                  {backgroundColor: 'green'},
                  this.state.isActiveInput === ORIGIN
                    ? this.state.activeInput.icons
                    : this.state.inactiveInput.icons,
                ]}
              />

              <Text
                numberOfLines={1}
                ellipsizeMode="tail"
                style={[
                  styles.inputs,
                  this.state.isActiveInput === ORIGIN
                    ? this.state.activeInput.text
                    : this.state.inactiveInput.text,
                ]}>
                {this.state.preLoc === ''
                  ? 'Pickup location'
                  : this.state.preLoc.address}
              </Text>

              <TouchableOpacity
                style={{
                  display:
                    this.state.isActiveInput !== ORIGIN ? 'none' : 'flex',
                }}
                ref={picFav => {
                  this.pickupFav = picFav;
                }}
                onPress={() => {
                  DataController.getItem(DataController.TUT_FAV_LOC)
                    .then(status => {
                      if (status == 'true') {
                        if (
                          this.state.preLoc != '' &&
                          this.state.isActiveInput === ORIGIN
                        )
                          this.setModalVisible(true);
                      } else {
                        this.showPopover(
                          DataController.TUT_FAV_LOC,
                          this.pickupFav,
                        );
                      }
                    })
                    .catch(err => {
                      console.log(err);
                    });
                }}>
                <View>
                  <Image
                    source={Constants.ICONS.favourite}
                    style={[
                      styles.icon,
                      {tintColor: 'black'},
                      this.state.isActiveInput === ORIGIN
                        ? this.state.activeInput.icons
                        : this.state.inactiveInput.icons,
                    ]}
                  />
                </View>
              </TouchableOpacity>
            </View>
          </TouchableHighlight>
        </Animated.View>

        <Animated.View
          style={{
            transform: [
              {translateY: this.state.translateYAnimDest},
              {scaleX: this.state.scaleXAnimDest},
            ],
            zIndex: this.state.isActiveInput === DESTINATION ? 99 : 1,
          }}>
          <TouchableHighlight
            underlayColor="white"
            style={[
              styles.locationInputsContainer,
              this.state.isActiveInput === DESTINATION
                ? this.state.activeInput.container
                : this.state.inactiveInput.container,
              this.state.isActiveInput === DESTINATION
                ? null
                : {justifyContent: 'flex-end', paddingTop: 0},
            ]}
            onPress={() => {
              requestAnimationFrame(() => {
                if (this.state.isActiveInput !== DESTINATION) {
                  this.animStart(DESTINATION);

                  if (this.state.destLoc !== '')
                    this.mapView.animateToRegion(
                      {
                        latitude: this.state.destLoc.latitude,
                        longitude: this.state.destLoc.longitude,
                        latitudeDelta: LATITUDE_DELTA,
                        longitudeDelta: LONGITUDE_DELTA,
                      },
                      500,
                    );
                } else
                  this.props.navigation.navigate('Search', {screen: 'Home'});
              });
            }}>
            <View style={styles.locationInputs}>
              <View
                style={[
                  styles.destOrigLocationDots,
                  {backgroundColor: 'red'},
                  this.state.isActiveInput === DESTINATION
                    ? this.state.activeInput.icons
                    : this.state.inactiveInput.icons,
                ]}
              />

              <Text
                numberOfLines={1}
                ellipsizeMode="tail"
                style={[
                  styles.inputs,
                  this.state.isActiveInput === DESTINATION
                    ? this.state.activeInput.text
                    : this.state.inactiveInput.text,
                ]}>
                {this.state.destLoc === ''
                  ? 'Drop location'
                  : this.state.destLoc.address}
              </Text>

              <TouchableOpacity
                style={{
                  display:
                    this.state.isActiveInput !== DESTINATION ? 'none' : 'flex',
                }}
                ref={drFav => {
                  this.dropFav = drFav;
                }}
                onPress={() => {
                  DataController.getItem(DataController.TUT_FAV_LOC)
                    .then(status => {
                      if (status == 'true') {
                        if (
                          this.state.destLoc != '' &&
                          this.state.isActiveInput === DESTINATION
                        )
                          this.setModalVisible(true);
                      } else {
                        this.showPopover(
                          DataController.TUT_FAV_LOC,
                          this.dropFav,
                        );
                      }
                    })
                    .catch(err => {
                      console.log(err);
                    });
                }}>
                <View>
                  <Image
                    source={Constants.ICONS.favourite}
                    style={[
                      styles.icon,
                      {tintColor: 'black'},
                      this.state.isActiveInput === DESTINATION
                        ? this.state.activeInput.icons
                        : this.state.inactiveInput.icons,
                    ]}
                    tintColor="black"
                  />
                </View>
              </TouchableOpacity>
            </View>
          </TouchableHighlight>
        </Animated.View>
      </View>
    );
  }

  // For iOS
  renderFooter() {
    return (
      <View style={{position: 'absolute', bottom: 0}}>
        <View
          style={{flex: 1, alignItems: 'flex-end', justifyContent: 'flex-end'}}>
          <TouchableHighlight
            underlayColor="white"
            style={styles.fab}
            onPress={() => {
              this.checkLocationPermission();
            }}>
            <Image
              source={Constants.ICONS.curr_location}
              style={[
                styles.icon,
                {alignSelf: 'flex-end', tintColor: '#0092FE'},
              ]}
            />
          </TouchableHighlight>
        </View>
        <View style={[styles.footer]}>
          {/* Covered/Uncovered switch is not needed presently and is not displayed */}
          <TouchableHighlight
            ref={covVeh => {
              this.covVehSwitch = covVeh;
            }}
            underlayColor={this.state.isCoveredVehicle ? ACCENT : 'transparent'}
            style={{
              borderWidth: 2,
              display: 'none',
              borderColor: this.state.isCoveredVehicle ? ACCENT : 'black',
              backgroundColor: this.state.isCoveredVehicle
                ? ACCENT
                : 'transparent',
              paddingVertical: 4,
              paddingHorizontal: 10,
              borderRadius: 5,
              opacity: this.state.isCoveredVehicle ? 1 : 0.2,

              // Uncomment below line when showing this switch
              // display: this.state.vehiclesList.length > 0? 'flex' : 'none'
            }}
            onPress={() => {
              DataController.getItem(DataController.TUT_COV_VEH)
                .then(status => {
                  if (status == 'true') {
                    this.setState(prevState => {
                      prevState.isCoveredVehicle = !prevState.isCoveredVehicle;
                      prevState.vehiclesList[
                        prevState.selectedVehicleIndex
                      ].covered = !prevState.isCoveredVehicle;
                      return prevState;
                    });
                    this.getETA();
                  } else {
                    this.showPopover(
                      DataController.TUT_COV_VEH,
                      this.covVehSwitch,
                    );
                  }
                })
                .catch(err => {
                  console.log(err);
                });
            }}>
            <View
              style={{flexDirection: 'row', justifyContent: 'space-between'}}>
              <Text
                style={{
                  fontSize: 12,
                  color: this.state.isCoveredVehicle ? 'white' : 'black',
                  fontWeight: '700',
                }}>
                Covered Vehicle
              </Text>

              <Image
                source={Constants.ICONS.tick}
                style={{
                  width: 15,
                  height: 15,
                  tintColor: this.state.isCoveredVehicle ? 'white' : 'black',
                }}
              />
            </View>
          </TouchableHighlight>

          <ScrollView
            style={{
              marginVertical: 10,
              display: this.state.vehiclesList.length > 0 ? 'flex' : 'none',
            }}
            horizontal={true}
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={{
              flexDirection: 'row',
              flexGrow: 1,
            }}>
            {this.state.vehiclesList.map((vehicle, index) => {
              return (
                <TouchableHighlight
                  key={index}
                  underlayColor="white"
                  onPress={() => {
                    this.setState(prevState => {
                      prevState.selectedVehicle = vehicle.vehicle_name;
                      prevState.selectedVehicleID = vehicle.id;
                      prevState.selectedVehicleIndex = index;
                      return prevState;
                    });
                    this.showFreeDrivOnMap();
                  }}
                  style={{alignItems: 'center', paddingHorizontal: 10, flex: 1}}
                  key={vehicle.vehicle_name}>
                  <View style={{alignItems: 'center'}}>
                    {(this.state.isCoveredVehicle ? (
                      vehicle.etaCovered
                    ) : (
                      vehicle.etaUncovered
                    )) ? (
                      <Text style={{fontSize: 10, marginVertical: 6.5}}>
                        {this.state.isCoveredVehicle
                          ? vehicle.etaCovered >= 60
                            ? (vehicle.etaCovered / 60).toFixed(0) + 'hrs'
                            : vehicle.etaCovered + 'mins'
                          : vehicle.etaUncovered >= 60
                          ? (vehicle.etaUncovered / 60).toFixed(0) + 'hrs'
                          : vehicle.etaUncovered + 'mins'}
                      </Text>
                    ) : (
                      <DotLoader />
                    )}

                    <View
                      style={{
                        backgroundColor:
                          this.state.selectedVehicle === vehicle.vehicle_name
                            ? ACCENT
                            : 'transparent',
                        borderRadius: 100,
                        marginBottom: 5,
                      }}>
                      <Image source={vehicleIcon} style={styles.iconsVehicle} />
                    </View>

                    <Text style={{fontSize: 10, textAlign: 'center'}}>
                      {vehicle.vehicle_name.replace(' ', '\n')}
                    </Text>
                  </View>
                </TouchableHighlight>
              );
            })}
          </ScrollView>

          <View style={{flexDirection: 'row', height: 45}}>
            <TouchableHighlight
              ref={bookBt => {
                this.bookNowButton = bookBt;
              }}
              underlayColor={ACCENT_DARK}
              onPress={() => {
                this.bookNow();
              }}
              style={{
                backgroundColor: ACCENT,
                width: '68%',
                marginRight: '1%',
                borderRadius: 5,
                alignItems: 'center',
                justifyContent: 'center',
              }}>
              <Text style={{color: 'white', fontSize: 15, fontWeight: '700'}}>
                Book
              </Text>
            </TouchableHighlight>

            <TouchableHighlight
              ref={setDT => {
                this.setDateTimeButton = setDT;
              }}
              underlayColor={ACCENT_DARK}
              onPress={() => {
                DataController.getItem(DataController.TUT_SET_DATETIME)
                  .then(status => {
                    if (status == 'true') {
                      this.showDateTimePicker(true, 'date');
                    } else {
                      this.showPopover(
                        DataController.TUT_SET_DATETIME,
                        this.setDateTimeButton,
                      );
                    }
                  })
                  .catch(err => {
                    console.log(err);
                  });
              }}
              style={{
                backgroundColor: ACCENT,
                width: '15%',
                marginRight: '1%',
                borderRadius: 5,
                alignItems: 'center',
                justifyContent: 'center',
              }}>
              <Image style={styles.icon} source={Constants.ICONS.clock} />
            </TouchableHighlight>

            <TouchableHighlight
              ref={qBook => {
                this.quickBook = qBook;
              }}
              onPress={() => {
                DataController.getItem(DataController.TUT_Q_BOOK)
                  .then(status => {
                    if (status == 'true') {
                      this.props.navigation.navigate('MyBookings', {
                        quickBook: true,
                      });
                    } else {
                      this.showPopover(
                        DataController.TUT_Q_BOOK,
                        this.quickBook,
                      );
                    }
                  })
                  .catch(err => {
                    console.log(err);
                  });
              }}
              underlayColor={ACCENT_DARK}
              style={{
                backgroundColor: ACCENT,
                width: '15%',
                borderRadius: 5,
                alignItems: 'center',
                justifyContent: 'center',
              }}>
              <Image style={styles.icon} source={instantIcon} />
            </TouchableHighlight>
          </View>
        </View>
      </View>
    );
  }

  showToast(text) {
    this.toast.show(text);
  }

  render() {
    return (
      <View style={{flex: 1}}>
        <StatusBar backgroundColor="white" barStyle="dark-content" />

        <View style={styles.map}>
          <MapView
            rotateEnabled={true}
            scrollEnabled={true}
            zoomEnabled={true}
            zoomTapEnabled={true}
            showsCompass={false}
            showsMyLocationButton={false}
            onRegionChangeComplete={this.mapRegionChangeCompleteListener}
            showsUserLocation={true}
            provider={PROVIDER_DEFAULT}
            style={styles.mapReg}
            initialRegion={{
              latitude: this.state.coordinates.latitude,
              longitude: this.state.coordinates.longitude,
              latitudeDelta: LATITUDE_DELTA,
              longitudeDelta: LONGITUDE_DELTA,
            }}
            ref={c => (this.mapView = c)}>
            {this.state.freeDrivers.map((driver, index) => {
              return (
                <Marker
                  key={index}
                  coordinate={{
                    latitude: parseFloat(driver.lat),
                    longitude: parseFloat(driver.lng),
                  }}
                  tracksViewChanges={this.state.trackViewChanges}>
                  <Image
                    source={driverMarker}
                    style={{width: 50, height: 50}}
                    resizeMode="contain"
                    onLoad={this.stopTrackingViewChanges}
                  />
                </Marker>
              );
            })}
          </MapView>
        </View>

        {/* Renders Header and Footer according to the Platform */}
        {Platform.OS == 'android' ? this.renderHeaderFooter() : null}
        {Platform.OS == 'ios' ? this.renderHeader() : null}
        {Platform.OS == 'ios' ? this.renderFooter() : null}

        {/* Pin on Map */}
        <View
          style={{
            top: '50%',
            marginTop: -35,
            position: 'absolute',
            alignSelf: 'center',
            alignItems: 'center',
            shadowColor: 'black',
            shadowOffset: {height: 2},
            shadowOpacity: 0.2,
            shadowRadius: 2,
          }}>
          <Image
            source={this.state.isActiveInput === ORIGIN ? greenPin : redPin}
            style={{width: 45, height: 45}}
          />
          <View
            style={{
              backgroundColor: 'white',
              borderWidth: 1,
              borderColor: 'rgba(0, 0, 0, 0.2)',
              opacity: 0.8,
              marginTop: 15,
              borderRadius: 50,
            }}>
            <Text
              style={{fontSize: 11, paddingVertical: 5, paddingHorizontal: 15}}>
              {this.state.isActiveInput === ORIGIN ? 'PICK UP' : 'DROP'}
            </Text>
          </View>
        </View>

        {/* Dialog box to save locations. */}
        <Modal
          animationType="fade"
          transparent={true}
          visible={this.state.modalVisible}
          onRequestClose={() => {
            this.setModalVisible(false);
          }}>
          <View
            style={{
              backgroundColor: 'rgba(0, 0, 0, 0.7)',
              height: '100%',
              alignItems: 'center',
              justifyContent: 'center',
            }}>
            <View
              style={{
                backgroundColor: 'white',
                width: '70%',
                paddingHorizontal: 12,
                paddingVertical: 20,
                borderRadius: 3,
                elevation: 10,
              }}>
              <TextInput
                editable={false}
                multiline={true}
                defaultValue={
                  this.state.isActiveInput === ORIGIN
                    ? this.state.preLoc.address
                    : this.state.destLoc.address
                }
                style={styles.dialogInputs}
              />

              <TextInput
                placeholder="Name your favourite place"
                returnKeyType="done"
                style={styles.dialogInputs}
                onChangeText={text => {
                  this.setState(prevState => {
                    prevState.editedName = text;
                    return prevState;
                  });
                }}
              />

              <TextInput
                maxLength={10}
                keyboardType="decimal-pad"
                returnKeyType="done"
                placeholder="Mobile number"
                style={styles.dialogInputs}
                onChangeText={text => {
                  this.setState(prevState => {
                    prevState.editedNumber = text;
                    return prevState;
                  });
                }}
              />

              <View style={{flexDirection: 'row', justifyContent: 'flex-end'}}>
                <TouchableHighlight
                  underlayColor="#E8E8E8"
                  onPress={() => {
                    this.setModalVisible(false);
                  }}
                  style={{
                    padding: 10,
                    borderRadius: 5,
                    marginTop: 10,
                    justifyContent: 'center',
                  }}>
                  <Text style={{color: '#004EC6', fontWeight: '700'}}>
                    {' '}
                    CANCEL{' '}
                  </Text>
                </TouchableHighlight>

                <TouchableHighlight
                  disabled={
                    this.state.editedName == '' || this.state.editedNumber == ''
                  }
                  underlayColor="#E8E8E8"
                  onPress={() => {
                    this.setModalVisible(false, true);
                  }}
                  style={{
                    padding: 5,
                    borderRadius: 5,
                    marginTop: 10,
                    justifyContent: 'center',
                    opacity:
                      this.state.editedName == '' ||
                      this.state.editedNumber == ''
                        ? 0.4
                        : 1,
                  }}>
                  <Text style={{color: '#004EC6', fontWeight: '700'}}>
                    {this.state.isLoading ? 'SAVING...' : 'SAVE'}
                  </Text>
                </TouchableHighlight>
              </View>

              <View
                style={{
                  position: 'absolute',
                  backgroundColor: 'white',
                  opacity: 0.8,
                  top: 0,
                  left: 0,
                  right: 0,
                  bottom: 0,
                  width: this.state.isLoading ? null : 0,
                }}
              />
            </View>
          </View>
        </Modal>

        {/* Date Time picker*/}
        <DateTimePickerComp
          dateTimeSetter={this.setDateTime}
          maximumDate={new Date().setDate(new Date().getDate() + 4)}
          ref={p => (this.dateTimePicker = p)}
        />

        {/* Tutorials popover */}
        <PopOverComp
          isVisible={this.state.isVisible}
          fromView={this.state.fromView}
          closePopover={this.closePopover.bind(this)}
          text={this.state.popOverText}
        />

        {/* Left side strip above map, to Open Navigation Drawer. */}
        <View
          style={{
            height: '100%',
            width: 10,
            opacity: 0,
            position: 'absolute',
            backgroundColor: 'red',
          }}
        />

        {/* Toast Box */}
        <ToastComp ref={t => (this.toast = t)} />
      </View>
    );
  }
}

const styles = StyleSheet.create({
  headerfootercont: {
    flex: 1,
    justifyContent: 'space-between',
    // backgroundColor: 'red'
  },

  map: {
    position: 'absolute',
    height: '100%',
    width: '100%',
    flex: 1,
    alignItems: 'center',
    backgroundColor: 'white',
  },

  mapReg: {
    ...StyleSheet.absoluteFillObject,
  },

  header: {
    backgroundColor: 'transparent',
    marginHorizontal: 20,
    marginTop: 5,
  },

  footer: {
    backgroundColor: 'white',
    padding: 5,
    elevation: 20,
    shadowColor: 'rgb(0, 0, 0)',
    shadowOffset: {width: 0, height: -2},
    shadowOpacity: 0.25,
    shadowRadius: 2,
  },

  inputs: {
    color: '#878787',
    flex: 1,
  },

  icon: {margin: 10, width: 18, height: 18, tintColor: 'white'},
  iconfav: {margin: 10, width: 18, height: 18, tintColor: 'red'},
  iconsVehicle: {
    width: 28,
    height: 28,
  },

  duration: {
    padding: 2,
    fontSize: 25,
    color: 'black',
    fontWeight: 'bold',
  },

  distance: {
    padding: 2,
    fontSize: 25,
    color: 'black',
    opacity: 0.4,
  },

  fab: {
    // My Location button
    backgroundColor: 'white',
    borderRadius: 100,
    padding: 10,
    margin: 10,
    elevation: 4,
    shadowColor: 'rgb(0, 0, 0)',
    shadowOffset: {width: 0, height: 2},
    shadowOpacity: 0.4,
    shadowRadius: 5,
  },

  modes: {
    width: '50%',
    paddingVertical: 3,
  },

  myLocMarker: {
    backgroundColor: '#304FFE',
    borderColor: 'white',
    borderWidth: 2,
    borderRadius: 100,
    color: 'white',
    margin: 3,
  },

  locationInputs: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    width: '100%',
  },

  destOrigLocationDots: {
    elevation: 5,
    borderColor: 'white',
    borderWidth: 2,
    borderRadius: 100,
    marginRight: 10,
  },

  locationInputsContainer: {
    paddingHorizontal: 15,
    paddingVertical: 7,
    borderRadius: 5,
    backgroundColor: 'white',
    alignSelf: 'center',
    height: 50,
  },

  iconHamMenu: {
    marginTop: 10,
    padding: 25,
    width: 25,
    height: 25,
    backgroundColor: 'transparent',
    alignItems: 'center',
    justifyContent: 'center',
  },

  dialogInputs: {
    borderBottomColor: '#CDCDCD',
    borderBottomWidth: 2,
    margin: 5,
    fontSize: 15,
    padding: Platform.OS == 'ios' ? 10 : 0,
  },
});
