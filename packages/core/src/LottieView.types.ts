import type { StyleProp, ViewStyle, LayoutChangeEvent } from 'react-native';

/**
 * Serialized animation as generated from After Effects
 */
export interface AnimationObject {
  v: string;
  fr: number;
  ip: number;
  op: number;
  w: number;
  h: number;
  nm?: string;
  ddd?: number;
  assets: any[];
  layers: any[];
  markers?: any[];
}

type ColorFilter = {
  keypath: string;
  color: string;
};

type TextFilterIOS = {
  keypath: string;
  text: string;
};

type TextFilterAndroid = {
  find: string;
  replace: string;
};

/**
 * Properties of the AnimatedLottieView component
 */
export interface AnimatedLottieViewProps {
  /**
   * The source of animation. Can be referenced as a local asset by a string, or remotely
   * with an object with a `uri` property, or it can be an actual JS object of an
   * animation, obtained (for example) with something like
   * `require('../path/to/animation.json')`
   */
  source: string | AnimationObject;

  /**
   * A number between 0 and 1, or an `Animated` number between 0 and 1. This number
   * represents the normalized progress of the animation. If you update this prop, the
   * animation will correspondingly update to the frame at that progress value. This
   * prop is not required if you are using the imperative API.
   */
  progress?: number;

  /**
   * The speed the animation will progress. This only affects the imperative API. The
   * default value is 1.
   */
  speed?: number;

  /**
   * The duration of the animation in ms. Takes precedence over speed when set.
   * This only works when source is an actual JS object of an animation.
   *
   * **Note: prop is not yet supported by new arch!**
   */
  duration?: number;

  /**
   * A boolean flag indicating whether or not the animation should loop.
   */
  loop?: boolean;

  /**
   * Style attributes for the view, as expected in a standard `View`:
   * http://facebook.github.io/react-native/releases/0.39/docs/view.html#style
   *
   * **CAVEAT: border styling is not supported.**
   */
  style?: StyleProp<ViewStyle>;

  /**
   * Determines how to resize the animated view when the frame doesn't match the raw image
   * dimensions.
   * Refer to https://facebook.github.io/react-native/docs/image.html#resizemode
   */
  resizeMode?: 'cover' | 'contain' | 'center';

  /**
   * Determines how Lottie should render
   * Refer to LottieAnimationView#setRenderMode(RenderMode) for more information.
   */
  renderMode?: 'AUTOMATIC' | 'HARDWARE' | 'SOFTWARE';

  /**
   * A boolean flag indicating whether or not the animation should start automatically when
   * mounted. This only affects the imperative API.
   */
  autoPlay?: boolean;

  /**
   * A boolean flag indicating whether or not the animation should size itself automatically
   * according to the width in the animation's JSON. This only works when source is an actual
   * JS object of an animation.
   */
  autoSize?: boolean;

  /**
   * A callback function which will be called when animation is finished. Note that this
   * callback will be called only when `loop` is set to false.
   */
  onAnimationFinish?: (isCancelled: boolean) => void;

  /**
   * A callback function which will be called when the view has been laid out.
   */
  onLayout?: (event: LayoutChangeEvent) => void;

  /**
   * An array of layers you want to override its color filter.
   */
  colorFilters?: Array<ColorFilter>;

  /**
   * A string to identify the component during testing.
   */
  testID?: string;

  // Android Props

  /**
   * A boolean flag to enable merge patching.
   * @platform android
   */
  enableMergePathsAndroidForKitKatAndAbove?: boolean;

  /**
   * A boolean flag indicating whether or not the animation should caching. Defaults to true.
   * Refer to LottieAnimationView#setCacheComposition(boolean) for more information.
   *
   * @platform android
   */
  cacheComposition?: boolean;

  /**
   * An array of objects denoting text values to find and replace.
   *
   * @platform android
   */
  textFiltersAndroid?: Array<TextFilterAndroid>;

  /**
   * Relative folder inside of assets containing image files to be animated.
   * Make sure that the images that bodymovin export are in that folder with their names unchanged (should be img_#).
   * Refer to https://github.com/airbnb/lottie-android#image-support for more details.
   *
   * @platform android
   */
  imageAssetsFolder?: string;

  /**
   * Uses hardware acceleration to perform the animation. This should only
   * be used for animations where your width and height are equal to the composition width
   * and height, e.g. you are not scaling the animation.
   *
   * **Note: prop is not yet supported by new arch!**
   *
   * @platform android
   */
  hardwareAccelerationAndroid?: boolean;

  /**
   * Allows to specify kind of cache used for animation. Default value weak.
   * strong - cached forever
   * weak   - cached as long it is in active use
   * none   - not cached
   *
   * **Note: prop is not yet supported by new arch!**
   *
   * @platform android
   */
  cacheStrategy?: 'strong' | 'weak' | 'none';

  // iOS Props

  /**
   * An array of objects denoting text layers by KeyPath and a new string value.
   *
   * @platform ios
   */
  textFiltersIOS?: Array<TextFilterIOS>;

  // Windows Props

  /**
   * A boolean flag to enable use of platform-level looping on Windows. This improves loop smoothness,
   * but onAnimationLoop will not fire and changing the loop prop will restart playback.
   *
   * @platform windows
   */
  useNativeLooping?: boolean;

  /**
   * A callback function which will be called when the animation loops.
   *
   * @platform windows
   */
  onAnimationLoop?: () => void;
}
