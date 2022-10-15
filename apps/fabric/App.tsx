import React from 'react';
import LottieView from 'lottie-react-native';
import {View} from 'react-native';

const App = () => {
  return (
    <View>
      <LottieView
        source={require('./LottieLogo1.json')}
        autoPlay
        loop
        enableMergePathsAndroidForKitKatAndAbove
      />
    </View>
  );
};

export default App;
