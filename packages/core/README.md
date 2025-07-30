# Lottie React Native

[![npm Version](https://img.shields.io/npm/v/lottie-react-native.svg)](https://www.npmjs.com/package/lottie-react-native) [![License](https://img.shields.io/npm/l/lottie-react-native.svg)](https://www.npmjs.com/package/lottie-react-native)

Lottie component for React Native ([iOS](https://github.com/airbnb/lottie-ios), [Android](https://github.com/airbnb/lottie-android), and [Windows](https://github.com/CommunityToolkit/Lottie-Windows))

Lottie is an ecosystem of libraries for parsing [Adobe After Effects](http://www.adobe.com/products/aftereffects.html) animations exported as JSON with [bodymovin](https://github.com/bodymovin/bodymovin) and rendering them natively!

For the first time, designers can create **and ship** beautiful animations without an engineer painstakingly recreating it by hand.

## Installing

## Breaking Changes in v6!

We've made some significant updates in version 6 that may impact your current setup. To get all the details about these changes, check out the [changelog](/CHANGELOG.md).

Stay informed to ensure a seamless transition to the latest version. Thank you!

### iOS and Android

- Install `lottie-react-native` (latest):

```
yarn add lottie-react-native
```

Go to your ios folder and run:

```
pod install
```

### Web

- Install `lottie-react-native` (latest):

```
yarn add lottie-react-native
```

- Add dependencies for web players:

```
yarn add @lottiefiles/dotlottie-react
```

### Windows (React Native >= 0.63)

<details>
<summary>Install the `lottie-react-native` npm package. (Click to expand)</summary>
<br>
    
Add the following to the end of your project file. For C# apps, this should come after any `Microsoft.Windows.UI.Xaml.CSharp.targets` includes. For C++ apps, it should come after any `Microsoft.Cpp.targets` includes.
```xml
<PropertyGroup Label="LottieReactNativeProps">
    <LottieReactNativeDir>$([MSBuild]::GetDirectoryNameOfFileAbove($(MSBuildThisFileDirectory), 'node_modules\lottie-react-native\package.json'))\node_modules\lottie-react-native</LottieReactNativeDir>
</PropertyGroup>
<ImportGroup Label="LottieReactNativeTargets">
    <Import Project="$(LottieReactNativeDir)\src\windows\cppwinrt\PropertySheets\LottieGen.Auto.targets" />
</ImportGroup>
```

Add the LottieReactNative.vcxproj file to your Visual Studio solution to ensure it takes part in the build.

For C# apps, you'll need to install the following packages through NuGet:

- LottieGen.MsBuild
- Microsoft.UI.Xaml
- Win2D.uwp
- Microsoft.Toolkit.Uwp.UI.Lottie
  - This package is used for loading JSON dynamically. If you only need codegen animation, you can set `<EnableLottieDynamicSource>false</EnableLottieDynamicSource>` in your project file and omit this reference.

For C++ apps, you'll need these NuGet packages:

- LottieGen.MsBuild
- Microsoft.UI.Xaml

WinUI 2.6 (Microsoft.UI.Xaml 2.6.0) is required by default. Overriding this requires creating a Directory.Build.props file in your project root with a `<WinUIVersion>` property.

In your application code where you set up your React Native Windows PackageProviders list, add the LottieReactNative provider:

```csharp
// C#
PackageProviders.Add(new LottieReactNative.ReactPackageProvider(new AnimatedVisuals.LottieCodegenSourceProvider()));
```

```cpp
// C++
#include <winrt/LottieReactNative.h>
#include <winrt/AnimatedVisuals.h>

...

PackageProviders().Append(winrt::LottieReactNative::ReactPackageProvider(winrt::AnimatedVisuals::LottieCodegenSourceProvider()));
```

Codegen animations are supported by adding LottieAnimation items to your project file. These will be compiled into your application and available at runtime by name. For example:

```xml
<!-- .vcxproj or .csproj -->
<ItemGroup>
    <LottieAnimation Include="Assets/Animations/MyAnimation.json" Name="MyAnimation" />
</ItemGroup>
```

```js
// js
<LottieView source={'MyAnimation'} />
```

Codegen is available to both C# and C++ applications. Dynamic loading of JSON strings at runtime is currently only supported in C# applications.

</details>

## Usage

Lottie can be used in a declarative way:

```jsx
import React from 'react';
import LottieView from 'lottie-react-native';

export default function Animation() {
  return (
    <LottieView source={require('../path/to/animation.json')} autoPlay loop />
  );
}
```

Additionally, there is an imperative API which is sometimes simpler.

```tsx
import React, { useEffect, useRef } from 'react';
import LottieView from 'lottie-react-native';

export default function AnimationWithImperativeApi() {
  const animationRef = useRef<LottieView>(null);

  useEffect(() => {
    animationRef.current?.play();

    // Or set a specific startFrame and endFrame with:
    animationRef.current?.play(30, 120);
  }, []);

  return (
    <LottieView
      ref={animationRef}
      source={require('../path/to/animation.json')}
    />
  );
}
```

Lottie's animation view can be controlled by either React Native Animated or Reanimated API.

```tsx
import React, { useEffect, useRef, Animated } from 'react';
import { Animated, Easing } from 'react-native';
import LottieView from 'lottie-react-native';

const AnimatedLottieView = Animated.createAnimatedComponent(LottieView);

export default function ControllingAnimationProgress() {
  const animationProgress = useRef(new Animated.Value(0));

  useEffect(() => {
    Animated.timing(animationProgress.current, {
      toValue: 1,
      duration: 5000,
      easing: Easing.linear,
      useNativeDriver: false,
    }).start();
  }, []);

  return (
    <AnimatedLottieView
      source={require('../path/to/animation.json')}
      progress={animationProgress.current}
    />
  );
}
```

Changing color of layers:

NOTE: This feature may not work properly on Android. We will try fix it soon.

```jsx
import React from 'react';
import LottieView from 'lottie-react-native';

export default function ChangingColorOfLayers() {
  return (
    <LottieView
      source={require('../path/to/animation.json')}
      colorFilters={[
        {
          keypath: 'button',
          color: '#F00000',
        },
        {
          keypath: 'Sending Loader',
          color: '#F00000',
        },
      ]}
      autoPlay
      loop
    />
  );
}
```

## If you want to use `.lottie` files

You need to modify your `metro.config.js` file accordingly by adding `lottie` extension to the `assetExts` array:

```js
const { getDefaultConfig, mergeConfig } = require('@react-native/metro-config');

const defaultConfig = getDefaultConfig(__dirname);

/**
 * Metro configuration
 * https://facebook.github.io/metro/docs/configuration
 *
 * @type {import('metro-config').MetroConfig}
 */
const config = {
  resolver: {
    assetExts: [...defaultConfig.resolver.assetExts, 'lottie'],
  },
};

module.exports = mergeConfig(getDefaultConfig(__dirname), config);
```

## Setup jest for dotLottie files

Create a file in the following path `__mocks__/lottieMock.js` and add the following code:

```js
module.exports = 'lottie-test-file-stub';
```

Then add the following to your `jest.config.js` file:

```js
module.exports = {
  ...
  moduleNameMapper: {
    ...,
    '\\.(lottie)$': '<rootDir>/jest/__mocks__/lottieMock.js',
  },
  ...
}
```

## API

You can find the full list of props and methods available in our [API document](https://github.com/airbnb/lottie-react-native/blob/master/docs/api.md). These are the most common ones:

| Prop               | Description                                                                                                                                                                                                                                                                     | Default                                                                                                                         |
| ------------------ | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------- |
| **`source`**       | **Mandatory** - The source of animation. Can be referenced as a local asset by a string, or remotely with an object with a `uri` property, or it can be an actual JS object of an animation, obtained (for example) with something like `require('../path/to/animation.json')`. | _None_                                                                                                                          |
| **`style`**        | Style attributes for the view, as expected in a standard [`View`](https://facebook.github.io/react-native/docs/layout-props.html).                                                                                                                                              | You need to set it manually. Refer to this [pull request](https://github.com/lottie-react-native/lottie-react-native/pull/992). |
| **`loop`**         | A boolean flag indicating whether or not the animation should loop.                                                                                                                                                                                                             | `true`                                                                                                                          |
| **`autoPlay`**     | A boolean flag indicating whether or not the animation should start automatically when mounted. This only affects the imperative API.                                                                                                                                           | `false`                                                                                                                         |
| **`colorFilters`** | An array of objects denoting layers by KeyPath and a new color filter value (as hex string).                                                                                                                                                                                    | `[]`                                                                                                                            |

[More...](https://github.com/airbnb/lottie-react-native/blob/master/docs/api.md)

## Troubleshooting

Not all After Effects features are supported by Lottie. If you notice there are some layers or animations missing check [this list](https://github.com/airbnb/lottie/blob/master/supported-features.md) to ensure they are supported.

## More

View more documentation, FAQ, help, examples, and more at [airbnb.io/lottie](https://airbnb.io/lottie/)

![Example1](docs/gifs/Example1.gif)

![Example2](docs/gifs/Example2.gif)

![Example3](docs/gifs/Example3.gif)

![Community](docs/gifs/Community%202_3.gif)

![Example4](docs/gifs/Example4.gif)
