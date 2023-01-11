import React from 'react';
import AnimatedLottieView from 'lottie-react-native';

const color = {
  primary: '#1652f0',
  secondary: '#64E9FF',
};

const App = () => {
  return (
    <AnimatedLottieView
      source={require('./animations/LottieLogo1.json')}
      autoPlay
      loop
      onAnimationFinish={() => {
        console.log('finished');
      }}
      colorFilters={[
        {
          keypath: 'BG',
          color: color.primary,
        },
        {
          keypath: 'O-B',
          color: color.secondary,
        },
        {
          keypath: 'L-B',
          color: color.secondary,
        },
        {
          keypath: 'T1a-Y 2',
          color: color.secondary,
        },
        {
          keypath: 'T1b-Y',
          color: color.secondary,
        },
        {
          keypath: 'T2b-B',
          color: color.secondary,
        },
        {
          keypath: 'T2a-B',
          color: color.secondary,
        },
        {
          keypath: 'I-Y',
          color: color.secondary,
        },
        {
          keypath: 'E1-Y',
          color: color.secondary,
        },
        {
          keypath: 'E2-Y',
          color: color.secondary,
        },
        {
          keypath: 'E3-Y',
          color: color.secondary,
        },
      ]}
      enableMergePathsAndroidForKitKatAndAbove
    />
  );
};

export default App;
