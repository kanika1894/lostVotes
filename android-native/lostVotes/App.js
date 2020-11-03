/**
 * Sample React Native App
 * https://github.com/facebook/react-native
 *
 * @format
 * @flow strict-local
 */

'use strict';
import React, { useRef, useState, useEffect, Component } from 'react';
import {
  SafeAreaView,
  StyleSheet,
  ScrollView,
  View,
  Text,
  StatusBar,
  TextInput,
  Alert,
  Button,
  DeviceEventEmitter,
  ToastAndroid,
  PendingView,
  TouchableOpacity,
  AppRegistry,
  useWindowDimensions,
  Image,
  FlatList,
  ListItem,
  Left,
  Right,
  CheckBox,
  Pressable
} from 'react-native';

import {
  Header,
  LearnMoreLinks,
  Colors,
  DebugInstructions,
  ReloadInstructions,
} from 'react-native/Libraries/NewAppScreen';
import { NavigationContainer } from '@react-navigation/native';
import SmsAndroid from 'react-native-get-sms-android';
import { checkMultiple, requestMultiple, PERMISSIONS, RESULTS } from 'react-native-permissions';
import Permissions from 'react-native-permissions';
import RNOtpVerify from 'react-native-otp-verify';
import { createStackNavigator } from '@react-navigation/stack';
import { RNCamera, FaceDetector } from 'react-native-camera';

const Stack = createStackNavigator();

// hash - ajcJcvqptYr

requestMultiple([PERMISSIONS.ANDROID.SEND_SMS, PERMISSIONS.ANDROID.CAMERA]).then(
  (result) => {
    console.log(result);
  }
);

checkMultiple([PERMISSIONS.ANDROID.SEND_SMS, PERMISSIONS.ANDROID.CAMERA]).then(
  (result) => {
    console.log(result);
  }
);

const App: () => React$Node = () => {
  const [text, setText] = useState('');
  const [disabled, setDisabled] = useState(true);
  const [otpVerified, setOtpVerified] = useState(true);
  const [otp, setOtp] = useState('');
  const [init, setInit] = useState(true);
  const [imageCapture, setImageCapture] = useState(false);
  const [type, setType] = useState('front');
  let [permission, setPermission] = useState('undetermined');
  const [clickedPictures, setClickedPictures] = useState([]);
  const [showGallery, setShowGallery] = useState(false);
  const [refreshList, setRefreshList] = useState(false);
  const [picturesTaken, setPictursTaken] = useState(1);
  const [voteNow, setVoteNow] = useState(false);
  const [verifyVoter, setVerifyVoter] = useState(false);
  const [candidateList, setCandidateList] = useState(false);
  const [previewImages, setPreviewImages] = useState(false);
  const [candidates, setCandidates] = useState([{'id':1,'name': 'BJP', 'checked': false}, {'id':2,'name': 'Congress', 'checked': false}, {'id':3,'name': 'AAP', 'checked': false},{'id':4,'name': 'JDU', 'checked': false},{'id':5,'name': 'CPI', 'checked': false}]);
  const [voteConfimed, setVoteConfirmed] = useState(false);
  const [register, setRegister] = useState(false);
  const [isVotingEnabled, setIsVotingEnabled] = useState(false);
  const [constituency, setConstituency] = useState('');
  let cameraRef = useRef(null);

  useEffect(() => {
      checkMultiple([PERMISSIONS.ANDROID.CAMERA]).then((result) => {
        console.log(result);
        });
    }, []);

  const otpHandler = (message : string) => {
    console.log("got it!");
    const otp = /(\d{4})/g.exec(message)[1];
    console.log(otp);
    setOtp(otp);
    setOtpVerified(false);
    RNOtpVerify.removeListener();
  }

  const startOtpVerificationListener = () => {
    RNOtpVerify.getOtp()
    .then(p => RNOtpVerify.addListener(otpHandler))
    .catch(p => console.log(p));
  };


  const validateAadhar = (text) => {
    setText(text);

    if (text.length == 12) {
      setDisabled(false);
    }
    else {
      setDisabled(true);
    }
  };

  const getOtp = () => {
    console.log("sending sms");

    SmsAndroid.autoSend(
      "+1-555-521-5554",
      "<#> Your verification code is 2021.\najcJcvqptYr",
      (fail) => {
        console.log('Failed with this error: ' + fail);
      },
      (success) => {
        console.log('SMS sent successfully');
      });

      startOtpVerificationListener();
  };

  const proceed = () => {
    console.log("yay!");
    checkIfVoterRegistered();
  };

  const InitPage = () => {
    return (
      <SafeAreaView>
        <ScrollView
          style={styles.scrollView}>
          <View style={styles.body}>
            <View style={styles.sectionContainer}>
              <Text style={styles.sectionTitle}>Enter AADHAR card number</Text>
                <TextInput
                  style={{height: 40}}
                  keyboardType='numeric'
                  placeholder="Your Aadhar card number (12 digits)"
                  onChangeText={(text) => validateAadhar(text)}
                  defaultValue={text}
                  value={text}
                  maxLength={12}
                  />
                <Button title="Get OTP" disabled={disabled} onPress={() => getOtp() } />
            </View>
            <View style={styles.sectionContainer}>
              <Text style={styles.sectionTitle}>Verify OTP</Text>
                <TextInput
                  style={{height: 40}}
                  keyboardType='numeric'
                  placeholder="Your OTP"
                  value={otp}
                  maxLength={4}
                  />
                <Button title="Proceed" disabled={otpVerified} onPress={() => proceed() } />
            </View>
          </View>
        </ScrollView>
      </SafeAreaView>
    );
  };

  const PendingView = () => (
    <View
      style={{
        flex: 1,
        backgroundColor: 'lightgreen',
        justifyContent: 'center',
        alignItems: 'center',
      }}
      >
      <Text>Waiting</Text>
    </View>
  );

  const ImageCaptureScreen =() => {
    return (
          <RNCamera
            ref={cameraRef}
            type={RNCamera.Constants.Type.front}
            style={styles.frame}
            autoFocus={RNCamera.Constants.AutoFocus.on}
            mirrorTarget={true}
            >
            <View style={{ flex: 5, flexDirection: 'row', alignSelf: 'center' }}>
              <FlatList
                data={clickedPictures}
                extraData={refreshList}
                renderItem={({ item }) => renderItem(item)}
                keyExtractor={(item) => item.url}
                horizontal={true}
              />
              </View>
              <View style={{ flex: 1, flexDirection: 'column-reverse' }}>
                <TouchableOpacity onPress={takePicture} style={styles.capture}>
                </TouchableOpacity>
              </View>
          </RNCamera>
    );
  };

  const renderItem = (item) => {
    return (
      <TouchableOpacity
          style={{flex:1, flexDirection: 'column-reverse', marginBottom: 10 }}>
            <Image style={{width: 100, height: 100}} resizeMode='cover' source={{ uri: item.url }}></Image>
      </TouchableOpacity>
      )
  };

  const renderPreview = (item) => {
    console.log('loading preview');
    console.log(item);
    return (
      <TouchableOpacity style={{ flex: 1/3, flexDirection: 'column-reverse'}}>
          <Image style={{ width: null, height: 200 }} resizeMode='cover' source={{ uri: item.url }}></Image>
      </TouchableOpacity>
      )
  };

  const takePicture = async() => {
    console.log(cameraRef);
    if (cameraRef) {
      const options = { quality: 0.5, base64: true };
      const data = await cameraRef.current.takePictureAsync(options);
      console.log(data.uri);
      //sendToServer();
      let pictures = clickedPictures;
      pictures.push({'url': data.uri});
      setClickedPictures(pictures);
      console.log(clickedPictures);
      setRefreshList(!refreshList);
      setPictursTaken(picturesTaken + 1);

      if (imageCapture && picturesTaken == 5) {
        setImageCapture(false);
        setPreviewImages(true);
        ToastAndroid.show("Your registration is completed!", ToastAndroid.SHORT, ToastAndroid.BOTTOM);
      }

      if (verifyVoter) {
        checkIfVoterChecksOut(data.url);
      }
    }
  };

  const showVoteNow = async() => {
    console.log('here');
    try {
      let response = await fetch('http://192.168.1.4:3000/registerVoter?aadhar='+text);
      let json = await response.json();
      console.log(json);
      setPreviewImages(false);
      setVoteNow(true);
      } catch (error) {
        console.error(error);
      }
  };

  const checkIfVoterChecksOut = (imgUri) => {
    // server call
    const result = true;
    if (result) {
      ToastAndroid.show("Your identity is verified. Taking you to the voting page", ToastAndroid.SHORT, ToastAndroid.BOTTOM);
      showCandidateList();
    }
  };

  const sendToServer = async() => {
    return fetch('http://192.168.1.4:3000/uploadPictures')
    .then((response) => {
      console.log(response.json());
    })
    .catch((error) => {
      console.error(error);
    });
  };

  const getConstituency = async() => {
    // server call to be added

    try {
      let response = await fetch('http://192.168.1.4:3000/getConstituency?aadhar='+text);
      let json = await response.json();
      console.log(json);
      setConstituency(json.constituency);
      console.log(constituency);
      setVerifyVoter(false);
      setCandidateList(true);

      } catch (error) {
        console.error(error);
      }
  };


  const onCheck = (id) => {
    let candidatesTmp = candidates;
    console.log(id);
    var i=0;
    while(i < candidatesTmp.length) {
      if (candidatesTmp[i].id == id) {
        candidatesTmp[i].checked = !candidatesTmp[i].checked;
      }
      i++;
    }
    console.log('done');
    setCandidates(candidatesTmp);
    setRefreshList(!refreshList);
  };

  const renderCandidates = (item) => {
    console.log(item.name);
    console.log(item.checked);
    console.log(item.id);
    if (item.checked) {
      return (
      <TouchableOpacity style={{ flex: 2, backgroundColor: 'green' }} onPress={() => onCheck(item.id)} >
        <Text style={{ fontSize: 18, alignSelf: 'center' }}>{item.name}</Text>
      </TouchableOpacity>
      )
    }
    return (
        <TouchableOpacity style={{ flex: 2 }} onPress={() => onCheck(item.id)} >
          <Text style={{ fontSize: 18, alignSelf: 'center' }} >{item.name}</Text>
        </TouchableOpacity>
      );
  };

  const thanksForVoting = () => {
    setCandidateList(false);
    setVoteConfirmed(true);
  }

  const getChosenCandidate = () => {
    let i=0;
    while(i<candidates.length) {
      if (candidates[i].checked) {
        return candidates[i].name;
      }
      i++;
    }
  }

  const confirmAndVote = () => {
    let votingConfirmation = "Your vote will be registered for "+getChosenCandidate()+". Are you sure about this?";
    Alert.alert(
      "Confirm your vote",
      votingConfirmation,
      [
        {
          text: "No",
          onPress: () => console.log("Going back"),
        },
        { text: "Yes", onPress: () => thanksForVoting() }
      ],
      { cancelable: false }
    );
  };

  const showCandidateList = () => {
    getConstituency();
  };

  const showVerifyVoter = () => {
    setVoteNow(false);
    setVerifyVoter(true);
  };

  const oneTimeRegistration = () => {
    setRegister(false);
    setImageCapture(true);
  };

  const checkIfVoterRegistered = async() => {
    // server call
    let isRegisteredAlready = false;
    try {
      let response = await fetch('http://192.168.1.4:3000/isVoterRegistered?aadhar='+text);
      let json = await response.json();
      console.log(json);
      isRegisteredAlready = json.isRegistered;
      console.log(isRegisteredAlready);
      setInit(false);
      if (!isRegisteredAlready) {
        setRegister(true);
      }
      else {
        checkIfElectionEnabled();
      }
      } catch (error) {
        console.error(error);
      }
  };

  const checkIfElectionEnabled = async() => {
    // server call

    try {
      let response = await fetch('http://192.168.1.4:3000/votingEnabled?aadhar='+text);
      let json = await response.json();
      console.log(json);
      setIsVotingEnabled(json.isVotingEnabled);
      console.log(isVotingEnabled);

      } catch (error) {
        console.error(error);
      }

      setVoteNow(true);
  };

  const RenderVotingOn = () => {
    return (
        <Button title="Proceed to verify" onPress={ () => showVerifyVoter() } />
      )
  };

  const RenderVotingOff = () => {
    return (
      <View>
        <Button title="Proceed to verify" disabled={true} onPress={ () => showVerifyVoter() } />
        <Text style={styles.sectionDescription}>No elections in your constituency!</Text>
      </View>
    )
  };

  const PreviewImages = () => {
    return (
        <View style={{ flex: 1 }}>
          <Text style={styles.sectionTitle}>Preview</Text>
          <Text style={styles.sectionDescription}>We will be using these pictures to identify you during voting. Once every 4 months, you will be prompted to record new pictures, to make sure we still identify you.</Text>
            <FlatList
              numColumns={3}
              data={clickedPictures}
              renderItem={({ item }) => renderPreview(item)}
              keyExtractor={(item) => item.url}
              />
          <Button title="Continue" onPress={() => showVoteNow()} />
        </View>
      )
  };

  const VoteNowScreen = () => {
    return (
      <View style={{ flex: 1 }}>
        <Text style={styles.sectionTitle}>Vote Now!</Text>
        <Text style={styles.sectionDescription}>This section will be enabled during the elections. Click on proceed to verify your identify</Text>
        { !isVotingEnabled && RenderVotingOff() }
        { isVotingEnabled && RenderVotingOn() }
      </View>
    )
  };

  const VerifyVoterScreen = () => {
    return (
      <View style={{ flex: 1 }}>
        <Text style={styles.sectionTitle}>Voter Verification</Text>
        <RNCamera
          ref={cameraRef}
          type={RNCamera.Constants.Type.front}
          style={styles.frame}
          autoFocus={RNCamera.Constants.AutoFocus.on}
          mirrorTarget={true}
          >
          <View style={{ flex: 1, flexDirection: 'column-reverse' }}>
            <TouchableOpacity onPress={takePicture} style={styles.capture}>
            </TouchableOpacity>
          </View>
        </RNCamera>
      </View>
    )
  };

  const CandidateListScreen = () => {
    return (
      <View style={{ flex: 1 }}>
        <Text style={styles.sectionContainer}>Vote for your constituency - <Text style={{fontSize: 14, fontWeight: 'bold'}}>{constituency}</Text></Text>
        <Text style={styles.sectionDescription}>Please choose amongst the candidates listed below from your constituency</Text>
        <FlatList
          data={candidates}
          numColumns={1}
          renderItem={({item}) => renderCandidates(item)}
          extraData={refreshList}
          keyExtractor={(item) => item.name}
        />
        <Button title="Vote" onPress={() => confirmAndVote()}/>
      </View>
    )
  };

  const ThanksPage = () => {
    return (
        <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
          <Text style={styles.sectionTitle}>Thanks for voting!</Text>
        </View>
      )
  };

  const RegisterPage = () => {
    return (
        <View style={{ flex:1 }}>
          <Text style={styles.sectionTitle}>Register</Text>
          <Text style={styles.sectionDescription}>Looks like you aren't registered yet. Click on Register to get started. As part of registration, we will be taking your 5 pictures for identification purpose.</Text>
          <Button title="Register Now" onPress={() => oneTimeRegistration()} />
        </View>
      )
  };

  return (
    <View style={{ flex:1 }}>
      <StatusBar barStyle="dark-content" />
      { init && InitPage() }
      { register && RegisterPage() }
      { imageCapture && ImageCaptureScreen() }
      { previewImages && PreviewImages() }
      { voteNow && VoteNowScreen() }
      { verifyVoter && VerifyVoterScreen() }
      { candidateList && CandidateListScreen() }
      { voteConfimed && ThanksPage() }
    </View>
  );
};

const styles = StyleSheet.create({
  scrollView: {
    backgroundColor: Colors.lighter,
  },
  container: {
    backgroundColor: 'black',
    position: 'absolute',
    height: 100
  },
  engine: {
    position: 'absolute',
    right: 0,
  },
  body: {
    backgroundColor: Colors.white,
  },
  sectionContainer: {
    marginTop: 32,
    paddingHorizontal: 24,
  },
  sectionTitle: {
    fontSize: 24,
    fontWeight: '600',
    color: Colors.black,
  },
  sectionDescription: {
    marginTop: 8,
    fontSize: 18,
    fontWeight: '400',
    color: Colors.dark,
  },
  highlight: {
    fontWeight: '700',
  },
  footer: {
    color: Colors.dark,
    fontSize: 12,
    fontWeight: '600',
    padding: 4,
    paddingRight: 12,
    textAlign: 'right',
  },
  preview: {
    flex: 1,
    justifyContent: 'flex-end',
    alignItems: 'center',
  },
  capture: {
    backgroundColor: '#fff',
    borderRadius: 40,
    alignSelf: 'center',
    width: 80,
    height: 80,
    marginBottom: 20
  },
  frame: {
    flex: 1
  },
  listCell: {
    flex: 1,
    backgroundColor: '#CCC',
    height: 80,
    textAlign: 'center'
  }
});

export default App;
