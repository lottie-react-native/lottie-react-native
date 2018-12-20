# Lottie React Native and TypeScript

If you are here, you are interested on using `lottie-react-native` in your typescript configured project (or just want to get in typescript).

## Getting started

This documentation assumes you have configured your project following the instructions provided in the [readme file](../README.md), it also assumes you have 

## Usage

The usage of `LottieView` is not that different to its JavaScript counterpart, but depending on how your typescript project is configured you might need to import `LottieView` as defined below:

- Your `tsconfig.json` file defines `"esModuleInterop": false,`. In this case, you are forced to define your import as 

```tsx
import LottieView = require("lottie-react-native");
```

- Your `tsconfig.json` file defines `"esModuleInterop": true,` and `"allowSyntheticDefaultImports": true,` (the default is `true`). In this case, you can import lottie as:

```tsx
import LottieView from "lottie-react-native";
```

### Sample code

```tsx
import React from 'react';
import LottieView from 'lottie-react-native'; // if you have "esModuleInterop": true
// import LottieView = require('lottie-react-native'); // otherwise you have "esModuleInterop": false

export default class BasicExample extends React.PureComponent {
  render() {
    return (
      <LottieView
        source={require('./animation.json')}
        autoPlay
        loop
      />
    );
  }
}
```
