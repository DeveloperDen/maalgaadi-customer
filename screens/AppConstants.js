
module.exports = {

    ICON : {
     URL_TICK: "",
     URL_CART: "",
    },
    CITYS : {
     IMDORE: 1,
     JAIPUR: 2,
     PUNE: 3,
     BHOPAL: 4,
    },

     BASE_URL_LIVE : "http://dashboard.maalgaadi.net" ,
     BASE_URL_DEMO : "http://dashboard.rubberducks.in" ,

     BASE_URL_IP_LIVE : BASE_URL_LIVE+"/api/v1/customerMobile/" ,
     BASE_URL_IP_DEMO : BASE_URL_DEMO+"/api/v1/customerMobile/" ,

     CCAVENUE_IP_LIVE : "http://customer.maalgaadi.net/api/v1/customerMobile/" ,

     SMS_ORIGIN : "MLGADI" ,

     OTP_DELIMITER : ":" ,


    /*Live Server Detail*/
     CCAVENUE : CCAVENUE_IP_LIVE ,

    // BASE_URL :  BASE_URL_IP_LIVE ,
    // IMAGE_BASE_URL : BASE_URL_LIVE ,

     BASE_URL :  BASE_URL_IP_DEMO ,
     IMAGE_BASE_URL : BASE_URL_DEMO ,

     PAYMENT_GATEWAY_URL : "https://secure.ccavenue.com/transaction/initTrans" ,
     PAYMENT_GATEWAY_ACCESS_CODE : "AVHR74EK06AD66RHDA" ,


    /*API Name */
     ADDEXCLUSIVEDRIVER : "addExclusiveDriver" ,
     EXCLUSIVEPLANACTIVE : "exclusivePlanActivate" ,
     CHANGELOGINOPERATION : "changeLoginOperation" ,
     CUSTOMER_LOGIN : "login" ,
     VEHICLE_CATEGORY : "getVehicleDetials" ,
     CUSTOMER_FAVORITE_LOCATION : "getCustomerFavoriteLocation" ,
     ADD_CUSTOMER_FAVORITE_LOCATION : "addCustomerFavoriteLocation" ,
     EDIT_CUSTOMER_FAVORITE_LOCATION : "updateCustomerFavoriteLocation" ,
     DELETE_CUSTOMER_FAVORITE_LOCATION : "deleteCustomerFavoriteLocationByMobile" ,
     GET_FREE_DRIVER_LOCATION : "getFreeDriversLocation" ,
     ADD_CUSTOMER_SIGNUP : "customerSignUp" ,
     FORGET_PASSWORD_OTP : "passwordResetByOTP" ,
     FORGET_PASSWORD_URL : "customerForgotPassword" ,
     ADD_CUSTOMER_PASSWORD : "updateNewCustomer" ,
     ADD_CUSTOMER_BOOKING : "addCustomerBooking" ,
     GET_NOTIFY_DRIVERREJECTMESSAGE : "getNotifyDriverRejectMessage" ,
     EDIT_CUSTOMER_BOOKING : "updateCustomerBooking" ,
     GET_DRIVER_DATA_BY_MGCODE : "getFavouriteDriverDetails" ,
     GET_TYPES_OF_GOODS : "getTypeOfGoods" ,
     GETOFFEREDPERCENTAGE : "getOfferedPercentage" ,
     GET_TRIP_ESTIMATE : "calculateOnAppEsitmated" ,
     GET_FAVORITE_DRIVER_LIST : "customerFavouriteDriverList" ,
     DELETE_BOOKING : "deleteCustomerBooking" ,
     CHECK_BOOKINGDRIVER_ALLOT : "checkBookingDriverAllot" ,
     GET_RUNNING_TRIP : "getCustomerRunningBooking" ,
     GET_COMPLETED_TRIP : "getCustomerBooking" ,
     GET_LAST_RATING : "customerLastBookingForRating" ,
     SAVE_BOOKING_RESPONSE : "bookingResponseUpdate" ,
     UPDATE_FIXED_BOOKING_WAITING_TIME : "fixedBookingResponseUpdate" ,
     UPDATE_FIXED_BOOKING_TIP : "updateTipAmount" ,
     GET_COUPON_LIST : "promoCodeList" ,
     COUPON_CODE_APPLIED : "checkPromoCode" ,
     GET_NOTIFICATION_LIST : "getPromotionalNotification" ,
     CANCEL_BOOKING : "cancelCustomerBooking" ,
     GET_REASON_LIST : "getCancellationReason" ,

     GET_CUSTOMER_DETAIL : "getCustomerDetials" ,
     UPDATE_CUSTOMER_PROFILE : "updateCustomerProfile" ,
     APP_DOWNLOAD : "appDownloads" ,


    /*get and update setting API*/
     GET_APP_SETTING_DETAIL : "getCustomerSetting" ,
     UPDATE_APP_SETTING : "updateCustomerSetting" ,


     VIEW_FAV_LOCATION_URL : "getCustomerFavoriteLocation" ,
    /*place Api URL */
     PLACE_API_URL : "https://maps.googleapis.com" ,
     ADD_FAVORITE_DRIVER : "addFavouriteDriver" ,
     ADD_FIXED_BOOKING : "addCustomerFixedBooking" ,
     GET_BOOKING_DETAIL : "getBookingDetails" ,
     GET_POD_MSG_TO_CUSTOMER : "getPODMessageToCustomer" ,
     GET_BOOKING_TRACKING_DATA : "getCustomerLiveTripDriverData" ,

    /*ComplaAPI*/
     ADD_COMPLAINT_URL : "addComplaint" ,
     GET_COMPLAINT_URL : "getCustomerComplaint" ,
     GET_FIXED_BOOKING : "getCustomerFixedBookings" ,

    /*Rating API*/
     GET_LAST_RECENT_TRIP : "customerLastBookingForRating" ,

     GET_CONFIG_SETTING : "getCustomerBookingSetting" ,
     GET_NOTE_RUNNING_TRIP : "addNotesOnRunningTrip" ,

    /*Logout API*/
     LOGOUT_API : "logout" ,

    /*POD API*/
     EMAIL_URL : "sendPodOrInvoiceThroughEmail" ,
     GET_BILLTI : "getCustPendingBillties" ,
    /* Trip route url (DTC & Trip) */
     TRIP_ROUTE : "getRouteTrip" ,

     FCM_TOKEN : "fcm_token" ,
     GET_WALLET_LIST : "getCustomerWalletAPI" ,
     GET_CUSTOMER_RATING : "addCustomerBookingRating" ,
     GET_ACTIVE_DRIVER_LIST : "customerActiveFavouriteDriverList" ,
     GET_PENDING_DRIVER_LIST : "customerPendingFavouriteDriverList" ,
     DELETE_ACTIVE_DRIVERS : "deleteFavouriteDriverList" ,
     DELETE_NOTIFICATION : "removePromotionalNotification" ,
     FORCE_UPDATE_APP_URL : "forceUpdateApp" ,
     SEND_TRANSACTION_STATUS : "successPaymentResponse" ,
     SEND_PAYNOW_TRANSACTION_STATUS : "successPayNowPaymentResponse" ,
     GET_CUSTOMER_BILLING_INFO : "getCustomerDetials" ,
     GET_TRACK_COMPLA : "trackComplaint" ,

    // max time till api wait for response
    RETROFIT_TIME_OUT : 60 ,
    /*terms and conditions*/
     TERMSANDCONDITION : "http://maalgaadi.net/terms-and-condition.html" ,
}
