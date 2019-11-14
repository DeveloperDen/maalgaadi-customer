export class TripEstimateDataModel {
    constructor() {
        console.log("Estimate Model created: ", this.landmark_json)
    }

    estimate_json = {
        data: {},
    }

    setData(estimateData) {
        this.estimate_json.data = estimateData
    }

    getModel = () => {
        return this.estimate_json
    }
}