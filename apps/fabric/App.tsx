import React from 'react';
import AnimatedLottieView from 'lottie-react-native';

const App = () => {
  return (
    <AnimatedLottieView
      source={require('./LottieLogo1.json')}
      autoPlay
      loop
      enableMergePathsAndroidForKitKatAndAbove
    />
  );
};

export default App;
