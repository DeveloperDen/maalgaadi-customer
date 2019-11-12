// Flag for different types of booking for ex Normal, Hourly etc
export const BookingType = {
    NORMAL: "normal", HOURLY: "hourly", FIXED: "fixed"
}

// Flag for different type of booking scenario for ex new booking, re-booking, edit booking
export const  BookingEventType = {
    NEW: "NEW", EDIT: "EDIT", RE_BOOK: "RE_BOOK"
}

export let bookingJSON = {
    landmark_list: [],
    booking_type: BookingType.NORMAL,
    booking_event_type: BookingEventType.NEW,
    booking_estimate: '',
    booking_id: 0,
    minimum_time: 0.0,
    minimum_distance: 0.0,
    loading: false,
    unloading: false,
    electronic_pod: false,
    physical_pod: false,
    urgent_pod: false,
    allot_to_fav_driver: false,
    allot_to_exclu_driver: false,
    payment_at_pickup: false,
    mobile_number: '',
    drop_mobile_number: '',
    remark: '',
    goods_type: '',
    selected_vehicle_category: 0,
    covered: true,
    customer_id: 0,
    goods_id: 0,
    booking_time: '',
    number_of_drop_points: 0,
    random_code: '',
    is_promo_code_applied: false,
    promo_code: '',
    tip: 0,
    selected_vehicle_category_name: '',
    book_later: false,
    vehicle: '',
    schedule_time_edit: true,
    pickup_address_edit: true,
    drop_address_edit: true,
    type_of_booking_edit: true,
    loading_edit: true,
    unloading_edit: true,
    is_goods_type_edit: true,
    payment_method_edit: true,
    pod_edit: true,
    is_vehicle_edit: true,
    is_fav_driver_edit: true,
    is_exc_driver_edit: true,
    number_of_drop_point_edit: true,
    all_edit: true,
    is_contact_edit: true,
    is_tip_edit: true,
    responseCode: 0,
    city_id: ''
}