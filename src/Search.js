import React, { Component } from 'react';
import {Text, View, Image, ActivityIndicator, Modal} from 'react-native';
import { GooglePlacesAutocomplete } from './GooglePlacesAutocomplete';
import { getItem, CUSTOMER_ID } from './utils/DataStorageController';
import { BASE_URL, VIEW_FAV_LOCATION_URL, FIELDS, KEY, ICONS, GOOGLE_MAPS_APIKEY } from './utils/AppConstants';
import ToastComp from './utils/ToastComp';
import { isServiceAvailable } from './utils/UtilFunc';

const ACCENT = '#FFCB28' // 255, 203, 40
 
export default class Search extends Component {
    constructor(props) {
        super(props)

        this.state = {
            placeSelected: false,
            favouriteLocations: null,
        }
    }

    componentDidMount() {
        this.getFavLocations();
    }

    showToast(message) {
        this.toast.show(message);
    }

    getFavLocations = async () => {
        this.showLoadingModal();

        const id = await getItem(CUSTOMER_ID)

        const reqURL = BASE_URL + VIEW_FAV_LOCATION_URL + '?' + 
                        FIELDS.CUSTOMER_ID + '=' + id

        const request = await fetch(reqURL, {
            method: 'GET',
            headers: {
                key: KEY
            }
        })

        const response = await request.json().then(value => {
            console.log(value)

            if(value.success){
                this.setState(prevState => {
                    prevState.favouriteLocations = []
                    value.data.forEach((loc, index, arr) => {
                        const favLoc = {
                            description: loc.address,
                            favourite: true,
                            geometry: {
                                location: {
                                    lat: parseFloat(loc.lat),
                                    lng: parseFloat(loc.lan)
                                }
                            },
                            landmark: loc.landmark
                        };
                        prevState.favouriteLocations.push(favLoc);
                    })

                    return prevState
                })
            }
            else {
                console.log(value.message);
                this.showToast(value.message);
            }
            
        }).catch(err => {
            console.log(err)
            this.showToast(err);
        })
        this.showLoadingModal(false);
    }

    showLoadingModal(visible = true) {
        this.setState(prevState => {
            prevState.placeSelected = visible;
            return prevState;
        })
    }
    render() {
        return (
            <View style={{
            flex: 1,
            margin: 10
            }}>
                {this.state.favouriteLocations != null &&
                    <GooglePlacesAutocomplete
                    placeholder='Search for locality or landmark'
                    autoFocus={true}
                    returnKeyType={'search'}
                    fetchDetails={true}
                    renderDescription={row =>
                        <View
                        style={{flexDirection: 'row', alignItems: 'center', marginEnd: 45}}>
                            <Image
                            source={row.favourite? ICONS.heart_filled : ICONS.location}
                            style={{width: 15, height:15, marginEnd: 10, opacity: 0.3,}}/>
                            <View>
                                {/* <Text style={{fontWeight: "700", fontSize: 15, ellipsizeMode: "tail",}} numberOfLines={1}> */}
                                <Text style={{fontWeight: "700", fontSize: 15}} numberOfLines={1}>
                                    {row.favourite? row.description : row.structured_formatting.main_text}
                                </Text>
                                {/* <Text style={{fontSize:10, ellipsizeMode: "tail",}} numberOfLines={1}> */}
                                <Text style={{fontSize:10}} numberOfLines={1}>
                                    {row.favourite? row.landmark : row.structured_formatting.secondary_text}
                                </Text>
                            </View>
                        </View>
                    }
                    onPress={(data, details=null) => {
                        console.log(`Name: ${data.description} \n Coordinates: {${details.geometry.location.lat}, ${details.geometry.location.lng}}`)
                        let DestinationLocation = {
                            address: data.description,
                            latitude: details.geometry.location.lat,
                            longitude: details.geometry.location.lng,
                          };
                        if (!isServiceAvailable(DestinationLocation)) {
                            this.showToast('Sorry, We don\'t serve this location yet.');
                            this.setState(prevState => {
                                prevState.placeSelected = false;
                                return prevState;
                            })
                            return;
                        }
                        if(this.props.navigation.getParam('screen') === 'Home') 
                            this.props.navigation.navigate('Main', {
                                address: data.description,
                                latitude: details.geometry.location.lat,
                                longitude: details.geometry.location.lng,
                            })
                        
                        else {
                            if(this.props.navigation.state.params.type === 'origin') {
                                this.props.navigation.state.params.setOrigin({
                                    address: data.favourite? data.landmark : data.description,
                                    latitude: details.geometry.location.lat,
                                    longitude: details.geometry.location.lng,
                                })
                                this.props.navigation.goBack()
                            }
                            else {
                                this.props.navigation.state.params.setDestination({
                                    address: data.favourite? data.landmark : data.description,
                                    latitude: details.geometry.location.lat,
                                    longitude: details.geometry.location.lng,
                                },
                                    this.props.navigation.state.params.index)
                                this.props.navigation.goBack()
                            }
                        }     
                    }}

                    onPressItem={() => this.showLoadingModal()}

                    numberOfLines={1}

                    renderLeftButton={() => {
                        return(
                            <Image source={ICONS.search}
                            style={{width: 25, height: 25, opacity: 0.3,
                            alignSelf: 'center', margin: 10}}/>
                        )
                    }}
                    
                    query={{
                        key: GOOGLE_MAPS_APIKEY,
                    }}

                    listUnderlayColor='rgba(0, 0, 0, 0.05)'
                    
                    styles={{
                        textInputContainer: {
                            backgroundColor: 'white',
                            elevation: 2,
                            shadowColor: 'rgb(0, 0, 0)',
                            shadowOffset: {width: 0, height: 2},
                            shadowOpacity: 0.22,
                            shadowRadius: 4,
                            borderRadius: 5
                        },
                        row: {
                            height: 60,
                            paddingHorizontal: 15,
                            alignItems: 'center',
                            marginVertical: 10,
                        },
                        poweredContainer: {
                            justifyContent: 'center',
                            margin: 10
                        },
                        powered: {
                            height: 15,
                        },
                        listView: {
                            marginTop: 5,
                            borderRadius: 5,
                            marginHorizontal: 5
                        },
                        predefinedPlacesDescription: {
                            color: '#1faadb'
                        }
                    }}
                    nearbyPlacesAPI='GooglePlacesSearch'
                    debounce={200}

                    predefinedPlaces={this.state.favouriteLocations}
                    predefinedPlacesAlwaysVisible={true}
                    />
                }

                {/* Loading Dialog */}
                <Modal
                animationType="fade"
                transparent={true}
                visible={this.state.placeSelected}
                onRequestClose={() => {
                    return;
                }}>
                    <View style={{
                    backgroundColor: 'rgba(0, 0, 0, 0.5)',
                    height: '100%',
                    alignItems: "center",
                    justifyContent: 'center'
                    }}>
                        <ActivityIndicator size="large" color={ACCENT} style={{alignSelf: 'center', margin: 15}}/>
                    </View>
                </Modal>

                <ToastComp ref={t => this.toast = t}/>
            </View>
        );
    }
}