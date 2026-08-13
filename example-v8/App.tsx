import LottieView from 'lottie-react-native-nitro';
import React from 'react';
import {Button, SafeAreaView, StyleSheet, Text, View} from 'react-native';

/**
 * API-parity smoke test for the Nitro port.
 *
 * Everything below is v7 API usage, unchanged: the default import, the prop
 * names and shapes, and the four imperative ref methods. It exercises the
 * source-kind switch that the `''` sentinel in the wrapper exists to survive
 * (see packages/nitro/TODO.md item 8) — with the stub natives nothing renders,
 * but a redbox or an "Unimplemented component" box means the wiring is broken.
 */
export default function App() {
  const ref = React.useRef<LottieView>(null);
  const [remote, setRemote] = React.useState(false);

  // Memoised: Nitro diffs props with `!==`, so inline arrays would re-push to
  // native on every render.
  const colorFilters = React.useMemo(
    () => [{keypath: 'Shape Layer 1', color: '#FF0000'}],
    [],
  );

  return (
    <SafeAreaView style={styles.root}>
      <Text style={styles.title}>lottie-react-native-nitro</Text>
      <Text style={styles.subtitle}>
        v7 API on the Nitro spec. Native side is a no-op stub, so nothing
        animates yet.
      </Text>

      <View style={styles.frame}>
        <LottieView
          ref={ref}
          source={remote ? {uri: 'https://example.com/animation.json'} : 'Watermelon'}
          style={styles.view}
          autoPlay
          loop
          speed={1}
          resizeMode="contain"
          colorFilters={colorFilters}
          onAnimationFinish={isCancelled =>
            console.log('finish, cancelled:', isCancelled)
          }
          onAnimationFailure={error => console.log('failure:', error)}
          onAnimationLoaded={() => console.log('loaded')}
        />
      </View>

      <View style={styles.row}>
        <Button title="play" onPress={() => ref.current?.play()} />
        <Button title="play 0-30" onPress={() => ref.current?.play(0, 30)} />
        <Button title="pause" onPress={() => ref.current?.pause()} />
        <Button title="resume" onPress={() => ref.current?.resume()} />
        <Button title="reset" onPress={() => ref.current?.reset()} />
      </View>

      <Button
        title={remote ? 'use local source' : 'use remote source'}
        onPress={() => setRemote(v => !v)}
      />
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
  row: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    gap: 8,
  },
});
