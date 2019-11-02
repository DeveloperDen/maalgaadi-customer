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
  Keyboard,
  ScrollView,
  Animated,
  Modal
} from 'react-native';
import MapView, {PROVIDER_GOOGLE } from 'react-native-maps';
import MapViewDirections from 'react-native-maps-directions';
import Geolocation from 'react-native-geolocation-service';
import { PermissionsAndroid } from 'react-native';
import Geocoder from 'react-native-geocoding';
import { TextInput } from 'react-native-gesture-handler';
import DateTimePicker from '@react-native-community/datetimepicker';

const Constants = require('./utils/AppConstants')
const DataController = require('./utils/DataStorageController')
const vehicleIcon = require('../assets/vehicle.png')
const instantIcon = require('../assets/instant.png')
const greenPin = require('../assets/pin_green.png')
const redPin = require('../assets/pin_red.png')

const { width, height } = Dimensions.get('window');
const ASPECT_RATIO = width / height;
const LATITUDE_DELTA = 0.0020;
const LONGITUDE_DELTA = LATITUDE_DELTA * ASPECT_RATIO;
const GOOGLE_MAPS_APIKEY = 'AIzaSyCJYc7hsuiHCwUQWQ0NTk0TW0ne0y43NAE';
const DRIVE = 'DRIVING'
const YOUR_LOCATION = 'Your location'
const CHO_DEST = 'Choose destination'
const DESTINATION = 'destination'
const ORIGIN = 'origin'

const ACCENT = '#FFCB28' // 255, 203, 40
const ACCENT_DARK = '#F1B800'

export default class Home extends Component {
  constructor(props) {
    super(props)

    Geocoder.init(GOOGLE_MAPS_APIKEY)

    this.requestLocationPermission = this.requestLocationPermission.bind(this)
    this.getCurrentLocation = this.getCurrentLocation.bind(this)

    this.mapView = null;
    this.originMarker = null
    this.destMarker = null
    this.myLocMarker = null

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

    this.state = {
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

      marginAnimSideOrig: new Animated.Value(0),
      marginAnimSideDest: new Animated.Value(10),
      marginTopAnimOrig: new Animated.Value(0),
      marginTopAnimDest: new Animated.Value(-20),

      selectedVehicle: this.vehiclesList[0].name,

      coordinates:{
          latitude: 0,
          longitude: 0,
        },

      preLoc: '',
      destLoc: '',

      duration: '',
      distance: '',

      display: 'flex',
      statusHidden: false,

      fullscreenButtonIcon: 'https://cdn1.iconfinder.com/data/icons/material-core/14/fullscreen-512.png',
      nightModeIcon: 'https://cdn2.iconfinder.com/data/icons/weather-74/24/weather-15-512.png',
      mapStyle: [],

      origin: '',
      destination: '',
      strokeColor: '#040B27',

      keyBoardActive: false,

      modeOfTrans: DRIVE,

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

  setModalVisible(visible) {
    this.setState(prevState => {
      prevState.modalVisible = visible
      return prevState
    });
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
              this.setState((prevState) => {
                prevState.coordinates.latitude = position.coords.latitude
                prevState.coordinates.longitude = position.coords.longitude

                return prevState
              })

              this.mapView.animateToRegion({
                latitude: this.state.coordinates.latitude,
                longitude: this.state.coordinates.longitude,
                latitudeDelta: LATITUDE_DELTA,
                longitudeDelta: LONGITUDE_DELTA
              }, 500)
          },
          (error) => {
              // See error code charts below.
              console.log(error.code, error.message);
          },
          { enableHighAccuracy: true, timeout: 15000, maximumAge: 10000 }
        );
  
      } else {
        console.log('Location permission denied');
        alert('Allow location access for better working of the application.');
        await requestLocationPermission()
      }
    } catch (err) {
      console.warn(err);
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
          .catch(error => console.warn(error));
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
    const isProfileCompleted = await DataController.getItem(DataController.IS_PROFILE_COMPLETED)
    isProfileCompleted === "false" ? this.props.navigation.navigate("CreateProfile", {
      [Constants.IS_NEW_USER] : true
    }) 
    : null

    await this.requestLocationPermission()
    this.keyboardDidShowListener = Keyboard.addListener('keyboardDidShow', this.keyboardDidShow);
    this.keyboardDidHideListener = Keyboard.addListener('keyboardDidHide', this.keyboardDidHide);
    
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
        
    })
  }

  animStart = (inputType, reverse = false) => {
    if(!reverse) {
      if(inputType !== this.state.isActiveInput) {
        Animated.parallel([
          Animated.timing(this.state.marginTopAnimDest, {
            toValue: 0,
            duration: 200
          }),
  
          Animated.timing(this.state.marginTopAnimOrig, {
            toValue: -10,
            duration: 200
          }),

          Animated.timing(this.state.marginAnimSideDest, {
            toValue: inputType === DESTINATION? 0 : 10,
            duration: 200
          }),

          Animated.timing(this.state.marginAnimSideOrig, {
            toValue: inputType === ORIGIN? 0 : 10,
            duration: 200
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
        Animated.timing(this.state.marginTopAnimOrig, {
          toValue: 0,
          duration: 200,
        }),
        Animated.timing(this.state.marginTopAnimDest, {
          toValue: -20,
          duration: 200
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
      .catch(error => console.warn(error));
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
            customMapStyle={this.state.mapStyle}
            provider={PROVIDER_GOOGLE}
            style={styles.mapReg}
            initialRegion={{
              latitude: this.state.coordinates.latitude,
              longitude: this.state.coordinates.longitude,
              latitudeDelta: LATITUDE_DELTA,
              longitudeDelta: LONGITUDE_DELTA,
            }}
            ref={c => this.mapView = c}>
    
              <MapViewDirections
                origin={this.state.origin}
                destination={this.state.destination}
                apikey={GOOGLE_MAPS_APIKEY}
                strokeWidth={3}
                strokeColor={this.state.strokeColor}
                optimizeWaypoints={true}
                mode={this.state.modeOfTrans}
                onStart={(params) => {
                  console.log(`Started routing between "${params.origin}" and "${params.destination}"`);
                }}
                onReady={result => {
                  console.log(`Distance: ${result.distance} km`)
                  console.log(`Duration: ${result.duration} min.`)

                  this.originMarker.animateMarkerToCoordinate({
                    latitude: result.coordinates[0].latitude,
                    longitude: result.coordinates[0].longitude,
                    latitudeDelta: LATITUDE_DELTA,
                    longitudeDelta: LONGITUDE_DELTA
                  }, 2)
    
                  this.destMarker.animateMarkerToCoordinate({
                    latitude: result.coordinates[result.coordinates.length - 1].latitude,
                    longitude: result.coordinates[result.coordinates.length - 1].longitude,
                    latitudeDelta: LATITUDE_DELTA,
                    longitudeDelta: LONGITUDE_DELTA
                  }, 2)

                  this.setState((prevState) => {
                    let totalDuration = parseInt(Math.ceil(parseFloat(result.duration)))
                    let durInHours = parseInt(Math.ceil(parseFloat(totalDuration / 60)))
                    let durInMins = parseInt(Math.ceil(parseFloat(totalDuration % 60)))
                    prevState.duration = durInMins === 0? durInHours + ' hours' : 
                                                          durInHours + ' hours ' + durInMins + ' mins'
                    prevState.distance = "(" + parseInt(Math.ceil(parseFloat(result.distance))) + " km)"

                    return prevState
                  })
                  
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
            
            <Animated.View style={{marginTop: this.state.marginTopAnimOrig, 
                                  marginHorizontal: this.state.marginAnimSideOrig}}>
              <TouchableHighlight 
              underlayColor='white'
              style={[styles.locationInputsContainer, 
                this.state.isActiveInput === ORIGIN? 
                this.state.activeInput.container : this.state.inactiveInput.container,
                this.state.isActiveInput === ORIGIN? null : {paddingTop: 0}]}
                onPress={() => {
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

                  <TouchableOpacity
                    onPress={() => {
                      if(this.state.preLoc != '') this.setModalVisible(true)
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
            
            <Animated.View style={{marginTop: this.state.marginTopAnimDest, 
                                  marginHorizontal: this.state.marginAnimSideDest}}>
              <TouchableHighlight 
                underlayColor='white'
                style={[styles.locationInputsContainer,
                        this.state.isActiveInput === DESTINATION? 
                        this.state.activeInput.container : this.state.inactiveInput.container,
                        this.state.isActiveInput === DESTINATION? null : {justifyContent: "flex-end", paddingVertical: 0}]}
                onPress={() => {
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
                }}>
                <View style={styles.locationInputs}>
                    <View style={[styles.destOrigLocationDots, { backgroundColor: 'red'} ,
                    this.state.isActiveInput === DESTINATION?
                      this.state.activeInput.icons : this.state.inactiveInput.icons]}/>

                    <Text numberOfLines={1} ellipsizeMode="tail"
                    style={[styles.inputs, 
                      this.state.isActiveInput === DESTINATION?
                      this.state.activeInput.text : this.state.inactiveInput.text]}
                    // onFocus={() => {
                    //   this.props.navigation.navigate('Search', {type: DESTINATION})
                    //   this.setState({
                    //     preLocOp: 0.2,
                    //     destLocOp: 1
                    //   })
                    // }}
                    
                    // onSubmitEditing={() => {
                    //   if(this.state.destLoc != '' && this.state.placeholder[0] === YOUR_LOCATION) {
                    //     ToastAndroid.show('Getting the route...', ToastAndroid.SHORT)
                    //     this.getCurrentLocation(ORIGIN)
                    //     this.setState((prevState) => {
                    //       prevState.destination = prevState.destLoc

                    //       return prevState
                    //     })
                    //   }
                    //   else if(this.state.preLoc != '' && this.state.placeholder[1] === YOUR_LOCATION) {
                    //     ToastAndroid.show('Getting the route...', ToastAndroid.SHORT)
                    //     this.getCurrentLocation(DESTINATION)
                    //     this.setState((prevState) => {
                    //       prevState.origin = prevState.preLoc
                    //       return prevState
                    //     })
                    //   }
                    // }}
                    >
                      {this.state.destLoc === '' ? 'Drop location' : this.state.destLoc.address}
                    </Text>

                    <TouchableOpacity
                      onPress={() => {
                        if(this.state.destLoc != '') this.setModalVisible(true)
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
            underlayColor="#E7E7E7"
            style={{
              borderWidth: 2, 
              borderColor: this.state.isCoveredVehicle? ACCENT : 'black',
              backgroundColor: this.state.isCoveredVehicle? ACCENT : 'transparent',
              paddingVertical: 4, paddingHorizontal: 10, borderRadius: 5,
              opacity: this.state.isCoveredVehicle? 1 : 0.2
            }}
            onPress={() => {
              this.setState(prevState => {
                prevState.isCoveredVehicle = !prevState.isCoveredVehicle
                return prevState
              })
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
            style={{marginVertical: 10}}
            horizontal={true} showsHorizontalScrollIndicator={false}
            contentContainerStyle={{flexDirection: 'row', justifyContent: "space-between"}}>
              {
                this.vehiclesList.map((vehicle) => {
                  return(
                  <TouchableHighlight underlayColor='white'
                  onPress={() => {
                    this.setState(prevState => {
                      prevState.selectedVehicle = vehicle.name
                      return prevState
                    })
                  }}
                  style={{alignItems: "center", paddingHorizontal: 10,}} key={vehicle.name}>
                    <View style={{alignItems: "center"}}>
                      {vehicle.distance > 0?
                        <Text style={{fontSize: 10, height: 20}}>{vehicle.distance} min</Text>
                        :
                        <Image source={{uri: 'https://cdn3.iconfinder.com/data/icons/virtual-notebook/128/button_switch-512.png'}}
                      style={{width: 20, height: 20}}
                      tintColor='#B0B0B0'/>}

                      <View style={{backgroundColor: this.state.selectedVehicle === vehicle.name? ACCENT: 'transparent',
                                    borderRadius: 100, marginBottom: 5}}>
                        <Image source={vehicle.img}
                        style={styles.iconsVehicle}/>
                      </View>

                      <Text
                      style={{fontSize: 10, textAlign: "center"}}>{vehicle.name.replace(' ', '\n')}</Text>
                    </View>
                  </TouchableHighlight>)
                })
              }
            </ScrollView>
          
            <View style={{flexDirection: 'row', height: 45}}>
              <TouchableHighlight
              underlayColor={ACCENT_DARK}
              onPress={() => {
                this.props.navigation.navigate('AddBooking', {
                  covered: this.state.isCoveredVehicle? 'Covered' : 'Uncovered',
                  origin: this.state.preLoc === ''? '': this.state.preLoc.address,
                  destination: this.state.destLoc === ''? '': this.state.destLoc.address,
                  vehicle: this.state.selectedVehicle,
                  dateTime: this.state.selectedDateTime
                })
              }}
              style={{
                backgroundColor: ACCENT, width: '68%', marginRight: '1%',
                borderRadius: 5, alignItems: "center", justifyContent: "center"
              }}>
                <Text style={{color: 'white', fontSize: 15, fontWeight: "700"}}>Book</Text>
              </TouchableHighlight>

              <TouchableHighlight 
              underlayColor={ACCENT_DARK}
              onPress={() => {
                this.showDateTimePicker(true, 'date')
              }}
              style={{
                backgroundColor: ACCENT, width: '15%', marginRight: '1%',
                borderRadius: 5, alignItems: "center", justifyContent: "center"
              }}>
                <Image style={styles.icon} source={{uri: 'https://cdn2.iconfinder.com/data/icons/pittogrammi/142/10-512.png'}} tintColor='white'/>
              </TouchableHighlight>

              <TouchableHighlight
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
          <View style={{
            backgroundColor: 'rgba(0, 0, 0, 0.7)',
            height: '100%',
            alignItems: "center",
            justifyContent: 'center'
            }}>
            <View style={{backgroundColor: 'white', width: '80%',
              paddingHorizontal: 12, paddingVertical: 20, borderRadius: 3,
              elevation: 10}}>
              <TextInput editable={false} multiline={true}
              defaultValue={this.state.isActiveInput === ORIGIN? 
                            this.state.preLoc.address :
                            this.state.destLoc.address}
              style={styles.dialogInputs}/>

              <TextInput placeholder="Name your favourite place"
              style={styles.dialogInputs}/>

              <TextInput placeholder="Mobile number"
              style={styles.dialogInputs}/>

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
                  this.setModalVisible(false)
                }}
                style={{padding: 5, borderRadius: 5,
                marginTop: 10, justifyContent: "center"}}>
                  <Text style={{color: '#004EC6', fontWeight: "700",}}> SAVE </Text>
                </TouchableHighlight>
              </View>
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

