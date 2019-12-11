import React, { Component } from 'react';
import {
  StyleSheet,
  TouchableOpacity,
  TouchableHighlight,
  Image,
  View,
  Text,
  ToastAndroid,
  StatusBar,
  Dimensions,
  ScrollView,
  Animated,
  Modal,
  NativeEventEmitter,
  PermissionsAndroid, Alert
} from 'react-native';
import MapView, {PROVIDER_GOOGLE, Marker } from 'react-native-maps';
import Geolocation from 'react-native-geolocation-service';
import Geocoder from 'react-native-geocoding';
import { TextInput } from 'react-native-gesture-handler';
import DateTimePicker from '@react-native-community/datetimepicker';
import NetInfo from "@react-native-community/netinfo";
import {LandmarkModel} from './models/landmark_model'
import DotLoader from './home/components/DotLoader';
import {formatDate, showNotification} from './utils/UtilFunc'
import { PopOverComp } from './utils/PopOverComp';
import messaging from '@react-native-firebase/messaging';

const BookingModel = require('./models/bookings_model')
const Constants = require('./utils/AppConstants')
const DataController = require('./utils/DataStorageController')
const vehicleIcon = require('../assets/vehicle.png')
const instantIcon = require('../assets/instant.png')
const greenPin = require('../assets/pin_green.png')
const redPin = require('../assets/pin_red.png')
const driverMarker = require('../assets/driver.png')

const { width, height } = Dimensions.get('window');
const ASPECT_RATIO = width / height;
const LATITUDE_DELTA = 0.0030;
const LONGITUDE_DELTA = LATITUDE_DELTA * ASPECT_RATIO;
const GOOGLE_MAPS_APIKEY = 'AIzaSyCJYc7hsuiHCwUQWQ0NTk0TW0ne0y43NAE';
const DRIVE = 'DRIVING'
const YOUR_LOCATION = 'Your location'
const CHO_DEST = 'Choose destination'
const DESTINATION = 'destination'
const ORIGIN = 'origin'
const SCALE_ANIM_DELAY = 100
const TRANS_ANIM_DELAY = 50

const I_TRANS_ORIG = 0
const I_TRANS_DEST = -20
const F_TRANS_ORIG = -5
const F_TRANS_DEST = -5

const ACCENT = '#FFCB28' // 255, 203, 40
const ACCENT_DARK = '#F1B800'

export default class Home extends Component {
  constructor(props) {
    super(props)

    Geocoder.init(GOOGLE_MAPS_APIKEY)

    this.requestLocationPermission = this.requestLocationPermission.bind(this)
    this.getCurrentLocation = this.getCurrentLocation.bind(this)
    this.stopTrackingViewChanges = this.stopTrackingViewChanges.bind(this)

    this.mapView = null;
    this.freeDrivers = [];

    this.netInfoSub = NetInfo.addEventListener((state) => {
      ToastAndroid.show(`CONNECTED: ${state.isConnected} \nTYPE: ${state.type}`,
      ToastAndroid.SHORT)

      if(!state.isConnected)
        props.navigation.navigate("NoNetworkModal");
    })

    this.formatDate = formatDate

    this.state = {
      fromView: null,
      popOverText: '',
      tutCompFieldActive: null,
      isVisible: false,

      trackViewChanges: true,
      coordinates: {
        latitude: 0,
        longitude: 0
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
        container:  {
            elevation: 2,
            backgroundColor: '#F7F7F7',
          },
        text: {
          fontSize: 13
        },
        icons: {
          width: 13, height: 13
        }
      },
      activeInput: {
        container: {
            elevation: 5,
            backgroundColor: 'white',
          },
        text: {
          fontSize: 15
        },
        icons: {
          width: 15, height: 15
        }
        
      },

      isActiveInput: ORIGIN,

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

      placeholder: [
        YOUR_LOCATION,
        CHO_DEST
      ]
    }

    this.mapStyleList = [
      {elementType: 'geometry', stylers: [{color: '#242f3e'}]},
      {elementType: 'labels.text.stroke', stylers: [{color: '#242f3e'}]},
      {elementType: 'labels.text.fill', stylers: [{color: '#746855'}]},
      {
        featureType: 'administrative.locality',
        elementType: 'labels.text.fill',
        stylers: [{color: '#d59563'}]
      },
      {
        featureType: 'poi',
        elementType: 'labels.text.fill',
        stylers: [{color: '#d59563'}]
      },
      {
        featureType: 'poi.park',
        elementType: 'geometry',
        stylers: [{color: '#263c3f'}]
      },
      {
        featureType: 'poi.park',
        elementType: 'labels.text.fill',
        stylers: [{color: '#6b9a76'}]
      },
      {
        featureType: 'road',
        elementType: 'geometry',
        stylers: [{color: '#38414e'}]
      },
      {
        featureType: 'road',
        elementType: 'geometry.stroke',
        stylers: [{color: '#212a37'}]
      },
      {
        featureType: 'road',
        elementType: 'labels.text.fill',
        stylers: [{color: '#9ca5b3'}]
      },
      {
        featureType: 'road.highway',
        elementType: 'geometry',
        stylers: [{color: '#746855'}]
      },
      {
        featureType: 'road.highway',
        elementType: 'geometry.stroke',
        stylers: [{color: '#1f2835'}]
      },
      {
        featureType: 'road.highway',
        elementType: 'labels.text.fill',
        stylers: [{color: '#f3d19c'}]
      },
      {
        featureType: 'transit',
        elementType: 'geometry',
        stylers: [{color: '#2f3948'}]
      },
      {
        featureType: 'transit.station',
        elementType: 'labels.text.fill',
        stylers: [{color: '#d59563'}]
      },
      {
        featureType: 'water',
        elementType: 'geometry',
        stylers: [{color: '#17263c'}]
      },
      {
        featureType: 'water',
        elementType: 'labels.text.fill',
        stylers: [{color: '#515c6d'}]
      },
      {
        featureType: 'water',
        elementType: 'labels.text.stroke',
        stylers: [{color: '#17263c'}]
      }
    ]
  }

  setModalVisible = async (visible, save = false) => {
    if(save) {
        await this.addLocation(visible)
    }
    else {
        this.setState(prevState => {
            prevState.modalVisible = visible
            return prevState
        })
    }
  }

  addLocation = async (visible) => {
    this.setState(prevState => {
        prevState.isLoading = true
        return prevState
    })

    const reqBody = new FormData()
    const custId = await DataController.getItem(DataController.CUSTOMER_ID)
    reqBody.append(Constants.FIELDS.CUSTOMER_ID, custId)
    reqBody.append(Constants.FIELDS.ADDRESS, this.state.editedName)
    reqBody.append(Constants.FIELDS.NUMBER, this.state.editedNumber)

    const region = this.state.isActiveInput === ORIGIN? this.state.preLoc : this.state.destLoc
    reqBody.append(Constants.FIELDS.LANDMARK, region.address)
    reqBody.append(Constants.FIELDS.LAT, region.latitude)
    reqBody.append(Constants.FIELDS.LNG, region.longitude)

    console.log('Request: ', reqBody)

    const request = await fetch(Constants.BASE_URL + Constants.ADD_CUSTOMER_FAVORITE_LOCATION, {
        method: 'POST',
        body: reqBody,
        headers: {
            key: "21db33e221e41d37e27094153b8a8a02"
        }
    })
    const response = await request.json().then(async value => {
        console.log("Response: ", value)

        if(value.success) {
            this.setState(prevState => {
                prevState.modalVisible = visible
                
                return prevState
            })
            ToastAndroid.show("Favourite Location Added", ToastAndroid.SHORT);
        }
        else{
            ToastAndroid.show(value.message, ToastAndroid.SHORT);
        }
        
    })
    .catch(err => {
        console.log(err);
        ToastAndroid.show(Constants.ERROR_EDIT_LOC, ToastAndroid.SHORT);
    })

    this.setState(prevState => {
        prevState.isLoading = false
        prevState.modalVisible = visible
        return prevState
    })
  }

  async requestLocationPermission() {
    try {
      const granted = await PermissionsAndroid.request(
        PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION,
        {
          title: 'MapsGo',
          message:
            'MapsGo wants to access your location',
          buttonNeutral: 'Ask Me Later',
          buttonNegative: 'Cancel',
          buttonPositive: 'OK',
        },
      );
      if (granted === PermissionsAndroid.RESULTS.GRANTED) {
        console.log('Location permission granted.');
        Geolocation.getCurrentPosition(
          (position) => {
              console.log(position);
              this.mapView.animateToRegion({
                latitude: position.coords.latitude,
                longitude: position.coords.longitude,
                latitudeDelta: LATITUDE_DELTA,
                longitudeDelta: LONGITUDE_DELTA
              }, 500)
          },
          (error) => {
            console.log(error.code, error.message);
          },
          { enableHighAccuracy: true, timeout: 15000, maximumAge: 10000 }
        );
  
      } else {
        console.log('Location permission denied');
        alert('Allow location access for better working of the application.');
        requestLocationPermission()
      }
    } catch (err) {
      console.log(err);
    }
  }

  getCurrentLocation(input) {
    Geolocation.getCurrentPosition(
      (position) => {
          console.log(position);
          Geocoder.from(position.coords.latitude, position.coords.longitude)
          .then(res => {
            var address = res.results[0].formatted_address;
            console.log(address);

            this.setState(prevState => {
              if(input === ORIGIN) {
                prevState.origin = address
                prevState.preLoc = address
              }
              else {
                prevState.destination = address
                prevState.destLoc = address
              }
                
              return prevState
            })
          })
          .catch(error => console.log(error));
          this.setState((prevState)=> {
            if(input === ORIGIN) 
              prevState.origin = position.coo
          })
      },
      (error) => {
          // See error code charts below.
          console.log(error.code, error.message);
      },
      { enableHighAccuracy: true, timeout: 15000, maximumAge: 10000 }
    );
  }

  async componentDidMount() {
    // Listener to events emitted by Java(PaymentWebviewScreen.java)
    // Page Finished Loading
    const eventEmitter = new NativeEventEmitter();
    eventEmitter.addListener('PageFinished', (event) => {
      console.log("URL: ", event.url)
      ToastAndroid.show("URL: " + event.url, ToastAndroid.SHORT)
    })
    // Transaction finished
    eventEmitter.addListener('TransFinished', (event) => {
      const params = event.transParams
      console.log("Transaction Params: ", params);
      DataController.setItem(DataController.PAYMENT_TRANS_DATA, JSON.stringify(params))
      .then(() => {
        if(params.success) {
          this.props.navigation.navigate({
            routeName: "TransactionSuccess"
          })
        }
        else {
          this.props.navigation.navigate({
            routeName: "TransactionFailed"
          })
        }
      })
   })

    const isProfileCompleted = await DataController.getItem(DataController.IS_PROFILE_COMPLETED)
    isProfileCompleted === "false" ? this.props.navigation.navigate("CreateProfile", {
      [Constants.IS_NEW_USER] : true
    }) 
    : null

    this.requestLocationPermission()
    
    // Will Focus listener
    this.willFocusListener = this.props.navigation.
    addListener('willFocus', () => {
      if(this.props.navigation.state.params){
        this.mapView.animateToRegion({
          latitude: this.props.navigation.getParam('latitude'),
          longitude: this.props.navigation.getParam('longitude'),
          latitudeDelta: LATITUDE_DELTA,
          longitudeDelta: LONGITUDE_DELTA
        }, 500)
      }

      // On focusing, check if any payment is pending, if so then, show the dialog.
      DataController.getItem(DataController.PAYMENT_TRANS_DATA)
      .then(value => {
        if(value != null){
          this.paymentModel = value;
          this.showPaymentDialog();
        }
        else
          ToastAndroid.show("Payment Transaction Data not found", ToastAndroid.SHORT);
      })
      .catch(err => {
        ToastAndroid.show(err, ToastAndroid.SHORT);
      })
    })

    this.getVehicleCategory()
    this.getFreeDrivers()

    // Subscribe to FCM Message listener
    this.unsubscribeFCM = messaging().onMessage(async message => {
      showNotification(message.data.message, "MaalGaadi");
      console.log("Got message: ", message.data);

      const data = message.data;
      const type = data.type;
      if(type == "booking_notification") {
        const title = data.title;
        const message = data.message;
        const messObj = JSON.parse(message);

        if(message.includes("Kindly pay")) {
          const paymentModel = {
            [Constants.TRANS_PARAMS.BOOKING_ID]: messObj[Constants.TRANS_PARAMS.BOOKING_ID],
            [Constants.TRANS_PARAMS.AMOUNT]: messObj[Constants.TRANS_PARAMS.AMOUNT],
            [Constants.FIELDS.CUSTOMER_ID]: await DataController.getItem(DataController.CUSTOMER_ID),
            [Constants.TRANS_PARAMS.ENC_RESP]: '',
            [Constants.TRANS_PARAMS.MESSAGE]: messObj[Constants.TRANS_PARAMS.MESSAGE],
            [Constants.TRANS_PARAMS.ORDER_ID]: '',
            [Constants.TRANS_PARAMS.STATUS]: ''
          }
          this.paymentModel = paymentModel;
          DataController.setItem(DataController.PAYMENT_TRANS_DATA, paymentModel);
          this.showPaymentDialog();
        }
      }

      Alert.alert(data.title, data.message,
        [
          {text: "Ok", onPress: () => {return;}}
        ])
    })
  }

  componentWillUnmount() {
    this.netInfoSub();
    this.unsubscribeFCM();
  }

  showPaymentDialog() {
    Alert.alert("Make Payment", "Please complete the payment to MaalGaadi driver",
    [
      {text: "OK", style: "default", onPress: () => {
        console.log("Completing booking payment..");
        this.props.navigation.navigate("PaymentWebview", {
          [Constants.TRANS_PARAMS.ORDER_ID]: this.paymentModel[Constants.TRANS_PARAMS.ORDER_ID],
          [Constants.TRANS_PARAMS.AMOUNT]: this.paymentModel[Constants.TRANS_PARAMS.AMOUNT],
          [Constants.TRANS_PARAMS.PAY_NOW]: true,
          [Constants.FIELDS.CUSTOMER_ID]: this.paymentModel[Constants.FIELDS.CUSTOMER_ID],
          onGoBack: () => {return;},
        })
      }},
      {
        text: "Ask me later", style: "cancel", onPress: () => {
          console.log("Skipping booking payment until next execution.");
        }
      }
    ]);
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
            key: "21db33e221e41d37e27094153b8a8a02"
        }
    })

    const response = await request.json().then(async value => {
        console.log(value)

        if(!value.success){
            ToastAndroid.show(value.message, ToastAndroid.SHORT);
        }
        else {
          await DataController.setItem(DataController.VEHICLE, JSON.stringify(value.data))
          
          this.setState(prevState => {
            prevState.vehiclesList = value.data
            prevState.selectedVehicle = value.data[0].vehicle_name
            prevState.selectedVehicleID = value.data[0].id
            prevState.selectedVehicleIndex = 0
            return prevState
          })
        }
        
    }).catch(err => {
        console.log(err)
        ToastAndroid.show(Constants.ERROR_GET_DETAILS, ToastAndroid.SHORT);
    })
  }

  getFreeDrivers = async () => {
    const reqURL = Constants.BASE_URL + Constants.GET_FREE_DRIVER_LOCATION

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
          this.freeDrivers = value.data
          this.setState(prevState => {
            prevState.selectedVehicleID = value.data[0].vehicle_category_id
            return prevState
          })
          this.showFreeDrivOnMap()
        }
        
    }).catch(err => {
        console.log(err)
        ToastAndroid.show(Constants.ERROR_GET_DETAILS, ToastAndroid.SHORT);
    })
  }

  showFreeDrivOnMap() {
    this.setState(prevState => {
      prevState.trackViewChanges = true;
      prevState.freeDrivers = []
      this.freeDrivers.forEach((value) => {
        if(value.vehicle_category_id === prevState.selectedVehicleID)
          prevState.freeDrivers.push(value)
      })
      return prevState
    })
  }

  calculateEta(distanceKm) {
    const peakDistance = 80; // km
    const timePerKm = 4; // min
    const bufferTime = 240; // min
    const returnTime = 0;
    if (distanceKm <= 80) {
        returnTime = ((timePerKm * distanceKm) + ((((distanceKm * 100) / peakDistance) * bufferTime) / 100));
    } else {
        returnTime = (timePerKm * distanceKm) + bufferTime;
    }
    return returnTime;
}

  animStart = (inputType, reverse = false) => {
    if(!reverse) {
      if(inputType !== this.state.isActiveInput) {
        Animated.parallel([
          Animated.timing(this.state.translateYAnimDest, {
            toValue: F_TRANS_DEST,
            duration: TRANS_ANIM_DELAY,
            useNativeDriver: true
          }),
  
          Animated.timing(this.state.translateYAnimOrig, {
            toValue: F_TRANS_ORIG,
            duration: TRANS_ANIM_DELAY,
            useNativeDriver: true
          }),

          Animated.timing(this.state.scaleXAnimDest, {
            toValue: inputType === DESTINATION? 1 : 0.95,
            duration: SCALE_ANIM_DELAY,
            useNativeDriver: true
          }),

          Animated.timing(this.state.scaleXAnimOrig, {
            toValue: inputType === ORIGIN? 1 : 0.95,
            duration: SCALE_ANIM_DELAY,
            useNativeDriver: true
          })
        ]).start(() => {
          this.setState(prevState => {
            prevState.isActiveInput = inputType
            return prevState
          })
          this.animStart(inputType, true)
        })
      }
    }
    else {
      Animated.parallel([
        Animated.timing(this.state.translateYAnimOrig, {
          toValue: I_TRANS_ORIG,
          duration: TRANS_ANIM_DELAY,
          useNativeDriver: true
        }),
        Animated.timing(this.state.translateYAnimDest, {
          toValue: I_TRANS_DEST,
          duration: TRANS_ANIM_DELAY,
          useNativeDriver: true
        })
      ]).start();
    }
  };

  mapRegionChangeCompleteListener = region => {
    Geocoder.from(region.latitude, region.longitude)
      .then(res => {
        var address = res.results[0].formatted_address;
        this.setState(prevState => {
          region = {
            address: address,
            latitude: region.latitude,
            longitude: region.longitude
          }

          prevState.isActiveInput === ORIGIN? prevState.preLoc = region : prevState.destLoc = region
          return prevState
        })
      })
      .catch(error => console.log(error));
  }

  showDateTimePicker = (show, mode, date = new Date()) => {
    this.setState(prevState => {
      prevState.showDateTime = show
      prevState.dateTimePickerMode = mode
      if(mode === 'date') {
        prevState.selectedDateTime.setHours(date.getHours())
        prevState.selectedDateTime.setMinutes(date.getMinutes())
      }
      else prevState.selectedDateTime = date
      return prevState
    })

    if(mode === 'date' && !show)  // When mode is 'date' and not 'show'ing the dialog, is when Time Dialog is closed.
      this.bookNow(false)
  }

  bookNow = async (isBookNow = true) => {
    let bookingModel = BookingModel.bookingJSON
    bookingModel.selected_vehicle_category = this.state.selectedVehicleID
    bookingModel.selected_vehicle_category_name = this.state.selectedVehicle
    bookingModel.vehicle = this.state.vehiclesList[this.state.selectedVehicleIndex]
    
    const cityId = 1 // TODO: Remove this line, uncomment next line.
    // const cityId = await DataController.getItem(DataController.CITY_ID)
    bookingModel.city_id = cityId

    const bookingTime = this.formatDate(isBookNow? new Date() : this.state.selectedDateTime)
    bookingModel.booking_time = bookingTime
    bookingModel.book_later = false

    bookingModel.customer_id = await DataController.getItem(DataController.CUSTOMER_ID)
    bookingModel.covered = this.state.isCoveredVehicle

    if(DataController.getItem(DataController.CREDIT_LIM) > 0)
      bookingModel.payment_at_pickup = true;
    
    let landmarkList = new Array()

    let pickupModel = new LandmarkModel()
    pickupModel.setFavourite(false)  // TODO: Decide on the basis of Favourites' list
    pickupModel.setLat(this.state.preLoc.latitude.toString())
    pickupModel.setLng(this.state.preLoc.longitude.toString())
    pickupModel.setLandmark(this.state.preLoc.address)
    pickupModel.setPickup(true)

    // TODO
    // if (pickupLocationModel != null && pickupLocationModel.isFavorite()) {
    //   pickupModel.setMobileNumber(pickupLocationModel.getNumber());
    // }

    landmarkList.push(pickupModel.getModel())
    if(this.state.destLoc !== '') {
      let dropModel = new LandmarkModel()
      dropModel.setFavourite(false)  // TODO: Decide on the basis of Favourites' list
      dropModel.setLat(this.state.destLoc.latitude.toString())
      dropModel.setLng(this.state.destLoc.longitude.toString())
      dropModel.setLandmark(this.state.destLoc.address)
      landmarkList.push(dropModel.getModel())
    }

    bookingModel.landmark_list = landmarkList
    bookingModel.booking_type = BookingModel.BookingType.NORMAL

    await DataController.setItem(DataController.BOOKING_MODEL, JSON.stringify(bookingModel))
    console.log("Data Written: ", bookingModel)

    this.props.navigation.navigate('AddBooking', {
      covered: this.state.isCoveredVehicle? 'Covered' : 'Uncovered',
      origin: this.state.preLoc,
      destination: [this.state.destLoc],
      vehicle: this.state.vehiclesList[this.state.selectedVehicleIndex],
      dateTime: isBookNow? new Date() : this.state.selectedDateTime
    })
  }

  stopTrackingViewChanges() {
    this.setState(prevState => {
      prevState.trackViewChanges = false
      return prevState
    })
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

    DataController.setItem(this.state.tutCompFieldActive, "true")
  }

  render() {
    return(
      <View style={{flex: 1,}}>
        <StatusBar backgroundColor='white' 
        barStyle="dark-content"/>

        <View style={styles.map}>
          <MapView
            showsMyLocationButton={false}
            onRegionChangeComplete={this.mapRegionChangeCompleteListener}
            showsUserLocation={true} 
            // customMapStyle={this.state.mapStyle}
            provider={PROVIDER_GOOGLE}
            style={styles.mapReg}
            initialRegion={{
              latitude: this.state.coordinates.latitude,
              longitude: this.state.coordinates.longitude,
              latitudeDelta: LATITUDE_DELTA,
              longitudeDelta: LONGITUDE_DELTA,
            }}
            ref={c => this.mapView = c}>

              {
                this.state.freeDrivers.map((driver, index) => {
                  return(
                    <Marker key={index} coordinate={{
                      latitude: parseFloat(driver.lat),
                      longitude: parseFloat(driver.lng),
                    }} tracksViewChanges={this.state.trackViewChanges}>
                      <Image source={driverMarker} style={{width: 50, height: 50}} resizeMode="contain"
                      onLoad={this.stopTrackingViewChanges}/>
                    </Marker>
                  )
                })
              }

          </MapView>
        </View>

        <View style={styles.headerfootercont}>
          <View style={[styles.header]}>
            <TouchableHighlight 
            style={styles.iconHamMenu}
            underlayColor='white'
            onPress={() => {
              this.props.navigation.openDrawer()
            }}>
              <View>
                <Image style={{width:22, height:22}}
                source={{
                  uri: 'https://cdn2.iconfinder.com/data/icons/ios-tab-bar/25/Hamburger_Round-512.png'
                }}
                tintColor='black'/>
              </View>
            </TouchableHighlight>
            
            <Animated.View 
            style={{
              transform: [
                {translateY: this.state.translateYAnimOrig},
                {scaleX: this.state.scaleXAnimOrig}
              ], zIndex: this.state.isActiveInput === ORIGIN? 99 : 1}}>
              <TouchableHighlight 
              underlayColor='white'
              style={[styles.locationInputsContainer, 
                this.state.isActiveInput === ORIGIN? 
                this.state.activeInput.container : this.state.inactiveInput.container,]}
                onPress={() => {
                  requestAnimationFrame(() => {
                    if(this.state.isActiveInput !== ORIGIN) {
                      this.animStart(ORIGIN)

                      if (this.state.preLoc !== '')
                        this.mapView.animateToRegion({
                          latitude: this.state.preLoc.latitude,
                          longitude: this.state.preLoc.longitude,
                          latitudeDelta: LATITUDE_DELTA,
                          longitudeDelta: LONGITUDE_DELTA
                        }, 500)
                    }
                    else this.props.navigation.navigate('Search', {screen: 'Home'})
                  })
                }}>
                <View style={styles.locationInputs}>
                  <View style={[styles.destOrigLocationDots, { backgroundColor: 'green'},
                  this.state.isActiveInput === ORIGIN?
                  this.state.activeInput.icons : this.state.inactiveInput.icons]}/>

                  <Text 
                  numberOfLines={1} 
                  ellipsizeMode="tail" 
                  style={[styles.inputs,
                  this.state.isActiveInput === ORIGIN?
                  this.state.activeInput.text : this.state.inactiveInput.text]}> 
                    {this.state.preLoc === '' ? 'Pickup location' : this.state.preLoc.address}
                  </Text>

                  <TouchableOpacity style={{display: this.state.isActiveInput !== ORIGIN? "none" : "flex"}}
                    ref={picFav => {this.pickupFav = picFav}}
                    onPress={() => {
                      DataController.getItem(DataController.TUT_FAV_LOC)
                      .then(status => {
                        if(status == 'true') {
                          if((this.state.preLoc != '') && (this.state.isActiveInput === ORIGIN))
                            this.setModalVisible(true)
                        }
                        else {
                          this.showPopover(DataController.TUT_FAV_LOC, this.pickupFav)
                        }
                      })
                      .catch(err => {console.log(err)})
                    }}>
                    <View>
                      <Image source={{
                        uri: 'https://cdn1.iconfinder.com/data/icons/jumpicon-basic-ui-line-1/32/-_Love-Heart-Romantic-512.png'
                      }}
                      style={[styles.icon,
                        this.state.isActiveInput === ORIGIN?
                        this.state.activeInput.icons : this.state.inactiveInput.icons]}
                      tintColor='black'/>
                    </View>
                  </TouchableOpacity>
                </View>
              </TouchableHighlight>
            </Animated.View>
            
            <Animated.View 
            style={{
              transform: [
                {translateY: this.state.translateYAnimDest},
                {scaleX: this.state.scaleXAnimDest}
              ], zIndex: this.state.isActiveInput === DESTINATION? 99 : 1}}>
              <TouchableHighlight 
                underlayColor='white'
                style={[styles.locationInputsContainer,
                        this.state.isActiveInput === DESTINATION? 
                        this.state.activeInput.container : this.state.inactiveInput.container,
                        this.state.isActiveInput === DESTINATION? null : {justifyContent: "flex-end", paddingTop: 0}]}
                onPress={() => {
                  requestAnimationFrame(() => {
                    if(this.state.isActiveInput !== DESTINATION) {
                      this.animStart(DESTINATION)

                      if (this.state.destLoc !== '')
                        this.mapView.animateToRegion({
                          latitude: this.state.destLoc.latitude,
                          longitude: this.state.destLoc.longitude,
                          latitudeDelta: LATITUDE_DELTA,
                          longitudeDelta: LONGITUDE_DELTA
                        }, 500)
                    }
                    else this.props.navigation.navigate('Search', {screen: 'Home'})
                  })
                }}>
                <View style={styles.locationInputs}>
                    <View style={[styles.destOrigLocationDots, { backgroundColor: 'red'} ,
                    this.state.isActiveInput === DESTINATION?
                      this.state.activeInput.icons : this.state.inactiveInput.icons]}/>

                    <Text numberOfLines={1} ellipsizeMode="tail"
                    style={[styles.inputs, 
                      this.state.isActiveInput === DESTINATION?
                      this.state.activeInput.text : this.state.inactiveInput.text]}>
                      {this.state.destLoc === '' ? 'Drop location' : this.state.destLoc.address}
                    </Text>

                    <TouchableOpacity style={{display: this.state.isActiveInput !== DESTINATION? "none" : "flex"}}
                      ref={drFav => {this.dropFav = drFav}}
                      onPress={() => {
                        DataController.getItem(DataController.TUT_FAV_LOC)
                        .then(status => {
                          if(status == 'true') {
                            if((this.state.destLoc != '') && (this.state.isActiveInput === DESTINATION))
                              this.setModalVisible(true)
                          }
                          else {
                            this.showPopover(DataController.TUT_FAV_LOC, this.dropFav)
                          }
                        })
                        .catch(err => {console.log(err)})
                      }}>
                      <View>
                        <Image source={{
                          uri: 'https://cdn1.iconfinder.com/data/icons/jumpicon-basic-ui-line-1/32/-_Love-Heart-Romantic-512.png'
                        }}
                        style={[styles.icon,
                          this.state.isActiveInput === DESTINATION?
                          this.state.activeInput.icons : this.state.inactiveInput.icons]}
                        tintColor='black'/>
                      </View>
                    </TouchableOpacity>
                  </View>
              </TouchableHighlight>
            </Animated.View>
          </View>

          <View style={{flex:1, alignItems: "flex-end", justifyContent:"flex-end"}}>
            <TouchableHighlight underlayColor='white'
            style={styles.fab} onPress={()=>{
                this.requestLocationPermission()
              }}>
                <Image source={{
                  uri: "https://cdn1.iconfinder.com/data/icons/material-device/22/gps-fixed-512.png"
                }}
                style={[styles.icon, {alignSelf: 'flex-end'}]}
                tintColor='#0092FE'/>
            </TouchableHighlight>
          </View>          

          <View style={[styles.footer]}>  
            <TouchableHighlight
            ref={covVeh => {this.covVehSwitch = covVeh}}
            underlayColor="#E7E7E7"
            style={{
              borderWidth: 2, 
              borderColor: this.state.isCoveredVehicle? ACCENT : 'black',
              backgroundColor: this.state.isCoveredVehicle? ACCENT : 'transparent',
              paddingVertical: 4, paddingHorizontal: 10, borderRadius: 5,
              opacity: this.state.isCoveredVehicle? 1 : 0.2,
              display: this.state.vehiclesList.length > 0? 'flex' : 'none'
            }}
            onPress={() => {
              DataController.getItem(DataController.TUT_COV_VEH)
              .then(status => {
                if(status == 'true') {
                  this.setState(prevState => {
                    prevState.isCoveredVehicle = !prevState.isCoveredVehicle
                    return prevState
                  })
                }
                else {
                  this.showPopover(DataController.TUT_COV_VEH, this.covVehSwitch)
                }
              })
              .catch(err => {console.log(err)})
            }}>

              <View style={{flexDirection: "row",
                            justifyContent:"space-between"}}>
                <Text style={{fontSize: 12, 
                  color: this.state.isCoveredVehicle? 'white' : 'black',
                  fontWeight: "700"}}>
                  Covered Vehicle
                </Text>
                
                <Image source={{uri: 'https://cdn4.iconfinder.com/data/icons/free-ui/64/v-10-512.png'}}
                  style={{width: 15, height: 15,}}
                  tintColor={this.state.isCoveredVehicle? 'white' : 'black'}
                  />
              </View>
            </TouchableHighlight>

            <ScrollView 
            style={{marginVertical: 10, display: this.state.vehiclesList.length > 0? 'flex' : 'none'}}
            horizontal={true} showsHorizontalScrollIndicator={false}
            contentContainerStyle={{
              flexDirection: 'row', flexGrow: 1
            }}>
              {
                this.state.vehiclesList.map((vehicle, index) => {
                  return(
                  <TouchableHighlight key={index} underlayColor='white'
                  onPress={() => {
                    this.setState(prevState => {
                      prevState.selectedVehicle = vehicle.vehicle_name
                      prevState.selectedVehicleID = vehicle.id
                      prevState.selectedVehicleIndex = index
                      return prevState
                    })
                    this.showFreeDrivOnMap()
                  }}
                  style={{alignItems: "center", paddingHorizontal: 10, flex: 1}} key={vehicle.vehicle_name}>
                    <View style={{alignItems: "center"}}>
                      {vehicle.distance > 0?
                        <Text style={{fontSize: 10, height: 20}}>{vehicle.distance} min</Text>
                        :
                        <DotLoader/>}

                      <View style={{backgroundColor: this.state.selectedVehicle === vehicle.vehicle_name? ACCENT: 'transparent',
                                    borderRadius: 100, marginBottom: 5}}>
                        <Image source={vehicleIcon}
                        style={styles.iconsVehicle}/>
                      </View>

                      <Text
                      style={{fontSize: 10, textAlign: "center"}}>{vehicle.vehicle_name.replace(' ', '\n')}</Text>
                    </View>
                  </TouchableHighlight>)
                })
              }
            </ScrollView>
          
            <View style={{flexDirection: 'row', height: 45}}>
              <TouchableHighlight ref={bookBt => {this.bookNowButton = bookBt}}
              underlayColor={ACCENT_DARK}
              onPress={() => {
                this.bookNow()
              }}
              style={{
                backgroundColor: ACCENT, width: '68%', marginRight: '1%',
                borderRadius: 5, alignItems: "center", justifyContent: "center"
              }}>
                <Text style={{color: 'white', fontSize: 15, fontWeight: "700"}}>Book</Text>
              </TouchableHighlight>

              <TouchableHighlight
              ref={setDT => {this.setDateTime = setDT}}
              underlayColor={ACCENT_DARK}
              onPress={() => {
                DataController.getItem(DataController.TUT_SET_DATETIME)
                .then(status => {
                  if(status == 'true') {
                    this.showDateTimePicker(true, 'date')
                  }
                  else {
                    this.showPopover(DataController.TUT_SET_DATETIME, this.setDateTime)
                  }
                })
                .catch(err => {console.log(err)})
              }}
              style={{
                backgroundColor: ACCENT, width: '15%', marginRight: '1%',
                borderRadius: 5, alignItems: "center", justifyContent: "center"
              }}>
                <Image style={styles.icon} source={{uri: 'https://cdn2.iconfinder.com/data/icons/pittogrammi/142/10-512.png'}} tintColor='white'/>
              </TouchableHighlight>

              <TouchableHighlight
              ref={qBook => {this.quickBook = qBook}}
              onPress={() => {
                DataController.getItem(DataController.TUT_Q_BOOK)
                .then(status => {
                  if(status == 'true') {
                    this.props.navigation.navigate("MyBookings", {quickBook: true})
                  }
                  else {
                    this.showPopover(DataController.TUT_Q_BOOK, this.quickBook)
                  }
                })
                .catch(err => {console.log(err)})
                
              }}
              underlayColor={ACCENT_DARK}
              style={{
                backgroundColor: ACCENT, width: '15%', borderRadius: 5, alignItems: "center", justifyContent: "center"
              }}>
                <Image style={styles.icon} source={instantIcon} tintColor='white'/>
              </TouchableHighlight>
            </View>
          </View>
        </View>

        <View style={{top: '50%', bottom: '50%', marginTop: -50, position: 'absolute', 
          alignSelf: "center", }}>
            <Image source={this.state.isActiveInput === ORIGIN? greenPin : redPin}
            style={{width: 40, height: 40,}}/>
        </View>
      
        {/* Dialog box to save locations. */}
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
            <View
            style={{backgroundColor: 'white', width: '80%',
              paddingHorizontal: 12, paddingVertical: 20, borderRadius: 3,
              elevation: 10}}>
              <TextInput editable={false} multiline={true}
              defaultValue={this.state.isActiveInput === ORIGIN? 
                            this.state.preLoc.address :
                            this.state.destLoc.address}
              style={styles.dialogInputs}/>

              <TextInput placeholder="Name your favourite place"
              style={styles.dialogInputs}
              onChangeText={(text) => {
                this.setState(prevState => {
                    prevState.editedName = text
                    return prevState
                })
              }}/>

              <TextInput maxLength={10} keyboardType="decimal-pad"
              placeholder="Mobile number"
              style={styles.dialogInputs}
              onChangeText={(text) => {
                this.setState(prevState => {
                    prevState.editedNumber = text
                    return prevState
                })
              }}/>

              <View style={{flexDirection: 'row', justifyContent: "flex-end"}}>
                <TouchableHighlight 
                  underlayColor='#E8E8E8'
                  onPress={() => {
                    this.setModalVisible(false)
                  }}
                  style={{
                    padding: 10,
                    borderRadius: 5,
                    marginTop:10,
                    justifyContent: "center"}}>
                  <Text style={{color: '#004EC6', fontWeight: "700"}}> CANCEL </Text>
                </TouchableHighlight>

                <TouchableHighlight 
                underlayColor='#E8E8E8'
                onPress={() => {
                  this.setModalVisible(false, true)
                }}
                style={{padding: 5, borderRadius: 5,
                marginTop: 10, justifyContent: "center"}}>
                  <Text style={{color: '#004EC6', fontWeight: "700",}}>
                    {this.state.isLoading? "SAVING..." : "SAVE"}
                  </Text>
                </TouchableHighlight>
              </View>
            
              <View style={{
                  position: 'absolute', backgroundColor: 'white',
                  opacity: 0.8, top: 0, left: 0, right: 0,
                  bottom: this.state.isLoading? 0 : '100%',
              }}/>
            </View>
          </View>
        </Modal>
      
        {/* Date Time picker, shown only when, showDateTime is True. */}
        {this.state.showDateTime &&
        <DateTimePicker
        value={new Date()}
        mode={this.state.dateTimePickerMode}
        minimumDate={new Date()}
        onChange={(event, date) => {
          if(this.state.dateTimePickerMode === 'date' && event.type === 'set')
            this.showDateTimePicker(true, 'time', date)
          else
            this.showDateTimePicker(false, 'date', date)
        }}
        />}

        {/* Tutorials popover */}
        <PopOverComp isVisible={this.state.isVisible} fromView={this.state.fromView}
        closePopover={this.closePopover.bind(this)} text={this.state.popOverText}/>
      
        {/* Left side strip above map, to Open Navigation Drawer. */}
        <View style={{height: '100%', width: 30, opacity: 0, position: 'absolute'}}/>
      </View>
    )
  }
}

const styles = StyleSheet.create({
  headerfootercont: {
    flex: 1,
    justifyContent:"space-between",
  },

  map: {
    position: "absolute",
    height: '100%',
    width: '100%',
    flex: 1,
    alignItems: "center",
    backgroundColor: 'white'
  },

  mapReg: {
    ...StyleSheet.absoluteFillObject,
  },

  header: {
    backgroundColor: 'transparent',
    marginHorizontal: 20,
    marginTop: 20
  },

  footer: {
    backgroundColor: 'white',
    padding: 5,
    elevation: 20
  },

  inputs: {
    color: '#878787',
    flex: 1
  },

  icon: {margin: 10, width:18, height:18, },
  iconsVehicle: {
    width: 28, height: 28,
  },

  duration: {
    padding: 2,
    fontSize: 25,
    color: 'black',
    fontWeight: 'bold'
  },

  distance: {
    padding: 2,
    fontSize: 25,
    color: 'black',
    opacity: 0.4
  },
  fab: {
    backgroundColor: 'white',
    borderRadius: 100,
    padding: 5,
    margin: 10,
    elevation: 4
  },

  modes: {
    width: '50%',
    paddingVertical: 3
  },

  myLocMarker: {
    backgroundColor: '#304FFE',
    borderColor: 'white',
    borderWidth: 2,
    borderRadius: 100,
    color: 'white',
    margin: 3
  },

  locationInputs: {
    flexDirection: 'row',
    justifyContent: "space-between",
    alignItems: "center",
    width: '100%'
  },

  destOrigLocationDots: {
    elevation: 5,
    borderColor: 'white',
    borderWidth: 2,
    borderRadius: 100,
    marginRight: 10
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
    marginBottom: 12, 
    width:25,
    height:25,
  },

  dialogInputs: {
    borderBottomColor: '#CDCDCD',
    borderBottomWidth: 2,
    margin: 5,
    fontSize: 15
  }
});

