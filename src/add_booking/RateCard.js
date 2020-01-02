import React, { Component } from 'react';
import {
  StyleSheet,
  View,
  Text,
  TouchableHighlight, 
  Image,
} from 'react-native';
import { ScrollView } from 'react-native-gesture-handler';
import { ICONS } from '../utils/AppConstants';


const ACCENT = '#FFCB28' // 255, 203, 40 

export default class RateCard extends Component {
    static navigationOptions = ({navigation}) => {
        return{
            headerTitle: 'Rate Card',
            headerLeft: 
            <TouchableHighlight
            onPress={() => {
                navigation.goBack()
            }}
            underlayColor='white'>
                <Image
                source={ICONS.close}
                tintColor='black'
                style={{width: 24, height: 24, marginStart: 16}}/>
            </TouchableHighlight>
        }
    }

    constructor(props) {
        super(props)
        this.state = {
        }
        this.rates = this.props.navigation.getParam('vehicle')
    }

    render() {
        return(
            <View style={{flex: 1, backgroundColor: 'white'}}>
                <ScrollView style={{display: this.state.rates === ''? "none" : "flex"}}>
                    {this.rates.map((value, index) => {
                        return(
                            <View key={index}>
                                <View style={{
                                    flexDirection: 'row', paddingVertical: 15, paddingHorizontal: 20,
                                    justifyContent: 'space-between'
                                }}>
                                    <View>
                                        <Text style={{fontSize: 15, fontWeight: '700'}}>
                                            {value.type}
                                        </Text>
                                        {value.extras.length > 0? 
                                        <Text style={{fontSize: 10, opacity: 0.4, marginTop: 10}}>{value.extras[0]}</Text> 
                                        : null}
                                    </View>
                                    <View style={{alignItems: 'flex-end'}}>
                                        <Text style={{fontSize: 15, fontWeight: '700'}}>
                                            {this.state.rates[value.field]}
                                        </Text>
                                        {value.extras.length > 1?
                                        <Text style={{fontSize: 10, opacity: 0.4, marginTop: 10}}>{value.extras[1]}</Text> 
                                        : null}
                                    </View>
                                </View>

                                <View 
                                style={{
                                    marginHorizontal: 15,
                                    borderTopColor:'rgba(0, 0, 0, 0.1)',
                                    borderTopWidth: 1
                                }}/>
                            </View> 
                        )
                    })}

                    <Text style={{textAlign: 'center', alignSelf: 'center', opacity: 0.4, fontSize: 10, padding: 15}}>
                        *Loading/Unloading charges applicable only for fround floor goods with unit weight upto 60Kgs.
                        All other charges like Toll Tax etc. will be charged on actual basis.
                    </Text>
                </ScrollView>
            </View>
        )
    }
}

const styles = StyleSheet.create({

});

