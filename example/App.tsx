import React from "react";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";
import LottieView from "lottie-react-native";

const color = {
  primary: "#1652f0",
  secondary: "#64E9FF",
};

const remoteSource = {
  uri: "https://raw.githubusercontent.com/lottie-react-native/lottie-react-native/master/example/animations/Watermelon.json",
};

const dotLottie = require("./animations/animation_lkekfrcl.lottie");

const localSource = require("./animations/LottieLogo1.json");

const App = () => {
  const ref = React.useRef<LottieView>(null);
  const [source, setSource] = React.useState(localSource);
  const [isLoop, setLoop] = React.useState(false);

  return (
    <View style={styles.container}>
      <LottieView
        ref={ref}
        key={source + isLoop}
        source={source}
        autoPlay={false}
        loop={isLoop}
        style={styles.lottie}
        resizeMode={"contain"}
        colorFilters={colorFilter}
        enableMergePathsAndroidForKitKatAndAbove
        enableSafeModeAndroid
        onAnimationFinish={() => {
          console.log("Finished");
        }}
        onAnimationFailure={(e) => {
          console.log("Error ", { e });
        }}
      />
      <View style={styles.controlsContainer}>
        <TouchableOpacity
          onPress={() => {
            setSource(localSource);
          }}
          style={styles.button}
        >
          <Text style={styles.text}>{"Local animation"}</Text>
        </TouchableOpacity>
        <TouchableOpacity
          onPress={() => {
            ref.current?.play();
          }}
          style={styles.button}
        >
          <Text style={styles.text}>{"Play"}</Text>
        </TouchableOpacity>
        <TouchableOpacity
          onPress={() => {
            ref.current?.play(40, 179);
          }}
          style={styles.button}
        >
          <Text style={styles.text}>{"Play from frames"}</Text>
        </TouchableOpacity>
        <TouchableOpacity
          onPress={() => {
            ref.current?.reset();
          }}
          style={styles.button}
        >
          <Text style={styles.text}>{"Reset"}</Text>
        </TouchableOpacity>
        <TouchableOpacity
          onPress={() => {
            setSource(remoteSource);
          }}
          style={styles.button}
        >
          <Text style={styles.text}>{"Remote animation"}</Text>
        </TouchableOpacity>
        <TouchableOpacity
          onPress={() => {
            setSource(dotLottie);
          }}
          style={styles.button}
        >
          <Text style={styles.text}>{"DotLottie animation"}</Text>
        </TouchableOpacity>
        <TouchableOpacity
          onPress={() => {
            setLoop((p) => !p);
          }}
          style={styles.button}
        >
          <Text style={styles.text}>{isLoop ? "Loop on" : "Loop off"}</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingVertical: 32,
  },
  controlsContainer: { marginTop: 24, gap: 12 },
  button: {
    backgroundColor: color.primary,
    paddingHorizontal: 24,
    paddingVertical: 16,
  },
  text: { color: "white", textAlign: "center" },
  lottie: { width: 400, height: 400 },
});

const colorFilter = [
  {
    keypath: "BG",
    color: color.primary,
  },
  {
    keypath: "O-B",
    color: color.secondary,
  },
  {
    keypath: "L-B",
    color: color.secondary,
  },
  {
    keypath: "T1a-Y 2",
    color: color.secondary,
  },
  {
    keypath: "T1b-Y",
    color: color.secondary,
  },
  {
    keypath: "T2b-B",
    color: color.secondary,
  },
  {
    keypath: "T2a-B",
    color: color.secondary,
  },
  {
    keypath: "I-Y",
    color: color.secondary,
  },
  {
    keypath: "E1-Y",
    color: color.secondary,
  },
  {
    keypath: "E2-Y",
    color: color.secondary,
  },
  {
    keypath: "E3-Y",
    color: color.secondary,
  },
];

export default App;
