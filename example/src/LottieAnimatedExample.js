/* eslint-disable react-native/no-inline-styles */
import React from 'react';
import {
  View,
  Animated,
  Easing,
  StyleSheet,
  Switch,
  Image,
  Platform,
  Text,
  TouchableOpacity,
} from 'react-native';
import LottieView from 'lottie-react-native';
import Slider from '@react-native-community/slider';
import ExamplePicker from './ExamplePicker';

const AnimatedSlider = Animated.createAnimatedComponent(Slider);

const playIcon = require('./images/play.png');
const pauseIcon = require('./images/pause.png');
const loopIcon = require('./images/loop.png');
const inverseIcon = require('./images/inverse.png');

const makeExample = (name, getJson, width) => ({
  name,
  getSource: Platform.select({
    windows: () => name, // Use codegen resources, which are referenced by name
    default: getJson,
  }),
  width,
});
const EXAMPLES = [
  makeExample('9 squares', () =>
    require('./animations/9squares-AlBoardman.json'),
  ),
  makeExample('Hamburger Arrow', () =>
    require('./animations/HamburgerArrow.json'),
  ),
  makeExample(
    'Hamburger Arrow (200 px)',
    () => require('./animations/HamburgerArrow.json'),
    200,
  ),
  makeExample('Line Animation', () =>
    require('./animations/LineAnimation.json'),
  ),
  makeExample('Lottie Logo 1', () => require('./animations/LottieLogo1.json')),
  makeExample('Lottie Logo 2', () => require('./animations/LottieLogo2.json')),
  makeExample('Lottie Walkthrough', () =>
    require('./animations/LottieWalkthrough.json'),
  ),
  makeExample('Motion Corpse', () =>
    require('./animations/MotionCorpse-Jrcanest.json'),
  ),
  makeExample('Pin Jump', () => require('./animations/PinJump.json')),
  makeExample('Twitter Heart', () => require('./animations/TwitterHeart.json')),
  makeExample('Watermelon', () => require('./animations/Watermelon.json')),
  makeExample('Motion Corpse', () =>
    require('./animations/MotionCorpse-Jrcanest.json'),
  ),
  makeExample('Remote load', () => ({
    uri: 'https://raw.githubusercontent.com/lottie-react-native/lottie-react-native/master/example/js/animations/Watermelon.json',
  })),
];

export default class LottieAnimatedExample extends React.Component {
  state = {
    example: EXAMPLES[0],
    duration: 3000,
    isPlaying: true,
    isInverse: false,
    isPaused: false,
    loop: true,
    progress: undefined,
  };
  anim = undefined;

  isImperativeMode = () => this.state.progress === undefined;

  stopAnimation = () => {
    if (this.isImperativeMode()) {
      this.anim.reset();
    } else {
      this.state.progress.setValue(0);
    }
    this.setState({isPlaying: false, isPaused: false});
  };

  onPlayPress = () => {
    let isPlaying = this.state.isPlaying;
    let isPaused = this.state.isPaused;

    if (this.isImperativeMode()) {
      if (isPlaying) {
        if (isPaused) {
          this.anim.resume();
          isPaused = false;
        } else {
          this.anim.pause();
          isPaused = true;
        }
      } else {
        this.anim.reset();
        this.anim.play();
        isPlaying = true;
        isPaused = false;
      }
      this.setState({isPlaying, isPaused});
    } else {
      this.state.progress.setValue(0);

      if (!isPlaying) {
        this.setState({isPlaying: true, isPaused: false});

        Animated.timing(this.state.progress, {
          toValue: 1,
          duration: this.state.duration,
          easing: Easing.linear,
          useNativeDriver: false,
        }).start(() => {
          this.setState({isPlaying: false, isPaused: false});
        });
      }
    }
  };

  onLoopPress = () => {
    this.stopAnimation();
    this.setState({loop: !this.state.loop});
  };

  onStopPress = () => {
    this.stopAnimation();
  };

  onInversePress = () =>
    this.setState(state => ({isInverse: !state.isInverse}));
  onProgressChange = progress => this.state.progress?.setValue(progress);
  onDurationChange = duration => this.setState({duration});
  onAnimationFinish = () => this.setState({isPlaying: false, isPaused: false});
  onExampleSelectionChange = (e, index) => {
    this.stopAnimation();
    this.setState(state => ({
      example: EXAMPLES[index],
      isPlaying: this.isImperativeMode(),
    }));
  };
  onToggleImperative = i => {
    this.stopAnimation();
    this.setState({progress: !i ? new Animated.Value(0) : undefined});
  };

  setAnim = anim => {
    this.anim = anim;
  };

  render() {
    const {duration, isPlaying, isPaused, isInverse, progress, loop, example} =
      this.state;

    return (
      <View style={{flex: 1}}>
        <ExamplePicker
          example={example}
          examples={EXAMPLES}
          onChange={this.onExampleSelectionChange}
        />
        <View style={{flex: 1, alignItems: 'center', justifyContent: 'center'}}>
          <LottieView
            ref={this.setAnim}
            autoPlay={!progress}
            style={[
              example.width && {width: example.width},
              isInverse && styles.lottieViewInvse,
            ]}
            source={example.getSource()}
            progress={progress}
            loop={loop}
            onAnimationFinish={this.onAnimationFinish}
            enableMergePathsAndroidForKitKatAndAbove
          />
        </View>
        <View style={{paddingBottom: 20, paddingHorizontal: 10}}>
          <View style={styles.controlsRow}>
            <TouchableOpacity onPress={this.onLoopPress} disabled={!!progress}>
              <Image
                style={[
                  styles.controlsIcon,
                  loop && styles.controlsIconEnabled,
                  !!progress && styles.controlsIconDisabled,
                ]}
                resizeMode="contain"
                source={loopIcon}
              />
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.playButton}
              onPress={this.onPlayPress}>
              <Image
                style={styles.playButtonIcon}
                resizeMode="contain"
                source={isPlaying && !isPaused ? pauseIcon : playIcon}
              />
            </TouchableOpacity>
            {/* <TouchableOpacity onPress={this.onStopPress} disabled={!isPlaying}>
              <Image
                style={styles.controlsIcon}
                resizeMode="contain"
                source={stopIcon}
              />
            </TouchableOpacity> */}
            <TouchableOpacity onPress={this.onInversePress}>
              <Image
                style={styles.controlsIcon}
                resizeMode="contain"
                source={inverseIcon}
              />
            </TouchableOpacity>
          </View>
          <View
            style={{
              flexDirection: 'row',
              justifyContent: 'space-between',
              paddingBottom: 10,
            }}>
            <Text>Use Imperative API:</Text>
            <View />
            <Switch onValueChange={this.onToggleImperative} value={!progress} />
          </View>
          <View style={{paddingBottom: 10}}>
            <View>
              <Text>Progress:</Text>
            </View>
            <AnimatedSlider
              style={{height: 30}}
              minimumValue={0}
              maximumValue={1}
              step={0.001}
              value={progress || 0}
              onValueChange={this.onProgressChange}
              disabled={!progress}
            />
          </View>
          <View>
            <View>
              <Text>Duration: ({Math.round(duration)}ms)</Text>
            </View>
            <Slider
              style={{height: 30}}
              step={50}
              minimumValue={50}
              maximumValue={4000}
              value={duration}
              onValueChange={this.onDurationChange}
              disabled={!progress}
            />
          </View>
        </View>
      </View>
    );
  }
}

const PLAY_BUTTON_SIZE = 60;
const styles = StyleSheet.create({
  controlsRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
  },
  playButton: {
    width: PLAY_BUTTON_SIZE,
    height: PLAY_BUTTON_SIZE,
    borderRadius: PLAY_BUTTON_SIZE / 2,
    backgroundColor: '#1d8bf1',
    justifyContent: 'center',
    alignItems: 'center',
  },
  playButtonIcon: {
    width: 16,
    height: 16,
  },
  controlsIcon: {
    width: 24,
    height: 24,
    padding: 8,
  },
  controlsIconEnabled: {
    tintColor: '#1d8bf1',
  },
  controlsIconDisabled: {
    tintColor: '#aaa',
  },
  lottieView: {
    flex: 1,
  },
  lottieViewInvse: {
    backgroundColor: 'black',
  },
});
