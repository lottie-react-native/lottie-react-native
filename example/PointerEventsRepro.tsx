import React, { useState } from "react";
import { Pressable, StyleSheet, Text, View, ViewStyle } from "react-native";
import LottieView from "lottie-react-native";

const modes = ["auto", "none", "box-only", "box-none", undefined] as const;

export default function PointerEventsRepro() {
  const [mode, setMode] = useState<ViewStyle["pointerEvents"]>("none");
  const [lottieCount, setLottieCount] = useState(0);
  const [viewCount, setViewCount] = useState(0);
  const [loaded, setLoaded] = useState(false);
  return (
    <View style={styles.screen}>
      <Text>
        Lottie pointerEvents: {mode ?? "unset"}; loaded: {String(loaded)}
      </Text>
      <View style={styles.controls}>
        {modes.map((value) => (
          <Pressable
            key={value ?? "unset"}
            accessibilityRole="button"
            style={styles.button}
            onPress={() => setMode(value)}
          >
            <Text>{value ?? "unset"}</Text>
          </Pressable>
        ))}
      </View>
      <Text>Lottie taps: {lottieCount}</Text>
      <View style={styles.area}>
        <Pressable
          accessibilityLabel="Behind Lottie"
          style={styles.target}
          onPress={() => setLottieCount((value) => value + 1)}
        />
        <LottieView
          source={require("./animations/LottieLogo1.json")}
          progress={0.5}
          style={[StyleSheet.absoluteFill, { pointerEvents: mode }]}
          onAnimationLoaded={() => setLoaded(true)}
        />
      </View>
      <Text>View taps: {viewCount}</Text>
      <View style={styles.area}>
        <Pressable
          accessibilityLabel="Behind View"
          style={styles.target}
          onPress={() => setViewCount((value) => value + 1)}
        />
        <View
          collapsable={false}
          style={[
            StyleSheet.absoluteFill,
            styles.overlay,
            { pointerEvents: mode },
          ]}
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    padding: 20,
    paddingTop: 60,
    backgroundColor: "white",
    gap: 12,
  },
  controls: { flexDirection: "row", flexWrap: "wrap", gap: 8 },
  button: { padding: 12, backgroundColor: "#ddd" },
  area: { height: 160 },
  target: { flex: 1, backgroundColor: "#ccffcc" },
  overlay: { backgroundColor: "#aaddff88" },
});
