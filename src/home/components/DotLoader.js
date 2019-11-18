import React, { Component } from 'react';
import {
  Image
} from 'react-native';

const dot_0 = require('../../../assets/one_dot.png')
const dot_1 = require('../../../assets/two_dot.png')
const dot_2 = require('../../../assets/three_dot.png')
const LOAD_ANIM_TIME = 200
const ACCENT = '#FFCB28' // 255, 203, 40
const ACCENT_DARK = '#F1B800' 

export default class DotLoader extends Component {
    constructor(props) {
        super(props)
        this.state = {
            index: 0,
        }

        this.dots = [
            dot_0, dot_1, dot_2
        ]
    }

    componentDidMount() {
        this.load()
    }

    load = () => {
        setTimeout(() => {
          this.setState(prevState => {
            prevState.index = (prevState.index + 1) % 3
            return prevState
          });
          this.load();
        }, LOAD_ANIM_TIME)
    }

    render() {
        return(
            <Image source={this.dots[this.state.index]}
                style={{width: 25, height: 25}}
                tintColor='#B0B0B0'/>
        )
    }
}

