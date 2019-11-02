import React from 'react';
import {NavigationActions} from 'react-navigation';
import { Text, View, StyleSheet, Image, Alert} from 'react-native'
import { ScrollView, TouchableHighlight } from 'react-native-gesture-handler';
import {getDeviceId} from 'react-native-device-info';

const ACCENT = '#FFCB28'
const Constants = require('./utils/AppConstants')
const DataController = require('./utils/DataStorageController')
const bookMG = require('../assets/truck.png')
const favLoc = require('../assets/fav_loc.png')
const notifications = require('../assets/notification.png')
const rupee = require('../assets/rupee.png')
const logout = require('../assets/logout.png')

navigateToScreen = ( route, props ) =>(
    () => {
    const navigateAction = NavigationActions.navigate({
        routeName: route
    });
    props.navigation.dispatch(navigateAction);
})

const screens = [
    {
        name: "Book MaalGaadi",
        icon: bookMG,
        screen: "Main"
    },

    {
        name: "My Bookings",
        icon: {uri: "https://cdn3.iconfinder.com/data/icons/wpzoom-developer-icon-set/500/78-512.png"},
        screen: "MyBookings"
    },

    {
        name: "Favourite Locations",
        icon: favLoc,
        screen: "FavouriteLocations"
    },

    {
        name: "Manage My Fleet",
        icon: {uri: "https://cdn2.iconfinder.com/data/icons/picol-vector/32/group_half_edit-512.png"},
        screen: "ManageFleet"
    },

    {
        name: "MG Wallet",
        icon: {uri: "https://cdn0.iconfinder.com/data/icons/finance-android-l-lollipop-icon-pack/24/wallet-512.png"},
        screen: "MGWallet"
    },

    {
        name: "Notifications",
        icon: notifications,
        screen: "Notifications"
    },

    {
        name: "POD",
        icon: {uri: "https://cdn4.iconfinder.com/data/icons/glyphs/24/icons_user2-512.png"},
        screen: "PendingPOD"
    },

    {
        name: "Rate Card",
        icon: rupee,
        screen: "RateCardScreen"
    },

    {
        name: "Settings",
        icon: {uri: "https://cdn1.iconfinder.com/data/icons/material-core/20/settings-512.png"},
        screen: "Settings"
    },

    {
        name: "Terms & Conditions",
        icon: {uri: "https://cdn3.iconfinder.com/data/icons/wpzoom-developer-icon-set/500/99-512.png"},
        screen: "TermsConditions"
    },

    {
        name: "Logout",
        icon: logout
    }
]

const logoutUser = async (props) => {
    const deviceId = getDeviceId()
    const custId = await DataController.getItem(DataController.CUSTOMER_ID)
    console.log("Device Id: ", deviceId, "\n Customer Id: ", custId);

    const reqURL = Constants.BASE_URL + Constants.LOGOUT_API + '?' + 
                        Constants.FIELDS.CUSTOMER_ID + '=' + parseInt(custId) + '&' +
                        Constants.FIELDS_LOGIN.DEVICE_ID + '=' + deviceId

        const request = await fetch(reqURL, {
            method: 'GET',
            headers: {
                key: "21db33e221e41d37e27094153b8a8a02"
            }
        })

        const response = await request.json().then(async value => {
            console.log(value)
            if(value.success) {
                const toWrite = new FormData();
                toWrite.append(DataController.IS_LOGIN, "false");
                toWrite.append(DataController.CUSTOMER_ID, "0")
                console.log("To write: ", toWrite)

                await DataController.setItems(toWrite)

                props.navigation.navigate("Login", {
                    status: Constants.LOGOUT_API
                })
            }
        })
}

const showAlert = (props) => {
    Alert.alert("Logout?", Constants.LOGOUT_MESSAGE, 
    [
        {text: "Cancel", style: "default"},
        {text: "Logout", onPress: () => logoutUser(props), style: "destructive"}
    ])
}

 DrawerContentComponent = (props) => {
    return (
        <View style={{flex: 1}}>
            <View style={styles.headerContainer}>
                <View 
                style={{
                    flex: 1, justifyContent: 'center',
                }} >
                    <Text style={styles.titleText}>
                        Profile (5 {String.fromCharCode(9733)})
                    </Text>
                    <Text style={styles.subtitleText}>
                        Some Name (+91 9838538381)
                    </Text>
                </View>
            </View>

            <ScrollView contentContainerStyle={styles.screenContainer} >
                {screens.map((screen, index) => {
                    return(
                        <TouchableHighlight underlayColor='#EBEBEB'
                        onPress={() => {
                            if(screen.name !== "Logout"){
                                props.navigation.closeDrawer()
                                props.navigation.navigate(screen.screen)
                            }
                            else showAlert(props);
                        }}
                        key={index}>
                            <View style={styles.screenListItem}>
                                <Image source={screen.icon}
                                style={{width: 20, height: 20}} tintColor={ACCENT}/>
                                <Text
                                style={{fontSize: 15, paddingStart: 30,}}>
                                    {screen.name}
                                </Text>
                            </View>
                        </TouchableHighlight>
                    )
                })}
            </ScrollView>
        </View>
    )
 }

const styles = StyleSheet.create({
    headerContainer: {
        height: 150,
        backgroundColor: '#FFCB28',
        paddingLeft: 15
    },
    titleText: {
        color: 'white',
        fontSize: 30,
        fontWeight: '700'
    },
    subtitleText: {
        color: 'white',
        fontSize: 15,
        marginTop: 10
    },

    screenContainer: { 
        paddingTop: 20,
        width: '100%',
    },

    screenListItem: {
        paddingHorizontal: 15,
        flexDirection: 'row',
        alignItems: "center",
        paddingVertical: 16
    }
});

export default DrawerContentComponent