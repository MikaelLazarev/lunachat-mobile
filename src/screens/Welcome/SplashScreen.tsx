/*
 * Lunachat - sattelite chat based on NuCypher
 * Copyright (c) 2020. Mikhail Lazarev
 */

import React from 'react';
import {Image, ImageBackground, SafeAreaView, StyleSheet, View} from 'react-native';
import {Button, Text} from 'react-native-elements';
import {useNavigation} from '@react-navigation/native';
import {commonStyles} from '../../../styles';

export const SplashScreen: React.FC = () => {
  const navigation = useNavigation();
  return (
    <View
      style={{
        ...commonStyles.safeAreaContainerCentered,
        backgroundColor: '#0b1535',
          width: '100%',
      }}>
        {/*<ImageBackground source={require('../../assets/background.jpg')} style={styles.image} >*/}
      <Image
        source={require('../../../logo.png')}
        style={{
          height: 220,
          resizeMode: 'contain',
          marginBottom: 28,
          marginTop: -40,
        }}
      />
      <Text h1>Lunachat</Text>
      <Text
        style={{
          fontSize: 18,
          fontWeight: 'bold',
          color: '#ffeb83',
          marginTop: 5,
        }}>
       NuCypher based chat
      </Text>
      <View style={styles.button}>
        <Button
          title="Login / Signup"
          onPress={() => navigation.navigate('PhoneScreen')}
          type="outline"
          buttonStyle={{borderColor: "#FFF"}}
          titleStyle={{color: "#FFF"}}


        />
      </View>
        {/*</ImageBackground>*/}
    </View>
  );
};

const styles = StyleSheet.create({
  button: {
    width: '70%',
    paddingTop: 50,
      borderColor: "#ffeb83"
  },
    image: {
        flex: 1,
        resizeMode: "cover",
        justifyContent: "center",
        alignContent: "center",
        alignItems: "center",
        width: '100%',
    },
});
