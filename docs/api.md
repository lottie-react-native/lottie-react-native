## Component API

| Prop | Description | Default |
|---|---|---|
|**`source`**| **Mandatory** - The source of animation. Can be referenced as a local asset by a string, or remotely with an object with a `uri` property, or it can be an actual JS object of an animation, obtained (for example) with something like `require('../path/to/animation.json')` |*None*|
|**`progress`**| A number between 0 and 1, or an `Animated` number between 0 and 1. This number represents the normalized progress of the animation. If you update this prop, the animation will correspondingly update to the frame at that progress value. This prop is not required if you are using the imperative API. |`0`|
|**`speed`**| The speed the animation will progress. This only affects the imperative API. Sending a negative value will reverse the animation |`1`|
|**`loop`**|A boolean flag indicating whether or not the animation should loop. |`false`|
|**`style`**|Style attributes for the view, as expected in a standard [`View`](http://facebook.github.io/react-native/releases/0.46/docs/layout-props.html), aside from border styling |*None*|
|**`imageAssetsFolder`**| Needed for **Android** to work properly with assets, iOS will ignore it. |*None*|


## Methods (Imperative API):

| Method | Description |
|---|---|
|**`play`**| Play the animation all the way through, at the speed specified as a prop.
|**`reset`**| Reset the animation back to `0` progress.

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
