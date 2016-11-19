/* eslint-disable global-require */
import React, { PropTypes } from 'react';
import {
  View,
  Text,
  Animated,
  Slider,
  StyleSheet,
  Picker,
  Platform,
  Switch,
  Button,
} from 'react-native';
import Animation from 'lottie-react-native';

const makeExample = (name, getJson) => ({ name, getJson });
const EXAMPLES = [
  makeExample('Hamburger Arrow', () => require('./animations/HamburgerArrow.json')),
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


class ExamplePicker extends React.Component {
  render() {
    return (
      <Picker
        selectedValue={this.props.example}
        onValueChange={this.props.onChange}
        style={{
          marginBottom: Platform.select({
            ios: -30,
            android: 0,
          }),
        }}
      >
        {Object.keys(EXAMPLES).map(name => EXAMPLES[name]).map(ex => (
          <Picker.Item
            key={ex.name}
            label={ex.name}
            value={ex.name}
          />
        ))}
      </Picker>
    );
  }
}


class PlayerControls extends React.Component {
  static propTypes = {
    progress: PropTypes.any, // animated
    config: PropTypes.shape({
      duration: PropTypes.number,
      imperative: PropTypes.bool,

    }),
    onProgressChange: PropTypes.func,
    onConfigChange: PropTypes.func,
    onPlayPress: PropTypes.func,
    onResetPress: PropTypes.func,
  };

  onConfigChange(merge) {
    const newConfig = {
      ...this.props.config,
      ...merge,
    };
    this.props.onConfigChange(newConfig);
  }

  render() {
    const { config } = this.props;
    return (
      <View style={{ paddingBottom: 20, paddingHorizontal: 10 }}>
        <View style={{ paddingBottom: 20 }}>
          <View style={{ flexDirection: 'row', justifyContent: 'space-around' }}>
            <Button title="Play" onPress={this.props.onPlayPress} />
            <Button title="Reset" onPress={this.props.onResetPress} />
          </View>
        </View>
        <View style={{ flexDirection: 'row', justifyContent: 'space-between', paddingBottom: 10 }}>
          <Text>Use Imperative API:</Text>
          <View />
          <Switch
            onValueChange={imperative => this.onConfigChange({ imperative })}
            value={config.imperative}
          />
        </View>
        <View style={{ paddingBottom: 10 }}>
          <View><Text>Progress:</Text></View>
          <Slider
            minimumValue={0}
            maximumValue={1}
            value={this.props.progress.__getValue()}
            onValueChange={this.props.onProgressChange}
          />
        </View>
        <View>
          <View><Text>Duration: ({Math.round(config.duration)}ms)</Text></View>
          <Slider
            minimumValue={50}
            maximumValue={4000}
            value={config.duration}
            onValueChange={duration => this.onConfigChange({ duration })}
          />
        </View>
      </View>
    );
  }
}

export default class LottieAnimatedExample extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      example: Object.keys(EXAMPLES)[0],
      progress: new Animated.Value(0),
      config: {
        duration: 3000,
        imperative: false,
      },
    };
    this.onValueChange = this.onValueChange.bind(this);
    this.onPlayPress = this.onPlayPress.bind(this);
    this.onResetPress = this.onResetPress.bind(this);
    this.setAnim = this.setAnim.bind(this);
  }

  onValueChange(value) {
    this.state.progress.setValue(value);
  }

  onPlayPress() {
    if (this.state.config.imperative) {
      this.anim.play();
    } else {
      this.state.progress.setValue(0);
      Animated.timing(this.state.progress, {
        toValue: 1,
        duration: this.state.config.duration,
      }).start(({ finished }) => {
        if (finished) this.forceUpdate();
      });
    }
  }

  onResetPress() {
    if (this.state.config.imperative) {
      this.anim.reset();
    } else {
      this.state.progress.setValue(1);
      Animated.timing(this.state.progress, {
        toValue: 0,
        duration: this.state.config.duration,
      }).start(({ finished }) => {
        if (finished) this.forceUpdate();
      });
    }
  }

  setAnim(anim) {
    this.anim = anim;
  }

  render() {
    const playerWindow = (
      <View
        style={{
          flex: 1,
          justifyContent: 'center',
          alignItems: 'center',
          borderColor: '#000',
          borderWidth: 1,
          backgroundColor: '#dedede',
          marginVertical: 10,
        }}
      >
        <View>
          <Animation
            ref={this.setAnim}
            style={{
              width: 200,
              height: 200,
            }}
            source={EXAMPLES[this.state.example].getJson()}
            progress={this.state.progress}
          />
        </View>
      </View>
    );

    return (
      <View style={StyleSheet.absoluteFill}>
        <ExamplePicker
          example={this.state.example}
          onChange={(example) => this.setState({ example })}
        />
        {playerWindow}
        <PlayerControls
          progress={this.state.progress}
          config={this.state.config}
          onProgressChange={this.onValueChange}
          onConfigChange={config => this.setState({ config })}
          onPlayPress={this.onPlayPress}
          onResetPress={this.onResetPress}
        />
      </View>
    );
  }
}
