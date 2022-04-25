## 5.0.1

- Fix SimpleColorFilter casting error

## 5.0.0

- Upgraded to RN 0.66.1
- Support for PlatformColor

## 4.1.3

- Added pod support for tvOS

## 4.1.2

- iOS target moved to 11.0 to align with React Native 64

## 4.1.1

- Updating Documentation

## 4.1.0

- Upgrading Native lottie-android to 4.0.0
- Migrated to maven_publish
- Migrated to gradle 7

## 4.0.3

- Updated `lottie-ios` dependency to 3.2.3

## 4.0.2

- Minor fixes

## 4.0.1

- Update react-native-safe-modules dependency

## 4.0.0

- Fix react-native 0.64 compatibility
- Windows support [C#]
- macOS Support (based on react-native-windows)
- Moved lottie-ios to peerDependencies
- Fix Android playback when startFrame > endFrame

## 3.4.1

- Updated the development app to React Native 0.62.2
- Updated `lottie-ios` dependency to 3.1.8
- Updated `lottie-android` dependency to 3.4.0

## 3.4.0 (May 20, 2020)

- Add auto embed fastlane
- Updated Android Building environment
- Add testID prop to AnimatedLottieView typescript definition
- Added Pause & Resume commands. Also added `onLayout` prop.
- Fix iOS speed not changing dynamically
- Improved documentation

## 3.3.2 (Nov 15, 2019)

- Removed support for `Reanimated`

## 3.3.1 (Nov 12, 2019)

- Support for `Reanimated`
- Added `colorFilters` prop for setting individually layers color
- Documentation update

## 3.2.1 (Sep 30, 2019)

- Fix for strange characters in some Java files

## 3.2.0 (Sep 30, 2019)

- Updated `lottie-ios` dependency to 3.1.3
- Updated `lottie-android` dependency to 3.0.7
- Make NPM package leaner
- Fix playing reverse on Android

## 3.1.1 (Sep 16, 2019)

- Fix loading assets from app bundle on iOS
- Remove unused deprecated `publishNonDefault` Gradle option
- Support passing extensionless file names on Android

## 3.1.0 (Jul 25, 2019)

- Support for `lottie-android` 3.0.0

## 3.0.4 (Jul 23, 2019)

- Fix for auto linking on Android

## 3.0.3 (Jul 22, 2019)

- Support for AndroidX
- Removed deprecated rnpm support
- Updated dependency for react-native-safe-module

## 3.0.2 (Jul 13, 2019)

- Lock lottie-ios on version 3.3.0

## 3.0.1 (Jun 28, 2019)

- Resolving UIViewManager deprecation warning

## 3.0.0 (Jun 1, 2019)

- React Native lottie upgrade (iOS)

## 2.6.1 (March 29, 2019)

- Lock lottie-ios on version 2.5.0
- Enable RN projects to define the Android AppCompat Library version

## 2.6.0 (March 18, 2019)

- Add Android app compatability support for RN 0.59 on Android (#455)

## 2.5.11 (December 20, 2018)

- Improved documentation
- Added `onAnimationFinish` callback
- Fixed compilation errors

## 2.5.10 (November 6, 2018)

- Fixed proptype checking on LottieView
- Added missing typings
- Use commonjs object export compatible syntax

## 2.5.9 (October 10, 2018)

- Fixed Android build - deprecated build script directives
- Fixed iOS build - header search paths
- Added missing typings

## 2.5.8 (August 27, 2018)

- Fixed Android flickering
- Added missing duration prop

## 2.5.7 (August 27, 2018)

- Fixed Android play method to be run only when the view is attached

## 2.5.6 (August 1, 2018)

- Reverted dependencies to ensure compatibility with RN

## 2.5.5 (August 1, 2018)

- Fixed Android builds

## 2.5.1 (July 30, 2018)

- Fixed built library
- Refactor + RN 0.56
- Autoplay animations when animation's source has changed
- Use project-wide properties and new dependency

## 2.5.0 (April 3, 2018)

- Fixed typescript support
- Bump Lottie to 2.5
- Support Carthage projects
- Fix resizeMode for iOS and TypeScript

## 2.3.2 (January 5, 2018)

- Moved eslint deps to devDeps
- Expose hardwareAccelerationAndroid (#254)

## 2.3.1 (December 5, 2017)

- Bumped lottie-ios and lottie-android

## 2.3.0 (November 24, 2017)

### Features and Improvements

- speed prop
- enableMergePathsAndroidForKitKatAndAbove prop for Android KitKat and above
- Bump Lottie-Android to 2.3.0
- Bump Lottie-iOS to 2.1.4
- Added resizeMode prop similar to <Image>
- Added play(fromFrame, toFrame)
- Removed the need for a style prop
  ### Bugs Fixed
- Improved the json serialization perf ~10x
- Fixed some build related issues on iOS and for newer versions of RN
- Enabled dev menu and reload for Android and iOS sample apps

## 1.0.6 (Feb 13, 2017)

- Fix name conflict with new release of ios cocoapod

## 1.0.5 (Feb 10, 2017)

- Allow iOS to be statically linked properly with react-native link

## 1.0.2 - 1.0.4 (Feb 8, 2017)

- Fix Android NativeModule name
- Depend on lottie-ios through NPM in order to make static linking easier
- Fix bad Lottie.xcodeproj reference for static linking
- Fix iOS header import order for static linking

## 1.0.1 (Feb 2, 2017)

- Fix Header / Build issues with iOS on RN 0.40+

## 1.0.0 (Feb 1, 2017)

- Official Release!
