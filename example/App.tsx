import LottieView from "lottie-react-native";
import React, { useCallback, useRef, useState } from "react";
import {
  Alert,
  Dimensions,
  SafeAreaView,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

const { width: screenWidth } = Dimensions.get("window");

// Enhanced color scheme
const colors = {
  primary: "#1652f0",
  secondary: "#64E9FF",
  background: "#f8f9fa",
  surface: "#ffffff",
  text: "#2c3e50",
  textLight: "#7f8c8d",
  success: "#27ae60",
  warning: "#f39c12",
  error: "#e74c3c",
  shadow: "rgba(0, 0, 0, 0.1)",
};

// Animation sources
const animationSources = {
  local: require("./animations/LottieLogo1.json"),
  remote: {
    uri: "https://raw.githubusercontent.com/lottie-react-native/lottie-react-native/master/example/animations/Watermelon.json",
  },
  dotLottie: require("./animations/animation_lkekfrcl.lottie"),
};

// Enhanced color filters with more comprehensive mapping
const colorFilters = [
  { keypath: "BG", color: colors.primary },
  { keypath: "O-B", color: colors.secondary },
  { keypath: "L-B", color: colors.secondary },
  { keypath: "T1a-Y 2", color: colors.secondary },
  { keypath: "T1b-Y", color: colors.secondary },
  { keypath: "T2b-B", color: colors.secondary },
  { keypath: "T2a-B", color: colors.secondary },
  { keypath: "I-Y", color: colors.secondary },
  { keypath: "E1-Y", color: colors.secondary },
  { keypath: "E2-Y", color: colors.secondary },
  { keypath: "E3-Y", color: colors.secondary },
];

// Animation speed options
const speedOptions = [0.5, 1, 1.5, 2];

const App: React.FC = () => {
  const lottieRef = useRef<LottieView>(null);
  const [currentSource, setCurrentSource] = useState(animationSources.local);
  const [isLooping, setIsLooping] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [animationSpeed, setAnimationSpeed] = useState(1);
  const [progress, setProgress] = useState(0);
  const [isLoading, setIsLoading] = useState(false);

  // Enhanced animation control methods
  const playAnimation = useCallback(() => {
    lottieRef.current?.play();
    setIsPlaying(true);
  }, []);

  const pauseAnimation = useCallback(() => {
    lottieRef.current?.pause();
    setIsPlaying(false);
  }, []);

  const resetAnimation = useCallback(() => {
    lottieRef.current?.reset();
    setIsPlaying(false);
    setProgress(0);
  }, []);

  const playFromFrames = useCallback(() => {
    lottieRef.current?.play(40, 179);
    setIsPlaying(true);
  }, []);

  const changeSource = useCallback((source: any, sourceName: string) => {
    setIsLoading(true);
    setCurrentSource(source);
    setIsPlaying(false);
    setProgress(0);

    // Simulate loading time for better UX
    setTimeout(() => {
      setIsLoading(false);
    }, 500);
  }, []);

  const toggleLoop = useCallback(() => {
    setIsLooping((prev) => !prev);
  }, []);

  const changeSpeed = useCallback(() => {
    const currentIndex = speedOptions.indexOf(animationSpeed);
    const nextIndex = (currentIndex + 1) % speedOptions.length;
    setAnimationSpeed(speedOptions[nextIndex]);
  }, [animationSpeed]);

  const handleAnimationFinish = useCallback(() => {
    console.log("Animation finished");
    setIsPlaying(false);
    if (!isLooping) {
      setProgress(1);
    }
  }, [isLooping]);

  const handleAnimationFailure = useCallback((error: any) => {
    console.error("Animation error:", error);
    Alert.alert(
      "Animation Error",
      "Failed to load or play the animation. Please try again.",
      [{ text: "OK" }]
    );
    setIsLoading(false);
    setIsPlaying(false);
  }, []);

  const Button: React.FC<{
    title: string;
    onPress: () => void;
    variant?: "primary" | "secondary" | "success" | "warning";
    disabled?: boolean;
  }> = ({ title, onPress, variant = "primary", disabled = false }) => (
    <TouchableOpacity
      onPress={onPress}
      style={[
        styles.button,
        styles[`button-${variant}`],
        disabled && styles.buttonDisabled,
      ]}
      disabled={disabled}
      activeOpacity={0.8}
    >
      <Text style={[styles.buttonText, disabled && styles.buttonTextDisabled]}>
        {title}
      </Text>
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="dark-content" backgroundColor={colors.background} />
      <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.title}>Lottie Animation Player</Text>
          <Text style={styles.subtitle}>Interactive animation controls</Text>
        </View>

        {/* Animation Container */}
        <View style={styles.animationContainer}>
          <View style={styles.animationWrapper}>
            {isLoading && (
              <View style={styles.loadingOverlay}>
                <Text style={styles.loadingText}>Loading...</Text>
              </View>
            )}
            <LottieView
              ref={lottieRef}
              key={`${JSON.stringify(
                currentSource
              )}-${isLooping}-${animationSpeed}`}
              source={currentSource}
              autoPlay={false}
              loop={isLooping}
              speed={animationSpeed}
              containerStyle={styles.lottieContainer}
              style={styles.lottie}
              resizeMode="contain"
              colorFilters={colorFilters}
              enableMergePathsAndroidForKitKatAndAbove
              enableSafeModeAndroid
              onAnimationFinish={handleAnimationFinish}
              onAnimationFailure={handleAnimationFailure}
              onAnimationLoaded={() => setIsLoading(false)}
            />
          </View>

          {/* Animation Info */}
          <View style={styles.infoContainer}>
            <Text style={styles.infoText}>
              Speed: {animationSpeed}x | Loop: {isLooping ? "ON" : "OFF"} |
              Status: {isPlaying ? "Playing" : "Paused"}
            </Text>
          </View>
        </View>

        {/* Control Sections */}
        <View style={styles.controlsContainer}>
          {/* Animation Sources */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Animation Sources</Text>
            <View style={styles.buttonRow}>
              <Button
                title="Local Animation"
                onPress={() => changeSource(animationSources.local, "Local")}
                variant="primary"
              />
              <Button
                title="Remote Animation"
                onPress={() => changeSource(animationSources.remote, "Remote")}
                variant="secondary"
              />
            </View>
            <Button
              title="DotLottie Animation"
              onPress={() =>
                changeSource(animationSources.dotLottie, "DotLottie")
              }
              variant="success"
            />
          </View>

          {/* Playback Controls */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Playback Controls</Text>
            <View style={styles.buttonRow}>
              <Button
                title={isPlaying ? "Pause" : "Play"}
                onPress={isPlaying ? pauseAnimation : playAnimation}
                variant={isPlaying ? "warning" : "success"}
              />
              <Button
                title="Reset"
                onPress={resetAnimation}
                variant="secondary"
              />
            </View>
            <Button
              title="Play from Frames (40-179)"
              onPress={playFromFrames}
              variant="primary"
            />
          </View>

          {/* Animation Settings */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Animation Settings</Text>
            <View style={styles.buttonRow}>
              <Button
                title={`Speed: ${animationSpeed}x`}
                onPress={changeSpeed}
                variant="secondary"
              />
              <Button
                title={`Loop: ${isLooping ? "ON" : "OFF"}`}
                onPress={toggleLoop}
                variant={isLooping ? "success" : "primary"}
              />
            </View>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: colors.background,
  },
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  header: {
    padding: 24,
    alignItems: "center",
    backgroundColor: colors.surface,
    marginBottom: 16,
    shadowColor: colors.shadow,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  title: {
    fontSize: 28,
    fontWeight: "bold",
    color: colors.text,
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 16,
    color: colors.textLight,
  },
  animationContainer: {
    backgroundColor: colors.surface,
    marginHorizontal: 16,
    marginBottom: 16,
    borderRadius: 16,
    padding: 16,
    shadowColor: colors.shadow,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  animationWrapper: {
    alignItems: "center",
    position: "relative",
  },
  lottie: {
    width: Math.min(screenWidth - 64, 320),
    height: Math.min(screenWidth - 64, 320),
  },
  lottieContainer: { backgroundColor: "gray", borderRadius: 60 },
  loadingOverlay: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(255, 255, 255, 0.8)",
    borderRadius: 16,
    zIndex: 1,
  },
  loadingText: {
    fontSize: 16,
    color: colors.textLight,
    fontWeight: "500",
  },
  infoContainer: {
    marginTop: 16,
    padding: 12,
    backgroundColor: colors.background,
    borderRadius: 8,
  },
  infoText: {
    fontSize: 14,
    color: colors.textLight,
    textAlign: "center",
    fontFamily: "monospace",
  },
  controlsContainer: {
    paddingHorizontal: 16,
    paddingBottom: 24,
  },
  section: {
    backgroundColor: colors.surface,
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    shadowColor: colors.shadow,
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: colors.text,
    marginBottom: 12,
  },
  buttonRow: {
    flexDirection: "row",
    gap: 8,
    marginBottom: 8,
  },
  button: {
    flex: 1,
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: "center",
    shadowColor: colors.shadow,
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 2,
    elevation: 2,
  },
  ["button-primary"]: {
    backgroundColor: colors.primary,
  },
  ["button-secondary"]: {
    backgroundColor: colors.secondary,
  },
  ["button-success"]: {
    backgroundColor: colors.success,
  },
  ["button-warning"]: {
    backgroundColor: colors.warning,
  },
  buttonDisabled: {
    backgroundColor: colors.textLight,
  },
  buttonText: {
    color: "white",
    fontSize: 14,
    fontWeight: "600",
    textAlign: "center",
  },
  buttonTextDisabled: {
    color: "rgba(255, 255, 255, 0.6)",
  },
});

export default App;
