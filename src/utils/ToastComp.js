import Toast, {DURATION} from 'react-native-easy-toast';
import React, { Component } from 'react';

const ACCENT = '#FFCB28' // 255, 203, 40
const ACCENT_DARK = '#F1B800'

export default class ToastComp extends Component {
    constructor(props) {
        super(props);
    }

    show(text) {
        this.toast.show(text, 3000);
    }

    render() {
        return(
            <Toast
                ref={toast => this.toast = toast}
                style={{
                    backgroundColor:ACCENT_DARK, padding: 20,
                    elevation: 4,
                    shadowColor: 'rgb(0, 0, 0)',
                    shadowOffset: {width: 0, height: 4},
                    shadowOpacity: 0.2,
                    shadowRadius: 4,
                }}
                position="top"
                fadeInDuration={100}
                fadeOutDuration={200}
                positionValue={100}
                translateFrom={-50}
                opacity={1}
                textStyle={{color: 'white'}}
            />
        )
    }
}