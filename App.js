import React from 'react';
import { StyleSheet, SafeAreaView, Text } from 'react-native';
import * as firebase from 'firebase';
import '@firebase/firestore'
import StackNavigator from './navigation/Stack'
import * as Font from 'expo-font';

var config = {
  apiKey: "AIzaSyCAjP1qfcmX_StwENiVoDWbr7kyD4Ixako",
  authDomain: "dumptrump-2.firebaseapp.com",
  databaseURL: "https://dumptrump-2.firebaseio.com",
  projectId: "dumptrump-2",
  storageBucket: "dumptrump-2.appspot.com",
  messagingSenderId: "856540038611",
  appId: "1:856540038611:web:d2e232264fda7ea9a9db26"
};
if (!firebase.apps.length) {
  firebase.initializeApp(config);
}


export default class App extends React.Component {

  state = {
    fontLoaded: false,
  }

  async componentDidMount() {
    await Font.loadAsync({
      PermanentMarker: require('./assets/PermanentMarker.ttf'),
    });

    this.setState({ fontLoaded: true })
  }
  render() {

    return (
      <SafeAreaView style={styles.container}>
        {this.state.fontLoaded ? (
          <StackNavigator />
        ) : (
            <Text>Font not Loaded</Text>
          )}

      </SafeAreaView>
    )
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1
  },

});
