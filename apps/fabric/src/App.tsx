import React from 'react';
import {StyleSheet, Text, TouchableOpacity, View} from 'react-native';
import AnimatedLottieView from 'lottie-react-native';

const color = {
  primary: '#1652f0',
  secondary: '#64E9FF',
};

const remoteSource = {
  uri: 'https://raw.githubusercontent.com/lottie-react-native/lottie-react-native/master/apps/paper/src/animations/Watermelon.json',
};

const localSource = require('./animations/LottieLogo1.json');

const App = () => {
  const [source, setSource] = React.useState<'local' | 'remote'>('local');

  return (
    <View style={styles.container}>
      <AnimatedLottieView
        source={source === 'remote' ? remoteSource : localSource}
        autoPlay={true}
        loop={false}
        style={styles.lottie}
        colorFilters={source === 'local' ? localColorFilter : undefined}
        enableMergePathsAndroidForKitKatAndAbove
        onAnimationFinish={() => {
          console.log('finished');
        }}
      />
      <TouchableOpacity
        onPress={() => {
          setSource(source === 'local' ? 'remote' : 'local');
        }}
        style={styles.button}>
        <Text style={styles.text}>
          {source === 'local' ? 'Local animation' : 'Remote animation'}
        </Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 32,
  },
  button: {backgroundColor: color.primary, marginTop: 24, padding: 24},
  text: {color: 'white'},
  lottie: {width: 400, height: 400},
});

const localColorFilter = [
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
];

export default App;
