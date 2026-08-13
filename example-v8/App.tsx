import {LottieView} from 'lottie-react-native-nitro';
import React from 'react';
import {SafeAreaView, StyleSheet, Text, View} from 'react-native';

/**
 * Smoke test for the Nitro view scaffold.
 *
 * The bordered frame below should contain an empty native view. If registration
 * is broken you get "Unimplemented component <LottieView>" on Android or a
 * redbox on iOS, rather than a silent pass.
 */
export default function App() {
  return (
    <SafeAreaView style={styles.root}>
      <Text style={styles.title}>lottie-react-native-nitro</Text>
      <Text style={styles.subtitle}>
        Nitro HybridView stub — renders an empty native view. No Lottie
        rendering yet.
      </Text>
      <View style={styles.frame}>
        <LottieView placeholder={false} style={styles.view} />
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 12,
  },
  title: {
    fontSize: 20,
    fontWeight: '600',
  },
  subtitle: {
    fontSize: 13,
    opacity: 0.6,
    textAlign: 'center',
    paddingHorizontal: 24,
  },
  frame: {
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 8,
  },
  view: {
    width: 200,
    height: 200,
  },
});
