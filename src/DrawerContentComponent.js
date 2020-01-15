import React, {useState} from 'react';
import {NavigationActions} from 'react-navigation';
import { Text, View, StyleSheet, Image, Alert, ToastAndroid} from 'react-native'
import { ScrollView, TouchableHighlight } from 'react-native-gesture-handler';
import {getDeviceId} from 'react-native-device-info';

const ACCENT = '#FFCB28'
const ACCENT_DARK = '#F1B800'
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
        icon: Constants.ICONS.my_booking,
        screen: "MyBookings"
    },

    {
        name: "Favourite Locations",
        icon: favLoc,
        screen: "FavouriteLocations"
    },

    {
        name: "Manage My Fleet",
        icon: Constants.ICONS.my_fleet,
        screen: "ManageFleet"
    },

    {
        name: "MG Wallet",
        icon: Constants.ICONS.my_wallet,
        screen: "MGWallet"
    },

    {
        name: "Notifications",
        icon: notifications,
        screen: "Notifications"
    },

    {
        name: "POD",
        icon: Constants.ICONS.user_pod,
        screen: "PendingPOD"
    },

    {
        name: "Rate Card",
        icon: rupee,
        screen: "RateScreen"
    },

    {
        name: "Settings",
        icon: Constants.ICONS.settings,
        screen: "Settings"
    },

    {
        name: "Terms & Conditions",
        icon: Constants.ICONS.t_and_c,
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
                key: Constants.KEY
            }
        })

        const response = await request.json().then(async value => {
            console.log(value)
            if(value.success) {
                const toWrite = new FormData();
                toWrite.append(DataController.IS_LOGIN, "false");
                toWrite.append(DataController.CUSTOMER_ID, "0")
                toWrite.append(DataController.CUSTOMER_MOBILE, "")
                toWrite.append(DataController.RATING, "")
                toWrite.append(DataController.CUSTOMER_NAME, "")
                toWrite.append(DataController.EMAIL, "")
                toWrite.append(DataController.ORG, "")
                toWrite.append(DataController.ADDRESS, "")
                toWrite.append(DataController.GOODS_ID, "")
                toWrite.append(DataController.GOODS_NAME, "")
                toWrite.append(DataController.TRIP_FREQ, "")
                console.log("To write: ", toWrite)

                await DataController.setItems(toWrite)

                props.navigation.navigate("Login", {
                    status: Constants.LOGOUT_API
                })
            }
            else {
                console.log(value.data.message);
                props.navigation.closeDrawer()
                ToastAndroid.show(Constants.ERROR_LOGOUT, ToastAndroid.SHORT);
            }
        }).catch(err => {
            console.log(err)
            props.navigation.closeDrawer()
            ToastAndroid.show(Constants.ERROR_LOGOUT, ToastAndroid.SHORT)
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
    const [rating, setRating] = useState("")
    const [name, setName] = useState("")
    const [number, setNumber] = useState("")
    const [profCheck, setProfCheck] = useState("")

    const toGet = new Array()
        toGet.push(DataController.RATING, DataController.CUSTOMER_NAME,
            DataController.CUSTOMER_MOBILE, DataController.IS_PROFILE_COMPLETED)

    DataController.getItems(toGet)
        .then(res => {
            setRating(res[0][1])
            setName(res[1][1])
            setNumber("+91 " + res[2][1])
            setProfCheck(res[3][1])
        })

    return (
        <View style={{flex: 1}}>
            <TouchableHighlight
            style={styles.headerContainer}
                underlayColor={ACCENT}
                onPress={() => {
                    if(profCheck === "true"){
                        console.log("Completed Profile!")
                        props.navigation.navigate("Profile")
                    }
                    else
                        console.log("Incomplete Profile")
                }}>
                <View 
                style={{
                    flex: 1, justifyContent: 'center',
                }} >
                    <Text style={styles.titleText}>
                        {rating !== ""?
                            "Profile (" + rating + String.fromCharCode(9733) + ")"
                            :
                            "Profile " + String.fromCharCode(9888)
                        }
                    </Text>
                    <Text style={styles.subtitleText}>
                        {
                            ((number === "") || (name === ""))?
                            "(Incomplete Profile)" :
                            name + " (" + number + ")"
                        }
                    </Text>
                </View>
            </TouchableHighlight>

            <ScrollView contentContainerStyle={styles.screenContainer} >
                {screens.map((screen, index) => {
                    return(
                        <TouchableHighlight underlayColor='#EBEBEB'
                        onPress={() => {
                            if(screen.name !== "Logout"){
                                props.navigation.closeDrawer()
                                props.navigation.navigate(screen.screen)
                            }
                            else {
                                props.navigation.closeDrawer()
                                showAlert(props);
                            }
                            
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
        height: 180,
        backgroundColor: ACCENT_DARK,
        paddingHorizontal: 20,
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
        paddingVertical: 20
    }
});

export default DrawerContentComponent