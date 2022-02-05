import React, {Component} from 'react';
import {
  StyleSheet,
  View,
  Text,
  TouchableHighlight,
  Image,
  Animated,
  Switch,
  TextInput,
  TouchableOpacity,
  Modal,
} from 'react-native';
import DateTimePickerComp from '../utils/DateTimePickerComp';
import {LandmarkModel} from '../models/landmark_model';
import {formatDate} from './../utils/UtilFunc';
import {BookingEventType} from '../models/bookings_model';
import {PopOverComp} from '../utils/PopOverComp';
import ToastComp from '../utils/ToastComp';
import {getUniqueNumber} from './../utils/UtilFunc';
import {AirbnbRating} from 'react-native-ratings';
import {ScrollView} from 'react-navigation';

const DataController = require('../utils/DataStorageController');
const Constants = require('../utils/AppConstants');
const BookingModel = require('../models/bookings_model');
const vehicleIcon = require('../../assets/vehicle.png');

const ACCENT = '#FFCB28'; // 255, 203, 40
const ACCENT_DARK = '#F1B800';
const DEF_GOODS = 'Select Goods Type';
const TAG = 'AddBooking: ';

export default class AddBooking extends Component {
  static navigationOptions = ({navigation}) => {
    return {
      headerTitle: navigation.getParam('title', 'Add Booking'),
      headerRight: (
        <TouchableHighlight
          onPress={() => {
            navigation.navigate('RateCard', {
              vehicle: navigation.getParam('vehicle'),
            });
          }}
          underlayColor="white">
          <Image
            source={Constants.ICONS.info}
            tintColor="black"
            style={{width: 22, height: 22, marginEnd: 22}}
          />
        </TouchableHighlight>
      ),
    };
  };

  constructor(props) {
    super(props);

    this.months = [
      'Jan',
      'Feb',
      'Mar',
      'Apr',
      'May',
      'Jun',
      'Jul',
      'Aug',
      'Sep',
      'Oct',
      'Nov',
      'Dec',
    ];
    this.formatDate = formatDate;

    this.state = {
      remark: '',
      favExcDialogMessage: '',
      noFavDrivModalVisible: false,
      fromView: null,
      popOverText: '',
      tutCompFieldActive: null,
      isVisible: false,

      goodsType: DEF_GOODS,
      goodsId: 0,
      physicalPODCharge: 0,
      number: '',
      scrollY: new Animated.Value(0),
      origin: '',
      locations: [],
      isUnLoadingSelected: false,
      isLoadingSelected: false,
      isPhysicalSelected: false,
      excDriverSelected: false,
      favDriverSelected: false,
      showDateTime: false,
      dateTimePickerMode: 'date',
      selectedDateTime: props.navigation.getParam('dateTime'),

      pickupEnabled: true,
      favDrivEnabled: true,
      excDrivEnabled: true,
      loadEnabled: true,
      unloadEnabled: true,
      dateTouchableEnabled: true,
      mobNumEnabled: true,
      goodsTypeEnabled: true,
      podEnabled: true,
      vehicleEnabled: true,
      dropPointsEnabled: true,
    };

    this.bookingModel = '';
    this.favDrivers = [];
    this.excDrivers = [];
    this.favExcDrivList = [];
  }

  async componentDidMount() {
    this.selectedVehicleId = this.props.navigation.getParam('vehicle').id;

    const goodsType = await DataController.getItem(DataController.GOODS_NAME);
    const goodsId = await DataController.getItem(DataController.GOODS_ID);

    const num = await DataController.getItem(DataController.CUSTOMER_MOBILE);
    this.bookingModel = JSON.parse(
      await DataController.getItem(DataController.BOOKING_MODEL),
    );
    console.log('AddBooking: ', 'componentDidMount >> ', this.bookingModel);
    this.setState(prevState => {
      prevState.favDriverSelected = this.bookingModel.allot_to_fav_driver;
      prevState.excDriverSelected = this.bookingModel.allot_to_exclu_driver;
      prevState.goodsType = goodsType;
      prevState.goodsId = goodsId;
      prevState.number = num;
      prevState.remark = this.bookingModel.remark;
      prevState.physicalPODCharge = this.bookingModel.vehicle.pod_charge;
      prevState.origin = this.props.navigation.getParam('origin');
      prevState.locations =
        this.props.navigation.getParam('destination') !== ''
          ? this.props.navigation.getParam('destination')
          : [];
      return prevState;
    });

    this.bookingModel.booking_event_type == BookingEventType.EDIT
      ? this.setupFieldsForEdit()
      : null;
    if (this.bookingModel.booking_event_type == BookingEventType.EDIT) {
      this.bookingModel.book_later = false;
      this.bookingModel.booking_estimate = '';
    }

    this.getFavDrivers();
  }

  getFavDrivers = async () => {
    const customerId = await DataController.getItem(DataController.CUSTOMER_ID);

    const reqURL =
      Constants.BASE_URL +
      Constants.GET_ACTIVE_DRIVER_LIST +
      '?' +
      Constants.FIELDS.CUSTOMER_ID +
      '=' +
      customerId;

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
        console.log(value);

        if (!value.success) {
          this.showToast(value.message);
        } else {
          this.favExcDrivList = value.data;
          if (value.data.length != 0) {
            value.data.forEach((val, i, arr) => {
              if (
                this.props.navigation.getParam('vehicle').id == val.vehicle_id
              )
                val.status_exclusive
                  ? this.excDrivers.push(val)
                  : this.favDrivers.push(val);
            });

            this.setState(prevState => {
              prevState.favDriverSelected =
                this.favDrivers.length > 0
                  ? prevState.favDriverSelected
                  : false;
              prevState.excDriverSelected =
                this.excDrivers.length > 0
                  ? prevState.excDriverSelected
                  : false;
              return prevState;
            });
          }
        }
      })
      .catch(err => {
        console.log(err);
        this.showToast(Constants.ERROR_GET_FAV_DRIV);
      });
  };

  showToast(message) {
    this.toast.show(message);
  }

  setModalVisible(show, excDriv = false) {
    this.setState(prevState => {
      prevState.noFavDrivModalVisible = show;
      prevState.favExcDialogMessage = excDriv
        ? Constants.NO_EXC_DRIV
        : Constants.NO_FAV_DRIV;

      return prevState;
    });
  }

  setupFieldsForEdit() {
    this.setState(prevState => {
      prevState.favDrivEnabled = this.bookingModel.is_fav_driver_edit;
      prevState.excDrivEnabled = this.bookingModel.is_exc_driver_edit;
      prevState.loadEnabled = this.bookingModel.loading_edit;
      prevState.unloadEnabled = this.bookingModel.unloading_edit;
      prevState.dateTouchableEnabled = this.bookingModel.schedule_time_edit;
      prevState.mobNumEnabled = this.bookingModel.is_contact_edit;
      prevState.goodsTypeEnabled = this.bookingModel.is_goods_type_edit;
      prevState.podEnabled = this.bookingModel.pod_edit;
      prevState.pickupEnabled = this.bookingModel.pickup_address_edit;
      prevState.vehicleEnabled = this.bookingModel.is_vehicle_edit;
      prevState.dropPointsEnabled = this.bookingModel.drop_address_edit;
      return prevState;
    });
  }

  showDateTimePicker = show => {
    this.dateTimePicker.showToggle(show);
  };

  // To set date time from the DateTimePicker component.
  setDateTime = date => {
    this.setState(prevState => {
      prevState.selectedDateTime = date;
      return prevState;
    });
    this.bookingModel.book_later = true;
  };

  setVehicle = vehicle => {
    this.selectedVehicleId = vehicle.id;
    this.props.navigation.setParams({
      vehicle: vehicle,
    });

    this.updateFavExcDrivList();
  };

  updateFavExcDrivList() {
    this.excDrivers = [];
    this.favDrivers = [];

    if (this.favExcDrivList.length != 0) {
      this.favExcDrivList.forEach((val, i, arr) => {
        console.log(this.selectedVehicleId, val.vehicle_id);
        if (this.selectedVehicleId == val.vehicle_id) {
          val.status_exclusive
            ? this.excDrivers.push(val)
            : this.favDrivers.push(val);
        }
      });

      this.setState(prevState => {
        prevState.favDriverSelected =
          this.favDrivers.length > 0 ? prevState.favDriverSelected : false;
        prevState.excDriverSelected =
          this.excDrivers.length > 0 ? prevState.excDriverSelected : false;
        return prevState;
      });
    }
  }

  setGoodsType = goods => {
    this.setState(prevState => {
      prevState.goodsType = goods.goods_name;
      prevState.goodsId = goods.id;
      return prevState;
    });
  };

  setOrigin = address => {
    this.setState(prevState => {
      prevState.origin = address;
      return prevState;
    });
  };

  setDestination = (address, index) => {
    console.log('Setting destination at index ', index);
    this.setState(prevState => {
      prevState.locations[index] = address;
      return prevState;
    });
    console.log('Locations: ', this.state.locations);
  };

  estimateFare = async () => {
    let isNumberThere = true;
    this.state.locations.forEach(loc => {
      if (loc.number == undefined || loc.number.length === 0) {
        isNumberThere = false;
        // this.toast.show("Please complete the details to get fare estimation");
      }
    });
    if (this.isValidModel(this.bookingModel) && isNumberThere) {
      this.bookingModel.remark = this.state.remark;
      this.bookingModel.loading = this.state.isLoadingSelected;
      this.bookingModel.unloading = this.state.isUnLoadingSelected;
      this.bookingModel.physical_pod = this.state.isPhysicalSelected;
      this.bookingModel.goods_id = this.state.goodsId;
      this.bookingModel.goods_type = this.state.goodsType;
      this.bookingModel.allot_to_fav_driver = this.state.favDriverSelected;
      this.bookingModel.allot_to_exclu_driver = this.state.excDriverSelected;

      const selectedVehicle = this.props.navigation.getParam('vehicle');
      this.bookingModel.selected_vehicle_category = selectedVehicle.id;
      this.bookingModel.selected_vehicle_category_name =
        selectedVehicle.vehicle_name;
      this.bookingModel.vehicle = selectedVehicle;

      const bookingTime = this.formatDate(
        !this.bookingModel.book_later
          ? new Date()
          : this.state.selectedDateTime,
      );
      this.bookingModel.booking_time = bookingTime;

      this.bookingModel.landmark_list = this.bookingModel.landmark_list.slice(
        0,
        1,
      );
      let list = this.bookingModel.landmark_list;

      list[0].landmark = this.state.origin.address;
      list[0].latitude = this.state.origin.latitude;
      list[0].longitude = this.state.origin.longitude;
      list[0].is_pickup = true;
      list[0].is_favorite = false;
      list[0].is_footer = false;
      list[0].is_filled = true;
      list[0].mobile_number = this.state.number;

      this.state.locations.forEach(loc => {
        let dropModel = new LandmarkModel();
        dropModel.setFavourite(false); // TODO: Decide on the basis of Favourites' list
        dropModel.setLat(loc.latitude);
        dropModel.setLng(loc.longitude);
        dropModel.setLandmark(loc.address);
        dropModel.setNumber(loc.number);
        list.push(dropModel.getModel());
      });

      this.bookingModel.number_of_drop_points = list.length - 1;

      await DataController.setItem(
        DataController.BOOKING_MODEL,
        JSON.stringify(this.bookingModel),
      );
      console.log('Data Written: ', this.bookingModel);
      this.props.navigation.navigate('FareEstimation', {
        covered: this.props.navigation.getParam('covered'),
        origin: this.state.origin,
        destination: this.state.locations,
        vehicle: this.props.navigation.getParam('vehicle'),
        dateTime: this.state.selectedDateTime,
      });
    } else {
      this.toast.show('Please complete the details to get fare estimation');
    }
  };

  isValidModel = model => {
    console.log('Locations: ', this.state.locations);
    if (model.booking_type == BookingModel.BookingType.NORMAL) {
      if (this.state.locations[0] == '' || this.state.locations.length == 0) {
        return false;
      }
    }

    if (this.state.goodsType === DEF_GOODS) {
      return false;
    }

    return true;
  };

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

  render() {
    const headerTransY = this.state.scrollY.interpolate({
      inputRange: [0, 100],
      outputRange: [0, -80],
      extrapolate: 'clamp',
    });
    const headerOpacity = this.state.scrollY.interpolate({
      inputRange: [0, 100],
      outputRange: [1, 0],
      extrapolate: 'clamp',
    });

    return (
      <View
        style={{
          flex: 1,
          backgroundColor: '#EEEEEE',
        }}>
        {/* Header with Vehicle type, Date and Time. */}
        <Animated.View
          style={[
            styles.header,
            {opacity: headerOpacity, transform: [{translateY: headerTransY}]},
          ]}>
          <View style={[styles.bar, {paddingTop: 20, paddingBottom: 35}]}>
            <View>
              <TouchableHighlight
                disabled={!this.state.vehicleEnabled}
                underlayColor="white"
                onPress={() => {
                  this.props.navigation.navigate('VehicleList', {
                    setVehicle: this.setVehicle.bind(this),
                  });
                }}>
                <Image
                  source={vehicleIcon}
                  style={{
                    width: 50,
                    height: 50,
                    opacity: this.state.vehicleEnabled ? 1 : 0.4,
                  }}
                />
              </TouchableHighlight>
            </View>
            <Text
              style={{
                fontSize: 22,
                fontWeight: '700',
                marginTop: 10,
                opacity: this.state.vehicleEnabled ? 1 : 0.4,
              }}>
              {this.props.navigation.getParam('vehicle').vehicle_name}
            </Text>
            <Text style={{fontSize: 10, opacity: 0.4, marginTop: 5}}>
              {this.props.navigation.getParam('covered')}
            </Text>
          </View>

          <TouchableHighlight
            disabled={!this.state.dateTouchableEnabled}
            underlayColor="black"
            onPress={() => {
              this.showDateTimePicker(true);
            }}
            style={{
              borderRadius: 100,
              paddingVertical: 8,
              width: '75%',
              backgroundColor: this.state.dateTouchableEnabled
                ? 'black'
                : 'gray',
              alignItems: 'center',
              justifyContent: 'center',
              marginTop: -25,
              alignSelf: 'center',
            }}>
            <Text
              style={{
                color: 'white',
                opacity: this.state.dateTouchableEnabled ? 1 : 0.4,
              }}>
              {this.formatDate(this.state.selectedDateTime)}
            </Text>
          </TouchableHighlight>
        </Animated.View>

        <Animated.ScrollView
          showsVerticalScrollIndicator={false}
          style={{flex: 1}}
          onScroll={Animated.event(
            [{nativeEvent: {contentOffset: {y: this.state.scrollY}}}],
            {useNativeDriver: true},
          )}>
          <View style={styles.scrollViewContent}>
            <View
              style={{
                backgroundColor: 'white',
                paddingVertical: 10,
                paddingStart: 20,
                borderRadius: 3,
              }}>
              <TouchableHighlight
                disabled={!this.state.pickupEnabled}
                underlayColor="white"
                onPress={() => {
                  this.props.navigation.navigate('Search', {
                    type: 'origin',
                    setOrigin: this.setOrigin.bind(this),
                  });
                }}>
                <View
                  style={{
                    flexDirection: 'row',
                    opacity: this.state.pickupEnabled ? 1 : 0.4,
                    alignItems: 'center',
                    marginVertical: 12,
                    paddingEnd: 20,
                  }}>
                  <View
                    style={{
                      backgroundColor: 'green',
                      elevation: 3,
                      borderWidth: 1,
                      borderColor: 'white',
                      width: 10,
                      height: 10,
                      borderRadius: 100,
                    }}
                  />
                  <Text
                    numberOfLines={1}
                    ellipsizeMode="tail"
                    style={{flex: 1, marginStart: 12, fontSize: 15}}>
                    {this.state.origin.address}
                  </Text>
                </View>
              </TouchableHighlight>

              {this.state.locations !== [] &&
                this.state.locations.map((item, index) => {
                  return (
                    <TouchableHighlight
                      disabled={!this.state.dropPointsEnabled}
                      key={index}
                      underlayColor="white"
                      onPress={() => {
                        this.props.navigation.navigate('Search', {
                          type: 'destination',
                          index: index,
                          setDestination: this.setDestination.bind(this),
                        });
                      }}>
                      <View>
                        <View
                          style={{
                            marginStart: 20,
                            borderTopColor: 'rgba(0, 0, 0, 0.1)',
                            borderTopWidth:
                              index < this.state.locations.length ? 1 : 0,
                          }}
                        />
                        <View
                          style={{
                            flexDirection: 'row',
                            opacity: this.state.dropPointsEnabled ? 1 : 0.4,
                            alignItems: 'center',
                            marginVertical: 12,
                            paddingEnd: 20,
                          }}>
                          <View
                            style={{
                              backgroundColor: 'red',
                              elevation: 3,
                              borderWidth: 1,
                              borderColor: 'white',
                              width: 10,
                              height: 10,
                              borderRadius: 100,
                            }}
                          />

                          <Text
                            numberOfLines={1}
                            ellipsizeMode="tail"
                            style={{flex: 1, marginStart: 12, fontSize: 15}}>
                            {!item.address ? `Drop off location` : item.address}
                          </Text>
                          <TouchableOpacity
                            disabled={!this.state.dropPointsEnabled}
                            style={{
                              width: 30,
                              height: 30,
                              opacity: 0.3,
                              justifyContent: 'center',
                              alignItems: 'center',
                            }}
                            onPress={() => {
                              this.setState(prevState => {
                                prevState.locations.splice(index, 1);
                                return prevState;
                              });
                            }}>
                            <Image
                              resizeMode="contain"
                              source={Constants.ICONS.cancel}
                              style={{width: 15, height: 15}}
                            />
                          </TouchableOpacity>
                        </View>
                      </View>
                    </TouchableHighlight>
                  );
                })}

                {/* Add Stop */}
              <TouchableOpacity
                disabled={!this.state.dropPointsEnabled}
                onPress={() => {
                  let index = this.state.locations.length;
                  this.props.navigation.navigate('Search', {
                    type: 'destination',
                    index: index,
                    setDestination: this.setDestination.bind(this),
                  });
                }}>
                <View>
                  <View
                    style={{
                      marginStart: 20,
                      borderTopColor: 'rgba(0, 0, 0, 0.1)',
                      borderTopWidth: 1,
                    }}
                  />
                  <View
                    style={{
                      flexDirection: 'row',
                      opacity: this.state.dropPointsEnabled ? 1 : 0.4,
                      alignItems: 'center',
                      marginVertical: 12,
                      paddingEnd: 20,
                    }}>
                    <Image
                      style={{
                        width: 15,
                        height: 15,
                        transform: [{rotate: '45deg'}],
                      }}
                      source={Constants.ICONS.cancel}
                      tintColor="#0041BB"
                    />
                    <Text
                      numberOfLines={1}
                      ellipsizeMode="tail"
                      style={{flex: 1, marginStart: 15, fontSize: 15}}>
                      Add Stop
                    </Text>
                  </View>
                </View>
              </TouchableOpacity>
            </View>

            {/* Contact Person's mobile number */}
            <View
              style={{
                paddingVertical: 5,
                opacity: this.state.mobNumEnabled ? 1 : 0.4,
              }}>
              <View
                style={{
                  flexDirection: 'row',
                  backgroundColor: '#F5F5F5',
                  alignItems: 'center',
                  marginVertical: 5,
                  borderRadius: 3,
                  overflow: 'hidden',
                }}>
                <Text style={{margin: 10, opacity: 0.4}}>+91</Text>
                <TextInput
                  editable={this.state.mobNumEnabled}
                  keyboardType="number-pad"
                  returnKeyType="done"
                  style={{
                    flex: 1,
                    backgroundColor: 'white',
                    paddingHorizontal: 15,
                    height: '100%',
                  }}
                  defaultValue={this.state.number}
                  placeholder="Contact Person's mobile number"
                />
              </View>
              {/* <View style={{
                                flexDirection: 'row', backgroundColor: '#F5F5F5',
                                alignItems: 'center', marginVertical: 5,
                                borderRadius: 3, overflow: 'hidden'
                            }}>
                                <Text style={{margin: 10, opacity: 0.4}}>
                                    +91
                                </Text>
                                <TextInput editable={this.state.mobNumEnabled}
                                keyboardType="number-pad" returnKeyType="done"
                                style={{
                                    flex: 1, backgroundColor: 'white',
                                    paddingHorizontal: 15, height: '100%'
                                }}
                                placeholder="Drop off mobile number"/>
                            </View> */}
            </View>

            {/* Drop off mobile number */}
            {this.state.locations !== [] &&
              this.state.locations.map((item, index) => {
                console.log(TAG, 'locations >> ', index, item);
                return (
                  <View
                    key={index}
                    style={{
                      // paddingVertical: 5,
                      paddingBottom: 5,
                      // opacity: this.state.mobNumEnabled ? 1 : 0.4,
                    }}>
                    <View
                      style={{
                        flexDirection: 'row',
                        backgroundColor: '#F5F5F5',
                        alignItems: 'center',
                        // marginVertical: 2,
                        marginBottom: 5,
                        borderRadius: 3,
                        overflow: 'hidden',
                      }}>
                      <Text style={{margin: 10, opacity: 0.4}}>+91</Text>
                      <TextInput
                        // editable={this.state.mobNumEnabled}
                        editable={true}
                        keyboardType="number-pad"
                        returnKeyType="done"
                        maxLength={10}
                        onChangeText={text => {
                          console.log(TAG, index, text);
                          this.state.locations[index].number = text;
                          console.log(TAG, index, this.state.locations);
                        }}
                        style={{
                          flex: 1,
                          backgroundColor: 'white',
                          paddingHorizontal: 15,
                          height: '100%',
                        }}
                        placeholder="Drop off mobile number"
                      />
                    </View>
                  </View>
                );
              })}

            <View
              style={{
                backgroundColor: 'white',
                borderRadius: 3,
                justifyContent: 'space-between',
                opacity: this.state.loadEnabled ? 1 : 0.4,
              }}>
              <Text style={{opacity: 0.4, margin: 8, fontSize: 12}}>
                ADDITIONAL SERVICES
              </Text>

              <View
                style={{
                  borderTopColor: 'rgba(0, 0, 0, 0.1)',
                  borderTopWidth: 1,
                }}
              />

              <View
                style={{flexDirection: 'row', justifyContent: 'space-around'}}>
                <TouchableHighlight
                  disabled={!this.state.loadEnabled}
                  underlayColor="white"
                  style={{
                    justifyContent: 'center',
                  }}
                  onPress={() => {
                    this.setState(prevState => {
                      prevState.isLoadingSelected = !prevState.isLoadingSelected;
                      return prevState;
                    });
                  }}>
                  <View
                    style={{
                      flexDirection: 'row',
                      alignItems: 'center',
                      margin: 10,
                    }}>
                    <View>
                      <Text
                        style={{
                          fontSize: 18,
                          fontWeight: '700',
                          opacity: this.state.isLoadingSelected ? 1 : 0.4,
                        }}>
                        Loading
                      </Text>
                      <Text style={{fontSize: 10, opacity: 0.4}}>
                        {' '}
                        Driver to load vehicle{' '}
                      </Text>
                    </View>
                    <Image
                      source={Constants.ICONS.tick}
                      style={{
                        width: 20,
                        height: 20,
                        margin: 10,
                        tintColor: this.state.isLoadingSelected
                          ? '#00CF35'
                          : 'rgba(0, 0, 0, 0.1)',
                      }}
                    />
                  </View>
                </TouchableHighlight>

                <View
                  style={{
                    borderStartColor: 'rgba(0, 0, 0, 0.1)',
                    borderStartWidth: 1,
                  }}
                />

                <TouchableHighlight
                  disabled={!this.state.loadEnabled}
                  underlayColor="white"
                  style={{
                    justifyContent: 'center',
                  }}
                  onPress={() => {
                    this.setState(prevState => {
                      prevState.isUnLoadingSelected = !prevState.isUnLoadingSelected;
                      return prevState;
                    });
                  }}>
                  <View
                    style={{
                      flexDirection: 'row',
                      alignItems: 'center',
                      margin: 10,
                    }}>
                    <View>
                      <Text
                        style={{
                          fontSize: 18,
                          fontWeight: '700',
                          opacity: this.state.isUnLoadingSelected ? 1 : 0.4,
                        }}>
                        Unloading
                      </Text>
                      <Text style={{fontSize: 10, opacity: 0.4}}>
                        {' '}
                        Driver to unload vehicle{' '}
                      </Text>
                    </View>
                    <Image
                      source={Constants.ICONS.tick}
                      style={{
                        width: 20,
                        height: 20,
                        margin: 10,
                        tintColor: this.state.isUnLoadingSelected
                          ? '#00CF35'
                          : 'rgba(0, 0, 0, 0.1)',
                      }}
                    />
                  </View>
                </TouchableHighlight>
              </View>
            </View>

            <View
              style={{
                backgroundColor: 'white',
                borderRadius: 3,
                justifyContent: 'space-between',
                marginTop: 10,
                opacity: this.state.podEnabled ? 1 : 0.4,
              }}>
              <Text style={{opacity: 0.4, margin: 8, fontSize: 12}}>
                PROOF OF DELIVERY
              </Text>

              <View
                style={{
                  borderTopColor: 'rgba(0, 0, 0, 0.1)',
                  borderTopWidth: 1,
                }}
              />

              <View
                style={{
                  flex: 1,
                  justifyContent: 'center',
                  margin: 3,
                }}>
                <TouchableHighlight
                  disabled={!this.state.podEnabled}
                  underlayColor="white"
                  style={{
                    flex: 1,
                    justifyContent: 'center',
                    margin: 10,
                  }}
                  onPress={() => {
                    this.setState(prevState => {
                      prevState.isPhysicalSelected = !prevState.isPhysicalSelected;
                      return prevState;
                    });
                  }}>
                  <View
                    style={{
                      flexDirection: 'row',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                    }}>
                    <View>
                      <Text
                        style={{
                          fontSize: 18,
                          fontWeight: '700',
                          opacity: this.state.isPhysicalSelected ? 1 : 0.4,
                        }}>
                        Physical
                      </Text>
                      <Text style={{fontSize: 10, opacity: 0.4}}>
                        POD to be delievered by driver
                      </Text>
                    </View>

                    <View>
                      <Image
                        source={Constants.ICONS.tick}
                        style={{
                          width: 20,
                          height: 20,
                          margin: 5,
                          tintColor: this.state.isPhysicalSelected
                            ? '#00CF35'
                            : 'rgba(0, 0, 0, 0.1)',
                        }}
                      />
                      <Text style={{fontSize: 15, opacity: 0.3}}>
                        {String.fromCharCode(8377) +
                          this.state.physicalPODCharge}
                      </Text>
                    </View>
                  </View>
                </TouchableHighlight>
              </View>
            </View>

            <View
              style={{
                backgroundColor: 'white',
                borderRadius: 3,
                marginTop: 10,
                flexDirection: 'row',
                justifyContent: 'space-between',
                alignItems: 'center',
                opacity: this.state.favDrivEnabled ? 1 : 0.3,
              }}>
              <TouchableHighlight
                disabled={!this.state.favDrivEnabled}
                underlayColor="white"
                style={{flex: 1, padding: 10}}
                onPress={() => {
                  this.setState(prevState => {
                    prevState.excDriverSelected = false;
                    return prevState;
                  });
                  // Presently switch is off
                  if (!this.state.favDriverSelected) {
                    if (this.favDrivers.length > 0) {
                      this.setState(prevState => {
                        prevState.favDriverSelected = !prevState.favDriverSelected;
                        return prevState;
                      });
                    } else {
                      this.setModalVisible(true);
                    }
                  } else {
                    this.setState(prevState => {
                      prevState.favDriverSelected = !prevState.favDriverSelected;
                      return prevState;
                    });
                  }
                }}>
                <Text style={{fontSize: 15, opacity: 0.5}}>
                  Allot only favourite drivers
                </Text>
              </TouchableHighlight>
              <Switch
                disabled={!this.state.favDrivEnabled}
                trackColor={{
                  false: 'rgba(0, 0, 0, 0.3',
                  true: 'rgba(255, 203, 40, 0.5)',
                }}
                thumbColor={this.state.favDriverSelected ? ACCENT : '#F0F0F0'}
                style={{padding: 10, marginEnd: 10}}
                value={this.state.favDriverSelected ? true : false}
                onChange={() => {
                  this.setState(prevState => {
                    prevState.excDriverSelected = false;
                    return prevState;
                  });
                  // Presently switch is off
                  if (!this.state.favDriverSelected) {
                    if (this.favDrivers.length > 0) {
                      this.setState(prevState => {
                        prevState.favDriverSelected = !prevState.favDriverSelected;
                        return prevState;
                      });
                    } else {
                      this.setModalVisible(true);
                    }
                  } else {
                    this.setState(prevState => {
                      prevState.favDriverSelected = !prevState.favDriverSelected;
                      return prevState;
                    });
                  }
                }}
              />
            </View>

            {/* Favourite Driver List If any 01-02-2022 */}
            {this.state.favDriverSelected ? (
              <View
                style={{
                  backgroundColor: 'white',
                  borderRadius: 3,
                  flexDirection: 'row',
                  justifyContent: 'flex-start',
                  opacity: this.state.favDrivEnabled ? 1 : 0.3,
                }}>
                <ScrollView
                  horizontal={true}
                  showsHorizontalScrollIndicator={false}>
                  {this.favDrivers.map((member, index) => {
                    return (
                      <View key={index}>
                        <View
                          style={{
                            width: 100,
                            flexDirection: 'column',
                            alignItems: 'center',
                            borderWidth: 0.1,
                            borderRadius: 2,
                            padding: 5,
                            marginRight: 4,
                          }}>
                          {/* Image View */}
                          <View style={{alignItems: 'center'}}>
                            <Image
                              source={Constants.ICONS.driver_fleet}
                              style={{
                                width: 60,
                                height: 60,
                                marginHorizontal: 5,
                              }}
                            />
                          </View>
                          {/* Driver Name, Vehicle and Rating View */}
                          <View style={{flex: 1, alignItems: 'center'}}>
                            <Text
                              numberOfLines={1}
                              style={{
                                textAlign: 'center',
                                width: 90,
                                fontSize: 14,
                                opacity: 0.4,
                              }}>
                              {member.name}
                              {/* {member.name.length < 12
                              ? `${member.name}`
                              : `${member.name.substring(0, 12)}...`} */}
                            </Text>
                            <Text
                              numberOfLines={1}
                              ellipsizeMode="tail"
                              style={{
                                fontSize: 12,
                                opacity: 0.4,
                                marginVertical: 5,
                              }}>
                              {member.vehicle_name}
                            </Text>
                            <AirbnbRating
                              starContainerStyle={{marginTop: -25}}
                              isDisabled={true}
                              selectedColor={ACCENT_DARK}
                              reviewColor={ACCENT_DARK}
                              reviewSize={5}
                              reviews={[]}
                              count={5}
                              defaultRating={member.average_rating}
                              size={10}
                            />
                          </View>
                        </View>
                      </View>
                    );
                  })}
                </ScrollView>
              </View>
            ) : null}

            {/* Exclusive driver switch is presently hidden */}
            {/* It was hidden but now it is shown 01-02-2022 */}
            <View
              style={{
                backgroundColor: 'white',
                // display: 'none',
                display: 'flex',
                borderRadius: 3,
                marginTop: 10,
                flexDirection: 'row',
                justifyContent: 'space-between',
                alignItems: 'center',
                opacity: this.state.excDrivEnabled ? 1 : 0.4,
              }}>
              <TouchableHighlight
                disabled={!this.state.excDrivEnabled}
                underlayColor="white"
                style={{flex: 1, padding: 10}}
                onPress={() => {
                  // Presently switch is off
                  this.setState(prevState => {
                    prevState.favDriverSelected = false;
                    return prevState;
                  });
                  if (!this.state.excDriverSelected) {
                    if (this.excDrivers.length > 0) {
                      this.setState(prevState => {
                        prevState.excDriverSelected = !prevState.excDriverSelected;
                        return prevState;
                      });
                    } else {
                      this.setModalVisible(true, true);
                    }
                  } else {
                    this.setState(prevState => {
                      prevState.excDriverSelected = !prevState.excDriverSelected;
                      return prevState;
                    });
                  }
                }}>
                <Text style={{fontSize: 15, opacity: 0.5}}>
                  Allot only exclusive drivers
                </Text>
              </TouchableHighlight>
              <Switch
                disabled={!this.state.excDrivEnabled}
                trackColor={{
                  false: 'rgba(0, 0, 0, 0.3',
                  true: 'rgba(255, 203, 40, 0.5)',
                }}
                thumbColor={this.state.excDriverSelected ? ACCENT : '#F0F0F0'}
                style={{padding: 10, marginEnd: 10}}
                value={this.state.excDriverSelected ? true : false}
                onChange={() => {
                  this.setState(prevState => {
                    prevState.favDriverSelected = false;
                    return prevState;
                  });
                  // Presently switch is off
                  if (!this.state.excDriverSelected) {
                    if (this.excDrivers.length > 0) {
                      this.setState(prevState => {
                        prevState.excDriverSelected = !prevState.excDriverSelected;
                        return prevState;
                      });
                    } else {
                      this.setModalVisible(true, true);
                    }
                  } else {
                    this.setState(prevState => {
                      prevState.excDriverSelected = !prevState.excDriverSelected;
                      return prevState;
                    });
                  }
                }}
              />
            </View>

            {/* Exclusive Driver List If any 04-02-2022 */}
            {this.state.excDriverSelected ? (
              <View
                style={{
                  backgroundColor: 'white',
                  borderRadius: 3,
                  flexDirection: 'row',
                  justifyContent: 'flex-start',
                  opacity: this.state.favDrivEnabled ? 1 : 0.3,
                }}>
                <ScrollView
                  horizontal={true}
                  showsHorizontalScrollIndicator={false}>
                  {this.excDrivers.map((member, index) => {
                    return (
                      <View key={index}>
                        <View
                          style={{
                            width: 100,
                            flexDirection: 'column',
                            alignItems: 'center',
                            borderWidth: 0.1,
                            borderRadius: 2,
                            padding: 5,
                            marginRight: 4,
                          }}>
                          {/* Image View */}
                          <View style={{alignItems: 'center'}}>
                            <Image
                              source={Constants.ICONS.driver_fleet}
                              style={{
                                width: 60,
                                height: 60,
                                marginHorizontal: 5,
                              }}
                            />

                            {member.status_exclusive ? (
                              <Image
                                source={Constants.ICONS.star}
                                style={{
                                  width: 15,
                                  height: 15,
                                  tintColor: ACCENT,
                                  marginTop: -15,
                                  alignSelf: 'flex-end',
                                  marginRight: 10,
                                }}
                              />
                            ) : null}
                          </View>
                          {/* Driver Name, Vehicle and Rating View */}
                          <View style={{flex: 1, alignItems: 'center'}}>
                            <Text
                              numberOfLines={1}
                              style={{
                                textAlign: 'center',
                                width: 90,
                                fontSize: 14,
                                opacity: 0.4,
                              }}>
                              {member.name}
                              {/* {member.name.length < 12
                              ? `${member.name}`
                              : `${member.name.substring(0, 12)}...`} */}
                            </Text>
                            <Text
                              style={{
                                fontSize: 12,
                                opacity: 0.4,
                                marginVertical: 5,
                              }}>
                              {member.vehicle_name}
                            </Text>
                            <AirbnbRating
                              starContainerStyle={{marginTop: -25}}
                              isDisabled={true}
                              selectedColor={ACCENT_DARK}
                              reviewColor={ACCENT_DARK}
                              reviewSize={5}
                              reviews={[]}
                              count={5}
                              defaultRating={member.average_rating}
                              size={10}
                            />
                          </View>
                        </View>
                      </View>
                    );
                  })}
                </ScrollView>
              </View>
            ) : null}

            <View
              style={{
                backgroundColor: 'white',
                borderRadius: 3,
                marginTop: 10,
                opacity: this.state.goodsTypeEnabled ? 1 : 0.4,
              }}>
              <TouchableHighlight
                disabled={!this.state.goodsTypeEnabled}
                ref={gType => {
                  this.goodsType = gType;
                }}
                underlayColor="white"
                onPress={() => {
                  DataController.getItem(DataController.TUT_GOODS_TYPE)
                    .then(status => {
                      if (status == 'true') {
                        this.props.navigation.navigate('GoodsList', {
                          setGoodsType: this.setGoodsType.bind(this),
                        });
                      } else {
                        this.showPopover(
                          DataController.TUT_GOODS_TYPE,
                          this.goodsType,
                        );
                      }
                    })
                    .catch(err => {
                      console.log(err);
                    });
                }}
                style={{
                  padding: 10,
                }}>
                <View>
                  <View
                    style={{
                      flexDirection: 'row',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                    }}>
                    <Text style={{fontSize: 15}}>Type of Goods</Text>
                    <Image
                      source={Constants.ICONS.forward}
                      style={{width: 15, height: 15}}
                    />
                  </View>
                  <Text
                    style={{
                      paddingHorizontal: 20,
                      paddingVertical: 10,
                      fontSize: 15,
                      opacity: 0.4,
                    }}>
                    {this.state.goodsType}
                  </Text>
                </View>
              </TouchableHighlight>
            </View>

            <View
              style={{
                backgroundColor: 'white',
                borderRadius: 3,
                marginTop: 10,
              }}>
              <TextInput
                returnKeyType="done"
                multiline={true}
                textAlignVertical="top"
                placeholder="Description"
                value={this.state.remark}
                style={{padding: 10, fontSize: 15, minHeight: 80}}
                onChangeText={text => {
                  this.setState(prevState => {
                    prevState.remark = text;
                    return prevState;
                  });
                }}
              />
            </View>
          </View>
        </Animated.ScrollView>

        {/* Fare Estimate button. */}
        <TouchableHighlight
          underlayColor={ACCENT_DARK}
          onPress={() => this.estimateFare()}
          style={{
            backgroundColor: ACCENT,
            paddingVertical: 15,
            justifyContent: 'center',
            alignItems: 'center',
            elevation: 10,
            shadowColor: 'rgb(0, 0, 0)',
            shadowOffset: {width: 0, height: -2},
            shadowOpacity: 0.22,
            shadowRadius: 4,
          }}>
          <Text style={{fontSize: 18, fontWeight: '700', color: 'white'}}>
            Estimate Fare
          </Text>
        </TouchableHighlight>

        {/* Date Time picker*/}
        <DateTimePickerComp
          dateTimeSetter={this.setDateTime}
          maximumDate={new Date().setDate(new Date().getDate() + 4)}
          value={this.state.selectedDateTime}
          ref={p => (this.dateTimePicker = p)}
        />

        <ToastComp ref={t => (this.toast = t)} />

        {/* Tutorials popover */}
        <PopOverComp
          isVisible={this.state.isVisible}
          fromView={this.state.fromView}
          closePopover={this.closePopover.bind(this)}
          text={this.state.popOverText}
        />

        {/* Modal to show when no Favourite Drivers are found */}
        <Modal
          animationType="fade"
          transparent={true}
          visible={this.state.noFavDrivModalVisible}
          onRequestClose={() => {
            this.setModalVisible(false, 0);
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
                borderRadius: 5,
                backgroundColor: 'white',
                overflow: 'hidden',
                width: '75%',
              }}>
              <View
                style={{
                  flexDirection: 'row',
                  justifyContent: 'space-between',
                  backgroundColor: 'white',
                }}>
                <Text style={{margin: 20, fontWeight: '700', fontSize: 15}}>
                  {' '}
                  Add Driver{' '}
                </Text>
                <TouchableOpacity
                  onPress={() => {
                    this.setModalVisible(false);
                  }}>
                  <Image
                    source={Constants.ICONS.close}
                    style={{width: 15, height: 15, margin: 20}}
                  />
                </TouchableOpacity>
              </View>

              <Text style={{marginBottom: 20, marginHorizontal: 20}}>
                {this.state.favExcDialogMessage}
              </Text>

              <TouchableHighlight
                underlayColor="rgba(255, 203, 40, 0.8)"
                onPress={() => {
                  this.setModalVisible(false);
                }}
                style={{
                  paddingVertical: 15,
                  alignItems: 'center',
                  justifyContent: 'center',
                  backgroundColor: ACCENT,
                }}>
                <Text style={{color: 'white'}}>OK</Text>
              </TouchableHighlight>
            </View>
          </View>
        </Modal>
      </View>
    );
  }
}

const styles = StyleSheet.create({
  row: {
    height: 40,
    margin: 16,
    backgroundColor: '#D3D3D3',
    alignItems: 'center',
    justifyContent: 'center',
  },
  scrollViewContent: {
    marginTop: 180,
    marginHorizontal: 10,
    paddingVertical: 20,
  },
  header: {
    height: 180,
    zIndex: 100,
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    backgroundColor: '#EEEEEE',
    overflow: 'hidden',
  },
  bar: {
    marginTop: 0,
    backgroundColor: 'white',
    alignItems: 'center',
    justifyContent: 'center',
  },
  title: {
    backgroundColor: 'transparent',
    color: 'white',
    fontSize: 18,
  },
});
