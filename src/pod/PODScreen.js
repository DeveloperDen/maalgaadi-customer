import React, { Component } from 'react';
import {
  StyleSheet,
  View,
  Text,
  Image,
  Modal,
  TouchableOpacity,
  TouchableHighlight,
  ActivityIndicator,
  Linking,
  StatusBar,
} from 'react-native';
import { ScrollView } from 'react-native-gesture-handler';
import firebase from 'react-native-firebase';
import ToastComp from '../utils/ToastComp';
const DataController = require('../utils/DataStorageController');
const Constants = require('../utils/AppConstants');
const ACCENT = '#FFCB28'; // 255, 203, 40
const ACCENT_DARK = '#F1B800';
const GREEN = '#24C800'; // 36, 200, 0
const PENDING = 'Pending';
const CANCELLED = 'Cancelled';
const COMPLETED = 'Completed';
const driverIc = require('../../assets/driver_icon.png');
const TAG = 'PODScreen: ';

export default class PODScreen extends Component {
  static navigationOptions = ({ navigation }) => {
    return {
      headerTitle: 'POD',
    };
  };

  constructor(props) {
    super(props);
    this.state = {
      isLoading: false,
    };

    this.url = props.navigation.getParam('podURL', '-');
    this.bookingID = props.navigation.getParam('bookingId', '-');
  }


  componentDidMount() {
    console.log(TAG, 'booking Id: ', this.bookingID);
    console.log(TAG, this.url.length, this.url);
  }

  componentWillUnmount() {
    if (this.props.navigation.getParam(DataController.RUNNING_TRIP_DATA)) {
      this.unsubscribeFCM();
    }
  }

  showToast(message) {
    this.toast.show(message);
  }

  sendEmail = async () => {
    this.setState(prevState => {
      prevState.isLoading = true;
      return prevState;
    });

    const custId = await DataController.getItem(DataController.CUSTOMER_ID);
    const email = await DataController.getItem(DataController.EMAIL);
    const reqURL =
      Constants.BASE_URL +
      Constants.EMAIL_URL +
      '?' +
      Constants.FIELDS.CUSTOMER_ID +
      '=' +
      '"' + custId + '"' +
      '&' +
      Constants.FIELDS.BOOKING_ID +
      '=' +
      this.bookingID +
      '&' +
      Constants.FIELDS.CUST_EMAIL +
      '=' +
      email +
      '&' +
      Constants.FIELDS.POD +
      '=' +
      (this.url.length == 0 ? false : true);

    console.log(TAG, 'sendEmail: Request >> ', reqURL);

    const request = await fetch(reqURL, {
      method: 'POST',
      headers: {
        key: Constants.KEY,
      },
    });
    await request
      .json()
      .then(async value => {
        this.props.navigation.goBack();
        this.showToast(value.message);
        console.log('Response: ', value);
      })
      .catch(err => {
        console.log(err);
        this.showToast(Constants.ERROR_GET_BOOKINGS);
      });


    this.setState(prevState => {
      prevState.isLoading = false;
      return prevState;
    });
  };

  render() {
    return (
      <View style={{ flex: 1, backgroundColor: 'rgba(0, 0, 0, 0.05)' }}>
        <StatusBar backgroundColor="white" barStyle="dark-content" />

        {/* <ScrollView style={{ marginTop: 30 }}> */}
        <View style={styles.container} >
          <View style={{ flex: 0.8 }}>

            <Image style={{ height: '100%', width: '100%' }} source={{ uri: this.url }} />
          </View>
          <View style={{ flex: 0.2, alignItems: 'center', justifyContent: 'center' }}>
            <TouchableHighlight
              disabled={this.state.isLoading}
              underlayColor="rgba(0, 0, 0, 0.02)"
              onPress={() => {
                console.log(TAG, 'Email press!!');
                this.sendEmail();
              }}>

              <View style={{ alignItems: 'center', backgroundColor: '#f7c117', padding: 10, borderRadius: 5, flexDirection: 'row' }}>
                <Image
                  source={Constants.ICONS.email}
                  style={{ width: 20, height: 20, tintColor: 'white' }}
                />
                {this.state.isLoading ? (
                  <ActivityIndicator size="small" color="white" />
                ) : (

                  <Text style={{ color: 'white', fontSize: 15 }}>Email</Text>
                )}

              </View>
            </TouchableHighlight>
          </View>
        </View>
        {/* </ScrollView> */}

        <ToastComp ref={t => (this.toast = t)} />
      </View>
    );
  }
}

const styles = StyleSheet.create({
  row_space: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  container: {
    flex: 1,
    flexDirection: 'column',
    backgroundColor: 'white',
    borderRadius: 4,

  },
  containerTitle: {
    fontWeight: '700',
    opacity: 0.4,
    marginStart: 20,
    marginBottom: 10,
  },
  detailsLeft: {
    opacity: 0.3,
    marginBottom: 10,
  },
  detailsRight: {
    textTransform: 'capitalize',
    fontWeight: '700',
    marginBottom: 10,
  },
});
