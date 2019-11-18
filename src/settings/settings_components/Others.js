import React, { Component } from 'react';
import {
  StyleSheet,
  View,
  Switch,
  TouchableHighlight,
  Text
} from 'react-native';

export default class Others extends Component {
    constructor(props) {
        super(props)

        this.state = {}

        this.others = [
            {
                field: "oth_reference_text",
                title: 'Reference Text',
            }
        ]
    }

    render() {
        return(
            <View style={{flex: 1}}>
                {this.others.map((value, index) => {
                    return(
                        <View key={index}>
                            <TouchableHighlight
                            underlayColor='rgba(0, 0, 0, 0.03)'
                            onPress={() => {
                                this.props.onSwitchChange(value.field)
                            }}>
                                <View
                                style={{
                                    flexDirection: 'row', alignItems: 'center', paddingVertical: 10,
                                    justifyContent: 'space-between'
                                }}>
                                    <Text style={{marginStart: 20, marginVertical: 10, fontSize: 15}}>
                                        {value.title}
                                    </Text>
                                    <Switch value={this.props.settings[value.field]}
                                    onValueChange={(chVal) => {
                                        this.props.onSwitchChange(value.field)
                                    }}/>
                                </View>
                            </TouchableHighlight>
                            <View 
                                style={{
                                borderTopColor:'rgba(0, 0, 0, 0.1)',
                                borderTopWidth: 1}}/>
                        </View> 
                    )
                })}
            </View>
        )
    }
}

const styles = StyleSheet.create({});

