import React from 'react'
import {
    View,
    Text,
    BackHandler,
    StatusBar
} from 'react-native'
import { NO_NETWORK } from './utils/AppConstants';
import { TouchableHighlight } from 'react-native-gesture-handler';
import NetInfo from "@react-native-community/netinfo";
import { NavigationActions } from 'react-navigation';

export default class NoNetworkModal extends React.Component {
    constructor(props) {
        super(props)

        // To avoid going back on pressing the back button.
        this.backHandler = BackHandler.addEventListener("hardwareBackPress", () => {
            return true;
        })
    }

    componentDidMount() {
        this.netInfoSub = NetInfo.addEventListener((state) => {
            if(state.isConnected)
                this.props.navigation.reset([
                    NavigationActions.navigate({routeName: "Home"})
                ])
        })
    }

    componentWillUnmount() {
        this.backHandler.remove();
        this.netInfoSub();
    }

    render() {
      return (
        <View
        style={{
            flex: 1
        }}>
            <StatusBar backgroundColor='rgba(0, 0, 0, 0.6)' barStyle="light-content"/>

            <View 
            style={{
                backgroundColor: 'rgba(0, 0, 0, 0.6)', width: '100%', height: '100%',
                alignItems: 'center', justifyContent: 'center',
            }}>
                <View style={{
                borderRadius: 5, backgroundColor: 'white', overflow: 'hidden',
                width: '75%'
                }}>
                    <Text style={{
                        marginHorizontal: 15, fontWeight: '700', marginTop: 15,
                        fontSize: 16
                    }}>No Network</Text>
                    <Text
                    style={{
                        marginHorizontal: 15, marginTop: 15,
                        fontSize: 13
                    }}>{NO_NETWORK}</Text>

                    <TouchableHighlight underlayColor='gray'
                    onPress={() => {
                        BackHandler.exitApp()
                    }}
                    style={{
                        width: '100%', backgroundColor: 'gray', alignItems: 'center',
                        justifyContent: 'center', paddingVertical: 15, marginTop: 20
                    }}>
                        <Text style={{color: 'white'}}>Exit</Text>
                    </TouchableHighlight>
                </View>
            </View>
        </View>
      );
    }
  }