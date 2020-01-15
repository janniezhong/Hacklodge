import React from 'react';
import { Button, Image, StyleSheet, View, TouchableOpacity, Text, ScrollView } from 'react-native';
import Photo from './Photo';

export default class ListItem extends React.Component {
  state = {
    faces: {},
    images: {},
    photos: [],
    selected: [],
  };
  render() {


    return (
      <View style={this.props.listParity == 1 ? listStyles.oddItem : listStyles.evenItem}>
        <Button 
          title={this.props.menuItemName}
          onPress={() => {
            this.props.navigation.navigate('Details', {menuItemName: this.props.menuItemName})
          }}
        />
      </View>
    );
  }
}

const listStyles = StyleSheet.create({
    oddItem: {
      backgroundColor:'#FFC8BE'
    },
    evenItem: {
      backgroundColor: '#FFE6E6'
    }
});