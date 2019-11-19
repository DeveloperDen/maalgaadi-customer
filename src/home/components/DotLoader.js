import React, { Component } from 'react';
import {
  Animated,
  View,
  StyleSheet
} from 'react-native';

const ANIM_DURATION = 200
const ANIM_DELAY_FACTOR = 200

export default class DotLoader extends Component {
    constructor(props) {
        super(props)
        this.state = {
            scaleL: new Animated.Value(1),
            scaleC: new Animated.Value(0.9),
            scaleR: new Animated.Value(0.9),
        }
    }

    componentDidMount() {
        // this.startAnim()
    }

    startAnim(secIter = false) {
        Animated.parallel([
            Animated.timing(this.state.scaleL, {
              toValue: secIter? 1 : 0.9,
              duration: ANIM_DURATION,
              useNativeDriver: true,
              delay: (ANIM_DELAY_FACTOR * 0)
            }),
            Animated.timing(this.state.scaleC, {
                toValue: secIter? 1 : 0.9,
              duration: ANIM_DURATION,
              useNativeDriver: true,
              delay: (ANIM_DELAY_FACTOR * 1)
            }),
            Animated.timing(this.state.scaleR, {
                toValue: secIter? 1 : 0.9,
                duration: ANIM_DURATION,
                useNativeDriver: true,
                delay: (ANIM_DELAY_FACTOR * 2)
            })
          ]).start(
              this.startAnim(!secIter)
          );
    }

    render() {
        return(
            <View style={{flexDirection: 'row', justifyContent: 'space-evenly', alignItems: 'center'}}>
                <Animated.View style={[styles.dot, {transform: [
                    {scaleX: this.state.scaleL}, {scaleY: this.state.scaleL}
                ]}]}/>
                <Animated.View style={[styles.dot, {transform: [
                    {scaleX: this.state.scaleC}, {scaleY: this.state.scaleC}
                ]}]}/>
                <Animated.View style={[styles.dot, {transform: [
                    {scaleX: this.state.scaleR}, {scaleY: this.state.scaleR}
                ]}]}/>
            </View>
        )
    }
}

const styles = StyleSheet.create({
    dot: {
        width: 5,
        height: 5,
        borderRadius: 100,
        backgroundColor: 'rgba(0, 0, 0, 0.1)',
        marginVertical: 10
    }
})

