import LottieView from 'lottie-react-native';
import {useRef, useState} from 'react';
import {Button, StyleSheet, TextInput, View} from 'react-native';

export const FramesExample = () => {
  const [startFrame, setStartFrame] = useState(0);
  const [endFrame, setEndFrame] = useState(15);

  const ref = useRef<LottieView>(null);

  const playFrames = () => {
    ref.current?.play(startFrame, endFrame);
  };

  return (
    <View style={styles.container}>
      <LottieView
        ref={ref}
        source={require('./animations/LottieWalkthrough.json')}
        autoPlay={false}
        loop={false}
        style={styles.lottie}
      />
      <TextInput
        key={'startFrame'}
        defaultValue={'0'}
        style={styles.input}
        placeholder="start frame"
        onChangeText={e => setStartFrame(parseInt(e ?? 0))}
      />
      <TextInput
        key={'endFrame'}
        defaultValue={'15'}
        style={styles.input}
        placeholder="end frame"
        onChangeText={e => setEndFrame(parseInt(e ?? 0))}
      />
      <Button title={'Play frames'} onPress={playFrames} />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 16,
  },
  lottie: {
    width: 200,
    height: 200,
    resizeMode: 'contain',
  },
  input: {borderWidth: 1, borderColor: 'black', width: 200, padding: 4},
});
