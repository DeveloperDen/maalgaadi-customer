import React, {Component, useEffect} from 'react';
import {
  StyleSheet,
  View,
  StatusBar,
  Image,
  Text,
  TouchableHighlight,
  Modal,
  ActivityIndicator,
  NativeModules,
  NativeEventEmitter,
  Linking,
  TouchableOpacity,
  Platform,
} from 'react-native';
// import firebase from 'react-native-firebase';
import {getDeviceId, getVersion} from 'react-native-device-info';
import {ICONS} from './utils/AppConstants';

const Constants = require('./utils/AppConstants');
const DataController = require('./utils/DataStorageController');
const logo = require('../assets/logo_splash.png');
const ACCENT = '#FFCB28'; // 255, 203, 40
const ACCENT_DARK = '#F1B800';

const TAG = 'Splash: ';

import messaging from '@react-native-firebase/messaging';

export default class Splash extends Component {
    
  static navigationOptions = ({navigation}) => {
    return {
      headerStyle: {display: 'none'},
    };
  };

  constructor(props) {
    super(props);
    this.state = {
      showAppUpdateModal: false,
    };
    this.isAppUpdated = true;

    // checkedVersion will be true only when the result of checkVersion is returned
    this.checkedVersion = false;

    // processCompleted will be true only when the time have completed(or when all the processed before the start of timer have completed)
    this.processesCompleted = false;
  }

  async componentDidMount() {
    // Check present instance's build number with the live application on store.
    await this.checkBuildNumber();

    // Check for the permission and if not enabled, get the permission.
    // const enabled = await firebase.messaging().hasPermission()
    const enabled = await messaging().hasPermission()
    console.log(TAG,"Firebase Permission checked: ", enabled);
    if(!enabled) {
        console.log(TAG, "Requesting...");
        // await this.requestFirebasePermission();
        await this.requestUserPermission();
    }
    // Register for iOS remote message.
    console.log(TAG, 'Registering for Remote Notifications.');
    try {
    //   await firebase.messaging().ios.registerForRemoteNotifications();
      await messaging().registerDeviceForRemoteMessages();
      console.log(TAG, 'Now registered for remote Notifications.');
    } catch (err) {
      console.log(TAG, 'Could not register for Remote Notification: ', err);
    }

    this.updateFCMToken();

    // FCM token subscriber
    // this.unsubscribeFCMRefresh = firebase
    //   .messaging()
    //   .onTokenRefresh((token) => {
    //     console.log('FCM Token refreshed. Updating...');
    //     this.updateFCMToken(token);
    //   });

      this.unsubscribeFCMRefresh = messaging().onTokenRefresh(token => {
          console.log(TAG, 'FCM Token Refreshed >>> ', token);
        this.updateFCMToken(token);
      });

  
    setTimeout(async () => {
      this.processesCompleted = true;

      // Proceed only if the version is checked
      if (this.checkedVersion) {
        console.log('Proceeding on time!');
        if (this.isAppUpdated) {
          const screen =
            (await DataController.getItem(DataController.IS_LOGIN)) === 'true'
              ? 'HomeDrawerNavigator'
              : 'RegistrationNavigator';
          this.props.navigation.navigate(screen);
        } else {
          this.setState((prevState) => {
            prevState.showAppUpdateModal = true;
            return prevState;
          });
        }
      }
    }, Constants.SPLASH_TIMEOUT);
  }

  async requestUserPermission() {
    const authStatus = await messaging().requestPermission();
    const enabled =
      authStatus === messaging.AuthorizationStatus.AUTHORIZED ||
      authStatus === messaging.AuthorizationStatus.PROVISIONAL;

    if (enabled) {
      console.log('Authorization status:', authStatus);
    } else {
      console.log('Requesting...');
      await this.requestUserPermission();
    }
  }

  async checkBuildNumber() {
    if (Platform.OS == 'android') {
      NativeModules.VersionChecker.checkVersion(getVersion());
      this.eventEmitter = new NativeEventEmitter(NativeModules.VersionChecker);
      this.eventEmitter.addListener('VersionCheck', async (result) => {
        this.isAppUpdated = result.isUpdated;

        console.log('App is updated: ', this.isAppUpdated);
        this.checkedVersion = true;

        // If all the process except version checking are completed, proceed to next screen/dialog.
        if (this.processesCompleted) {
          console.log('Proceeding after all the processes...');
          if (this.isAppUpdated) {
            const screen =
              (await DataController.getItem(DataController.IS_LOGIN)) === 'true'
                ? 'HomeDrawerNavigator'
                : 'RegistrationNavigator';
            this.props.navigation.navigate(screen);
          } else {
            this.setState((prevState) => {
              prevState.showAppUpdateModal = true;
              return prevState;
            });
          }
        }
      });
    } else {
      const request = await fetch(
        'https://itunes.apple.com/lookup?bundleId=avpstransort.maalgaadicustomerapp',
        {
          method: 'GET',
        },
      );

      await request
        .json()
        .then((value) => {
          this.checkedVersion = true;
          const storeVersion = parseFloat(value.results[0].version);
          const installedVersion = parseFloat(getVersion());
          console.log('App Store Version: ', storeVersion);
          console.log('Installed Version: ', installedVersion);

          if (storeVersion > installedVersion) this.isAppUpdated = false;
        })
        .catch((err) => {
          console.log(err);
        });
    }
  }

  // Update FCM token on the server.
  async updateFCMToken(token = '') {
    if (token == '') {
      console.log(
        'updateFCMToken: ',
        'No token provided, getting token now...',
      );
      console.log(
        'APNS Token: ',
        // await firebase.messaging().ios.getAPNSToken(),
        await messaging().getAPNSToken(),
      );
    //   token = await firebase.messaging().getToken();
    token = await messaging().getToken();
      console.log('Splash: ', 'updateFCMToken >> ', '' + token);
    }
    DataController.setItem(DataController.FCM_TOKEN, token);

    const reqURL =
      Constants.BASE_URL +
      Constants.APP_DOWNLOAD +
      '?' +
      Constants.FIELDS_LOGIN.DEVICE_ID +
      '=' +
      getDeviceId() +
      '&' +
      Constants.FIELDS_LOGIN.FCM_TOKEN +
      '=' +
      token;

    console.log('Request: ', reqURL);

    const request = await fetch(reqURL, {
      method: 'GET',
      headers: {
        key: Constants.KEY,
      },
    });

    await request
      .json()
      .then((value) => {
        console.log('FCM update response: ', value);
      })
      .catch((err) => {
        console.log(err);
      });
  }

//   async requestFirebasePermission() {
//     await firebase
//       .messaging()
//       .requestPermission()
//       .then((result) => {
//         console.log('Firebase Permission requested: Granted: ', result);
//       })
//       .catch((error) => {
//         console.log('Firebase Permission requested Error: ', error);
//         this.requestFirebasePermission();
//       });
//   }


  componentWillUnmount() {
    this.unsubscribeFCMRefresh();

    if (Platform.OS == 'android')
      this.eventEmitter.removeAllListeners('VersionCheck');
  }

  render() {
    return (
      <View
        style={{
          flex: 1,
          backgroundColor: ACCENT,
          justifyContent: 'center',
          alignItems: 'center',
        }}>
        <StatusBar hidden={true} />

        <Image source={logo} resizeMode="contain" style={{width: '80%'}} />

        <ActivityIndicator size="large" color="white" />

        {/* Modal to show when app is not updated */}
        <Modal
          animationType="fade"
          transparent={true}
          visible={this.state.showAppUpdateModal}
          onRequestClose={() => {
            return;
          }}>
          <View
            style={{
              backgroundColor: 'rgba(0, 0, 0, 0.4)',
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
              {/* TODO: Remove CLOSE button to force user to update application
                                <TouchableOpacity style={{margin: 15}}
                                onPress={async () => {
                                    const screen = (await DataController.getItem(DataController.IS_LOGIN) === "true")? 
                                    'HomeDrawerNavigator' : 'RegistrationNavigator'
                                    this.props.navigation.navigate(screen)
                                }}>
                                    <Image source={ICONS.close} style={{width: 20, height: 20, opacity: 0.4}}/>
                                </TouchableOpacity> */}

              <Image
                source={ICONS.new}
                style={{
                  width: 100,
                  height: 100,
                  alignSelf: 'center',
                  margin: 15,
                  marginTop: 20,
                }}
              />
              <Text
                style={{
                  marginBottom: 20,
                  marginHorizontal: 10,
                  fontSize: 13,
                  textAlign: 'center',
                  opacity: 0.4,
                }}>
                {Constants.UPDATE_APP_MESSAGE}
              </Text>

              <TouchableHighlight
                underlayColor="rgba(255, 203, 40, 0.8)"
                onPress={() => {
                  console.log('Will update application...');
                  const url =
                    Platform.OS == 'ios'
                      ? 'itms-apps://itunes.apple.com/in/app/id1493757012?mt=8'
                      : 'market://details?id=avpstransort.maalgaadicustomerapp';
                  Linking.openURL(url);
                }}
                style={{
                  paddingVertical: 15,
                  alignItems: 'center',
                  justifyContent: 'center',
                  backgroundColor: ACCENT,
                }}>
                <Text style={{color: 'white'}}>UPDATE</Text>
              </TouchableHighlight>
            </View>
          </View>
        </Modal>
      </View>
    );
  }
}

const styles = StyleSheet.create({});
