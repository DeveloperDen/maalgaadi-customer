import {Platform} from 'react-native';
import {getDistance} from 'geolib';

var PushNotification = require('react-native-push-notification');

const TAG = 'UtilFunc: ';

export const formatDate = (date = new Date()) => {
  const months = [
    'Jan',
    'Feb',
    'Mar',
    'Jun',
    'Jul',
    'Aug',
    'Sep',
    'Oct',
    'Nov',
    'Dec',
  ];
  let dateTimeStr;

  const dateArr = date.toLocaleString().split(' ');
  console.log('Formatting: Array: ', dateArr, ' Date: ', date);
  // ["Wed", "Jan", "15", "11:14:13", "2020"] or ["Sat", "Jan", "", "4", "11:13:48", "2020"] <-- Android
  // ["1/9/2020,", "5:41:18", "PM"] <-- iOS (MM/DD/YYYY)

  if (Platform.OS == 'android') {
    const yyyy = dateArr[2] == '' ? dateArr[5] : dateArr[4];
    const MMM = dateArr[1];
    const dd = dateArr[2] == '' ? dateArr[3] : dateArr[2];
    const hhmmss =
      dateArr[2] == '' ? dateArr[4].split(':') : dateArr[3].split(':');
    const hhmm = hhmmss[0] + ':' + hhmmss[1];
    const ampm = Number.parseInt(hhmmss[0]) >= 12 ? 'PM' : 'AM';
    dateTimeStr = dd + ' ' + MMM + ' ' + yyyy + ' ' + hhmm + ' ' + ampm;
  } else {
    // iOS
    const date = dateArr[0].split('/');
    const yyyy = date[2];
    const MMM = months[parseInt(date[0]) - 1];
    const dd = date[1];
    const hhmmss = dateArr[1].split(':');
    const hhmm = hhmmss[0] + ':' + hhmmss[1];
    const ampm = dateArr[2];
    dateTimeStr = dd + ' ' + MMM + ' ' + yyyy + ' ' + hhmm + ' ' + ampm;
  }

  console.log('Returning Formatted date: ', dateTimeStr);
  return dateTimeStr;
};

export const unFormatDate = dateStr => {
  // dateStr => 2019-11-15 18:57:30
  console.log('Unformatting date: ', dateStr);

  date = new Date(dateStr);
  return date;
};

export const showNotification = (notifMessage, notifTitle) => {
  PushNotification.localNotification({
    /* Android Only Properties */
    largeIcon: 'ic_launcher', // (optional) default: "ic_launcher"
    smallIcon: 'ic_notification', // (optional) default: "ic_notification" with fallback for "ic_launcher"
    vibrate: false,

    /* iOS and Android properties */
    title: notifTitle,
    message: notifMessage,
  });
};

export const emailValidate = email => {
  let reg = /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/;
  return reg.test(email);
};

export const isServiceAvailable = location => {
  let inIndore = false;
  let destination = {
    latitude: location.latitude,
    longitude: location.longitude,
  };
  const array = [
    {
      id: 1,
      city: 'Indore',
      state: ' Madhya Pradesh',
      country: ' India',
      lat: '22.7195687',
      lon: '75.85772580000003',
      allow_distance: 80,
      created_at: '2017-09-11 17:05:12',
      updated_at: '2017-09-29 11:54:24',
    },
  ];
  array.forEach(element => {
    let origin = {
      latitude: element.lat,
      longitude: element.lon,
    };
    if (getDistance(origin, destination) / 1000 <= element.allow_distance) {
      inIndore = true;
    }
  });
  return inIndore;
};

export const getUniqueNumber = () => {
  return new Date();
};
