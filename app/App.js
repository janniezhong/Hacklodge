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


import GalleryScreen from './GalleryScreen';
import isIPhoneX from 'react-native-is-iphonex';

import { 
  Ionicons,
  MaterialIcons,
  Foundation,
  MaterialCommunityIcons,
  Octicons
} from '@expo/vector-icons';
import { emitNotification } from 'expo/build/Notifications/Notifications';

const images = {
  menuOne: require
}

const landmarkSize = 2;

// const windowWidth = Dimensions.get('window').width;
// const windowHeight = Dimensions.get('window').height;

const flashModeOrder = {
  off: 'on',
  on: 'auto',
  auto: 'torch',
  torch: 'off',
};

const flashIcons = {
  off: 'flash-off',
  on: 'flash-on',
  auto: 'flash-auto',
  torch: 'highlight'
};

const wbOrder = {
  auto: 'sunny',
  sunny: 'cloudy',
  cloudy: 'shadow',
  shadow: 'fluorescent',
  fluorescent: 'incandescent',
  incandescent: 'auto',
};

const wbIcons = {
  auto: 'wb-auto',
  sunny: 'wb-sunny',
  cloudy: 'wb-cloudy',
  shadow: 'beach-access',
  fluorescent: 'wb-iridescent',
  incandescent: 'wb-incandescent',
};

class CameraScreen extends React.Component {
  state = {
    flash: 'off',
    zoom: 0,
    autoFocus: 'on',
    type: 'back',
    whiteBalance: 'auto',
    ratio: '16:9',
    ratios: [],
    newPhotos: false,
    permissionsGranted: false,
    pictureSize: undefined,
    pictureSizes: [],
    pictureSizeId: 0,
    showGallery: false,
    showMoreOptions: false,
  };

  async UNSAFE_componentWillMount() {
    const { status } = await Permissions.askAsync(Permissions.CAMERA);
    this.setState({ permissionsGranted: status === 'granted' });
  }

  componentDidMount() {
    FileSystem.makeDirectoryAsync(FileSystem.documentDirectory + 'photos').catch(e => {
      console.log(e, 'Directory exists');
    });
  }

  getRatios = async () => {
    const ratios = await this.camera.getSupportedRatios();
    return ratios;
  };

  toggleView = () => {
                        this.accessCameraRoll();
                        this.setState({ showGallery: !this.state.showGallery, newPhotos: false });
                    };

  toggleMoreOptions = () => this.setState({ showMoreOptions: !this.state.showMoreOptions });

  toggleFacing = () => this.setState({ type: this.state.type === 'back' ? 'front' : 'back' });

  toggleFlash = () => this.setState({ flash: flashModeOrder[this.state.flash] });

  setRatio = ratio => this.setState({ ratio });

  toggleWB = () => this.setState({ whiteBalance: wbOrder[this.state.whiteBalance] });

  toggleFocus = () => this.setState({ autoFocus: this.state.autoFocus === 'on' ? 'off' : 'on' });

  zoomOut = () => this.setState({ zoom: this.state.zoom - 0.1 < 0 ? 0 : this.state.zoom - 0.1 });

  zoomIn = () => this.setState({ zoom: this.state.zoom + 0.1 > 1 ? 1 : this.state.zoom + 0.1 });

  setFocusDepth = depth => this.setState({ depth });

  takePicture = () => {
    if (this.camera) {
      this.camera.takePictureAsync({ onPictureSaved: this.onPictureSaved });
    }
  };

  accessCameraRoll = async () =>{
        const { status } = await Permissions.askAsync(Permissions.CAMERA_ROLL);
  
        if (status !== 'granted') {
          throw new Error('Denied CAMERA_ROLL permissions!');
        }

  };

  handleMountError = ({ message }) => console.error(message);

  onPictureSaved = async photo => {
    await FileSystem.moveAsync({
      from: photo.uri,
      to: `${FileSystem.documentDirectory}photos/${Date.now()}.jpg`,
    });
    this.setState({ newPhotos: true });
  }

  collectPictureSizes = async () => {
    if (this.camera) {
      const pictureSizes = await this.camera.getAvailablePictureSizesAsync(this.state.ratio);
      let pictureSizeId = 0;
      if (Platform.OS === 'ios') {
        pictureSizeId = pictureSizes.indexOf('High');
      } else {
        // returned array is sorted in ascending order - default size is the largest one
        pictureSizeId = pictureSizes.length-1;
      }
      this.setState({ pictureSizes, pictureSizeId, pictureSize: pictureSizes[pictureSizeId] });
    }
  };

  previousPictureSize = () => this.changePictureSize(1);
  nextPictureSize = () => this.changePictureSize(-1);

  changePictureSize = direction => {
    let newId = this.state.pictureSizeId + direction;
    const length = this.state.pictureSizes.length;
    if (newId >= length) {
      newId = 0;
    } else if (newId < 0) {
      newId = length -1;
    }
    this.setState({ pictureSize: this.state.pictureSizes[newId], pictureSizeId: newId });
  }

  renderGallery() {
    return <GalleryScreen onPress={this.toggleView.bind(this)} />;
  }

  renderNoPermissions = () => 
    <View style={styles.noPermissions}>
      <Text style={{ color: 'white' }}>
        Camera permissions not granted - cannot open camera preview.
      </Text>
    </View>

  renderTopBar = () => 
    <View
      style={styles.topBar}>
      <TouchableOpacity style={styles.toggleButton} onPress={this.toggleFacing}>
        <Ionicons name="ios-reverse-camera" size={32} color="white" />
      </TouchableOpacity>
      <TouchableOpacity style={styles.toggleButton} onPress={this.toggleFlash}>
        <MaterialIcons name={flashIcons[this.state.flash]} size={32} color="white" />
      </TouchableOpacity>
      <TouchableOpacity style={styles.toggleButton} onPress={this.toggleWB}>
        <MaterialIcons name={wbIcons[this.state.whiteBalance]} size={32} color="white" />
      </TouchableOpacity>
      <TouchableOpacity style={styles.toggleButton} onPress={this.toggleFocus}>
        <Text style={[styles.autoFocusLabel, { color: this.state.autoFocus === 'on' ? "white" : "#6b6b6b" }]}>AF</Text>
      </TouchableOpacity>   
    </View>

  renderBottomBar = () =>
    <View
      style={styles.bottomBar}>
      <TouchableOpacity style={styles.bottomButton} onPress={this.toggleMoreOptions}>
        <Octicons name="kebab-horizontal" size={30} color="white"/>
      </TouchableOpacity>
      <View style={{ flex: 0.4 }}>
        <TouchableOpacity
          onPress={this.takePicture}
          style={{ alignSelf: 'center' }}
        >
          <Ionicons name="ios-radio-button-on" size={70} color="white" />
        </TouchableOpacity>
      </View> 
      <TouchableOpacity style={styles.bottomButton} onPress={this.toggleView}>
        <View>
          <Foundation name="thumbnails" size={30} color="white" />
          {this.state.newPhotos && <View style={styles.newPhotosDot}/>}
        </View>
      </TouchableOpacity>
    </View>

  renderMoreOptions = () =>
    (
      <View style={styles.options}>
        <View style={styles.pictureSizeContainer}>
          <Text style={styles.pictureQualityLabel}>Picture quality</Text>
          <View style={styles.pictureSizeChooser}>
            <TouchableOpacity onPress={this.previousPictureSize} style={{ padding: 6 }}>
              <Ionicons name="md-arrow-dropleft" size={14} color="white" />
            </TouchableOpacity>
            <View style={styles.pictureSizeLabel}>
              <Text style={{color: 'white'}}>{this.state.pictureSize}</Text>
            </View>
            <TouchableOpacity onPress={this.nextPictureSize} style={{ padding: 6 }}>
              <Ionicons name="md-arrow-dropright" size={14} color="white" />
            </TouchableOpacity>
          </View>
        </View>
      </View> 
    );

  renderCamera = () =>
    (
      <View style={{ flex: 1 }}>
        <Camera
          ref={ref => {
            this.camera = ref;
          }}
          style={styles.camera}
          onCameraReady={this.collectPictureSizes}
          type={this.state.type}
          flashMode={this.state.flash}
          autoFocus={this.state.autoFocus}
          zoom={this.state.zoom}
          whiteBalance={this.state.whiteBalance}
          ratio={this.state.ratio}
          pictureSize={this.state.pictureSize}
          onMountError={this.handleMountError}
          >
          {this.renderTopBar()}
          {this.renderBottomBar()}
        </Camera>
        {this.state.showMoreOptions && this.renderMoreOptions()}
      </View>
    );

  render() {
    const cameraScreenContent = this.state.permissionsGranted
      ? this.renderCamera()
      : this.renderNoPermissions();
    const content = this.state.showGallery ? this.renderGallery() : cameraScreenContent;
    return <View style={styles.container}>{content}</View>;
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000',
  },
  camera: {
    flex: 1,
    justifyContent: 'space-between',
  },
  topBar: {
    flex: 0.2,
    backgroundColor: 'transparent',
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingTop: Constants.statusBarHeight / 2,
  },
  bottomBar: {
    paddingBottom: isIPhoneX ? 25 : 5,
    backgroundColor: 'transparent',
    alignSelf: 'flex-end',
    justifyContent: 'space-between',
    flex: 0.12,
    flexDirection: 'row',
  },
  noPermissions: {
    flex: 1,
    alignItems:'center',
    justifyContent: 'center',
    padding: 10,
  },
  gallery: {
    flex: 1,
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  toggleButton: {
    flex: 0.25,
    height: 40,
    marginHorizontal: 2,
    marginBottom: 10,
    marginTop: 20,
    padding: 5,
    alignItems: 'center',
    justifyContent: 'center',
  },
  autoFocusLabel: {
    fontSize: 20,
    fontWeight: 'bold'
  },
  bottomButton: {
    flex: 0.3, 
    height: 58, 
    justifyContent: 'center',
    alignItems: 'center',
  },
  newPhotosDot: {
    position: 'absolute',
    top: 0,
    right: -5,
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#4630EB'
  },
  options: {
    position: 'absolute',
    bottom: 80,
    left: 30,
    width: 200,
    height: 160,
    backgroundColor: '#000000BA',
    borderRadius: 4,
    padding: 10,
  },
  detectors: {
    flex: 0.5,
    justifyContent: 'space-around',
    alignItems: 'center',
    flexDirection: 'row',
  },
  pictureQualityLabel: {
    fontSize: 10,
    marginVertical: 3, 
    color: 'white'
  },
  pictureSizeContainer: {
    flex: 0.5,
    alignItems: 'center',
    paddingTop: 10,
  },
  pictureSizeChooser: {
    alignItems: 'center',
    justifyContent: 'space-between',
    flexDirection: 'row'
  },
  pictureSizeLabel: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center'
  },
  landmark: {
    width: landmarkSize,
    height: landmarkSize,
    position: 'absolute',
    backgroundColor: 'red',
  },
  row: {
    flexDirection: 'row',
  },
  detailSheet: {
    alignItems: 'center',
  }
});





class ChoosePictureScreen extends React.Component{
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
    let names = ["first", "second", "burrito"]

    return(
      <ScrollView>
        {names.map(name => <ListItem key={name} navigation={this.props.navigation} menuItemName={name} />)}
      </ScrollView>
    );
  }
}

class Details extends React.Component{
  
  // state = {
  //   info: "",
  // }
  static navigationOptions = ({ navigation }) => {
    return {
      title: navigation.getParam('keyword')
    };
  };

    

  render(){

    let { navigation } = this.props;
    const host = 'http://57b9f852.ngrok.io'
    let formData = new FormData();
    formData.append('name', 'scrambled eggs');

    const request = new Request(`${host}/info`, {method: 'POST', body: formData});
    console.log(request);

    const data = `{"image_url": "https://images.media-allrecipes.com/userphotos/560x315/1010465.jpg", "description": "Scrambled eggs is a dish made from eggs (usually chicken eggs) stirred or beaten together in a pan while being gently heated, typically with salt, butter and sometimes other ingredients.", "title": "Scrambled Eggs"}`
    let infoObject = JSON.parse(data)
    let descr = infoObject.description;
    let imageurl = infoObject.image_url;
    let name = infoObject.title;
    console.log(data);
    console.log(request.description);
    
    // fetch(request)
    //   .then(response => {
    //     console.log(response);
    //     if (response.status === 200) {
    //       return response;
    //     } else {
    //       throw new Error('Something went wrong on api server!');
    //     }
    //   })
    //   .then(response => {
    //     console.log(response);
    //     // ...
    //   }).catch(error => {
    //     console.error(error);
    //   });

    return(
      <ScrollView contentContainerStyle={styles.detailSheet}> 
        
        <Image
            source = {{uri: imageurl}}
            style = {{resizeMode: 'contain', width: 150, height: 150, alignItems: 'center',}}
        />
        <Text  style = {{flex:1, alignItems: 'center', justifyContent: 'center'}} > {descr} </Text>

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
    screen: ChoosePictureScreen,
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