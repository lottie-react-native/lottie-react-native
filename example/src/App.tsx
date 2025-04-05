import { View, StyleSheet } from 'react-native';
import { LottieAnimationView } from 'lottie-react-native';

export default function App() {
  return (
    <View style={styles.container}>
      <LottieAnimationView
        style={{ height: 100, width: 100, backgroundColor: '#abc' }}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
