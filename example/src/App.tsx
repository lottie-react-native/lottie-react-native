import { View, StyleSheet } from 'react-native';
import { LottieAnimationView } from 'lottie-react-native';
import { parsePossibleSources } from '../../src/LottieView/utils';
import LottieLogo from './animations/LottieLogo1.json';

const color = {
  primary: '#1652f0',
  secondary: '#64E9FF',
};

export default function App() {
  return (
    <View style={styles.container}>
      <LottieAnimationView
        {...parsePossibleSources(LottieLogo)}
        style={styles.lottie}
        autoPlay
        loop
        colorFilters={colorFilter}
      />
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
    color: color.secondary,
  },
];
