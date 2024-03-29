import React, {Component} from 'react';
import {
  StyleSheet,
  View,
  Image,
  TouchableHighlight,
  Text,
  Picker,
  Linking,
  Platform,
} from 'react-native';
import {emailValidate} from '../utils/UtilFunc';
import {
  ScrollView,
  TextInput,
  TouchableOpacity,
} from 'react-native-gesture-handler';
import {PopOverComp} from '../utils/PopOverComp';
import {ICONS} from '../utils/AppConstants';
import ToastComp from '../utils/ToastComp';

const Constants = require('../utils/AppConstants');
const DataController = require('../utils/DataStorageController');

const ACCENT = '#FFCB28'; // 255, 203, 40
const ACCENT_DARK = '#F1B800';
const DEFAULT_GOODS = 'Select Goods Type';
const TAG = 'CreateProfile:'

export default class CreateProfile extends Component {
  static navigationOptions = ({navigation}) => {
    return {
      headerTitle: navigation.getParam(Constants.IS_NEW_USER)
        ? 'Create Profile'
        : 'Edit Profile',
    };
  };

  constructor(props) {
    super(props);

    this.tripFreqArray = [
      'Select Trip Frequency',
      '5 Trips a Month',
      '30 Trips a Month',
      '60 Trips a Month',
      'More than 60 Trips',
    ];

    this.selectedCityId = '1';
    this.planId = 0;
    this.paymentData = '';
    (this.tripCode = ''), (this.isExc = false);

    this.state = {
      fromView: null,
      popOverText: '',
      tutCompFieldActive: null,
      isVisible: false,

      isLoading: false,
      tripFreq: 0,
      name: '',
      address: '',
      number: '',
      email: '',
      org: '',
      goodsType: DEFAULT_GOODS,
      goodsId: 0,
      tripPickerOpen: false,
    };
  }

  validateFields() {
    if (
      this.state.tripFreq != 0 &&
      this.state.name != '' &&
      this.state.address != '' &&
      this.state.number != '' &&
      this.state.email != '' &&
      this.state.org != '' &&
      this.state.goodsType != DEFAULT_GOODS &&
      this.state.goodsId != 0
    ) {
      // this.updateUserProfile()

      if (emailValidate(this.state.email)) this.updateUserProfile();
      else this.showToast('Please enter correct E-mail');
    } else {
      this.showToast('Please fill the fields');
    }
  }

  showToast(message) {
    this.toast.show(message);
  }

  async componentDidMount() {
    const toGet = new Array();
    toGet.push(
      DataController.CUSTOMER_NAME,
      DataController.CUSTOMER_MOBILE,
      DataController.EMAIL,
      DataController.ORG,
      DataController.ADDRESS,
      DataController.GOODS_NAME,
      DataController.GOODS_ID,
      DataController.TRIP_FREQ,
    );

    DataController.getItems(toGet)
      .then(res => {
        this.setState(prevState => {
          prevState.name = res[0][1];
          prevState.number = res[1][1];
          prevState.email = res[2][1];
          prevState.org = res[3][1];
          prevState.address = res[4][1];
          prevState.goodsType =
            res[5][1] !== '' &&
            res[5][1] !== null &&
            typeof res[5][1] !== 'undefined'
              ? res[5][1]
              : DEFAULT_GOODS;
          prevState.goodsId =
            res[6][1] !== '' &&
            res[6][1] !== null &&
            typeof res[6][1] !== 'undefined'
              ? res[6][1]
              : 0;
          prevState.tripFreq =
            res[7][1] !== '' &&
            res[7][1] !== null &&
            typeof res[7][1] !== 'undefined'
              ? this.tripFreqArray.indexOf(res[7][1])
              : 0;
          return prevState;
        });
      })
      .catch(err => {
        console.log(err);
        this.showToast(Constants.ERROR_GET_DETAILS);
      });
  }

  setGoodsType = goods => {
    this.setState(prevState => {
      prevState.goodsType = goods.goods_name;
      prevState.goodsId = goods.id;
      return prevState;
    });
  };

  updateUserProfile = async () => {
    this.setState(prevState => {
      prevState.isLoading = true;
      return prevState;
    });

    const reqBody = new FormData();
    const custId = await DataController.getItem(DataController.CUSTOMER_ID);
    reqBody.append(Constants.FIELDS.CUSTOMER_ID, custId);
    reqBody.append(Constants.FIELDS.NAME, this.state.name);
    reqBody.append(Constants.FIELDS.ADDRESS, this.state.address);
    reqBody.append(Constants.FIELDS.EMAIL, this.state.email);
    reqBody.append(Constants.FIELDS.ORG, this.state.org);
    reqBody.append(Constants.FIELDS.TRIP_CODE, this.tripCode);
    reqBody.append(Constants.FIELDS.NUMBER, this.state.number);
    reqBody.append(Constants.FIELDS.GOODS_ID, this.state.goodsId);
    reqBody.append(Constants.FIELDS.GOODS_NAME, this.state.goodsType);
    reqBody.append(
      Constants.FIELDS.TRIP_FREQ,
      this.tripFreqArray[this.state.tripFreq],
    );
    reqBody.append(Constants.FIELDS.CITY_ID, this.selectedCityId);
    reqBody.append(Constants.FIELDS.PLAN_ID, this.planId);
    reqBody.append(Constants.FIELDS.PAYMENT_DATA, this.paymentData),
      reqBody.append(Constants.FIELDS.IS_EXCLUSIVE, this.isExc);

    console.log(TAG, 'updateUserProfile: Request >> ',Constants.BASE_URL+Constants.UPDATE_CUSTOMER_PROFILE, reqBody);

    const request = await fetch(
      Constants.BASE_URL + Constants.UPDATE_CUSTOMER_PROFILE,
      {
        method: 'POST',
        body: reqBody,
        headers: {
          key: Constants.KEY,
        },
      },
    );

    await request
      .json()
      .then(async value => {
        console.log(TAG,'updateUserProfile: Response >> ', value);
        if (value.success) {
          const dataToWrite = new FormData();
          dataToWrite.append(DataController.IS_PROFILE_COMPLETED, 'true');
          dataToWrite.append(DataController.IS_LOGIN, 'true');
          dataToWrite.append(
            DataController.CUSTOMER_ID,
            value.data.id.toString(),
          );
          dataToWrite.append(
            DataController.CUSTOMER_MOBILE,
            value.data.cust_number,
          );
          dataToWrite.append(
            DataController.BUFFER_TIME,
            value.data.configure_setting.buffered_schedule_time.toString(),
          );
          dataToWrite.append(
            DataController.CONFIGURE_SETTING,
            JSON.stringify(value.data.configure_setting),
          );

          dataToWrite.append(DataController.CUSTOMER_NAME, this.state.name);
          dataToWrite.append(
            DataController.RATING,
            value.data.rating.toString(),
          );
          dataToWrite.append(DataController.EMAIL, value.data.cust_email);
          dataToWrite.append(DataController.ORG, value.data.cust_organization);

          // TODO: Decide on the basis of city_list
          dataToWrite.append(DataController.CITY, 'Indore');

          dataToWrite.append(
            DataController.CITY_ID,
            value.data.city_id.toString(),
          );

          dataToWrite.append(DataController.ADDRESS, value.data.cust_address);
          dataToWrite.append(DataController.GOODS_NAME, value.data.goods_name);
          dataToWrite.append(
            DataController.GOODS_ID,
            value.data.goods_id.toString(),
          );
          dataToWrite.append(
            DataController.TRIP_FREQ,
            value.data.selected_trip_frequency,
          );

          dataToWrite.append(DataController.IS_PROFILE_UPDATED, 'true');

          await DataController.setItems(dataToWrite);

          console.log('Response: ', value);
          console.log('Written Data: ', dataToWrite);
          console.log('Profile Updated');

          this.props.navigation.popToTop();
        } else {
          this.showToast(value.message);
        }
      })
      .catch(err => {
        console.log(err);
        this.showToast(Constants.ERROR_UPDATE_PROFILE);
      });

    this.setState(prevState => {
      prevState.isLoading = false;
      return prevState;
    });
  };

  showPopover(compFieldText, comp) {
    this.setState(prevState => {
      prevState.isVisible = true;
      prevState.fromView = comp;
      prevState.popOverText = compFieldText;
      return prevState;
    });
  }

  closePopover() {
    this.setState(prevState => {
      prevState.isVisible = false;
      return prevState;
    });
  }

  render() {
    return (
      <View style={{flex: 1, backgroundColor: 'white'}}>
        <View
          style={{
            backgroundColor: 'rgba(0, 0, 0, 0.04)',
            padding: 20,
            overflow: 'visible',
            position: 'absolute',
            width: '100%',
            top: 0,
          }}>
          <Image
            source={Constants.ICONS.driver_search}
            style={{width: 100, height: 100, opacity: 0.5, alignSelf: 'center'}}
          />
        </View>

        <ScrollView>
          <View
            style={{
              marginTop: 140,
              backgroundColor: 'white',
              paddingHorizontal: 20,
              paddingTop: 30,
            }}>
            <TextInput
              placeholder="NAME"
              returnKeyType="done"
              defaultValue={this.state.name}
              style={styles.inputs}
              onChangeText={text =>
                this.setState(prevState => {
                  prevState.name = text;
                  return prevState;
                })
              }
            />

            <TextInput
              placeholder="MOBILE"
              keyboardType="decimal-pad"
              maxLength={10}
              editable={false}
              defaultValue={this.state.number}
              style={styles.inputs}
            />

            <View
              style={[
                styles.inputs,
                {flexDirection: 'row', alignItems: 'center'},
              ]}>
              <TextInput
                defaultValue={this.state.email}
                returnKeyType="done"
                placeholder="EMAIL"
                keyboardType="email-address"
                textContentType="emailAddress"
                style={{flex: 1}}
                onChangeText={text =>
                  this.setState(prevState => {
                    prevState.email = text;
                    return prevState;
                  })
                }
              />

              <TouchableOpacity
                ref={emH => {
                  this.emailHint = emH;
                }}
                onPress={() => {
                  this.showPopover(Constants.HINT_PROF_EMAIL, this.emailHint);
                }}>
                <Image
                  source={ICONS.info}
                  style={{width: 20, height: 20, opacity: 0.4}}
                />
              </TouchableOpacity>
            </View>

            <View
              style={[
                styles.inputs,
                {flexDirection: 'row', alignItems: 'center'},
              ]}>
              <TextInput
                defaultValue={this.state.org}
                returnKeyType="done"
                placeholder="ORGANIZATION"
                style={{flex: 1}}
                onChangeText={text =>
                  this.setState(prevState => {
                    prevState.org = text;
                    return prevState;
                  })
                }
              />

              <TouchableOpacity
                ref={oH => {
                  this.orgHint = oH;
                }}
                onPress={() => {
                  this.showPopover(Constants.HINT_PROF_ORG, this.orgHint);
                }}>
                <Image
                  source={ICONS.info}
                  style={{width: 20, height: 20, opacity: 0.4}}
                />
              </TouchableOpacity>
            </View>

            <TextInput
              placeholder="CITY"
              editable={false}
              defaultValue="Indore"
              style={styles.inputs}
            />

            <TextInput
              defaultValue={this.state.address}
              returnKeyType="done"
              placeholder="ADDRESS"
              textContentType="fullStreetAddress"
              style={styles.inputs}
              onChangeText={text =>
                this.setState(prevState => {
                  prevState.address = text;
                  return prevState;
                })
              }
            />

            <View
              style={{
                borderBottomColor: 'rgba(0, 0, 0, 0.2)',
                borderBottomWidth: 2,
                borderRadius: 3,
                marginBottom: 25,
              }}>
              <TouchableHighlight
                underlayColor="white"
                onPress={() => {
                  this.props.navigation.navigate('GoodsList', {
                    setGoodsType: this.setGoodsType.bind(this),
                  });
                }}
                style={{
                  padding: 10,
                }}>
                <View>
                  <View
                    style={{
                      flexDirection: 'row',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                    }}>
                    <Text style={{fontSize: 15}}>TYPE OF GOODS</Text>
                    <Image
                      source={Constants.ICONS.forward}
                      style={{width: 15, height: 15}}
                    />
                  </View>

                  <Text
                    style={{
                      paddingHorizontal: 20,
                      paddingTop: 10,
                      fontSize: 15,
                      opacity: 0.4,
                    }}>
                    {this.state.goodsType}
                  </Text>
                </View>
              </TouchableHighlight>
            </View>

            <View
              style={{
                marginBottom: 10,
                paddingHorizontal: 10,
              }}>
              <Text style={{fontSize: 15}}>TRIP FREQUENCY</Text>
              {Platform.OS == 'android' ? (
                <Picker
                  selectedValue={this.state.tripFreq}
                  style={{height: 50, width: '100%'}}
                  onValueChange={(itemValue, itemIndex) =>
                    this.setState(prevState => {
                      prevState.tripFreq = itemValue;
                      return prevState;
                    })
                  }>
                  {this.tripFreqArray.map((value, index) => {
                    return (
                      <Picker.Item label={value} value={index} key={index} />
                    );
                  })}
                </Picker>
              ) : (
                <TouchableOpacity
                  style={{
                    backgroundColor: 'rgba(0, 0, 0, 0.05)',
                    padding: 15,
                    justifyContent: 'center',
                    borderRadius: 4,
                    marginTop: 5,
                    marginHorizontal: 10,
                  }}
                  onPress={() => {
                    this.setState(prevState => {
                      prevState.tripPickerOpen = !prevState.tripPickerOpen;
                      return prevState;
                    });
                  }}>
                  <View
                    style={{
                      flexDirection: 'row',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                    }}>
                    <Text
                      style={{
                        fontSize: 16,
                        opacity: 0.6,
                      }}>
                      {this.tripFreqArray[this.state.tripFreq]}
                    </Text>

                    <Image
                      source={ICONS.forward}
                      style={{
                        width: 18,
                        height: 18,
                        transform: [
                          {
                            rotate: this.state.tripPickerOpen
                              ? '-90deg'
                              : '90deg',
                          },
                        ],
                        opacity: 0.6,
                      }}
                    />
                  </View>
                </TouchableOpacity>
              )}

              {/* Trip Picker for iOS */}
              <View
                style={{
                  backgroundColor: 'rgba(0, 0, 0, 0.02)',
                  marginHorizontal: 10,
                  display: this.state.tripPickerOpen ? 'flex' : 'none',
                }}>
                <Picker
                  selectedValue={this.state.tripFreq}
                  onValueChange={(itemValue, itemIndex) =>
                    this.setState(prevState => {
                      prevState.tripFreq = itemValue;
                      prevState.tripPickerOpen = false;
                      return prevState;
                    })
                  }>
                  {this.tripFreqArray.map((value, index) => {
                    return (
                      <Picker.Item label={value} value={index} key={index} />
                    );
                  })}
                </Picker>
              </View>
            </View>

            <View style={{alignItems: 'center', marginVertical: 30}}>
              <Text style={{fontSize: 13}}>
                By clicking Create Profile, you agree to our{' '}
              </Text>
              <TouchableHighlight
                underlayColor="white"
                onPress={() => {
                  Linking.openURL(Constants.TERMSANDCONDITION).catch(err =>
                    console.log(err),
                  );
                }}>
                <Text
                  style={{
                    color: ACCENT_DARK,
                    textDecorationLine: 'underline',
                    fontSize: 13,
                  }}>
                  Terms and Conditions
                </Text>
              </TouchableHighlight>
            </View>
          </View>
        </ScrollView>

        {/* Overlay to show while loading, to avoid any touches */}
        <View
          style={{
            position: 'absolute',
            backgroundColor: 'white',
            width: '100%',
            opacity: 0.5,
            height: this.state.isLoading ? '100%' : 0,
          }}
        />

        {/* Tutorials popover */}
        <PopOverComp
          isVisible={this.state.isVisible}
          fromView={this.state.fromView}
          closePopover={this.closePopover.bind(this)}
          text={this.state.popOverText}
        />

        {/* Save button */}
        <TouchableHighlight
          disabled={this.state.isLoading}
          underlayColor={ACCENT_DARK}
          onPress={() => {
            this.validateFields();
          }}
          style={{
            backgroundColor: this.state.isLoading ? 'gray' : ACCENT,
            paddingVertical: 15,
            justifyContent: 'center',
            alignItems: 'center',
            elevation: 10,
            shadowColor: 'rgb(0, 0, 0)',
            shadowOffset: {width: 0, height: -2},
            shadowOpacity: 0.2,
            shadowRadius: 4,
          }}>
          <Text
            style={{
              fontSize: 18,
              fontWeight: '700',
              color: 'white',
              opacity: this.state.isLoading ? 0.3 : 1,
            }}>
            {this.state.isLoading
              ? 'Saving...'
              : this.props.navigation.getParam(Constants.IS_NEW_USER)
              ? 'Create Profile'
              : 'Save'}
          </Text>
        </TouchableHighlight>

        {/* Toast box */}
        <ToastComp ref={t => (this.toast = t)} />
      </View>
    );
  }
}

const styles = StyleSheet.create({
  inputs: {
    borderBottomColor: 'rgba(0, 0, 0, 0.2)',
    borderBottomWidth: 2,
    marginBottom: 15,
    padding: 6,
  },
});
