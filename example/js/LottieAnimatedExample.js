/* eslint-disable global-require */
import React from 'react';
import {
  View,
  Animated,
  Easing,
  StyleSheet,
  Slider,
  Switch,
  Image,
  Text,
  TouchableOpacity,
} from 'react-native';
import LottieView from 'lottie-react-native';
import ExamplePicker from './ExamplePicker';

const playIcon = require('./images/play.png');
const pauseIcon = require('./images/pause.png');
const loopIcon = require('./images/loop.png');
const inverseIcon = require('./images/inverse.png');

const makeExample = (name, getJson, width) => ({ name, getJson, width });
const EXAMPLES = [
  makeExample('Hamburger Arrow', () => require('./animations/HamburgerArrow.json')),
  makeExample('Hamburger Arrow (200 px)', () => require('./animations/HamburgerArrow.json'), 200),
  makeExample('Line Animation', () => require('./animations/LineAnimation.json')),
  makeExample('Lottie Logo 1', () => require('./animations/LottieLogo1.json')),
  makeExample('Lottie Logo 2', () => require('./animations/LottieLogo2.json')),
  makeExample('Lottie Walkthrough', () => require('./animations/LottieWalkthrough.json')),
  makeExample('Pin Jump', () => require('./animations/PinJump.json')),
  makeExample('Twitter Heart', () => require('./animations/TwitterHeart.json')),
  makeExample('Watermelon', () => require('./animations/Watermelon.json')),
  makeExample('Motion Corpse', () => require('./animations/MotionCorpse-Jrcanest.json')),
].reduce((acc, e) => {
  // eslint-disable-next-line no-param-reassign
  acc[e.name] = e;
  return acc;
}, {});

export default class LottieAnimatedExample extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      example: Object.keys(EXAMPLES)[0],
      progress: new Animated.Value(0),
      duration: 3000,
      imperative: true,
      isPlaying: false,
      isInverse: false,
      loop: true,
    };
    this.onValueChange = this.onValueChange.bind(this);
    this.onPlayPress = this.onPlayPress.bind(this);
    this.onInversePress = this.onInversePress.bind(this);
    this.setAnim = this.setAnim.bind(this);
  }

  onValueChange(value) {
    this.state.progress.setValue(value);
  }

  onPlayPress() {
    if (this.state.imperative) {
      this.anim.play();
    } else {
      this.state.progress.setValue(0.5);
      Animated.timing(this.state.progress, {
        toValue: 1,
        duration: this.state.duration,
        easing: Easing.linear,
      }).start(({ finished }) => {
        if (finished) this.forceUpdate();
      });
    }
  }

  onInversePress() {
    this.setState(state => ({ ...state, isInverse: !state.isInverse }));
  }

  setAnim(anim) {
    this.anim = anim;
  }

  render() {
    const { duration, imperative, isPlaying, isInverse, progress, loop, example } = this.state;
    const selectedExample = EXAMPLES[example];
    return (
      <View style={{ flex: 1 }}>
        <ExamplePicker
          example={example}
          examples={EXAMPLES}
          onChange={e => this.setState({ example: e })}
        />
        <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
          <LottieView
            ref={this.setAnim}
            style={[
              selectedExample.width && { width: selectedExample.width },
              isInverse && styles.lottieViewInvse,
            ]}
            source={selectedExample.getJson()}
            progress={this.state.progress}
            loop={loop}
            enableMergePathsAndroidForKitKatAndAbove
          />
        </View>
        <View style={{ paddingBottom: 20, paddingHorizontal: 10 }}>
          <View style={styles.controlsRow}>
            <TouchableOpacity
              onPress={() => this.setState(state => ({ ...state, loop: !state.loop }))}
            >
              <Image
                style={[styles.controlsIcon, loop && styles.controlsIconEnabled]}
                resizeMode="contain"
                source={loopIcon}
              />
            </TouchableOpacity>
            <TouchableOpacity style={styles.playButton} onPress={this.onPlayPress}>
              <Image
                style={styles.playButtonIcon}
                resizeMode="contain"
                source={isPlaying ? pauseIcon : playIcon}
              />
            </TouchableOpacity>
            <TouchableOpacity onPress={this.onInversePress}>
              <Image style={styles.controlsIcon} resizeMode="contain" source={inverseIcon} />
            </TouchableOpacity>
          </View>
          <View
            style={{ flexDirection: 'row', justifyContent: 'space-between', paddingBottom: 10 }}
          >
            <Text>Use Imperative API:</Text>
            <View />
            <Switch onValueChange={i => this.setState({ imperative: i })} value={imperative} />
          </View>
          <View style={{ paddingBottom: 10 }}>
            <View>
              <Text>Progress:</Text>
            </View>
            <Slider
              minimumValue={0}
              maximumValue={1}
              // eslint-disable-next-line no-underscore-dangle
              value={progress.__getValue()}
              onValueChange={this.onProgressChange}
            />
          </View>
          <View>
            <View>
              <Text>Duration: ({Math.round(duration)}ms)</Text>
            </View>
            <Slider
              minimumValue={50}
              maximumValue={4000}
              value={duration}
              onValueChange={d => this.setState({ duration: d })}
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
  lottieView: {
    flex: 1,
  },
  lottieViewInvse: {
    backgroundColor: 'black',
  },
});
