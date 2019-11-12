export class LandmarkModel {
    constructor() {
        console.log("Landmark Model created: ", this.landmark_json)
    }

    landmark_json = {
        is_footer: false,
        is_pickup: false,
        is_favorite: false,
        is_filled: true,
        landmark: '',
        mobile_number: '',
        latitude: '',
        longitude: ''
    }

    setFooter(is) {
        this.landmark_json.is_footer = is
    }

    setPickup(is) {
        this.landmark_json.is_pickup = is
    }

    setFavourite(is) {
        this.landmark_json.is_favorite = is
    }

    setFilled(is) {
        this.landmark_json.is_filled = is
    }

    setLandmark(l) {
        this.landmark_json.landmark = l
    }

    setFooter(is) {
        this.landmark_json.is_footer = is
    }

    setNumber(n) {
        this.landmark_json.mobile_number = n
    }

    setLat(lat) {
        this.landmark_json.latitude = lat
    }

    setLng(lng) {
        this.landmark_json.longitude = lng
    }

    getModel = () => {
        return this.landmark_json
    }

    setModel = (model) => {
        this.landmark_json = model
    }
}