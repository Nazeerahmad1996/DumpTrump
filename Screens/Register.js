import React from 'react';
import { StyleSheet, Text, View, TextInput, TouchableOpacity, Alert, Image, ImageBackground, Dimensions } from 'react-native';
import Modal from 'react-native-modal';
import * as firebase from 'firebase';
import '@firebase/firestore'
import * as Linking from 'expo-linking';
import * as Constants from 'expo-constants';
import { FirebaseRecaptchaVerifierModal } from "expo-firebase-recaptcha";
import * as Facebook from 'expo-facebook';
import * as Google from "expo-google-app-auth";
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { ScrollView } from 'react-native-gesture-handler';
const windowWidth = Dimensions.get('window').width;
const windowHeight = Dimensions.get('window').height;
const IOS_CLIENT_ID =
    "908352193166-dicip2hamrjf6pughcfqc5ri6hgoc4v3.apps.googleusercontent.com";
const ANDROID_CLIENT_ID =
    "908352193166-626mcp0t2npfs269pu9lbiov2ae9h76g.apps.googleusercontent.com";

// const recaptchaVerifier = React.useRef(null);

export default class App extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            email: null,
            password: null,
            logged: false,
            name: '',
            SignUpPage: false,
            forgetPassword: false,
            ScoreUid: null,
            check: true,
            help: false,
            modalPages: false,
        }
    }


    handleOpenURL(url) {
        console.log('worked', url)
        let { path, queryParams } = Linking.parse(url);
        console.log(queryParams.uid)
        this.setState({ ScoreUid: queryParams.uid })
    }


    async componentDidMount() {

        Linking.addEventListener('url', ({ url }) => this.handleOpenURL(url))

        console.log('===========' + this.state.ScoreUid)
        firebase.auth().onAuthStateChanged((user) => {
            if (user && this.state.check) {
                this.props.navigation.navigate('DrawerNavigation')
            }
            this.setState({ check: false })
        });
    }





    GooglelogIn = async () => {
        try {
            const result = await Google.logInAsync({
                iosClientId: IOS_CLIENT_ID,
                androidClientId: ANDROID_CLIENT_ID,
                scopes: ["profile", "email"]
            });
            console.log(result.user)

            if (result.type === "success") {
                const credential = firebase.auth.GoogleAuthProvider.credential(result.idToken, result.accessToken);
                firebase
                    .auth()
                    .signInAndRetrieveDataWithCredential(credential)
                    .then(res => {
                        const db = firebase.firestore();
                        if (this.state.ScoreUid) {
                            let score = 0
                            let that = this;
                            db.collection("Users").doc(this.state.ScoreUid).get().then(function (doc) {
                                if (doc.exists) {
                                    console.log('worl: ', doc.data().Score)
                                    db.collection("Users").doc(that.state.ScoreUid).update({
                                        Score: doc.data().Score + 10
                                    })
                                } else {
                                    console.log("No such document!");
                                }
                            }).catch(function (error) {
                                console.log("Error getting document:", error);
                            });
                        }
                        var userId = firebase.auth().currentUser.uid
                        db.collection("Users").doc(userId).get().then(function (doc) {
                            if (doc.exists) {

                            } else {
                                db.collection("Users").doc(userId).set(result.user).then((data) => {
                                    db.collection("Users").doc(userId).update({
                                        Score: 0
                                    })
                                });
                            }
                        }).catch(function (error) {
                            console.log("Error getting document:", error);
                        });
                        this.props.navigation.navigate("UsernameUpdate")
                        console.log("Successful");
                    })
                    .catch(error => {
                        console.log("firebase cred err:", error);
                    });
                console.log("LoginScreen.js.js 21 | ", result.user.givenName);
                return result.accessToken;
            } else {
                return { cancelled: true };
            }
        } catch (e) {
            console.log('LoginScreen.js.js 30 | Error with login', e);
            return { error: true };
        }
    };


    // GooglelogIn = async () => {
    //   try {
    //     await GoogleSignIn.askForPlayServicesAsync();
    //     const { type, user } = await GoogleSignIn.signInAsync();
    //     if (type === 'success') {
    //       this._syncUserWithStateAsync();
    //     }
    //   } catch ({ message }) {
    //     alert('login: Error:' + message);
    //   }
    // };


    Register = async () => {
        if (this.state.email != null && this.state.password) {
            firebase
                .auth()
                .createUserWithEmailAndPassword(this.state.email, this.state.password)
                .then((data) => {
                    var userId = firebase.auth().currentUser.uid
                    const db = firebase.firestore();

                    db.collection("Users").doc(userId).set({
                        email: this.state.email.trim(),
                        Score: 0,
                    });



                    if (this.state.ScoreUid !== null && this.state.ScoreUid !== '') {
                        let score = 0
                        let that = this;
                        db.collection("Users").doc(this.state.ScoreUid).get().then(function (doc) {
                            if (doc.exists) {
                                db.collection("Users").doc(that.state.ScoreUid).update({
                                    Score: doc.data().Score + 10
                                })
                            } else {
                                console.log("No such document!");
                            }
                            that.props.navigation.navigate("UsernameUpdate")
                        }).catch(function (error) {
                            console.log("Error getting document:", error);
                        });

                    } else {
                        this.props.navigation.navigate("UsernameUpdate")
                    }

                    // firebase.database().ref('users').child(userId).set({
                    //   Email: this.state.email.trim(),
                    // }).catch((err) => {
                    //   console.log(err)
                    // });
                }).catch((error) => {
                    console.log(error)
                });
        }
        else {
            Alert.alert("Please Fill Form!");
        }
        // Alert.alert(this.state.value);
    }

    AnonymousLogin = () => {
        firebase.auth().signInAnonymously().then((data) => {
            this.props.navigation.navigate('DrawerNavigation')
        }).catch(function (error) {
            console.log(error)
        });
    }

    Login = () => {
        if (this.state.email != null && this.state.password != null) {
            firebase
                .auth()
                .signInWithEmailAndPassword(this.state.email, this.state.password)
                .catch((error) => {
                    Alert.alert(error.code);
                });
        }
        else {
            Alert.alert("Please fill form!")
        }
    }


    ForgotPassword = () => {
        firebase.auth().sendPasswordResetEmail(this.state.email)
            .then(function (user) {
                alert('Please check your email...')
            }).catch(function (e) {
                alert(e)
            })
    }

    SignOut = () => {
        firebase.auth().signOut()
            .then(() => {
                this.props.navigation.navigate('Register')
            })
            .catch(error => {

            })
    }



    FacebooklogIn = async () => {
        try {
            const {
                type,
                token,
                expires,
                permissions,
                declinedPermissions
            } = await Facebook.logInWithReadPermissionsAsync("2060226984224028", {
                permissions: ["public_profile"]
            });

            if (type === "success") {
                console.log('sdfhj')
                // Get the user's name using Facebook's Graph API
                const response = await fetch(
                    `https://graph.facebook.com/me?access_token=${token}`
                );
                const user = await response.json()
                const credential = firebase.auth.FacebookAuthProvider.credential(token)
                firebase.auth().signInWithCredential(credential).then((data) => {
                    console.log(firebase.auth().currentUser)
                    const db = firebase.firestore();
                    if (this.state.ScoreUid !== null) {
                        let score = 0
                        let that = this;
                        db.collection("Users").doc(this.state.ScoreUid).get().then(function (doc) {
                            if (doc.exists) {
                                console.log('worl: ', doc.data().Score)
                                db.collection("Users").doc(that.state.ScoreUid).update({
                                    Score: doc.data().Score + 10
                                })
                            } else {
                                console.log("No such document!");
                            }
                        }).catch(function (error) {
                            console.log("Error getting document:", error);
                        });
                    }
                    var userId = firebase.auth().currentUser.uid

                    db.collection("Users").doc(userId).get().then(function (doc) {
                        if (doc.exists) {

                        } else {
                            db.collection("Users").doc(userId).set(user).then((data) => {
                                db.collection("Users").doc(userId).update({
                                    Score: 0
                                })
                            });
                        }
                    }).catch(function (error) {
                        console.log("Error getting document:", error);
                    });
                    this.props.navigation.navigate("UsernameUpdate")
                    this.setState({ name: firebase.auth().currentUser.displayName })
                }).catch((error) => {
                    console.log(error)
                })
            } else {
                alert(`Facebook Login Error: Cancelled`);
            }
        } catch ({ message }) {
            // alert(`Facebook Login Error: ${message}`);
            console.log(message)
        }
    }

    renderModalHelp = () => (
        <View style={styles.modalView}>



            <Text style={{ textAlign: 'center', fontSize: 22, fontWeight: 'bold', marginBottom: 25 }}>Help</Text>

            {this.state.modalPages ? (
                <Text style={{ marginHorizontal: 20, fontWeight: 'bold', textAlign: 'center' }}>You will choose a username to protect anonymite. You are awarded points each time you successfully invite a new user or post a reason to the Dump Trump reason board. To begin, login.</Text>

            ) : (
                    <Text style={{ marginHorizontal: 20, fontWeight: 'bold', textAlign: 'center' }}>DUMPTRUMP APP is a social game app desinged to secure votes needed to beat Donald Trump in the upcoming fall elctions.</Text>

                )
            }

            <TouchableOpacity style={{ marginTop: 10 }} onPress={() => this.setState({ modalPages: !this.state.modalPages })}>
                <MaterialCommunityIcons name={this.state.modalPages ? "arrow-left-thick" : "arrow-right-thick"} size={40} />
            </TouchableOpacity>

            <TouchableOpacity style={{ alignSelf: 'flex-end', marginRight: 10 }} onPress={() => this.setState({ help: false })}>
                <MaterialCommunityIcons name="close-circle" size={25} />
            </TouchableOpacity>

        </View >
    );

    renderModalContent = () => (
        <View style={styles.modalView}>

            <Text style={{ textAlign: 'center', fontSize: 22, fontWeight: 'bold', marginBottom: 25 }}>Forgot Password</Text>

            <View style={styles.inputView} >
                <TextInput
                    style={styles.inputText}
                    placeholder="Email..."
                    placeholderTextColor="#003f5c"
                    onChangeText={text => this.setState({ email: text })} />
            </View>

            <TouchableOpacity onPress={() => this.ForgotPassword()} style={styles.forgotBtn}>
                <Text style={styles.loginText}>Forgot</Text>
            </TouchableOpacity>

            <TouchableOpacity onPress={() => this.setState({ forgetPassword: false })}>
                <Text style={{ fontSize: 17, textAlign: 'center' }}>Cancel</Text>
            </TouchableOpacity>

        </View>
    );

    async openUrl(url) {
        try {
            const can = await Linking.canOpenURL(url);
            if (can) {
                Linking.openURL(url);
                return;
            } else {
                console.log('cant')
            }
        }
        catch (e) {
            console.log(e)
        }
        Alert.alert(I18n.t('unknown_error'));
    }


    render() {
        return (
            <ImageBackground source={require('../assets/background.png')} style={styles.container}>
                <Modal
                    isVisible={this.state.forgetPassword}
                    backdropColor="rgba(0,0,0,0.1)"
                    animationIn="zoomInDown"
                    animationOut="zoomOutUp"
                    animationInTiming={600}
                    animationOutTiming={600}
                    backdropTransitionInTiming={600}
                    backdropTransitionOutTiming={600}
                    onBackdropPress={() => this.setState({ forgetPassword: false })}
                    style={{ overflow: 'scroll' }}>
                    {this.renderModalContent()}
                </Modal>
                <Modal
                    isVisible={this.state.help}
                    backdropColor="rgba(0,0,0,0.1)"
                    animationIn="zoomInDown"
                    animationOut="zoomOutUp"
                    animationInTiming={600}
                    animationOutTiming={600}
                    backdropTransitionInTiming={600}
                    backdropTransitionOutTiming={600}
                    onBackdropPress={() => this.setState({ help: false })}
                    style={{ overflow: 'scroll' }}>
                    {this.renderModalHelp()}
                </Modal>
                <ScrollView showsVerticalScrollIndicator={false}>
                    <View style={styles.container}>
                        {/* <Text style={styles.logo}>PushForGorilla</Text>
                        <View style={styles.inputView} >
                            <TextInput
                                style={styles.inputText}
                                placeholder="Email..."
                                placeholderTextColor="#003f5c"
                                onChangeText={text => this.setState({ email: text })} />
                        </View>
                        <View style={styles.inputView} >
                            <TextInput
                                secureTextEntry
                                style={styles.inputText}
                                placeholder="Password..."
                                placeholderTextColor="#003f5c"
                                onChangeText={text => this.setState({ password: text }, () => {
                                    console.log(this.state.password)
                                })} />
                        </View> */}
                        {/* {
                            !this.state.SignUpPage && (
                                <TouchableOpacity onPress={() => this.setState({ forgetPassword: true })}>
                                    <Text style={styles.forgot}>Forgot Password?</Text>
                                </TouchableOpacity>
                            )}
                        {
                            this.state.SignUpPage ? (
                                <TouchableOpacity onPress={() => this.Register()} style={styles.loginBtn}>
                                    <Text style={styles.loginText}>SIGNUP</Text>
                                </TouchableOpacity>
                            ) : (
                                    <TouchableOpacity onPress={() => this.Login()} style={styles.loginBtn}>
                                        <Text style={styles.loginText}>LOGIN</Text>
                                    </TouchableOpacity>
                                )
                        } */}

                        {/* <TouchableOpacity style={{ marginVertical: 10 }} onPress={() => this.setState({ SignUpPage: !this.state.SignUpPage })}>
                            <Text style={styles.loginText}>{this.state.SignUpPage ? 'Login' : 'Signup'}</Text>
                        </TouchableOpacity> */}

                        <Image source={require('../assets/trump.png')} style={{ width: windowWidth, height: windowWidth / 1.7, marginTop: 60, marginBottom: 10 }} />
                        <Text style={{ fontFamily: 'PermanentMarker', color: '#fff', fontSize: 40, textAlign: 'center', marginBottom: 20 }}>2020</Text>

                        {
                            !this.state.SignUpPage && (

                                <View>
                                    <View style={{ flexDirection: 'row', alignItems: 'center', marginHorizontal: 20, marginBottom: -19 }}>
                                        <View style={{ flex: 1, borderTopWidth: 2, borderColor: 'grey', borderTopLeftRadius: 5 }} />
                                        <Text style={{ fontFamily: 'PermanentMarker', color: '#fff', fontSize: 25, textAlign: 'center', marginHorizontal: 10 }}>Login</Text>
                                        <View style={{ flex: 1, borderTopWidth: 2, borderColor: 'grey', borderTopRightRadius: 5 }} />
                                    </View>

                                    <View style={styles.ButtonContainer}>

                                        <TouchableOpacity onPress={() => this.GooglelogIn()} style={styles.loginBtn2}>
                                            <MaterialCommunityIcons name="google-plus" size={32} color='#fff' />
                                            {/* <Text style={styles.loginText}>Google</Text> */}
                                        </TouchableOpacity>
                                        <TouchableOpacity onPress={() => this.AnonymousLogin()} style={[styles.loginBtn2, { backgroundColor: '#000' }]}>
                                            {/* <MaterialCommunityIcons name="incognito" size={32} color='#fff' /> */}
                                            <Image source={require('../assets/anon.png')} style={{ width: 32, height: 40 }} />
                                            {/* <Text style={styles.loginText}>Anonymous</Text> */}
                                        </TouchableOpacity>
                                        <TouchableOpacity onPress={() => this.props.navigation.navigate('PhoneLogin')} style={[styles.loginBtn2, { backgroundColor: '#000' }]}>
                                            <MaterialCommunityIcons name="phone-in-talk" size={32} color='#fff' />
                                            {/* <Text style={styles.loginText}>Google</Text> */}
                                        </TouchableOpacity>
                                        <TouchableOpacity style={[styles.loginBtn2, { backgroundColor: '#3b5998' }]} onPress={() => this.FacebooklogIn()}>
                                            <MaterialCommunityIcons name="facebook" size={32} color='#fff' />

                                            {/* <Text style={styles.loginText}>Facebook</Text> */}
                                        </TouchableOpacity>



                                    </View>

                                    <TouchableOpacity onPress={() => this.setState({ help: true })} style={styles.Helpbtn}>
                                        <MaterialCommunityIcons name="help-circle-outline" size={32} color='#fff' />
                                        {/* <Text style={styles.loginText}>Google</Text> */}
                                    </TouchableOpacity>
                                </View>
                            )
                        }
                    </View>
                </ScrollView>
            </ImageBackground >
        );
    }
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
        paddingTop: 10
    },
    ButtonContainer: {
        marginHorizontal: 20,
        marginBottom: 20,
        flexDirection: 'row',
        justifyContent: 'space-between',
        borderLeftWidth: 2,
        borderRightWidth: 2,
        borderBottomWidth: 2,
        borderRadius: 4,
        paddingVertical: 30,
        borderColor: 'grey'
    },
    logo: {
        fontWeight: "bold",
        fontSize: 50,
        color: "#fb5b5a",
        marginBottom: 40
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
    forgot: {
        color: "white",
        fontSize: 11
    },
    loginBtn: {
        width: "80%",
        backgroundColor: "#fb5b5a",
        borderRadius: 25,
        height: 50,
        alignItems: "center",
        justifyContent: "center",
        marginTop: 40,
        marginBottom: 5,
    },
    Helpbtn: {
        alignSelf: 'center'
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
    loginBtn2: {
        width: 50,
        height: 50,
        backgroundColor: "#fb5b5a",
        borderRadius: 50,
        alignItems: "center",
        justifyContent: "center",
        marginHorizontal: 10
    },
    loginText: {
        color: "white"
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
});
