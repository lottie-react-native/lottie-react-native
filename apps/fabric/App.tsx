import React from 'react';
import AnimatedLottieView from 'lottie-react-native';

const App = () => {
  return (
    <AnimatedLottieView
      autoPlay={true}
      source={require('./9squares-AlBoardman.json')}
      loop={true}
    />
  );
};

export default App;
