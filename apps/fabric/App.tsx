import React from 'react';
import AnimatedLottieView from 'lottie-react-native';

const App = () => {
  return (
    <AnimatedLottieView
      source={require('./Check.json')}
      autoPlay
      loop={false}
      onAnimationFinish={() => {
        console.log('Animation finished.');
      }}
      colorFilters={[
        {
          keypath: 'Circle',
          color: '#FF0000',
        },
      ]}
      enableMergePathsAndroidForKitKatAndAbove
    />
  );
};

export default App;
