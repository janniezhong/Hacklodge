import * as React from 'react';
import { ScrollView, Image, Button, StyleSheet, Text, View, Alert, TouchableOpacity, Slider, Platform } from 'react-native';
import { createAppContainer } from 'react-navigation';
import { createStackNavigator } from 'react-navigation-stack';
import Constants from 'expo-constants';
import { Camera } from 'expo-camera'; 
import * as FileSystem from 'expo-file-system';
import * as Permissions from 'expo-permissions';
//import { width, height, totalSize } from 'react-native-dimension';
import ListItem from './ListItem';

import { 
  Ionicons,
  MaterialIcons,
  Foundation,
  MaterialCommunityIcons,
  Octicons
} from '@expo/vector-icons';
import { emitNotification } from 'expo/build/Notifications/Notifications';

const host = 'http://57b9f852.ngrok.io'

const images = {
  menuOne: require
}

const landmarkSize = 2;

// const windowWidth = Dimensions.get('window').width;
// const windowHeight = Dimensions.get('window').height;

class HomeScreen extends React.Component{
  render(){
    return (
      <View style = {{flex: '1', alignItems: 'center', justifyContent: 'center'}}>
      <Button
      title="Take picture"
      onPress = {() => this.props.navigation.navigate('CameraScreen')}
      />
      <Button
      title="Upload picture"
      onPress = {() => this.props.navigation.navigate('UploadPicture')}
      />
      <Button
      title="Sample Menu 1"
      onPress = {() => this.props.navigation.navigate('PicturePreview', {menuId:1,})}
      />
      <Button
      title="Sample Menu 2"
      onPress = {() => this.props.navigation.navigate('PicturePreview', {menuId:2,})}
      />
      <Button
      title="Sample Menu 3"
      onPress = {() => this.props.navigation.navigate('PicturePreview', {menuId:3,})}
      />
      </View>
      );
  }
}

class PicturePreview extends React.Component {

  static navigationOptions = ({ navigation }) => {
    return {
      title: 'Preview'
    };
  };

  chooseMenu = (menuNum) => {
    if(menuNum == 1){
      return require('./menus/simple-mexican-menu.jpeg');
    } else if (menuNum == 2){
      return require('./menus/wine-list.jpeg');
    } else {
      return require('./menus/mexican_menu.jpeg');
    }
  }  

  render(){
    const { navigation } = this.props;
    var menuPath = this.chooseMenu(navigation.getParam('menuId'))
// menuPath = require('./menus/wine-list.jpeg');
return (
  <View title = "Preview"
  style = {{flex:1, alignItems: 'center', justifyContent: 'center'}}> 
  <Image style = {{
    resizeMode: 'contain', height: 500, width: 400,
  }}
  source = {menuPath}
  />
  <Button 
  title = "Next"
  onPress={() => {
    this.props.navigation.navigate('MenuList');
  }}
  />
  </View>
  )
}

}

class MenuList extends React.Component{
  static navigationOptions = ({ navigation }) => {
    return {
      title: 'Menu Items'
    };
  };

  render(){
    let names = ["Huevos ocn Chariz", "Migas con Huev", "Beef Burrit", "Barbacoa Burrit", "Fiesta Chicken Burrito ", "Vegetarian Burrito ", "Smothered Burrito ", "Carne Asada Plate ", "Quesadilla ", "Carne Asada Steak "]

    return(
      <ScrollView>
      {names.map(name => <ListItem key={name} navigation={this.props.navigation} menuItemName={name} />)}
      </ScrollView>
      );
  }
}

class Details extends React.Component{

  state = {
    data: { image_url: '', image_url: '', description:'' },
  }
  static navigationOptions = ({ navigation }) => {
    return {
      title: navigation.getParam('keyword')
    };
  };

  componentDidMount() {
    let formData = new FormData();
    console.log(this.props.menuItemName);
    formData.append('name', this.props.navigation.getParam('menuItemName', 'scrambled eggs'));

    fetch(`${host}/info`, {
      method:'POST',
      body: formData
    })
    .then((response) => response.json())
    .then((data) => {
      console.log('Success:', data);
      this.setState({data: data});
    })
    .catch((error) => {
      console.error(error);
    });
  }
  render(){

    let { navigation } = this.props;

    return(
      <ScrollView contentContainerStyle={styles.detailSheet}> 
      <Text style = {{alignItems: 'center', justifyContent: 'center'}}>{this.state.data.title}</Text>
      <Image
      source = {{uri: this.state.data.image_url}}
      style = {{resizeMode: 'contain', width: 150, height: 150, alignItems: 'center',}}
      />
      <Text style = {{flex:1, alignItems: 'center', justifyContent: 'center'}}>{this.state.data.description}</Text>
      </ScrollView>
      );
  }
}

class UploadPicture extends React.Component{
  render(){
    return(
      <View style = {{alignItems: 'center', justifyContent: 'center'}}>
      <Text>Upload Picture</Text>
      </View>
      );
  }

}

const AppNavigator = createStackNavigator({
  Home: {
    screen: HomeScreen,
  },
  CameraScreen:{
    screen: CameraScreen,
  },
  UploadPicture:{
    screen: UploadPicture,
  },
  PicturePreview:{
    screen: PicturePreview,
  },
  MenuList:{
    screen: MenuList,
  },
  Details:{
    screen: Details,
  },
},
{
  initialRouteName: 'Home',
}
);

const AppContainer = createAppContainer(AppNavigator);

export default class App extends React.Component {
  render() {
    return <AppContainer />;
  }
}