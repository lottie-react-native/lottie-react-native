Lottie for React Native, [iOS](https://github.com/airbnb/lottie-ios), and [Android](https://github.com/airbnb/lottie-android)
===

[![npm Version](https://img.shields.io/npm/v/lottie-react-native.svg)](https://www.npmjs.com/package/lottie-react-native) [![License](https://img.shields.io/npm/l/lottie-react-native.svg)](https://www.npmjs.com/package/lottie-react-native) [![Build Status](https://travis-ci.org/airbnb/lottie-react-native.svg)](https://travis-ci.org/airbnb/lottie-react-native) 

Lottie component for React Native (iOS and Android)

Lottie is a mobile library for Andorid and iOS that parses [Adobe After Effects](http://www.adobe.com/products/aftereffects.html) animations exported as json with [bodymovin](https://github.com/bodymovin/bodymovin) and renders them natively on mobile!

For the first time, designers can create **and ship** beautiful animations without an engineer painstakingly recreating it be hand. They say a picture is worth 1,000 words so here are 13,000:

![Example1](docs/gifs/Example1.gif)


![Example2](docs/gifs/Example2.gif)


![Example3](docs/gifs/Example3.gif)


![Community](docs/gifs/Community 2_3.gif)


![Example4](docs/gifs/Example4.gif)


All of these animations were created in After Effects, exported with bodymovin, and rendered natively with no additional engineering effort.


## Related Projects

This project is only the code to wrap and expose Lottie to React Native. The parsing/rendering code can be found in their
respective libraries:

[Lottie for iOS](https://github.com/airbnb/lottie-ios)

[Lottie for Android](https://github.com/airbnb/lottie-android)


## Basic Usage

[See full component API](/docs/api.md)

Lottie's animation progress can be controlled with an `Animated` value:

```jsx
import React from 'react';
import { Animated } from 'react-native';
import Animation from 'lottie-react-native';

export default class BasicExample extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      progress: new Animated.Value(0),
    };
  }

  componentDidMount() {
    Animated.timing(this.state.progress, {
      toValue: 1,
      duration: 5000,
    }).start();
  }

  render() {
    return (
      <Animation
        style={{
          width: 200,
          height: 200,
        }}
        source={require('../path/to/animation.json')}
        progress={this.state.progress}
      />
    );
  }
}
```

Additionally, there is an imperative API which is sometimes simpler.

```jsx
import React from 'react';
import Animation from 'lottie-react-native';

export default class BasicExample extends React.Component {
  componentDidMount() {
    this.animation.play();
  }

  render() {
    return (
      <Animation
        ref={animation => { this.animation = animation; }}
        style={{
          width: 200,
          height: 200,
        }}
        source={require('../path/to/animation.json')}
      />
    );
  }
}
```

## Alternatives
1. Build animations by hand. Building animations by hand is a huge time commitment for design and engingeering across Android and iOS. It's often hard or even impossible to justify spending so much time to get an animation right.
2. [Facebook Keyframes](https://github.com/facebookincubator/Keyframes). Keyframes is a wonderful new library from Facebook that they built for reactions. However, Keyframes doesn't support some of Lottie's features such as masks, mattes, trim paths, dash patterns, and more.
2. Gifs. Gifs are more than double the size of a bodymovin JSON and are rendered at a fixed size that can't be scaled up to match large and high density screens.
3. Png sequences. Png sequences are even worse than gifs in that their file sizes are often 30-50x the size of the bodymovin json and also can't be scaled up.

## Why is it called Lottie?
Lottie is named after a German film director and the foremost pioneer of silhouette animation. Her best known films are The Adventures of Prince Achmed (1926) – the oldest surviving feature-length animated film, preceding Walt Disney's feature-length Snow White and the Seven Dwarfs (1937) by over ten years
[The art of Lotte Reineger](https://www.youtube.com/watch?v=LvU55CUw5Ck&feature=youtu.be)

## Contributing

See the [Contributors Guide](/CONTRIBUTING.md)


## License

[Apache-2.0](/LICENSE.md)
