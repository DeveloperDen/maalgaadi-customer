import AsyncStorage from '@react-native-community/async-storage';

export const IS_LOGIN = 'isLogin'
export const CUSTOMER_ID = "customer_id"
export const CUSTOMER_MOBILE = "number"
export const REFERRAL_CODE = "referral_code"
export const IS_PROFILE_COMPLETED = "is_profile_completed"
export const BUFFER_TIME = "buffer_time"
export const CONFIGURE_SETTING = "configure_setting"
export const CITY_LIST = "city_list"
export const CUSTOMER_NAME = "cust_name"
export const RATING = "rating"
export const EMAIL = "email"
export const ORG = "organization"
export const CITY = "city"
export const CITY_ID = "city_id"
export const ADDRESS = "address"
export const GOODS_NAME = "goods_name"
export const GOODS_ID = "goods_id"
export const TRIP_FREQ = "trip_freq"
export const USER_SETTINGS = "settings"
export const BOOKING_MODEL = "booking_model"

export const getItem = async (key) => {
    try {
        const value = await AsyncStorage.getItem(key);
        return (value);
    }
    catch (err) {
        console.log(err);
        return null;
    }
}

// Here 'keys' will take FormData as input, which stores an array of arrays under key '_parts'
export const setItems = async (keys) => {
    try {
        await AsyncStorage.multiSet(keys._parts);
    }
    catch (err) {
        console.log(err);
    }
}

export const setItem = async (key, value) => {
    try {
        await AsyncStorage.setItem(key, value);
    }
    catch (err) {
        console.log(err);
    }
}

export const getItems = async (keys) => {
    try {
        const value = await AsyncStorage.multiGet(keys);
        return (value);
    }
    catch (err) {
        console.log(err);
    }
}