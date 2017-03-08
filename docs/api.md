# Component API

Props:

```
type AnimationProps = {
  // The source of animation. Can be referenced as a local asset by a string, or remotely 
  // with an object with a `uri` property, or it can be an actual JS object of an 
  // animation, obtained (for example) with something like 
  // `require('../path/to/animation.json')`
  source: string | AnimationJson | { uri: string },
  
  // A number between 0 and 1, or an `Animated` number between 0 and 1. This number 
  // represents the normalized progress of the animation. If you update this prop, the 
  // animation will correspondingly update to the frame at that progress value. This 
  // prop is not required if you are using the imperative API.
  progress: number | Animated = 0,
  
  // The speed the animation will progress. This only affects the imperative API. The 
  // default value is 1.
  speed: number = 1,
  
  // A boolean flag indicating whether or not the animation should loop.
  loop: boolean = false,
  
  // Style attributes for the view, as expected in a standard `View`:
  // http://facebook.github.io/react-native/releases/0.39/docs/view.html#style
  // CAVEAT: border styling is not supported.
  style?: ViewStyle,
};

```


Methods:

```
class Animation extends React.Component {

  // play the animation all the way through, at the speed specified as a prop.
  play();
  
  
  // Reset the animation back to `0` progress.
  reset();

}
```
