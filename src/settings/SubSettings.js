import React, { Component } from 'react';
import {
  StyleSheet,
  View,
  Switch,
  TouchableHighlight,
  Text
} from 'react-native';

const ACCENT = '#FFCB28' // 255, 203, 40
const ACCENT_DARK = '#F1B800' 

const SMS = 'SMS Alerts'
const APP_NOTIF = 'App Notifications'
const POD_INV = 'Proof of Delivery & Invoices'
const POD_MAIL = 'Invoice and POD mail Subjects'
const OTHERS = 'Others'

export default class SettingsAll extends Component {
    static navigationOptions = ({navigation}) => {
        return{
            headerTitle: navigation.getParam('title', 'Settings'),
        }
    }

    constructor(props) {
        super(props)
        this.state = {
            sms: [
                {
                    title: 'On Vehicle allotment',
                    on: true
                },
                {
                    title: 'On reaching pickup point',
                    on: true
                },
                {
                    title: 'On reaching destination',
                    on: true
                },
                {
                    title: 'On Billing',
                    on: true
                }
            ],

            notification: [
                {
                    title: 'On Vehicle allotment',
                    on: true
                },
                {
                    title: 'On reaching pickup point',
                    on: true
                },
                {
                    title: 'On reaching destination',
                    on: true
                },
                {
                    title: 'On Billing',
                    on: true
                }
            ],

            podInv: [
                {
                    title: 'Invoice on Email',
                    on: true
                },
                {
                    title: 'POD on Email',
                    on: true
                }
            ],

            podSub: [
                {
                    title: 'Reference Text',
                    on: true
                },
                {
                    title: 'Trip Id',
                    on: true
                },
                {
                    title: 'Vehicle Reg. No.',
                    on: true
                },
                {
                    title: 'Reference Scheduled date',
                    on: true
                },
            ],

            others: [
                {
                    title: 'Reference Text',
                    on: false
                }
            ]
        }
    }

    render() {
        return(
            <View style={{flex: 1}}>
                {this.props.navigation.getParam('title') === SMS && this.state.sms.map((value, index) => {
                        return(
                            <View key={index}>
                                <TouchableHighlight
                                underlayColor='rgba(0, 0, 0, 0.03)'
                                onPress={() => {
                                    this.setState(prevState => {
                                        prevState.sms[index].on = !prevState.sms[index].on
                                        return prevState
                                    })
                                }}>
                                    <View
                                    style={{
                                        flexDirection: 'row', alignItems: 'center', paddingVertical: 10,
                                        justifyContent: 'space-between'
                                    }}>
                                        <Text style={{marginStart: 20, marginVertical: 10, fontSize: 15}}>
                                            {value.title}
                                        </Text>
                                        <Switch value={this.state.sms[index].on}
                                        onValueChange={(value) => {
                                            this.setState(prevState => {
                                                prevState.sms[index].on = value
                                                return prevState
                                            })
                                        }}/>
                                    </View>
                                </TouchableHighlight>
                                <View 
                                    style={{
                                    borderTopColor:'rgba(0, 0, 0, 0.1)',
                                    borderTopWidth: 1}}/>
                            </View> 
                        )
                    })}
                
                {this.props.navigation.getParam('title') === APP_NOTIF && this.state.notification.map((value, index) => {
                        return(
                            <View key={index}>
                                <TouchableHighlight
                                underlayColor='rgba(0, 0, 0, 0.03)'
                                onPress={() => {
                                    this.setState(prevState => {
                                        prevState.notification[index].on = !prevState.notification[index].on
                                        return prevState
                                    })
                                }}>
                                    <View
                                    style={{
                                        flexDirection: 'row', alignItems: 'center', paddingVertical: 10,
                                        justifyContent: 'space-between'
                                    }}>
                                        <Text style={{marginStart: 20, marginVertical: 10, fontSize: 15}}>
                                            {value.title}
                                        </Text>
                                        <Switch value={this.state.notification[index].on}
                                        onValueChange={(value) => {
                                            this.setState(prevState => {
                                                prevState.notification[index].on = value
                                                return prevState
                                            })
                                        }}/>
                                    </View>
                                </TouchableHighlight>
                                <View 
                                    style={{
                                    borderTopColor:'rgba(0, 0, 0, 0.1)',
                                    borderTopWidth: 1}}/>
                            </View> 
                        )
                    })}

                {this.props.navigation.getParam('title') === POD_INV && this.state.podInv.map((value, index) => {
                        return(
                            <View key={index}>
                                <TouchableHighlight
                                underlayColor='rgba(0, 0, 0, 0.03)'
                                onPress={() => {
                                    this.setState(prevState => {
                                        prevState.podInv[index].on = !prevState.podInv[index].on
                                        return prevState
                                    })
                                }}>
                                    <View
                                    style={{
                                        flexDirection: 'row', alignItems: 'center', paddingVertical: 10,
                                        justifyContent: 'space-between'
                                    }}>
                                        <Text style={{marginStart: 20, marginVertical: 10, fontSize: 15}}>
                                            {value.title}
                                        </Text>
                                        <Switch value={this.state.podInv[index].on}
                                        onValueChange={(value) => {
                                            this.setState(prevState => {
                                                prevState.podInv[index].on = value
                                                return prevState
                                            })
                                        }}/>
                                    </View>
                                </TouchableHighlight>
                                <View 
                                    style={{
                                    borderTopColor:'rgba(0, 0, 0, 0.1)',
                                    borderTopWidth: 1}}/>
                            </View> 
                        )
                    })}
                
                {this.props.navigation.getParam('title') === POD_MAIL && this.state.podSub.map((value, index) => {
                        return(
                            <View key={index}>
                                <TouchableHighlight
                                underlayColor='rgba(0, 0, 0, 0.03)'
                                onPress={() => {
                                    this.setState(prevState => {
                                        prevState.podSub[index].on = !prevState.podSub[index].on
                                        return prevState
                                    })
                                }}>
                                    <View
                                    style={{
                                        flexDirection: 'row', alignItems: 'center', paddingVertical: 10,
                                        justifyContent: 'space-between'
                                    }}>
                                        <Text style={{marginStart: 20, marginVertical: 10, fontSize: 15}}>
                                            {value.title}
                                        </Text>
                                        <Switch value={this.state.podSub[index].on}
                                        onValueChange={(value) => {
                                            this.setState(prevState => {
                                                prevState.podSub[index].on = value
                                                return prevState
                                            })
                                        }}/>
                                    </View>
                                </TouchableHighlight>
                                <View 
                                    style={{
                                    borderTopColor:'rgba(0, 0, 0, 0.1)',
                                    borderTopWidth: 1}}/>
                            </View> 
                        )
                    })}

                {this.props.navigation.getParam('title') === OTHERS && this.state.others.map((value, index) => {
                        return(
                            <View key={index}>
                                <TouchableHighlight
                                underlayColor='rgba(0, 0, 0, 0.03)'
                                onPress={() => {
                                    this.setState(prevState => {
                                        prevState.others[index].on = !prevState.others[index].on
                                        return prevState
                                    })
                                }}>
                                    <View
                                    style={{
                                        flexDirection: 'row', alignItems: 'center', paddingVertical: 10,
                                        justifyContent: 'space-between'
                                    }}>
                                        <Text style={{marginStart: 20, marginVertical: 10, fontSize: 15}}>
                                            {value.title}
                                        </Text>
                                        <Switch value={this.state.others[index].on}
                                        onValueChange={(value) => {
                                            this.setState(prevState => {
                                                prevState.others[index].on = value
                                                return prevState
                                            })
                                        }}/>
                                    </View>
                                </TouchableHighlight>
                                <View 
                                    style={{
                                    borderTopColor:'rgba(0, 0, 0, 0.1)',
                                    borderTopWidth: 1}}/>
                            </View> 
                        )
                    })}
            </View>
        )
    }
}

const styles = StyleSheet.create({

});

