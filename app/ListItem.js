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
      <View style={styles.container}>
        <Text>asdf</Text>
        <Button 
          title={this.props.menuItemName}
          onPress={() => {
            this.props.navigation.navigate('Details', {keyword: this.props.menuItemName})
          }}
        />
      </View>
    );
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingTop: 20,
    backgroundColor: 'white',
  },
  navbar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#4630EB',
  },
  pictures: {
    flex: 1,
    flexWrap: 'wrap',
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingVertical: 8,
  },
  button: {
    padding: 20,
  },
  whiteText: {
    color: 'white',
  }
});
