import React, { Component } from 'react';
import {Text, View, Image} from 'react-native';
import { GooglePlacesAutocomplete } from 'react-native-google-places-autocomplete';

const GOOGLE_MAPS_APIKEY = 'AIzaSyCJYc7hsuiHCwUQWQ0NTk0TW0ne0y43NAE';
const DESTINATION = 'destination'
const ORIGIN = 'origin'
 
export default class Search extends Component {
    constructor(props) {
        super(props)
    }
    render() {
        return (
            <View style={{
                flex: 1,
                margin: 10
              }}>
                <GooglePlacesAutocomplete
                placeholder='Search for locality or landmark'
                autoFocus={true}
                returnKeyType={'search'}
                fetchDetails={true}
                renderDescription={row => 
                    <View style={{flexDirection: 'row',alignItems: 'center'}}>
                        <Image
                        source={{uri: 'https://cdn2.iconfinder.com/data/icons/pittogrammi/142/94-512.png'}}
                        style={{width: 15, height:15, margin: 10, opacity: 0.3}}/>
                        <View>
                            <Text style={{fontWeight: "700", fontSize: 15, ellipsisMode: "tail"}} numberOfLines={1}>
                            {row.structured_formatting.main_text}
                        </Text>
                            <Text style={{fontSize:10, ellipsisMode: "tail"}} numberOfLines={1}>
                                {row.structured_formatting.secondary_text}
                            </Text>
                        </View>
                    </View>
                }
                onPress={(data, details=null) => {
                    console.log(`Name: ${data.description} \n Coordinates: {${details.geometry.location.lat}, ${details.geometry.location.lng}}`)
                    
                    if(this.props.navigation.getParam('screen') === 'Home') 
                        this.props.navigation.navigate('Main', {
                            address: data.description,
                            latitude: details.geometry.location.lat,
                            longitude: details.geometry.location.lng,
                        })
                    
                    else
                        if(this.props.navigation.state.params.type === 'origin') {
                            this.props.navigation.state.params.setOrigin(data.description)
                            this.props.navigation.goBack()
                        }
                        else {
                            this.props.navigation.state.params.setDestination(data.description,
                                this.props.navigation.state.params.index)
                            this.props.navigation.goBack()
                        }
                        
                }}

                numberOfLines={1}

                renderLeftButton={() => {
                    return(
                        <Image source={{uri: 'https://cdn4.iconfinder.com/data/icons/ionicons/512/icon-search-512.png'}}
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
                        borderRadius: 5
                    },
                    row: {
                        height: 60,
                        alignItems: 'center',
                        marginVertical: 5,
                        marginEnd: 35
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
                        elevation: 1,
                        flexGrow: 0
                    }
                }}
                nearbyPlacesAPI='GooglePlacesSearch'
                debounce={200}
                />
            </View>
        );
    }
}