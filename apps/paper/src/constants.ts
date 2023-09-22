import {StyleSheet} from 'react-native';
import {makeExample} from './utils';

export const playIcon = require('./images/play.png');
export const pauseIcon = require('./images/pause.png');
export const loopIcon = require('./images/loop.png');
export const inverseIcon = require('./images/inverse.png');

export const EXAMPLES = [
  makeExample('9 squares', () =>
    require('./animations/9squares-AlBoardman.json'),
  ),
  makeExample('[Dot Lottie] Dark/Light Mode Switch', () =>
    require('./animations/animation_lkekfrcl.lottie'),
  ),
  makeExample('[Dot Lottie Remote] Walking to Work', () => ({
    uri: 'https://github.com/matinzd/matinzd/raw/main/animation_lkpzxqpk.lottie',
  })),
  makeExample('[Perf test] Hero', () => require('./animations/hero.json')),
  makeExample('Hamburger Arrow', () =>
    require('./animations/HamburgerArrow.json'),
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
  makeExample('Remote load', () => ({
    uri: 'https://raw.githubusercontent.com/lottie-react-native/lottie-react-native/master/apps/paper/src/animations/Watermelon.json',
  })),
  makeExample('Invalid URL', () => ({
    uri: 'https://***invalid-url***/lottie-react-native/lottie-react-native/master/apps/paper/src/animations/Watermelon.json',
  })),
];

const PLAY_BUTTON_SIZE = 60;

export const styles = StyleSheet.create({
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
  lottieViewInverse: {
    backgroundColor: 'black',
  },
});
