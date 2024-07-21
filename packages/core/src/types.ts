import { CSSProperties } from 'react';
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
 * Properties of the LottieView component
 */
export interface LottieViewProps {
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
   * @platform ios, android, windows
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
   * @platform ios, android, windows
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
   * @platform ios, android, windows
   */
  style?: StyleProp<ViewStyle>;

  /**
   * Style attributes for the web.
   * @platform web
   */
  webStyle?: CSSProperties;

  /**
   * Determines how to resize the animated view when the frame doesn't match the raw image
   * dimensions.
   *
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
   * A callback function which will be called when animation is finished. Note that this
   * callback will be called only when `loop` is set to false.
   * @platform ios, android, web
   */
  onAnimationFinish?: (isCancelled: boolean) => void;

  /**
   * A callback function which will be called when animation is failed to load.
   * @platform ios, android, web
   */
  onAnimationFailure?: (error: string) => void;

  /**
   * A callback function which will be called when animation has been loaded.
   * @platform ios, android
   */
  onAnimationLoaded?: () => void;

  /**
   * A callback function which will be called when the animation loops.
   *
   * @platform windows, web
   */
  onAnimationLoop?: () => void;

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
   * A boolean flag to enable safe mode which wraps the draw call with a try catch on Android
   * @platform android
   */
  enableSafeModeAndroid?: boolean

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
   * @platform android
   */
  hardwareAccelerationAndroid?: boolean;

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

  // Web Props

  /**
   * A boolean flag to enable hover interactions. Whether to play on mouse hover. Defaults to false.
   * @platform web
   */
  hover?: boolean;

  /**
   * Direction of the animation. Defaults to 1.
   * @platform web
   */
  direction?: 1 | -1;
}
