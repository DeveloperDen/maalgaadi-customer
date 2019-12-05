import React, { Component } from 'react';
import {
  StyleSheet,
  View,
  Text,
  TouchableHighlight, 
  Image,
  ScrollView,
  Animated,
  Switch,
  TextInput,
  TouchableOpacity,
  ToastAndroid
} from 'react-native';
import DateTimePicker from '@react-native-community/datetimepicker';
import { LandmarkModel } from '../models/landmark_model';
import { formatDate } from './../utils/UtilFunc';
import { BookingEventType } from '../models/bookings_model';
import { PopOverComp } from '../utils/PopOverComp';

const DataController = require('../utils/DataStorageController')
const BookingModel = require('../models/bookings_model')
const vehicleIcon = require('../../assets/vehicle.png')


const ACCENT = '#FFCB28' // 255, 203, 40
const ACCENT_DARK = '#F1B800'
const DEF_GOODS = 'Select Goods Type'

export default class AddBooking extends Component {
    static navigationOptions = ({navigation}) => {
        return{
            headerTitle: navigation.getParam('title', 'Add Booking'),
            headerRight: 
            <TouchableHighlight
            onPress={() => {
                navigation.navigate('RateCard')
            }}
            underlayColor='white'>
                <Image
                source={{uri: 'https://cdn4.iconfinder.com/data/icons/ionicons/512/icon-information-circled-512.png'}}
                tintColor='black'
                style={{width: 22, height: 22, marginEnd: 22}}/>
            </TouchableHighlight>
        }
    }

    constructor(props) {
        super(props)

        this.months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug",
                                "Sep", "Oct", "Nov", "Dec"];
        this.formatDate = formatDate
        
        this.state = {
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
            locations: '',
            isUnLoadingSelected: false,
            isLoadingSelected: false,
            isPhysicalSelected: false,
            excDriverSelected: false,
            favDriverSelected: false,
            showDateTime: false,
            dateTimePickerMode: 'date',
            selectedDateTime: props.navigation.getParam('dateTime'),

            favDrivEnabled: true,
            excDrivEnabled: true,
            loadEnabled: true,
            unloadEnabled: true,
            dateTouchableEnabled: true,
            mobNumEnabled: true,
            goodsTypeEnabled: true,
            podEnabled: true,
        }

        this.bookingModel = ''
    }

    async componentDidMount() {
        const num = await DataController.getItem(DataController.CUSTOMER_MOBILE)
        this.bookingModel = JSON.parse(await DataController.getItem(DataController.BOOKING_MODEL))
        this.setState(prevState => {
            prevState.number = num
            prevState.physicalPODCharge = this.bookingModel.vehicle.pod_charge
            prevState.origin = this.props.navigation.getParam('origin')
            prevState.locations = this.props.navigation.getParam('destination') !== ''?
                                    this.props.navigation.getParam('destination') : []
            return prevState
        })
        
        this.bookingModel.booking_event_type == BookingEventType.EDIT? this.setupFieldsForEdit() : null;
    }

    setupFieldsForEdit() {
        this.setState(prevState => {
            prevState.favDrivEnabled = this.bookingModel.is_fav_driver_edit
            prevState.excDrivEnabled = this.bookingModel.is_exc_driver_edit
            prevState.loadEnabled = this.bookingModel.loading_edit
            prevState.unloadEnabled = this.bookingModel.unloading_edit
            prevState.dateTouchableEnabled = this.bookingModel.schedule_time_edit
            prevState.mobNumEnabled = this.bookingModel.is_contact_edit
            prevState.goodsTypeEnabled = this.bookingModel.is_goods_type_edit
            prevState.podEnabled = this.bookingModel.pod_edit
            return prevState
        })
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

    setVehicle = (vehicle) => {
        this.props.navigation.setParams({
            vehicle: vehicle
        })
    }

    setGoodsType = (goods) => {
        this.setState(prevState => {
            prevState.goodsType = goods.goods_name
            prevState.goodsId = goods.id
            return prevState
        })
    }

    setOrigin = (landmark) => {
        this.setState(prevState => {
            prevState.origin = landmark
            return prevState
        })
    }

    setDestination = (landmark, index) => {
        this.setState(prevState => {
            prevState.locations[index] = landmark
            return prevState
        })
    }

    estimateFare = async () => {
        if(this.isValidModel(this.bookingModel)) {
            this.bookingModel.loading = this.state.isLoadingSelected
            this.bookingModel.unloading = this.state.isUnLoadingSelected
            this.bookingModel.physical_pod = this.state.isPhysicalSelected
            this.bookingModel.goods_id = this.state.goodsId
            this.bookingModel.goods_type = this.state.goodsType

            const selectedVehicle = this.props.navigation.getParam('vehicle')
            this.bookingModel.selected_vehicle_category = selectedVehicle.id
            this.bookingModel.selected_vehicle_category_name = selectedVehicle.vehicle_name
            this.bookingModel.vehicle = selectedVehicle
            
            this.bookingModel.landmark_list = this.bookingModel.landmark_list.slice(0, 1)
            let list = this.bookingModel.landmark_list

            list[0].landmark = this.state.origin.landmark
            list[0].latitude = this.state.origin.latitude
            list[0].longitude = this.state.origin.longitude

            this.state.locations.forEach(loc => {
                let dropModel = new LandmarkModel()
                dropModel.setFavourite(false)  // TODO: Decide on the basis of Favourites' list
                dropModel.setLat(loc.latitude.toString())
                dropModel.setLng(loc.longitude.toString())
                dropModel.setLandmark(loc.landmark)
                list.push(dropModel.getModel())
            });

            this.bookingModel.number_of_drop_points = list.length - 1

            await DataController.setItem(DataController.BOOKING_MODEL, JSON.stringify(this.bookingModel))
            console.log("Data Written: ", this.bookingModel)
            this.props.navigation.navigate("FareEstimation", {
                covered: this.props.navigation.getParam('covered'),
                origin: this.state.origin,
                destination: this.state.locations,
                vehicle: this.props.navigation.getParam('vehicle'),
                dateTime: this.state.selectedDateTime
              })
        }
        else {
            ToastAndroid.show('Invalid!', ToastAndroid.SHORT)
        }
    }

    isValidModel = (model) => {
        const list = this.state.locations

        if (model.booking_type == BookingModel.BookingType.NORMAL) {
            if (list.length < 1) {
                return false;
            }
        }

        if(this.state.goodsType === DEF_GOODS){
            return false
        }

        return true
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
        const headerHeight = this.state.scrollY.interpolate({
            inputRange: [0, 180],
            outputRange: [180, 0],
            extrapolate: 'clamp',
        });
        const headerPadding = this.state.scrollY.interpolate({
            inputRange: [20, 180],
            outputRange: [20, 0],
            extrapolate: 'clamp',
        });
        const headerOpacity = this.state.scrollY.interpolate({
            inputRange: [20, 130],
            outputRange: [1, 0],
            extrapolate: 'clamp',
        });

        return(
            <View style={styles.fill}>
                <ScrollView 
                showsVerticalScrollIndicator={false}
                style={styles.fill}
                scrollEventThrottle={16}
                onScroll={Animated.event(
                        [{nativeEvent: {contentOffset: {y: this.state.scrollY}}}]
                        )}
                >
                    <View style={styles.scrollViewContent}>
                        <View 
                            style={{
                            backgroundColor: 'white', paddingVertical: 10, paddingStart: 20,
                            borderRadius: 3
                        }}>
                            <TouchableHighlight
                            underlayColor='white'
                            onPress={() => {
                                this.props.navigation.navigate('Search', {type: 'origin', setOrigin: this.setOrigin.bind(this)})
                            }}>
                                <View
                                style={{
                                    flexDirection: 'row',
                                    alignItems: "center",
                                    marginVertical: 12,
                                    paddingEnd: 20
                                }}>
                                    <View style={{
                                        backgroundColor: 'green',
                                        elevation: 3,
                                        borderWidth: 1,
                                        borderColor: 'white',
                                        width: 10,
                                        height: 10,
                                        borderRadius: 100
                                        }}/>
                                    <Text numberOfLines={1} ellipsizeMode='tail'
                                    style={{flex: 1, marginStart: 12, fontSize: 15}}>
                                        {this.state.origin.landmark}
                                    </Text>
                                </View>
                            </TouchableHighlight>
                            
                            {this.state.locations !== '' && this.state.locations.map((item, index) => {
                                return(
                                    <TouchableHighlight
                                    key={index}
                                    underlayColor='white'
                                    onPress={() => {
                                        this.props.navigation
                                        .navigate('Search', {type: 'destination', index: index, setDestination: this.setDestination.bind(this)})
                                    }}>
                                        <View>
                                            <View style={{
                                            marginStart: 20,
                                            borderTopColor:'rgba(0, 0, 0, 0.1)',
                                            borderTopWidth: index < (this.state.locations.length)? 1 : 0}}/>
                                            <View 
                                            style={{
                                                flexDirection: 'row',
                                                alignItems: "center",
                                                marginVertical: 12,
                                                paddingEnd: 20
                                            }}>
                                                <View style={{backgroundColor: 'red', elevation: 3,
                                                    borderWidth: 1, borderColor: 'white',
                                                    width: 10, height: 10, borderRadius: 100,
                                                    }}/>

                                                    <Text numberOfLines={1} ellipsizeMode='tail'
                                                    style={{flex: 1, marginStart: 12, fontSize: 15}}>
                                                        {!item.landmark? `Drop off location` : item.landmark}
                                                    </Text>
                                                    <TouchableOpacity
                                                    style={{width: 30, height: 30, opacity: 0.3, 
                                                        justifyContent: 'center',
                                                        alignItems: 'center'}}
                                                    onPress={() => {
                                                        this.setState(prevState => {
                                                            prevState.locations.splice(index, 1)
                                                            return prevState
                                                        })
                                                    }}>
                                                        <Image
                                                        resizeMode="contain"
                                                        source={{uri: 'https://cdn1.iconfinder.com/data/icons/material-core/20/cancel-512.png'}}
                                                        style={{width: 15, height: 15,}}/>
                                                    </TouchableOpacity>
                                            </View>
                                        </View>
                                    </TouchableHighlight>
                                )
                            })}

                            <TouchableOpacity
                            onPress={() => {
                                let index = this.state.locations.length
                                this.props.navigation
                                .navigate('Search', {type: 'destination', index: index, setDestination: this.setDestination.bind(this)})
                            }}>
                                <View>
                                    <View 
                                    style={{
                                    marginStart: 20,
                                    borderTopColor:'rgba(0, 0, 0, 0.1)',
                                    borderTopWidth: 1}}/>
                                    <View 
                                        style={{
                                            flexDirection: 'row',
                                            alignItems: "center",
                                            marginVertical: 12,
                                            paddingEnd: 20
                                        }}>
                                        <Image style={{
                                            width: 15,
                                            height: 15,
                                            transform: [{ rotate: '45deg'}]
                                            }}
                                            source={{uri: 'https://cdn1.iconfinder.com/data/icons/material-core/20/cancel-512.png'}}
                                            tintColor='#0041BB'/>
                                        <Text numberOfLines={1} ellipsizeMode='tail'
                                        style={{flex: 1, marginStart: 15, fontSize: 15}}>
                                            Add Stop
                                        </Text>
                                    </View>
                                </View>
                            </TouchableOpacity>
                        </View>

                        <View style={{paddingVertical: 5, opacity: this.state.mobNumEnabled? 1 : 0.4}}>
                            <View style={{
                                flexDirection: 'row', backgroundColor: '#F5F5F5',
                                alignItems: 'center', marginVertical: 5,
                                borderRadius: 3, overflow: 'hidden'
                            }}>
                                <Text style={{margin: 10, opacity: 0.4}}>
                                    +91
                                </Text>
                                <TextInput editable={this.state.mobNumEnabled}
                                keyboardType="number-pad"
                                style={{
                                    flex: 1, backgroundColor: 'white',
                                    paddingHorizontal: 15
                                }}
                                defaultValue={this.state.number}
                                placeholder="Contact Person's mobile number"/>
                            </View>
                            <View style={{
                                flexDirection: 'row', backgroundColor: '#F5F5F5',
                                alignItems: 'center', marginVertical: 5,
                                borderRadius: 3, overflow: 'hidden'
                            }}>
                                <Text style={{margin: 10, opacity: 0.4}}>
                                    +91
                                </Text>
                                <TextInput editable={this.state.mobNumEnabled}
                                keyboardType="number-pad"
                                style={{
                                    flex: 1, backgroundColor: 'white',
                                    paddingHorizontal: 15
                                }}
                                placeholder="Drop off mobile number"/>
                            </View>
                        </View>
                    
                        <View
                        style={{
                            backgroundColor: 'white', borderRadius: 3, justifyContent: "space-between",
                            opacity: this.state.loadEnabled? 1 : 0.4
                        }}>
                            <Text style={{opacity: 0.4, margin: 8, fontSize: 12}}>
                                ADDITIONAL SERVICES
                            </Text>
                            
                            <View 
                                style={{
                                borderTopColor:'rgba(0, 0, 0, 0.1)',
                                borderTopWidth: 1}}/>

                            <View style={{flexDirection: 'row', justifyContent: "space-around"}}>
                                <TouchableHighlight disabled={!this.state.loadEnabled}
                                underlayColor='white'
                                style={{
                                    justifyContent: 'center',
                                }}
                                onPress={() => {
                                    this.setState(prevState => {
                                        prevState.isLoadingSelected = !prevState.isLoadingSelected
                                        return prevState
                                    })
                                }}>
                                    <View 
                                    style={{
                                        flexDirection: 'row', alignItems: 'center', margin: 10
                                    }}>
                                        <View>
                                            <Text style={{fontSize: 18, fontWeight: "700"}}> Loading </Text>
                                            <Text style={{fontSize: 10, opacity: 0.4}}> Driver to load vehicle </Text>
                                        </View>
                                        <Image source={{uri: 'https://cdn4.iconfinder.com/data/icons/free-ui/64/v-10-512.png'}}
                                        style={{width: 20, height: 20, margin: 10}}
                                        tintColor={this.state.isLoadingSelected? '#00CF35' : 'rgba(0, 0, 0, 0.1)'}
                                        />
                                    </View>
                                </TouchableHighlight>
                                
                                <View style={{
                                    borderStartColor:'rgba(0, 0, 0, 0.1)',
                                    borderStartWidth: 1,
                                    }}/>

                                <TouchableHighlight disabled={!this.state.loadEnabled}
                                underlayColor='white'
                                style={{
                                    justifyContent: 'center',
                                }}
                                onPress={() => {
                                    this.setState(prevState => {
                                        prevState.isUnLoadingSelected = !prevState.isUnLoadingSelected
                                        return prevState
                                    })
                                }}>
                                    <View style={{
                                        flexDirection: 'row', alignItems: 'center', margin: 10
                                    }}>
                                        <View>
                                            <Text style={{fontSize: 18, fontWeight: "700"}}> Unloading </Text>
                                            <Text style={{fontSize: 10, opacity: 0.4}}> Driver to unload vehicle </Text>
                                        </View>
                                        <Image source={{uri: 'https://cdn4.iconfinder.com/data/icons/free-ui/64/v-10-512.png'}}
                                        style={{width: 20, height: 20, margin: 10}}
                                        tintColor={this.state.isUnLoadingSelected? '#00CF35' : 'rgba(0, 0, 0, 0.1)'}
                                        />
                                    </View>
                                </TouchableHighlight>
                            </View>
                        </View>
                        
                        <View
                        style={{
                            backgroundColor: 'white',
                            borderRadius: 3, justifyContent: "space-between",
                            marginTop: 10, opacity: this.state.podEnabled? 1 : 0.4
                        }}>
                            <Text style={{opacity: 0.4, margin: 8, fontSize: 12}}>
                                PROOF OF DELIVERY
                            </Text>
                            
                            <View 
                            style={{
                                borderTopColor:'rgba(0, 0, 0, 0.1)',
                                borderTopWidth: 1
                            }}/>
                            
                            <View 
                            style={{
                                    flex: 1, justifyContent: 'center',
                                    margin: 3,
                                }}>
                                <TouchableHighlight disabled={!this.state.podEnabled}
                                underlayColor='white'
                                style={{
                                    flex: 1, justifyContent: 'center',
                                    margin: 10
                                }}
                                onPress={() => {
                                    this.setState(prevState => {
                                        prevState.isPhysicalSelected = !prevState.isPhysicalSelected
                                        return prevState
                                    })
                                }}>
                                    <View style={{
                                        flexDirection: 'row', alignItems: 'center', justifyContent: "space-between"
                                    }}>
                                        <View>
                                            <Text style={{fontSize: 18, fontWeight: "700"}}>Physical</Text>
                                            <Text style={{fontSize: 10, opacity: 0.4}}>
                                                POD to be delievered by driver
                                            </Text>
                                        </View>
                                        
                                        <View>
                                            <Image source={{uri: 'https://cdn4.iconfinder.com/data/icons/free-ui/64/v-10-512.png'}}
                                            style={{width: 20, height: 20, margin: 5}}
                                            tintColor={this.state.isPhysicalSelected? '#00CF35' : 'rgba(0, 0, 0, 0.1)'}
                                            />
                                            <Text style={{fontSize: 15, opacity: 0.3}}>
                                                {String.fromCharCode(8377) + this.state.physicalPODCharge}
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
                            flexDirection: 'row', justifyContent: "space-between",
                            alignItems: 'center', opacity: this.state.favDrivEnabled? 1 : 0.3
                        }}>
                            <TouchableHighlight disabled={!this.state.favDrivEnabled}
                            underlayColor='white'
                            style={{flex: 1, padding: 10}}
                            onPress={() => {
                                this.setState(prevState => {
                                    prevState.favDriverSelected = !prevState.favDriverSelected
                                    return prevState
                                })
                            }}>
                                <Text style={{fontSize: 15, opacity: 0.5}}>Allot only favourite drivers</Text>
                            </TouchableHighlight>
                            <Switch disabled={!this.state.favDrivEnabled}
                            trackColor= {{false: 'rgba(0, 0, 0, 0.3', true: 'rgba(255, 203, 40, 0.5)'}}
                            thumbColor= {this.state.favDriverSelected? ACCENT : '#F0F0F0'}
                            style={{padding: 10}}
                            value={this.state.favDriverSelected? true : false}
                            onChange={() => {
                                this.setState(prevState => {
                                    prevState.favDriverSelected = !prevState.favDriverSelected
                                    return prevState
                                })
                            }}/>
                        </View>
                    
                        <View
                        style={{
                            backgroundColor: 'white',
                            borderRadius: 3,
                            marginTop: 10,
                            flexDirection: 'row', justifyContent: "space-between",
                            alignItems: 'center', opacity: this.state.excDrivEnabled? 1 : 0.4
                        }}>
                            <TouchableHighlight disabled={!this.state.excDrivEnabled}
                            underlayColor='white'
                            style={{flex: 1, padding: 10}}
                            onPress={() => {
                                this.setState(prevState => {
                                    prevState.excDriverSelected = !prevState.excDriverSelected
                                    return prevState
                                })
                            }}>
                                <Text style={{fontSize: 15, opacity: 0.5}}>Allot only exclusive drivers</Text>
                            </TouchableHighlight>
                            <Switch disabled={!this.state.excDrivEnabled}
                            trackColor= {{false: 'rgba(0, 0, 0, 0.3', true: 'rgba(255, 203, 40, 0.5)'}}
                            thumbColor= {this.state.excDriverSelected? ACCENT : '#F0F0F0'}
                            style={{padding: 10}}
                            value={this.state.excDriverSelected? true : false}
                            onChange={() => {
                                this.setState(prevState => {
                                    prevState.excDriverSelected = !prevState.excDriverSelected
                                    return prevState
                                })
                            }}/>
                        </View>
                    
                        <View
                        style={{
                            backgroundColor: 'white',
                            borderRadius: 3,
                            marginTop: 10, opacity: this.state.goodsTypeEnabled? 1 : 0.4
                        }}>
                            <TouchableHighlight disabled={!this.state.goodsTypeEnabled}
                            ref={gType => {this.goodsType = gType}}
                            underlayColor='white'
                            onPress={() => {
                                DataController.getItem(DataController.TUT_GOODS_TYPE)
                                .then(status => {
                                    if(status == 'true') {
                                        this.props.navigation.navigate('GoodsList', {setGoodsType: this.setGoodsType.bind(this)})
                                    }
                                    else {
                                        this.showPopover(DataController.TUT_GOODS_TYPE, this.goodsType)
                                    }
                                })
                                .catch(err => {console.log(err)})
                            }}
                            style={{
                                padding: 10
                            }}>
                                <View
                                style={{
                                    flexDirection: 'row', alignItems: 'center',
                                    justifyContent: 'space-between'
                                }}>
                                    <Text style={{fontSize: 15}}>Type of Goods</Text>
                                    <Image source={{uri: 'https://cdn2.iconfinder.com/data/icons/ios-7-icons/50/forward-512.png'}}
                                    style={{width: 15, height: 15}}/>
                                </View>
                                
                            </TouchableHighlight>
                            <Text
                            style={{
                                paddingHorizontal: 20,
                                paddingBottom: 10,
                                fontSize: 15,
                                opacity: 0.4
                            }}>
                                {this.state.goodsType}
                            </Text>
                        </View>

                        <View
                        style={{
                            backgroundColor: 'white',
                            borderRadius: 3,
                            marginTop: 10,
                        }}>
                            <TextInput
                            multiline={true}
                            textAlignVertical="top"
                            placeholder='Description'
                            style={{padding: 10, fontSize: 15, minHeight: 80,}}/>
                        </View>
                    </View>
                </ScrollView>
                
                {/* Fare Estimate button. */}
                <TouchableHighlight
                underlayColor={ACCENT_DARK}
                onPress={() => this.estimateFare()}
                style={{
                    backgroundColor: ACCENT,
                    paddingVertical: 15,
                    justifyContent: 'center',
                    alignItems: 'center',
                    elevation: 10
                }}>
                    <Text style={{fontSize: 18, fontWeight: '700', color: 'white'}}>Estimate Fare</Text>
                </TouchableHighlight>

                {/* Header with Vehicle type, Date and Time. */}
                <Animated.View style={[styles.header, {height: headerHeight}]}>
                    <Animated.View style={[styles.bar, {paddingTop: headerPadding, paddingBottom: 35}]}>
                        <Animated.View style={{opacity: headerOpacity}}>
                            <TouchableHighlight
                            underlayColor='white'
                            onPress={() => {
                                this.props.navigation.navigate('VehicleList', {setVehicle: this.setVehicle.bind(this)})
                            }}>
                                <Image source={vehicleIcon} style={{width: 50, height: 50}}/>
                            </TouchableHighlight>
                        </Animated.View>
                        <Animated.Text style={{fontSize: 22, fontWeight: '700', marginTop: 10, opacity: headerOpacity}}>
                            {this.props.navigation.getParam('vehicle').vehicle_name}
                        </Animated.Text>
                        <Animated.Text style={{fontSize: 10, opacity: 0.4, marginTop: 5, opacity: headerOpacity}}>
                            {this.props.navigation.getParam('covered')}
                        </Animated.Text>
                    </Animated.View>

                    <TouchableHighlight disabled={!this.state.dateTouchableEnabled}
                        underlayColor='black'
                        onPress={() => {
                            this.showDateTimePicker(true, 'date')
                        }}
                        style={{
                            borderRadius: 100,
                            paddingVertical: 8,
                            width: '75%',
                            backgroundColor: this.state.dateTouchableEnabled? 'black' : 'gray',
                            alignItems: 'center',
                            justifyContent: 'center',
                            marginTop: -20, alignSelf: 'center'
                        }}>
                        <Text style={{color: 'white', opacity: this.state.dateTouchableEnabled? 1 : 0.4}}>
                            {this.formatDate(this.state.selectedDateTime)}
                        </Text>
                    </TouchableHighlight>
                </Animated.View>
            
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
            </View>
        )
    }
}

const styles = StyleSheet.create({
    fill: {
        flex: 1,
        backgroundColor: '#EEEEEE'
    },
    row: {
        height: 40,
        margin: 16,
        backgroundColor: '#D3D3D3',
        alignItems: 'center',
        justifyContent: 'center',
    },
    scrollViewContent: {
        marginTop: 180,
        backgroundColor: '#EEEEEE',
        marginHorizontal: 10,
        paddingVertical: 20
    },
    header: {
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

