import { View, StyleSheet, TouchableOpacity, Text } from 'react-native';
import { LottieAnimationView } from 'lottie-react-native';
import {
  parseColorToHex,
  parsePossibleSources,
} from '../../src/LottieView/utils';
import { useState } from 'react';

const color = {
  third: '#1652f0',
  secondary: '#64EAFF',
  primary: 'rgba(0, 10, 100, 0.2)',
};

const remoteSource = {
  uri: 'https://raw.githubusercontent.com/lottie-react-native/lottie-react-native/master/example/animations/Watermelon.json',
};

const dotLottie = require('../animations/animation_lkekfrcl.lottie');

const localSource = require('../animations/LottieLogo1.json');

export default function App() {
  // const ref = useRef<LottieView>(null);
  const [source, setSource] = useState(localSource);
  const [isLoop, setLoop] = useState(false);
  return (
    <View style={styles.container}>
      <LottieAnimationView
        {...parsePossibleSources(source)}
        autoPlay={true} // Temporary till i create the callback wrappers and allow passing ref
        loop={isLoop}
        style={styles.lottie}
        resizeMode={'NOT_SET'}
        renderMode={'NOT_SET'}
        enableMergePathsAndroidForKitKatAndAbove
        enableSafeModeAndroid
        colorFilters={colorFilter.map((item) => ({
          ...item,
          color: parseColorToHex(item.color),
        }))}
        // onAnimationLoaded={{
        //   f: () => {
        //     console.log('Lottie loaded');
        //   },
        // }}
        // onAnimationFailure={{
        //   f: (error) => {
        //     console.log(`Lottie Errored: ${error}`);
        //   },
        // }}
        // onAnimationFinish={{
        //   f: (isCancelled) => {
        //     console.log(
        //       `Lottie Finished with isCancelled set to ${isCancelled}`
        //     );
        //   },
        // }}
      />
      <View style={styles.controlsContainer}>
        <TouchableOpacity
          onPress={() => {
            setSource(localSource);
          }}
          style={styles.button}
        >
          <Text style={styles.text}>{'Local animation'}</Text>
        </TouchableOpacity>
        <TouchableOpacity
          onPress={() => {
            // ref.current?.play();
          }}
          style={styles.button}
        >
          <Text style={styles.text}>{'Play'}</Text>
        </TouchableOpacity>
        <TouchableOpacity
          onPress={() => {
            // ref.current?.play(40, 179);
          }}
          style={styles.button}
        >
          <Text style={styles.text}>{'Play from frames'}</Text>
        </TouchableOpacity>
        <TouchableOpacity
          onPress={() => {
            // ref.current?.reset();
          }}
          style={styles.button}
        >
          <Text style={styles.text}>{'Reset'}</Text>
        </TouchableOpacity>
        <TouchableOpacity
          onPress={() => {
            setSource(remoteSource);
          }}
          style={styles.button}
        >
          <Text style={styles.text}>{'Remote animation'}</Text>
        </TouchableOpacity>
        <TouchableOpacity
          onPress={() => {
            setSource(dotLottie);
          }}
          style={styles.button}
        >
          <Text style={styles.text}>{'DotLottie animation'}</Text>
        </TouchableOpacity>
        <TouchableOpacity
          onPress={() => {
            setLoop((p: boolean) => !p);
          }}
          style={styles.button}
        >
          <Text style={styles.text}>{isLoop ? 'Loop on' : 'Loop off'}</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 32,
  },
  controlsContainer: { marginTop: 24, gap: 12 },
  button: {
    backgroundColor: color.primary,
    paddingHorizontal: 24,
    paddingVertical: 16,
  },
  text: { color: 'white', textAlign: 'center' },
  lottie: { width: 400, height: 400 },
});

const colorFilter = [
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
    color: color.third,
  },
];
