import React from 'react';
import { StyleSheet, SafeAreaView, Text } from 'react-native';
import * as firebase from 'firebase';
import '@firebase/firestore'
import StackNavigator from './navigation/Stack'
import * as Font from 'expo-font';

var config = {
  apiKey: "AIzaSyDCB3Gcf3YxA3UVQHfRfOnxZwwJwkD4y2w",
  authDomain: "dumptrump-1.firebaseapp.com",
  databaseURL: "https://dumptrump-1.firebaseio.com",
  projectId: "dumptrump-1",
  storageBucket: "dumptrump-1.appspot.com",
  messagingSenderId: "954517218481",
  appId: "1:954517218481:web:a744f73393013255beee90"
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
