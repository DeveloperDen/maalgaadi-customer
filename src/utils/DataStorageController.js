import AsyncStorage from '@react-native-community/async-storage';

export const IS_LOGIN = 'isLogin'
export const CUSTOMER_ID = "customer_id"
export const CUSTOMER_MOBILE = "number"
export const REFERRAL_CODE = "referral_code"
export const IS_PROFILE_COMPLETED = "is_profile_completed"
export const BUFFER_TIME = "buffer_time"

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
        const result = await AsyncStorage.multiSet(keys._parts);
        console.log(result);
    }
    catch (err) {
        console.log(err);
    }
}