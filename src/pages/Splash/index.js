import React from 'react';
import {StatusBar, View} from 'react-native';

import LottieView from 'lottie-react-native';

const Splash = props => {
  return (
    <View style={{flex: 1, backgroundColor: 'white'}}>
      <StatusBar
        barStyle={'dark-content'}
        backgroundColor={'white'}
        translucent
      />
      <LottieView
        source={require('../../assets/animations/splash_animation.json')}
        autoPlay
        loop={false}
        speed={0.85}
        onAnimationFinish={() => props.setIsSplashing(false)}
      />
    </View>
  );
};

export default Splash;
