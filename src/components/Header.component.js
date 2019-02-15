import React, {Component} from 'react';
import { StyleSheet, Text, View, Image } from 'react-native';

export const Header = () => {
  return (
    <View style={[styles.shadowStyle,{flexDirection:'row',paddingHorizontal:'5%',paddingTop:'5%'}]}>
      <View style={{flex:0.2}}>
        <Image
          style={{width:'70%', height:'60%'}}
          source={{uri: 'https://facebook.github.io/react-native/docs/assets/favicon.png'}}
        />
      </View>
      <View style={{flexDirection:'row',flex:0.8}}>
        <View>
          <Text style={{fontSize:35}}>GitHub</Text>
        </View>
        <View>
          <Text style={{fontSize:18,paddingVertical:'6%',paddingHorizontal:'5%'}}>Popular</Text>
        </View>
        <View>
          <Text style={{fontSize:18,paddingVertical:'6%'}}>Repositories</Text>
        </View>

      </View>
    </View>
  )
}

const styles = StyleSheet.create({
  shadowStyle: {
    borderWidth: 1,
    borderColor: '#cdcdcd',
    borderTopWidth: 0,
    borderLeftWidth:0,
    borderRightWidth:0,
    shadowColor: '#ddd',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.8,
    shadowRadius: 1,
    elevation: 1,
  }
});
