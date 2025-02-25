# Migration from Version 5 to 6

## Installation changes

We removed the need to install `lottie-ios` separatly from `lottie-react-native`. You should remove `lottie-ios` from your `package.json` file if it is still there.

## Updating the style props

In version 6, Lottie no longer attempts to set default width, height or aspect ration on your views, and you will need to provide them your self moving forward. For example:

```tsx
const TestComponent = () => {
    return (
        <Lottie source={{...etc}} />
    )
}
```

Should be updated to include the dimension style props. for example:

```tsx
const TestComponent = () => {
    return (
        <Lottie source={{...etc}} style={{width: 100, height: 100}} />
    )
}
```


```tsx
const TestComponent = () => {
    return (
        <Lottie source={{...etc}} style={{width: '100%', aspectRatio: 16/9}} />
    )
}
```

## The main Lottie view is no longer wrapped by Animated API from React Native

Previously, we used to wrap the Base Lottie View in a React Native Animated component. This was causing issues for those who wanted to wrap lottie with Reanimated. As of version 6, we removed this default wrapper, so if you wish to animate the lottie view, use `createAnimatedComponent`, either from `Reanimated` or `React-Native`.

## The new prop for leveraging GPU for rendering

As of Lottie V6, we can now leverage the GPU to do all the heavy lifting of rendering, alleviating the load from the CPU. This is achieved via a new Prop, called `renderMode` which takes one of three values:
1. "AUTOMATIC": This is the new default, and it will allow Lottie to decide based on environment whether to use GPU or CPU for the rendering
2. "SOFTWARE": This is the old behaviour that also exists on V5 and below. In this mode, Lottie is using the UI thread for doing the animations. Setting the prop to this value ensures a backward compatible way of behaviour, in line with the old methods
3. "HARDWARE": The new render mode. It leverages the devices GPU and offloads the animation to it to ensure that the UI thread is left at a lower utilization, resulting in better performance.

While the supported effects are almost the same across the board, there are certain differences and certain features that one rendering mode may support and another might not (to see the full list, [check here](https://airbnb.io/lottie/#/supported-features)). If you are having issues rendering an animation in V6 that was working in V5, try to switch back to "SOFTWARE" for the rendering mode (though we recommend using "AUTOMATIC" or "HARDWARE", if you are not having problems, for better performance)
