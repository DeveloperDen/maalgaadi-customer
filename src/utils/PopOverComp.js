import React from 'react'
import {Text} from 'react-native'
import Popover from 'react-native-popover-view'

const ACCENT = '#FFCB28' // 255, 203, 40
const ACCENT_DARK = '#F1B800'

export const PopOverComp = (props) => {
    return(
        <Popover
            isVisible={props.isVisible}
            fromView={props.fromView}
            onRequestClose={() => props.closePopover()}
            popoverStyle={{padding: 10, backgroundColor: ACCENT}}
            arrowStyle={{backgroundColor: ACCENT_DARK}}>
            <Text style={{fontWeight: '700', color: 'white'}}>{props.text}</Text>
        </Popover>
    )
}