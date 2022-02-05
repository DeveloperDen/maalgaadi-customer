import React, {Component} from 'react';
import {StyleSheet, Text, View, Image} from 'react-native';
import {TouchableHighlight} from 'react-native-gesture-handler';
import ToastComp from '../utils/ToastComp';

const notification = require('../../assets/notification.png');
const Constants = require('../utils/AppConstants');
const DataController = require('../utils/DataStorageController');

const SMS = 'SMS Alerts';
const APP_NOTIF = 'App Notifications';
const POD_INV = 'Proof of Delivery & Invoices';
const POD_MAIL = 'Invoice and POD mail Subjects';
const OTHERS = 'Others';

const settings = [
  {
    title: SMS,
    icon: Constants.ICONS.message,
  },
  {
    title: APP_NOTIF,
    icon: notification,
  },
  {
    title: POD_INV,
    icon: Constants.ICONS.email,
  },
  {
    title: POD_MAIL,
    icon: Constants.ICONS.invoice,
  },
  {
    title: OTHERS,
    icon: Constants.ICONS.more_dots,
  },
];
const TAG = 'Settings:';
export default class Settings extends Component {
  static navigationOptions = ({navigation}) => {
    return {
      headerTitle: 'Settings',
    };
  };

  constructor(props) {
    super(props);

    this.state = {
      isLoading: true,
    };

    this.settings = null;
  }

  componentDidMount() {
    this.getSettings();
  }

  showToast(message) {
    this.toast.show(message);
  }

  getSettings = async () => {
    const reqBody = new FormData();
    const custId = await DataController.getItem(DataController.CUSTOMER_ID);
    reqBody.append(Constants.FIELDS.CUSTOMER_ID, custId);

    console.log(TAG, 'getSettings: Request >> ', reqBody);

    const request = await fetch(
      Constants.BASE_URL + Constants.GET_APP_SETTING_DETAIL,
      {
        method: 'POST',
        body: reqBody,
        headers: {
          key: Constants.KEY,
        },
      },
    );
    const response = await request
      .json()
      .then(async value => {
        const settings = JSON.stringify(value.data);

        const dataToWrite = settings;

        await DataController.setItem(DataController.USER_SETTINGS, dataToWrite);
        this.settings = value.data;

        console.log(TAG, 'getSettings: Response >> ', value);
        console.log(TAG, 'getSettings: Data written >> ', dataToWrite);
      })
      .catch(err => {
        console.log(err);
        this.showToast(Constants.ERROR_GET_SETTINGS);
      });

    this.setState(prevState => {
      prevState.isLoading = false;
      return prevState;
    });
  };

  updateSettings = async settings => {
    console.log(TAG, 'updateSettings: settings >> ', settings);
    this.setState(prevState => {
      prevState.isLoading = true;
      return prevState;
    });
    const request = await fetch(
      Constants.BASE_URL + Constants.UPDATE_APP_SETTING,
      {
        method: 'POST',
        body: JSON.stringify(settings),
        headers: {
          key: Constants.KEY,
          'Content-Type': 'application/json',
        },
      },
    ).catch(error => {
      console.error(TAG, 'updateSettings: requestError >> ', error);
    });
    console.log(TAG, 'updateSettings: Request >> ', request);
    const response = await request
      .json()
      .then(async value => {
        const settings = JSON.stringify(value.data);

        const dataToWrite = settings;

        await DataController.setItem(DataController.USER_SETTINGS, dataToWrite);
        this.settings = value.data;

        console.log(TAG, 'updateSettings: Response >> ', value);
        console.log(TAG, 'updateSettings: Data written >> ', dataToWrite);
      })
      .catch(err => {
        console.log(err);
        this.showToast(Constants.ERROR_GET_SETTINGS);
      });

    this.setState(prevState => {
      prevState.isLoading = false;
      return prevState;
    });
  };

  render() {
    return (
      <View>
        {settings.map((value, index) => {
          return (
            <TouchableHighlight
              underlayColor="rgba(0, 0, 0, 0.04)"
              key={index}
              onPress={() => {
                this.props.navigation.navigate('SubSettings', {
                  title: value.title,
                  settings: this.settings,
                  onGoBack: this.updateSettings.bind(this),
                });
              }}>
              <View>
                <View
                  style={{
                    flexDirection: 'row',
                    alignItems: 'center',
                    paddingHorizontal: 15,
                    marginTop: 15,
                  }}>
                  <Image
                    source={value.icon}
                    style={{
                      width: 22,
                      height: 22,
                      opacity: 0.3,
                    }}
                  />
                  <Text style={{flex: 1, fontSize: 15, marginStart: 20}}>
                    {value.title}
                  </Text>
                  <Image
                    source={Constants.ICONS.forward}
                    style={{width: 25, height: 25}}
                  />
                </View>
                <View
                  style={{
                    marginStart: 50,
                    marginTop: 15,
                    borderTopColor: 'rgba(0, 0, 0, 0.1)',
                    borderTopWidth: 1,
                  }}
                />
              </View>
            </TouchableHighlight>
          );
        })}

        {/* Overlay to show while loading, to avoid any touches */}
        <View
          style={{
            position: 'absolute',
            backgroundColor: 'white',
            width: '100%',
            opacity: 0.8,
            height: this.state.isLoading ? '100%' : 0,
          }}
        />

        <ToastComp ref={t => (this.toast = t)} />
      </View>
    );
  }
}

const styles = StyleSheet.create({});
