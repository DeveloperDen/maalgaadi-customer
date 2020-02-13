import React, { Component } from 'react';
import {
  StyleSheet,
  View,
  Text,
  ScrollView,
  Image
} from 'react-native';
import { FIELDS, BASE_URL, GET_NOTIFICATION_LIST, ERROR_GET_DETAILS, KEY, ICONS} from './utils/AppConstants';
import { getItem, CUSTOMER_ID } from './utils/DataStorageController';
import { formatDate } from './utils/UtilFunc';
import ToastComp from './utils/ToastComp';

const ACCENT = '#FFCB28' // 255, 203, 40
const ACCENT_DARK = '#F1B800'

export default class Notifications extends Component {
    static navigationOptions = ({navigation}) => {
        return{
            headerTitle: 'Notifications',
        }
    }

    constructor(props) {
        super(props)
        this.state = {
            isLoading: true,
            notifications: []
        }
    }

    componentDidMount() {
        this.getNotificationsList();
    }

    showToast(message) {
        this.toast.show(message);
    }

    getNotificationsList = async () => {

        const reqBody = new FormData()
        reqBody.append(FIELDS.CUSTOMER_ID, await getItem(CUSTOMER_ID))

        console.log('Request Body: ', reqBody)

        const request = await fetch(BASE_URL + GET_NOTIFICATION_LIST, {
            method: 'POST',
            body: reqBody,
            headers: {
                key: KEY
            }
        })

        await request.json().then(async value => {
            console.log("Response Body: ", value);

            if(value.success) {
                this.setState(prevState => {
                    prevState.notifications = value.data;
                    return prevState;
                })
            }
            else {
                console.log("Could not get Notifications!");
            }
        }).catch(err => {
            console.log(err)
            this.showToast(ERROR_GET_DETAILS);
        })

        this.setState(prevState => {
            prevState.isLoading = false
            return prevState
        })
    }

    render() {
        return(
            <View style={{flex: 1}}>
                <ScrollView style={{display: this.state.notifications.length > 0? 'flex' : 'none'}}>
                    {this.state.notifications.map((notif, index) => {
                        return(
                            <View key={index}>
                                <View style={{flexDirection: 'row', alignItems: 'center', marginVertical: 10, margin: 15}}>
                                    <Image source={ICONS.ic_notifications}
                                    style={{
                                        width: 45, height: 45, marginEnd: 15
                                    }}/>
                                    <View style={{flex: 1}}>
                                        <Text style={{fontSize: 16, fontWeight: "700"}}>
                                            {notif.message}
                                        </Text>

                                        <View style={{alignItems: 'center', justifyContent: 'space-between', opacity: 0.4, marginTop: 10, flexDirection: 'row'}}>
                                            <Text style={{fontSize: 12,}}>{notif.created_at}</Text>
                                            <Text style={{fontSize: 12,}}>PROMOTIONAL</Text>
                                        </View>
                                    </View>
                                </View>

                                <Image source={{uri: BASE_URL + notif.image}} resizeMode="cover" style={{height: 120, margin: 10,}}/>
                                <View 
                                style={{
                                borderTopColor:'rgba(0, 0, 0, 0.1)',
                                borderTopWidth: 1}}/>
                            </View>
                        )
                    })}
                </ScrollView>

                {/* Text to show when list is empty */}
                <View style={{flex: 1, textAlign: "center",
                alignContent: 'center', justifyContent: 'center',
                opacity: 0.3, marginHorizontal: 20, display: this.state.notifications.length > 0? 'none' : 'flex'}}>
                    <Text style={{textAlign: "center", fontSize: 16,}}>
                        {this.state.isLoading? 'Getting notifications...' : "No notifications to be seen here. Enjoy the day."}
                    </Text>
                </View>
            
                <ToastComp ref={t => this.toast = t}/>
            </View>
        )
    }
}

const styles = StyleSheet.create({});