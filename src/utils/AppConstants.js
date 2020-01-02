export const CITY_INDORE = 1;
export const CITY_JAIPUR = 2;
export const CITY_PUNE = 3;

export const BASE_URL_LIVE = "http://dashboard.maalgaadi.net";
// export const BASE_URL_DEMO = "http://dashboard.rubberducks.in";
export const BASE_URL_DEMO = "http://54.255.142.232/"

export const BASE_URL_IP_LIVE = BASE_URL_LIVE + "/api/v1/customerMobile/";
export const BASE_URL_IP_DEMO = BASE_URL_DEMO + "/api/v1/customerMobile/";

export const CCAVENUE_IP_LIVE = "http://customer.maalgaadi.net/api/v1/customerMobile/";

export const SMS_ORIGIN = "MLGADI";
export const OTP_DELIMITER = ":";

// Usable links starts from here
export const CCAVENUE = CCAVENUE_IP_LIVE;
export const BASE_URL = BASE_URL_IP_DEMO;
export const IMAGE_BASE_URL = BASE_URL_DEMO;
export const KEY = "21db33e221e41d37e27094153b8a8a02";

export const PAYMENT_GATEWAY_URL = "https://secure.ccavenue.com/transaction/initTrans";
export const PAYMENT_GATEWAY_ACCESS_CODE = "AVHR74EK06AD66RHDA";
export const MERCHANT_ID = "153491"
export const CURRENCY = "INR"
export const CURRENT_REDIRECT_URL = BASE_URL + "successPaymentResponseFromCCAPI";
export const CURRENT_CANCEL_URL = BASE_URL + "cancelPaymentResponseFromCCAPI"

export const GET_RSA = "getRSA"
export const ADDEXCLUSIVEDRIVER = "addExclusiveDriver";
export const EXCLUSIVEPLANACTIVE = "exclusivePlanActivate";
export const CHANGELOGINOPERATION = "changeLoginOperation";
export const CUSTOMER_LOGIN = "login";
export const VEHICLE_CATEGORY = "getVehicleDetials";
export const CUSTOMER_FAVORITE_LOCATION = "getCustomerFavoriteLocation";
export const ADD_CUSTOMER_FAVORITE_LOCATION = "addCustomerFavoriteLocation";
export const EDIT_CUSTOMER_FAVORITE_LOCATION = "updateCustomerFavoriteLocation";
export const DELETE_CUSTOMER_FAVORITE_LOCATION = "deleteCustomerFavoriteLocationByMobile";
export const GET_FREE_DRIVER_LOCATION = "getFreeDriversLocation";
export const ADD_CUSTOMER_SIGNUP = "customerSignUp";
export const FORGET_PASSWORD_OTP = "passwordResetByOTP";
export const FORGET_PASSWORD_URL = "customerForgotPassword";
export const ADD_CUSTOMER_PASSWORD = "updateNewCustomer";
export const ADD_CUSTOMER_BOOKING = "addCustomerBooking";
export const GET_NOTIFY_DRIVERREJECTMESSAGE = "getNotifyDriverRejectMessage";
export const EDIT_CUSTOMER_BOOKING = "updateCustomerBooking";
export const GET_DRIVER_DATA_BY_MGCODE = "getFavouriteDriverDetails";
export const GET_TYPES_OF_GOODS = "getTypeOfGoods";
export const GETOFFEREDPERCENTAGE = "getOfferedPercentage";
export const GET_TRIP_ESTIMATE = "calculateOnAppEsitmated";
export const GET_FAVORITE_DRIVER_LIST = "customerFavouriteDriverList";
export const DELETE_BOOKING = "deleteCustomerBooking";
export const CHECK_BOOKINGDRIVER_ALLOT = "checkBookingDriverAllot";
export const GET_RUNNING_TRIP = "getCustomerRunningBooking";
export const GET_COMPLETED_TRIP = "getCustomerBooking";
export const GET_LAST_RATING = "customerLastBookingForRating";
export const SAVE_BOOKING_RESPONSE = "bookingResponseUpdate";
export const UPDATE_FIXED_BOOKING_WAITING_TIME = "fixedBookingResponseUpdate";
export const UPDATE_FIXED_BOOKING_TIP = "updateTipAmount";
export const GET_COUPON_LIST = "promoCodeList";
export const COUPON_CODE_APPLIED = "checkPromoCode";
export const GET_NOTIFICATION_LIST = "getPromotionalNotification";
export const CANCEL_BOOKING = "cancelCustomerBooking";
export const GET_REASON_LIST = "getCancellationReason";
export const GET_CUSTOMER_DETAIL = "getCustomerDetials";
export const UPDATE_CUSTOMER_PROFILE = "updateCustomerProfile";
export const APP_DOWNLOAD = "appDownloads";
export const GET_APP_SETTING_DETAIL = "getCustomerSetting";
export const UPDATE_APP_SETTING = "updateCustomerSetting";
export const VIEW_FAV_LOCATION_URL = "getCustomerFavoriteLocation";
export const PLACE_API_URL = "https://maps.googleapis.com";
export const ADD_FAVORITE_DRIVER = "addFavouriteDriver";
export const ADD_FIXED_BOOKING = "addCustomerFixedBooking";
export const GET_BOOKING_DETAIL = "getBookingDetails";
export const GET_POD_MSG_TO_CUSTOMER = "getPODMessageToCustomer";
export const GET_BOOKING_TRACKING_DATA = "getCustomerLiveTripDriverData";
export const ADD_COMPLAINT_URL = "addComplaint";
export const GET_COMPLAINT_URL = "getCustomerComplaint";
export const GET_FIXED_BOOKING = "getCustomerFixedBookings";
export const GET_LAST_RECENT_TRIP = "customerLastBookingForRating";
export const GET_CONFIG_SETTING = "getCustomerBookingSetting";
export const GET_NOTE_RUNNING_TRIP = "addNotesOnRunningTrip";
export const LOGOUT_API = "logout";
export const EMAIL_URL = "sendPodOrInvoiceThroughEmail";
export const GET_BILLTI = "getCustPendingBillties";
export const TRIP_ROUTE = "getRouteTrip";
export const FCM_TOKEN = "fcm_token";
export const GET_WALLET_LIST = "getCustomerWalletAPI";
export const GET_CUSTOMER_RATING = "addCustomerBookingRating";
export const GET_ACTIVE_DRIVER_LIST = "customerActiveFavouriteDriverList";
export const GET_PENDING_DRIVER_LIST = "customerPendingFavouriteDriverList";
export const DELETE_ACTIVE_DRIVERS = "deleteFavouriteDriverList";
export const DELETE_NOTIFICATION = "removePromotionalNotification";
export const FORCE_UPDATE_APP_URL = "forceUpdateApp";
export const SEND_TRANSACTION_STATUS = "successPaymentResponse";
export const SEND_PAYNOW_TRANSACTION_STATUS = "successPayNowPaymentResponse";
export const GET_CUSTOMER_BILLING_INFO = "getCustomerDetials";
export const GET_TRACK_COMPLA = "trackComplaint";
export const RETROFIT_TIME_OUT = 60;

export const MESSAGE_DURATION = 2000
export const SPLASH_TIMEOUT = 3000

export const OTP_MISMATCH = "OTP did not match"
export const PASS_CHANGE_SUCCESS = "Password changed successfully. Please Login to continue."
export const PASS_MISMATCH = "Password and Confirm Password did not match"
export const LOGOUT_MESSAGE = "Are you sure you want to Logout?"
export const LOGOUT_SUCCESS = "Logged out successfully"
export const ERROR_UPDATE_PROFILE = "Error while updating profile"
export const ERROR_OTP = "Error while generating OTP"
export const ERROR_SIGNUP = "Error while SignUp"
export const ERROR_LOGIN = "Error while LogIn"
export const ERROR_GET_GOODS = "An error occured while getting Goods List"
export const ERROR_GET_DETAILS = "An error occured while getting User Details"
export const ERROR_GET_SETTINGS = "An error occured while getting User Settings"
export const PAST_BOOK_EMPTY = "Looks like you have not booked any MaalGaadi yet. Make your first booking today!"
export const RUNNING_BOOK_EMPTY = "Details for all your ongoing trips will be shown here. Book a MaalGaadi now!"
export const ERROR_GET_BOOKINGS = "An error occured while getting User Bookings"
export const FAV_LOC_EMPTY = "Store your frequently used locations as Favourite and save the hassel of typing long addresses."
export const ERROR_EDIT_LOC = "An error occured while updating favourite location. Please try again later."
export const WALLET_EMPTY = "Looks like you have not booked any MaalGaadi yet. Make your first booking today!"
export const WALLET_RECORD_EMPTY = "No record found for the specified Dates"
export const FIND_DRIVER_TITLE = "Finding nearest driver"
export const FIND_DRIVER_DESC = "We are finding the best of our drivers to take up your booking request"
export const NO_DRIVER_FOUND_T = "No Driver available"
export const NO_DRIVER_FOUND_D = "No drivers are available to accept your booking"
export const CANCEL_EDIT_CONFIRM = "Cancellation charges may apply. Do you want to cancel or edit the trip?"
export const NO_NETWORK = "Seems like you are Offline. Please connect to either a WiFi network or turn on your Cellular Data"
export const NO_ACIVE_FLEET = "Currently, you do not have any favourite drivers in your list. Tap on Add button to manage driver on your fleet."
export const ERR_ACTIVE_FLEET = "An error occured while upadating fleet members."
export const ERROR_LOGOUT = "An error occured while Logging Out. Please try restarting the application."
export const TRANS_FAIL_GUIDE = "Due to bank\'s system and processes it may take approximately 4 hours to reflect money in your Maalgaadi Wallet. Maalgaadi has no control over the time taken by your bank"

// Text for Tutorial/Hint Popover
export const tut_fav_loc = "Place location pin to a location, and tap on Favourite button, to add the location to Favourites"
export const tut_set_date = "You can Schedule Bookings for a later time. Your booked vehicle will arrive at your pick-up location at the scheduled date and time."
export const tut_q_book = "Use Quick Booking to access your previous trips, and re-book them instantly."
export const tut_cov_veh = "Select the option if Covered Vehicle and unselect if Uncovered Vehicle, is required."
export const tut_goods_type = "Tell us the nature of Goods that will be transfered and we will allot the best vehicle and driver to your booking"
export const HINT_PROF_EMAIL = "Invoices and Proof of Deliveries will be sent on this Email id"
export const HINT_PROF_ORG = "Organization Name will be printed on Invoices"

export const IS_NEW_USER = "is_new_user"

export const FIELDS_LOGIN = {
    CUSTOMER_PHONE: "customer_phone",
    CUSTOMER_PASSWORD: "customer_password",
    DEVICE_ID: "device_id",
    DEVICE_FCM_TOKEN: "device_fcm_token",
    FCM_TOKEN: "token"
}

export const FIELDS = {
    NUMBER: "number",
    CUSTOMER_PHONE: "phone",
    CUSTOMER_PASSWORD: "password",
    REF_CODE: "referral_code",
    LAT: "lat",
    LNG: "lng",
    CUSTOMER_ID: "customer_id",
    NAME: "name",
    ADDRESS: "address",
    EMAIL: "email",
    ORG: "organization",
    TRIP_CODE: "trip_code",
    GOODS_ID: "goods_id",
    GOODS_NAME: "goods_name",
    TRIP_FREQ: "selected_trip_frequency",
    CITY_ID: "selected_city_id",
    PLAN_ID: "plan_id",
    PAYMENT_DATA: "payment_data",
    IS_EXCLUSIVE: "is_exclusive_status",
    VEHICLE_ID: "vehicle_id",
    PAGE: "page",
    ID: "id",
    LANDMARK: "landmark",
    ST_DATE: "start_date",
    END_DATE: "end_date",
    CITY_ID_USER: "city_id",
    RANDOM_CODE: "random_code",
    BOOK_EVE_TYPE: "booking_event_type",
    BOOK_EVE: "booking_event",
    WAIT_TIME: "wait_time",
    BOOKING_ID: "booking_id",
    REASON: "reason",
    ISSUE_TYPE: "issues_type",
    ACTION: "action",
    DRIVER_ID: "driver_id",
    MG_CODE: "mg_code",
    STATUS_EXC: "status_exclusive",
    BOOKING_TYPE: "booking_type",
    FAV_DRIV_REQ: "fav_driver_required"
}

export const TRANS_PARAMS = {
    ORDER_ID:  "order_id",
    AMOUNT: "amount",
    ENC_RESP: "encResp",
    MESSAGE: "message",
    PAY_NOW: "paynow",
    STATUS: "status",
    BOOKING_ID: "booking_id",
    CURRENCY: "currency",
    CURRENT_CURRENCY: "INR",
    ACCESS_CODE: "access_code",
    MERCHANT_ID: "merchant_id",
    REDIRECT_URL: "redirect_url",
    CANCEL_URL: "cancel_url",
    ENC_VAL: "enc_val",
    BILLING_NAME: "billing_name",
    BILLING_ZIP: "billing_zip",
    BILLING_ADDRESS: "billing_address",
    BILLING_COUNTRY: "billing_country",
    BILLING_EMAIL: "billing_email",
    BILLING_TEL: "billing_tel",
    BILLING_CITY: "billing_city",
    BILLING_STATE: "billing_state"
}


export const T_C = [
    `MaalGaadi being just an aggregation tech platform, connecting customers to LCV drivers/ owners, will not hold any responsibility what so ever for any loss/ damage caused to either customers, LCV drivers/ owners or any 3 rd party in course of service delivery by the LCV drivers/ owners to their respective customers.`,

    `The MaalGaadi suggested rates mentioned on application while a customer is placing a booking are only suggestions by MaalGaadi based on current market price trends &amp; only meant to help customers do correct price estimations for the booking. Eventually the rates entered/ offered by customer and subsequently accepted by driver shall be the final rates for the service without any further disputes. The rates can be amended/ changed as per the mutual understanding &amp; consent of the driver and customer for any particular booking.`,

    `Though MaalGaadi checks & verifies the basic KYC documents of the LCV drivers/ owners while registering them. It is the customer onus to check the documents while availing services from the driver. MaalGaadi shall not be responsible for any legal or other issue arising due to lack of documents on the part of LCV drivers/owners.`,

    `In case any issue arises during the services provided by the LCV drivers to customers, the same shall has to be resolved between the driver and the customer amicably on their own &amp; MaalGaadi will not get involved, intervene or arbitrage in the dispute resolution.`,

    `In case of any change in trip details/ parameters entered by the customer resulting in change in charges has to be mutually decided, finalised &amp; settled between the drivers and the customers.`,

    `The responsibility of delivery of POD, Delivery Challans or any similar document shall be of the LCV driver/owner and customer may withhold his payment in case of non delivery.`,

    `MaalGaadi is hereby authorized to use the location based information provided by any of the telecommunication companies when the Customer uses the mobile phone to make a booking. The location based information will be used only to facilitate and improve the probability of locating vehicles for the Customer.`,

    `The courts of Indore, India shall have the sole and exclusive jurisdiction in respect of any matters arising from the use of the services offered by MaalGaadi or the agreement or arrangement between MaalGaadi and the Customer.`
]

export const TERMSANDCONDITION = "http://maalgaadi.net/terms-and-condition.html";

export const ICONS = {
    info: {uri: 'https://cdn3.iconfinder.com/data/icons/google-material-design-icons/48/ic_info_48px-512.png'},
    cancel: {uri: 'https://cdn1.iconfinder.com/data/icons/material-core/20/cancel-512.png'},
    tick: {uri: 'https://cdn3.iconfinder.com/data/icons/google-material-design-icons/48/ic_done_48px-512.png'},
    forward: {uri: 'https://cdn2.iconfinder.com/data/icons/ios-7-icons/50/forward-512.png'},
    close: {uri: 'https://cdn3.iconfinder.com/data/icons/google-material-design-icons/48/ic_close_48px-512.png'},
    my_booking: {uri: "https://cdn3.iconfinder.com/data/icons/wpzoom-developer-icon-set/500/78-512.png"},
    my_fleet: {uri: "https://cdn2.iconfinder.com/data/icons/picol-vector/32/group_half_edit-512.png"},
    my_wallet: {uri: "https://cdn0.iconfinder.com/data/icons/finance-android-l-lollipop-icon-pack/24/wallet-512.png"},
    user_pod: {uri: "https://cdn4.iconfinder.com/data/icons/glyphs/24/icons_user2-512.png"},
    settings: {uri: "https://cdn1.iconfinder.com/data/icons/material-core/20/settings-512.png"},
    t_and_c: {uri: "https://cdn3.iconfinder.com/data/icons/wpzoom-developer-icon-set/500/99-512.png"},
    location: {uri: 'https://cdn2.iconfinder.com/data/icons/pittogrammi/142/94-512.png'},
    edit: {uri: 'https://cdn3.iconfinder.com/data/icons/google-material-design-icons/48/ic_mode_edit_48px-512.png'},
    delete: {uri: 'https://cdn3.iconfinder.com/data/icons/google-material-design-icons/48/ic_delete_48px-512.png'},
    ham_menu: {uri: 'https://cdn2.iconfinder.com/data/icons/ios-tab-bar/25/Hamburger_Round-512.png'},
    favourite: {uri: 'https://cdn1.iconfinder.com/data/icons/jumpicon-basic-ui-line-1/32/-_Love-Heart-Romantic-512.png'},
    curr_location: {uri: "https://cdn1.iconfinder.com/data/icons/material-device/22/gps-fixed-512.png"},
    clock: {uri: 'https://cdn2.iconfinder.com/data/icons/pittogrammi/142/10-512.png'},
    driver_fleet: {uri: 'https://cdn1.iconfinder.com/data/icons/user-pictures/100/boy-512.png'},
    driver_search: {uri: 'https://cdn3.iconfinder.com/data/icons/google-material-design-icons/48/ic_account_circle_48px-512.png'},
    add: {uri: 'https://cdn3.iconfinder.com/data/icons/google-material-design-icons/48/ic_add_48px-512.png'},
    cancel_outline: { uri: 'https://cdn3.iconfinder.com/data/icons/google-material-design-icons/48/ic_highlight_remove_48px-512.png' },
    call: { uri: 'https://cdn3.iconfinder.com/data/icons/google-material-design-icons/48/ic_local_phone_48px-512.png' },
    email: {uri: 'https://cdn3.iconfinder.com/data/icons/google-material-design-icons/48/ic_markunread_48px-512.png'},
    work: {uri: 'https://cdn3.iconfinder.com/data/icons/google-material-design-icons/48/ic_work_48px-512.png'},
    home: {uri: 'https://cdn3.iconfinder.com/data/icons/google-material-design-icons/48/ic_home_48px-512.png'},
    goods: {uri: 'https://cdn3.iconfinder.com/data/icons/google-material-design-icons/48/ic_now_widgets_48px-512.png'},
    shipping: {uri: 'https://cdn3.iconfinder.com/data/icons/google-material-design-icons/48/ic_local_shipping_48px-512.png'},
    search: {uri: 'https://cdn4.iconfinder.com/data/icons/ionicons/512/icon-search-512.png'},
    message: {uri: 'https://cdn0.iconfinder.com/data/icons/google-material-design-3-0/48/ic_message_48px-512.png'},
    invoice: {uri: 'https://cdn1.iconfinder.com/data/icons/free-98-icons/32/invoice-512.png'},
    more_dots: {uri: 'https://cdn4.iconfinder.com/data/icons/essential-app-1/16/dot-more-menu-hide-512.png'},
    show_pass: 'https://cdn3.iconfinder.com/data/icons/google-material-design-icons/48/ic_remove_red_eye_48px-512.png',
    hide_pass: 'https://cdn3.iconfinder.com/data/icons/google-material-design-icons/48/ic_visibility_off_48px-512.png',
    warning: {uri: 'https://cdn3.iconfinder.com/data/icons/google-material-design-icons/48/ic_warning_48px-512.png'},
    device: {uri: 'https://cdn3.iconfinder.com/data/icons/google-material-design-icons/48/ic_stay_primary_portrait_48px-512.png'},
    key: {uri: 'https://cdn3.iconfinder.com/data/icons/google-material-design-icons/48/ic_vpn_key_48px-512.png'},
    filter: {uri: 'https://cdn1.iconfinder.com/data/icons/gradak-music/32/music-38-512.png'},
    calendar_today: {uri: 'https://cdn3.iconfinder.com/data/icons/google-material-design-icons/48/ic_insert_invitation_48px-512.png'},
    forward_arrow: {uri: 'https://cdn3.iconfinder.com/data/icons/google-material-design-icons/48/ic_arrow_forward_48px-512.png'},
}