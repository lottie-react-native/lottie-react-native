import React from 'react';
import AnimatedLottieView from 'lottie-react-native';

const App = () => {
  return (
    <AnimatedLottieView
      source={require('./animations/DynamicText.json')}
      autoPlay
      loop
      colorFilters={[
        {
          keypath: 'Background Shape',
          color: '#FF6600',
        },
      ]}
      textFiltersAndroid={[
        {
          keypath: 'Text - 2',
          text: 'FILTERS',
        },
        {
          keypath: 'Text - 3',
          text: 'ANDROID',
        },
      ]}
      textFiltersIOS={[
        {
          keypath: 'Text - 2',
          text: 'FILTERS',
        },
        {
          keypath: 'Text - 3',
          text: 'iOS',
        },
      ]}
      enableMergePathsAndroidForKitKatAndAbove
    />
  );
};

export default App;
