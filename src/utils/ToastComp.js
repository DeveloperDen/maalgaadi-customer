import Toast, {DURATION} from 'react-native-easy-toast';
import React, { Component } from 'react';

const ACCENT = '#FFCB28' // 255, 203, 40
const ACCENT_DARK = '#F1B800'

export default class ToastComp extends Component {
    constructor(props) {
        super(props);
    }

    show(text) {
        this.toast.show(text, 5000);
    }

    render() {
        return(
            <Toast
                ref={toast => this.toast = toast}
                style={{backgroundColor:ACCENT_DARK}}
                fadeInDuration={750}
                fadeOutDuration={1000}
                opacity={0.8}
                textStyle={{color: 'white'}}
            />
        )
    }
}