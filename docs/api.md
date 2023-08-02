## Component API

| Prop                     | Description                                                                                                                                                                                                                                                                                                                                                            | Default     | Platform     |
| ------------------------ | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ----------- | ------------ |
| **`source`**             | **Mandatory** - The source of animation. Can be referenced as a local asset by a string, or remotely with an object with a `uri` property, or it can be an actual JS object of an animation, obtained (for example) with something like `require('../path/to/animation.json')`                                                                                         | _None_      | All          |
| **`progress`**           | A number between 0 and 1. This number represents the normalized progress of the animation. If you update this prop, the animation will correspondingly update to the frame at that progress value. This prop is not required if you are using the imperative API.                                                                                                      | `0`         | All          |
| **`speed`**              | The speed the animation will progress. Sending a negative value will reverse the animation                                                                                                                                                                                                                                                                             | `1`         | All          |
| **`duration`**           | The duration of the animation in ms. Takes precedence over `speed` when set. This only works when `source` is an actual JS object of an animation.                                                                                                                                                                                                                     | `undefined` | All          |
| **`loop`**               | A boolean flag indicating whether or not the animation should loop.                                                                                                                                                                                                                                                                                                    | `true`      | All          |
| **`autoPlay`**           | A boolean flag indicating whether or not the animation should start automatically when mounted. This only affects the imperative API.                                                                                                                                                                                                                                  | `false`     | All          |
| **`resizeMode`**         | Determines how to resize the animated view when the frame doesn't match the raw image dimensions. Supports `cover`, `contain` and `center`.                                                                                                                                                                                                                            | `contain`   | All          |
| **`style`**              | Style attributes for the view, as expected in a standard [`View`](http://facebook.github.io/react-native/releases/0.46/docs/layout-props.html), aside from border styling                                                                                                                                                                                              | _None_      | All          |
| **`imageAssetsFolder`**  | Needed for **Android** to work properly with assets, iOS will ignore it.                                                                                                                                                                                                                                                                                               | _None_      | Android      |
| **`useNativeLooping`**   | **Only Windows**. When enabled, uses platform-level looping to improve smoothness, but onAnimationLoop will not fire and changing the `loop` prop will reset playback rather than finishing gracefully.                                                                                                                                                                | false       | Windows      |
| **`onAnimationLoop`**    | **Only Windows**. A callback function invoked when the animation loops.                                                                                                                                                                                                                                                                                                | _None_      | Windows      |
| **`onAnimationFinish`**  | A callback function which will be called when animation is finished. This callback is called with a boolean `isCancelled` argument, indicating if the animation actually completed playing, or if it was cancelled, for instance by calling `play()` or `reset()` while is was still playing. Note that this callback will be called only when `loop` is set to false. | _None_      | All          |
| **`renderMode`**         | a String flag to set whether or not to render with `HARDWARE` or `SOFTWARE` acceleration                                                                                                                                                                                                                                                                               | `AUTOMATIC` | iOS, Android |
| **`cacheComposition`**   | **Only Android**, a boolean flag indicating whether or not the animation should do caching.                                                                                                                                                                                                                                                                            | `true`      | Android      |
| **`colorFilters`**       | An array of objects denoting layers by KeyPath and a new color filter value (as hex string).                                                                                                                                                                                                                                                                           | `[]`        | All          |
| **`textFiltersAndroid`** | **Only Android**, an array of objects denoting text values to find and replace.                                                                                                                                                                                                                                                                                        | `[]`        | Android      |
| **`textFiltersIOS`**     | **Only iOS**, an array of objects denoting text layers by KeyPath and a new string value.                                                                                                                                                                                                                                                                              | `[]`        | iOS          |

## Methods (Imperative API):

| Method       | Description                                                                                                                                                        |
| ------------ | ------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| **`play`**   | Play the animation all the way through, at the speed specified as a prop. It can also play a section of the animation when called as `play(startFrame, endFrame)`. |
| **`reset`**  | Reset the animation back to `0` progress.                                                                                                                          |
| **`pause`**  | Pauses the animation.                                                                                                                                              |
| **`resume`** | Resumes the paused animation.                                                                                                                                      |

## If you want to use `.lottie` files

You need to modify your `metro.config.js` file accordingly by adding `lottie` extension to the `assetExts` array:

```js
const { getDefaultConfig, mergeConfig } = require("@react-native/metro-config");

const defaultConfig = getDefaultConfig(__dirname);

/**
 * Metro configuration
 * https://facebook.github.io/metro/docs/configuration
 *
 * @type {import('metro-config').MetroConfig}
 */
const config = {
  resolver: {
    assetExts: [...defaultConfig.resolver.assetExts, "lottie"],
  },
};

module.exports = mergeConfig(getDefaultConfig(__dirname), config);
```

## Using animations with assets

When creating animations using AfterEffects and bodymovin, the exported json may have some assets to rely on, specified like this:

```json
  ...,
  "assets": [
    {
      "id": "image_0",
      "w": 737,
      "h": 1215,
      "u": "images/",
      "p": "img_0.png"
    }
  ],
  ...
```

To make `react-native-lottie` use those assets properly, it is necessary to go for the native route: so remember that you need to **fully** rebuild your application if you modify the images / add new ones.

### Android

You need to copy your images into `[PROJECT FOLDER]/android/app/src/main/assets`. It is suggested to create a `lottie` subfolder, and eventually a folder per animation.
You will then need to refer that folder, via its relative path, in the `imageAssetsFolder` prop for the animation - ex: `imageAssetsFolder={'lottie/animation_1'}`.

### iOS

You need to open XCode, right click on the Resources folder (on the left column), "Add file to [Project]" and select the images required.

#### Renaming assets

If you find yourself in the necessity to rename the images (ex. multiple animations with assets), you can - but you need to **remember** to modify the name in the json file too, like:

```json
  ...,
  "assets": [
    {
      "id": "image_0",
      "w": 737,
      "h": 1215,
      "u": "images/",
      "p": "new_snihy_name.png"  <---- HERE!
    }
  ],
  ...
```
