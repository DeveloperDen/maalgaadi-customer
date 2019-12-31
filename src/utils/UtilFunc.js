var PushNotification = require("react-native-push-notification");

export const formatDate = (date = new Date()) => {
    const dateArr = date.toLocaleString().split(" ");  // [Sat, Nov, 30, 16:45:44, 2019] 
    const yyyy = dateArr[4]
    const MMM = dateArr[1]
    const dd = dateArr[2]
    const hhmmss = dateArr[3].split(":")
    const hhmm = hhmmss[0] + ':' + hhmmss[1]
    const ampm = Number.parseInt(hhmmss[0]) >= 12? 'PM' : 'AM'

    const dateTimeStr = dd + ' ' + MMM + ' ' + yyyy + ' ' + hhmm + ' ' + ampm
    return(dateTimeStr)
}

export const unFormatDate = (dateStr) => {
  // dateStr => 2019-11-15 18:57:30

  date = new Date(dateStr)
  return date
}

export const showNotification = (notMessage, notTitle) => {
  PushNotification.cancelAllLocalNotifications();

  PushNotification.localNotification({
      /* Android Only Properties */
      largeIcon: "ic_launcher", // (optional) default: "ic_launcher"
      smallIcon: "ic_notification", // (optional) default: "ic_notification" with fallback for "ic_launcher"
      vibrate: false, 

      /* iOS and Android properties */
      title: notTitle,
      message: notMessage,
  });
}