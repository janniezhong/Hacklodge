import React from 'react';
import { Image, StyleSheet, View, TouchableOpacity, Text, ScrollView } from 'react-native';
import * as FileSystem from 'expo-file-system';
import * as MediaLibrary from 'expo-media-library';
import { MaterialIcons } from '@expo/vector-icons';
import Photo from './Photo';

const PHOTOS_DIR = FileSystem.documentDirectory + 'photos';

export default class BoxScreen extends React.Component {
  state = {
    faces: {},
    images: {},
    photos: [],
    selected: [],
  };

  render(){
    // var imgType = navigation.getParam('imgType');
    // if (imgType == 'taken'){
    //   var menuPath = navigation.getParam('imgURI');
    // } else {
    //   var menuPath = this.chooseMenu(navigation.getParam('menuId'));
    // }
    console.log("Made it to BoxScreen rendering 2!");

    return (
      <View title = "BoxScreen" style = {styles.genericView}> 
      
      {/* <Image style = {{ resizeMode: 'contain', height: 500, width: 400, }} source = {{uri: navigation.menuURI}} />
      <View style={styles.buttonWrapper, previewStyles.buttonWrapper}>
        <TouchableOpacity style={styles.button}
          onPress= {() => {
            this.props.navigation.navigate('MenuList', {
              menuType:'example', 
              menuId:this.props.navigation.getParam('menuId'),
              menuURI: menuPath}
            );
          }}
        >
          <Text style={styles.buttonText}>Next</Text>
        </TouchableOpacity>
        </View> */
        
        
        <Text>This is the BoxScreen</Text>}
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
