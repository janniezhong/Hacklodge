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

const host = 'http://57b9f852.ngrok.io'

const images = {
  menuOne: require
}
const myRed = '#FF6E66';
const styles = StyleSheet.create({
  genericView: {flex: 1, alignItems: 'center', justifyContent: 'center'},
  button: {
    alignItems:'center',
    backgroundColor: myRed,
    width:'100%',
    padding:20,
    maxWidth:400,
    justifyContent:'space-between',
    marginTop:10
  },
  buttonWrapper: {
    alignItems:'center',
    width:'100%',
    marginBottom:80,
    paddingLeft:10,
    paddingRight:10,
  },
  buttonText: {
    color: '#FFFFFF',
    fontSize:18
  },
  logo: {
    resizeMode:'contain',
    width:290,
  },
});

class HomeScreen extends React.Component{
  render(){
    return (
      <View style = {styles.genericView}>

        <Image style={styles.logo} source={require('./assets/logo.png')} />

        <View style = {styles.buttonWrapper}>
          <TouchableOpacity style={styles.button}
            // onPress = {() => this.props.navigation.navigate('CameraScreen')}
          >
            <Text style={styles.buttonText}>Take Picture</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.button}
            onPress = {() => this.props.navigation.navigate('UploadPicture')}
          >
            <Text style={styles.buttonText}>Upload Picture</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.button}
            onPress = {() => this.props.navigation.navigate('Preview', {menuId:1,})}
          >
            <Text style={styles.buttonText}>See an Example</Text>
          </TouchableOpacity>
        </View>

        {/* <Button
        title="Sample Menu 2"
        onPress = {() => this.props.navigation.navigate('Preview', {menuId:2,})}
        />
        <Button
        title="Sample Menu 3"
        onPress = {() => this.props.navigation.navigate('Preview', {menuId:3,})}
        /> */}
      </View>
    );
  }
}

const previewStyles = StyleSheet.create({
  buttonWrapper: {
    alignItems:'center',
    width:'100%',
    marginBottom:-30,
    paddingLeft:10,
    paddingRight:10,
  },
})

class Preview extends React.Component {
  static navigationOptions = ({ navigation }) => { title: 'Preview' };

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
      <View title = "Preview" style = {styles.genericView}> 
      <Image style = {{ resizeMode: 'contain', height: 500, width: 400, }} source = {menuPath} />
      <View style={styles.buttonWrapper, previewStyles.buttonWrapper}>
        <TouchableOpacity style={styles.button}
          onPress= {() => {
            this.props.navigation.navigate('MenuList', {
              menuType:'upload', 
              menuId:this.props.navigation.getParam('menuId')}
            );
          }}
        >
          <Text style={styles.buttonText}>Next</Text>
        </TouchableOpacity>
        </View>
      </View>
    );
  }
}


class MenuList extends React.Component{
  static navigationOptions = ({ navigation }) => {
    return {
      title: 'Menu Items'
    };
  };
  state = {
    // data: {item_list: ["Scrambled Eggs"]}
    data: {item_list: ["Loading..."]}
  }
  componentDidMount() {
    if(this.props.navigation.getParam('menuType') == 'upload') {
      let menuId = this.props.navigation.getParam('menuId');

      let formData = new FormData();
      formData.append('menu_id', menuId);
      fetch(`${host}/ocr`, {
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
      // this.setState({names:["Huevos ocn Chariz", "Migas con Huev", "Beef Burrit", "Barbacoa Burrit", "Fiesta Chicken Burrito ", "Vegetarian Burrito ", "Smothered Burrito ", "Carne Asada Plate ", "Quesadilla ", "Carne Asada Steak "]});
    }
  }

  render(){
    return(
      <ScrollView>
      {this.state.data.item_list.map((name, i) => 
        (<ListItem key={name} navigation={this.props.navigation} menuItemName={name} listParity={i%2} />)
      )}
      </ScrollView>
    );
  }
}

class Details extends React.Component{

  state = {
    data: { image_url: `${host}/static/loading.png`, description:'Loading description...' },
  }
  static navigationOptions = ({ navigation }) => {
    return {
      title: navigation.getParam('menuItemName')
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
      <ScrollView contentContainerStyle={{alignItems:'center'}}> 
      {/* <Text style = {{alignItems: 'center', justifyContent: 'center'}}>{this.state.data.title}</Text> */}
      <Image
      source = {{uri: this.state.data.image_url}}
      style = {{resizeMode: 'contain', width: 250, height: 200, alignItems: 'center',}}
      />
      <Text style = {{
        flex:1,
        alignItems: 'center',
        justifyContent: 'center',
        fontSize: 18,
        padding:20,
        lineHeight:27,
      }}>{this.state.data.description}</Text>
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
    navigationOptions: {
      headerShown:false,
    }
  },
  UploadPicture:{
    screen: UploadPicture,
    navigationOptions: {
      headerShown:false,
    }
  },
  Preview:{
    screen: Preview,
    navigationOptions: {
      headerShown:false,
    }
  },
  MenuList:{
    screen: MenuList,
    navigationOptions: {
      headerStyle: {
        backgroundColor:myRed,
        // headerTintColor:'#FFFFFF',
      },
      headerTitleStyle: {
        fontWeight:'normal',
        color:'#FFFFFF'
      }
      // headerShown:false,
    }
  },
  Details:{
    screen: Details,
    navigationOptions: {
      headerStyle: {
        backgroundColor:myRed,
        // headerTintColor:'#FFFFFF',
      },
      headerTitleStyle: {
        fontWeight:'normal',
        color:'#FFFFFF'
      }
      // headerShown:false,
    }
  },
},{
  initialRouteName: 'Home',
});

const AppContainer = createAppContainer(AppNavigator);

export default class App extends React.Component {
  render() {
    return <AppContainer />;
  }
}