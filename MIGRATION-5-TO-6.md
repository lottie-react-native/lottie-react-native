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
