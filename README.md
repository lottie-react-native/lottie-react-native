# Lottie React Native
[![npm Version](https://img.shields.io/npm/v/lottie-react-native.svg)](https://www.npmjs.com/package/lottie-react-native) [![License](https://img.shields.io/npm/l/lottie-react-native.svg)](https://www.npmjs.com/package/lottie-react-native)

Lottie component for React Native ([iOS](https://github.com/airbnb/lottie-ios), [Android](https://github.com/airbnb/lottie-android), and [Windows](https://github.com/CommunityToolkit/Lottie-Windows))

Lottie is an ecosystem of libraries for parsing [Adobe After Effects](http://www.adobe.com/products/aftereffects.html) animations exported as JSON with [bodymovin](https://github.com/bodymovin/bodymovin) and rendering them natively!

For the first time, designers can create **and ship** beautiful animations without an engineer painstakingly recreating it by hand.

## Installing

### iOS and Android
Install `lottie-react-native` (latest) and `lottie-ios` (3.4.0):

```
yarn add lottie-react-native lottie-ios@3.4.0
```

or

```
npm i --save lottie-react-native lottie-ios@3.4.0
```

Go to your ios folder and run:

```
pod install
```

### Windows (React Native >= 0.63)
Install the `lottie-react-native` npm package.

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
<LottieView source={"MyAnimation"} />
```

Codegen is available to both C# and C++ applications. Dynamic loading of JSON strings at runtime is currently only supported in C# applications.


## Versioning

Depending on which version of React Native your app runs on you might need to install a specific version of lottie-react-native. Here's the compatibility list:

| App built in React Native version                | Requires lottie-react-native version                                                                                                                                                                                                                                                                      | Requires lottie-ios version                                                                                                              |
| ------------------ | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------- |
| >= 0.59       | 3.0.2 | 3.0.3 
| >= 0.60       | 4.0.2 | 3.2.3 
| >= 0.63       | 4.0.3 | 3.2.3 
| >= 0.64       | 4.1.3 | 3.2.3 
| >= 0.66       | latest | 3.4.0 

## Usage

(If you are using TypeScript, please read [this first](/docs/typescript.md))

Lottie can be used in a declarative way:

```jsx
import React from 'react';
import Lottie from 'lottie-react-native';

export default function Animation() {
  return (
    <Lottie source={require('./animation.json')} autoPlay loop />
  );
}
```

Additionally, there is an imperative API which is sometimes simpler.

```jsx
import React, { useEffect, useRef } from 'react';
import Lottie from 'lottie-react-native';

export default function AnimationWithImperativeApi() {
  const animationRef = useRef<Lottie>(null)
  
  useEffect(() => {
    animationRef.current?.play()

    // Or set a specific startFrame and endFrame with:
    animationRef.current?.play(30, 120);
  }, [])

  return (
    <Lottie
      ref={animationRef}
      source={require('../path/to/animation.json')}
    />
  );
}
```

Lottie's animation progress can be controlled with an `Animated` value:

```jsx
import React, { useEffect } from 'react';
import { Animated, Easing } from 'react-native';
import Lottie from 'lottie-react-native';

export default function ControllingAnimationProgress() {
  const animationProgress = useRef(new Animated.Value(0))

  useEffect(() => {
    Animated.timing(animationProgress.current, {
      toValue: 1,
      duration: 5000,
      easing: Easing.linear,
      useNativeDriver: false
    }).start();
  }, [])

  return (
     <Lottie
      source={require('../path/to/animation.json')}
      progress={animationProgress.current}
    />
  );
}
```

Changing color of layers:

```jsx
import React from 'react';
import Lottie from 'lottie-react-native';

export default function ChangingColorOfLayers() {
  return (
    <Lottie
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

## API

You can find the full list of props and methods available in our [API document](https://github.com/airbnb/lottie-react-native/blob/master/docs/api.md). These are the most common ones:


| Prop               | Description                                                                                                                                                                                                                                                                     | Default                                                                                                             |
| ------------------ | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------- |
| **`source`**       | **Mandatory** - The source of animation. Can be referenced as a local asset by a string, or remotely with an object with a `uri` property, or it can be an actual JS object of an animation, obtained (for example) with something like `require('../path/to/animation.json')`. | _None_                                                                                                              |
| **`style`**        | Style attributes for the view, as expected in a standard [`View`](https://facebook.github.io/react-native/docs/layout-props.html).                                                                                                                                              | The `aspectRatio` exported by Bodymovin will be set. Also the `width` if you haven't provided a `width` or `height` |
| **`loop`**         | A boolean flag indicating whether or not the animation should loop.                                                                                                                                                                                                             | `true`                                                                                                              |
| **`autoPlay`**     | A boolean flag indicating whether or not the animation should start automatically when mounted. This only affects the imperative API.                                                                                                                                           | `false`                                                                                                             |
| **`colorFilters`** | An array of objects denoting layers by KeyPath and a new color filter value (as hex string).                                                                                                                                                                                    | `[]`                                                                                                                |

[More...](https://github.com/airbnb/lottie-react-native/blob/master/docs/api.md)

## Troubleshooting

Not all After Effects features are supported by Lottie. If you notice there are some layers or animations missing check [this list](https://github.com/airbnb/lottie/blob/master/supported-features.md) to ensure they are supported.

### iOS specific problems

If you have issues linking your **iOS** project check out this [StackOverflow thread](https://stackoverflow.com/questions/52536380/why-linker-link-static-libraries-with-errors-ios) on how to fix it.

### Android specific problems

If your app crashes on **Android**, means auto linking didn't work. You will need to make the following changes:

`android/app/src/main/java/\<AppName\>/MainApplication.java`

- add `import com.airbnb.android.react.lottie.LottiePackage;` on the imports section
- add `packages.add(new LottiePackage());` in `List<ReactPackage> getPackages()`;

`android/app/build.gradle`

add `implementation project(':lottie-react-native')` in the `dependencies` block

`android/settings.gradle`

add:

```
include ':lottie-react-native'
project(':lottie-react-native').projectDir = new File(rootProject.projectDir, '../node_modules/lottie-react-native/src/android')
```

## More

View more documentation, FAQ, help, examples, and more at [airbnb.io/lottie](https://airbnb.io/lottie/)

![Example1](docs/gifs/Example1.gif)

![Example2](docs/gifs/Example2.gif)

![Example3](docs/gifs/Example3.gif)

![Community](docs/gifs/Community%202_3.gif)

![Example4](docs/gifs/Example4.gif)
