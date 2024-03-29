import React, {Component} from 'react';
import {
    StyleSheet,
    View,
    Animated,
    Dimensions,
    Text,
    Image,
    ViewPropTypes as RNViewPropTypes,
    Easing,
} from 'react-native'

import PropTypes from 'prop-types';
const ViewPropTypes = RNViewPropTypes || View.propTypes;
export const DURATION = { 
    LENGTH_SHORT: 500,
    FOREVER: 0,
};

const {height, width} = Dimensions.get('window');

export default class Toast extends Component {

    constructor(props) {
        super(props);
        this.state = {
            isShow: false,
            text: '',
            opacityValue: new Animated.Value(0),
            translateYValue: new Animated.Value(this.props.translateFrom)
        }
    }

    show(text, duration, callback) {
        this.duration = typeof duration === 'number' ? duration : DURATION.LENGTH_SHORT;
        this.callback = callback;
        this.setState({
            isShow: true,
            text: text,
        });

        this.animation =
        Animated.parallel([
            Animated.timing(
                this.state.translateYValue,
                {
                    toValue: 0,
                    duration: this.props.fadeInDuration,
                    easing: Easing.ease,
                    useNativeDriver: true,
                }
            ),
            Animated.timing(
                this.state.opacityValue,
                {
                    toValue: this.props.opacity,
                    duration: this.props.fadeInDuration,
                    easing: Easing.ease,
                    useNativeDriver: true,
                }
            )
        ])
        this.animation.start(() => {
            this.isShow = true;
            if(duration !== DURATION.FOREVER) this.close();
        });
    }

    close( duration ) {
        let delay = typeof duration === 'undefined' ? this.duration : duration;

        if(delay === DURATION.FOREVER) delay = this.props.defaultCloseDelay || 250;

        if (!this.isShow && !this.state.isShow) return;
        this.timer && clearTimeout(this.timer);
        this.timer = setTimeout(() => {
            this.animation =
            Animated.parallel([
                Animated.timing(
                    this.state.translateYValue,
                    {
                        toValue: this.props.translateFrom,
                        duration: this.props.fadeOutDuration,
                        easing: Easing.ease,
                        useNativeDriver: true
                    }
                ),
                Animated.timing(
                    this.state.opacityValue,
                    {
                        toValue: 0.0,
                        duration: this.props.fadeOutDuration,
                        easing: Easing.ease,
                        useNativeDriver: true
                    }
                )
            ])
            this.animation.start(() => {
                this.setState({
                    isShow: false,
                });
                this.isShow = false;
                if(typeof this.callback === 'function') {
                    this.callback();
                }
            });
        }, delay);
    }

    componentWillUnmount() {
        this.animation && this.animation.stop()
        this.timer && clearTimeout(this.timer);
    }

    render() {
        let pos;
        switch (this.props.position) {
            case 'top':
                pos = this.props.positionValue;
                break;
            case 'center':
                pos = height / 2;
                break;
            case 'bottom':
                pos = height - this.props.positionValue;
                break;
        }

        const view = this.state.isShow ?
            <View
                style={[styles.container, { top: pos }]}
                pointerEvents="none"
            >
                <Animated.View
                    style={[styles.content, { opacity: this.state.opacityValue, flexDirection: 'row', justifyItems: 'space-evenly', alignItems: 'center', transform: [{translateY: this.state.translateYValue}]}, this.props.style]}
                >
                    <Image source={require('../../src/utils/AppConstants').ICONS.warning}
                    style={{width: 20, height: 20, marginRight: 15, tintColor: 'white',}} />
                    {React.isValidElement(this.state.text) ? this.state.text : <Text style={this.props.textStyle}>{this.state.text}</Text>}
                </Animated.View>
            </View> : null;
        return view;
    }
}

const styles = StyleSheet.create({
    container: {
        position: 'absolute',
        left: 0,
        right: 0,
        elevation: 999,
        alignItems: 'center',
        zIndex: 10000,
    },
    content: {
        backgroundColor: 'black',
        borderRadius: 5,
        padding: 10,
    },
    text: {
        color: 'white'
    }
});

Toast.propTypes = {
    style: ViewPropTypes.style,
    position: PropTypes.oneOf([
        'top',
        'center',
        'bottom',
    ]),
    textStyle: Text.propTypes.style,
    positionValue:PropTypes.number,
    fadeInDuration:PropTypes.number,
    fadeOutDuration:PropTypes.number,
    opacity:PropTypes.number
}

Toast.defaultProps = {
    position: 'bottom',
    textStyle: styles.text,
    positionValue: 120,
    fadeInDuration: 500,
    fadeOutDuration: 500,
    opacity: 1
}
