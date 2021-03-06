import * as React from 'react';
import { Alert, TextInput, Dimensions, StyleSheet, Text, TouchableOpacity, Share, View, ImageBackground, FlatList, StatusBar, Image } from 'react-native';
import { ScrollView } from 'react-native-gesture-handler';
import * as Linking from 'expo-linking';
import Modal from 'react-native-modal';

import * as firebase from 'firebase';
import '@firebase/firestore'
const windowWidth = Dimensions.get('window').width;
const windowHeight = Dimensions.get('window').height;
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
export default class HomeScreen extends React.Component {

    state = {
        logged: false,
        name: '',
        Post: false,
        Description: '',
        messages: []
    }

    onShare = async () => {
        try {
            const result = await Share.share({
                message:
                    'React Native | A framework for building native apps using React',
            });
            if (result.action === Share.sharedAction) {
                if (result.activityType) {
                    // shared with activity type of result.activityType
                } else {
                    // shared
                }
            } else if (result.action === Share.dismissedAction) {
                // dismissed
            }
        } catch (error) {
            alert(error.message);
        }
    };


    renderModalContent = () => (
        <View style={styles.modalView}>

            <Text style={{ textAlign: 'center', fontSize: 22, fontWeight: 'bold', marginBottom: 25 }}>Post</Text>

            <View style={styles.inputView} >
                <TextInput
                    style={styles.inputText}
                    placeholder="Description..."
                    placeholderTextColor="#003f5c"
                    onChangeText={text => this.setState({ Description: text })} />
            </View>

            <TouchableOpacity onPress={() => this.Post()} style={styles.forgotBtn}>
                <Text style={styles.loginText}>Post</Text>
            </TouchableOpacity>

            <TouchableOpacity onPress={() => this.setState({ Post: false })}>
                <Text style={{ fontSize: 17, textAlign: 'center' }}>Cancel</Text>
            </TouchableOpacity>

        </View>
    );


    async componentDidMount() {

        // Linking.addEventListener('url', ({ url }) => this.handleOpenURL(url))

        // console.log('===========' + this.state.ScoreUid)

        firebase
            .database()
            .ref('Post')
            .on("value", snapshot => {
                const data = snapshot.val()
                const count = snapshot.numChildren();
                if (snapshot.val()) {
                    const initMessages = [];
                    Object
                        .keys(data)
                        .forEach(message => initMessages.push(data[message]));

                    var reversed = initMessages.reverse()
                    this.setState({ messages: reversed })
                }
            });

        firebase.auth().onAuthStateChanged((user) => {
            if (user != null) {
                // var userId = firebase.auth().currentUser.uid
                // const db = firebase.firestore();
                // db.collection("Users").doc(userId).get().then(function (doc) {
                //   if (doc.exists) {
                //     console.log("Document data:", doc.data().Score);
                //   } else {
                //     // doc.data() will be undefined in this case
                //     console.log("No such document!");
                //   }
                // }).catch(function (error) {
                //   console.log("Error getting document:", error);
                // });
                this.setState({ logged: true })
                if (user.email != null) {
                    this.setState({ name: user.email })
                } else {
                    this.setState({ name: user.displayName })
                }
            }
        })
    }

    Delete = async (item) => {
        await firebase.database().ref('Post').child(item.Node).remove(function (error) {
            if (!error) {
                Alert.alert("Deleted")
            }
            else if (error) {
                Alert.alert(error);
            }
        })
    }

    Like = async (item) => {

        var user = firebase.auth().currentUser.uid;

        let userName;
        var docRef = firebase.firestore().collection("Users").doc(user);

        await docRef.get().then(function (doc) {
            if (doc.exists) {
                userName = doc.data().username
            } else {
                // doc.data() will be undefined in this case
                userName = 'Anonymous'
                console.log("No such document!");
            }
        }).catch(function (error) {
            console.log("Error getting document:", error);
        });
        var count;

        var newPostRef = await firebase.database().ref('Post').child(item.Node).child("Likes/" + user).set({
            uid: user,
            Name: userName,
        }).then((data) => {
            firebase
                .database()
                .ref('Post').child(item.Node).child("Likes")
                .once("value", snapshot => {
                    count = snapshot.numChildren();
                    firebase.database().ref('Post').child(item.Node).update({
                        LikeCount: count,
                    })
                    this.setState({
                        CountOfLikes: count,
                    });
                });
        }).catch((error) => {
            //error callback
            Alert.alert(
                'Upload Not Successfully' + error
            )
        });
    }

    SignOut = () => {
        firebase.auth().signOut()
            .then(() => {
                this.props.navigation.navigate('Register')
            })
            .catch(error => {

            })
    }

    Post = async () => {
        var user = firebase.auth().currentUser.uid;

        let userName;
        var docRef = firebase.firestore().collection("Users").doc(user);

        await docRef.get().then(function (doc) {
            if (doc.exists) {
                userName = doc.data().username
                console.log("Document data:", doc.data().username);
            } else {
                userName = 'Anonymous'
                // doc.data() will be undefined in this case
                console.log("5No such document!");
            }
        }).catch(function (error) {
            console.log("Error getting document:", error);
        });
        var nodeName = 'Post';

        if (this.state.Description != '') {

            var newPostRef = firebase.database().ref(nodeName).push({
                User: user,
                Name: userName,
                Description: this.state.Description,
                Date: new Date().toDateString(),
                Node: "null",
                Likes: 0,
            }).then((data) => {
                this.setState({ Description: '' })
                this.setState({ Post: false })
                Alert.alert(
                    'Upload Successfully'
                )
                var Key = data.key
                firebase.database().ref(nodeName).child(Key).update({
                    Node: Key
                })
                let score = 0
                let that = this;
                firebase.firestore().collection("Users").doc(user).get().then(function (doc) {
                    if (doc.exists) {
                        console.log('worl: ', doc.data().Score)
                        firebase.firestore().collection("Users").doc(user).update({
                            Score: doc.data().Score + 10
                        })
                    } else {
                        firebase.firestore().collection("Users").doc("gorilla").get().then(function (doc) {
                            if (doc.exists) {
                                console.log('wor5: ', doc.data().Score)
                                firebase.firestore().collection("Users").doc("gorilla").update({
                                    Score: doc.data().Score + 10
                                })
                            } else {
                                console.log("6No such document!");
                            }
                        }).catch(function (error) {
                            console.log("2Error getting document:", error);
                        });
                        console.log("1No such document!");
                    }
                }).catch(function (error) {
                    console.log("2Error getting document:", error);
                });

            }).catch((error) => {
                //error callback
                Alert.alert(
                    'Upload Not Successfully' + error
                )
            })
        }

        else {
            Alert.alert("Please Fill The Form Proper.")
        }
    }

    renderRow = ({ item, index }) => {
        var user = firebase.auth().currentUser.uid;
        var count = 0;
        return (
            <View style={{ marginHorizontal: 20, marginVertical: 10, backgroundColor: '#fff', padding: 20, borderRadius: 5 }}>
                <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                    <Text style={{ flex: 1 }}>{item.Description}</Text>
                    {user === item.User && (
                        <TouchableOpacity style={{ marginLeft: 5 }} onPress={() => this.Delete(item)}>
                            <Ionicons name='ios-trash' color='grey' size={25} />
                        </TouchableOpacity>
                    )}
                </View>
                <Text style={{ color: 'grey', textAlign: 'right', fontSize: 13, marginVertical: 5 }}>-{item.Name}</Text>
                <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                    <View style={{ flexDirection: 'row', flex: 1, alignItems: 'center' }}>
                        <TouchableOpacity onPress={() => this.Like(item)}>
                            <Ionicons name='md-thumbs-up' color='grey' size={25} />
                        </TouchableOpacity>
                        <Text style={{ color: 'grey', textAlign: 'right', fontSize: 12, marginLeft: 5 }}>{item.LikeCount}</Text>
                    </View>
                    <Text style={{ color: 'grey', textAlign: 'right', fontSize: 13 }}>{item.Date}</Text>
                </View>
            </View>
        )
    }

    render() {
        var userId = firebase.auth().currentUser.uid
        let redirectUrl = Linking.makeUrl('', { uid: userId });
        // let redirectUrl = Linking.makeUrl()
        let { path, queryParams } = Linking.parse(redirectUrl);
        return (
            <ImageBackground source={require('../assets/background.png')} style={styles.container}>
                <Modal
                    isVisible={this.state.Post}
                    backdropColor="rgba(0,0,0,0.1)"
                    animationIn="zoomInDown"
                    animationOut="zoomOutUp"
                    animationInTiming={600}
                    animationOutTiming={600}
                    backdropTransitionInTiming={600}
                    backdropTransitionOutTiming={600}
                    onBackdropPress={() => this.setState({ Post: false })}
                    style={{ overflow: 'scroll' }}>
                    {this.renderModalContent()}
                </Modal>
                <View style={{ paddingTop: StatusBar.currentHeight, flexDirection: 'row', alignItems: 'center', backgroundColor: '#fff' }}>
                    <TouchableOpacity
                        onPress={() => this.props.navigation.openDrawer()}
                        style={{ padding: 8, backgroundColor: '#4863A0', width: 60, height: 50, justifyContent: 'center', alignItems: 'center' }}>
                        <Ionicons name='md-menu' color='#fff' size={35} />
                    </TouchableOpacity>
                    <Text style={{ flex: 1, textAlign: 'center', fontSize: 20, fontWeight: 'bold' }}>Home</Text>
                    <TouchableOpacity
                        onPress={() => this.props.navigation.navigate('LeaderBoard')}
                        style={{ padding: 8, backgroundColor: '#fb5b5a', width: 60, height: 50, justifyContent: 'center', alignItems: 'center' }}>
                        <Image style={{ height: 30, width: 30 }} source={require('../assets/scoreboard.png')} />
                    </TouchableOpacity>
                </View>
                <View style={{ backgroundColor: '#000', padding: 10, flexDirection: 'row', alignItems: 'center' }}>
                    <Text style={{ color: '#fff', fontSize: 18, textAlign: 'center', flex: 1 }}>Reason to vote</Text>
                    <TouchableOpacity onPress={this.onShare}>
                        <Ionicons name='md-share' color='#fff' size={30} />
                    </TouchableOpacity>
                </View>
                <View style={{ flex: 1 }}>
                    <FlatList
                        data={this.state.messages}
                        initialNumToRender={4}
                        extraData={this.state}
                        renderItem={this.renderRow}
                        keyExtractor={(item, index) => index.toString()}

                    />
                    {/* <Text style={{ fontSize: 20 }}>Welcome {this.state.name}</Text>
                    <TouchableOpacity onPress={this.SignOut} style={styles.Row}>
                        <Text style={{ fontSize: 16, marginTop: 10 }}>Logout</Text>
                    </TouchableOpacity> */}
                </View >
                <TouchableOpacity onPress={() => this.setState({ Post: true })} style={{ position: 'absolute', bottom: 20, right: 20 }}>
                    <Ionicons name='md-add-circle' color='grey' size={60} />
                </TouchableOpacity>
            </ImageBackground>
        )
    }
}

HomeScreen.navigationOptions = {
    header: null,
};




const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#fff',
    },
    Title: {
        fontSize: 30,
        fontWeight: 'bold',
        paddingHorizontal: 20
    },
    modalView: {
        width: '95%',
        borderRadius: 10,
        alignSelf: 'center',
        backgroundColor: 'white',
        paddingVertical: 20,
        justifyContent: 'center',
        alignItems: 'center'
    },
    inputView: {
        width: "80%",
        backgroundColor: "#465881",
        borderRadius: 25,
        height: 50,
        marginBottom: 20,
        justifyContent: "center",
        padding: 20
    },
    inputText: {
        height: 50,
        color: "white"
    },
    forgotBtn: {
        width: "80%",
        backgroundColor: "#fb5b5a",
        borderRadius: 25,
        height: 50,
        alignItems: "center",
        justifyContent: "center",
        marginBottom: 10,
    },


});
