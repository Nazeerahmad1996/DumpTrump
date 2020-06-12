import React from 'react';
import { StyleSheet, SafeAreaView, Text } from 'react-native';
import * as firebase from 'firebase';
import '@firebase/firestore'
import StackNavigator from './navigation/Stack'
import * as Font from 'expo-font';

var config = {
  apiKey: "AIzaSyAaJfombUrhKgYW4eGRGs4YktzMhF7h93g",
  authDomain: "dumptrump-3.firebaseapp.com",
  databaseURL: "https://dumptrump-3.firebaseio.com",
  projectId: "dumptrump-3",
  storageBucket: "dumptrump-3.appspot.com",
  messagingSenderId: "908352193166",
  appId: "1:908352193166:web:2a7b43bb4bd3bbb019bfdf"
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
