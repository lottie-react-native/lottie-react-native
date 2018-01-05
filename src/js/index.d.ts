import * as React from 'react';

import {
  Animated,
  StyleProp,
  ViewProperties,
  ViewStyle
} from 'react-native';

export interface AnimationObject {
  v: string;
  fr: number;
  ip: number;
  op: number;
  w: number;
  h: number;
  nm: string;
  ddd: number;
  assets: any[];
  layers: any[];
}

export interface AnimationProps extends ViewProperties {
  /**
   * The source of animation. Can be referenced as a local asset by a string, or remotely
   * with an object with a `uri` property, or it can be an actual JS object of an
   * animation, obtained (for example) with something like
   * `require('../path/to/animation.json')`
   */
  source: string | AnimationObject | { uri: string };

  /**
   * A number between 0 and 1, or an `Animated` number between 0 and 1. This number
   * represents the normalized progress of the animation. If you update this prop, the
   * animation will correspondingly update to the frame at that progress value. This
   * prop is not required if you are using the imperative API.
   */
  progress?: number | Animated.Value;

  /**
   * The speed the animation will progress. This only affects the imperative API. The
   * default value is 1.
   */
  speed?: number;

  /**
   * A boolean flag indicating whether or not the animation should loop.
   */
  loop?: boolean;

  /**
   * Style attributes for the view, as expected in a standard `View`:
   * http://facebook.github.io/react-native/releases/0.39/docs/view.html#style
   * CAVEAT: border styling is not supported.
   */
  style?: StyleProp<ViewStyle>;

  /**
   * [Android] Relative folder inside of assets containing image files to be animated.
   * Make sure that the images that bodymovin export are in that folder with their names unchanged (should be img_#).
   * Refer to https://github.com/airbnb/lottie-android#image-support for more details.
   * @platform android
   */
  imageAssetsFolder?: string;

  /**
   * [Android]. Uses hardware acceleration to perform the animation. This should only
   * be used for animations where your width and height are equal to the composition width
   * and height, e.g. you are not scaling the animation.
   * @platform android
   */
  hardwareAccelerationAndroid?: boolean;
}

export default class Animation extends React.Component<AnimationProps, {}> {
  /**
   * Play the animation all the way through, at the speed specified as a prop.
   */
  play: () => {};

  /**
   * Reset the animation back to `0` progress.
   */
  reset: () => {}
}
