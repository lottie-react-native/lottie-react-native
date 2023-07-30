# Changelog

## 6.0.0

### Features

- Fabric support for iOS ([#955](https://github.com/lottie-react-native/lottie-react-native/pull/955))
- Fabric support for Android ([#910](https://github.com/lottie-react-native/lottie-react-native/pull/910))
- Upgrade android-lottie to 6.0.0 ([#993](https://github.com/lottie-react-native/lottie-react-native/pull/993))
- Upgrade android-lottie to 6.1.0 ([#1060](https://github.com/lottie-react-native/lottie-react-native/pull/1060))
- Implement native auto play for android ([63f71aa](https://github.com/react-native-community/lottie-react-native/commit/63f71aacbc007d8e2a9a1216ef2072023dc63fce))
- Implement native auto play for ios ([84e6668](https://github.com/react-native-community/lottie-react-native/commit/84e666838075ffb3264a15c823f454cd63d1ab8f))

### Bug Fixes

- Add missing condition ([bd44aff](https://github.com/react-native-community/lottie-react-native/commit/bd44aff93a8e5f992d1414ca9d839b850605eadf))
- Old arch impl ([65ec453](https://github.com/react-native-community/lottie-react-native/commit/65ec453afa1663fcb564a21931af7f27531c106b))
- **android**: Refactor event dispatch logic on android to fix fabric crash ([#1000](https://github.com/react-native-community/lottie-react-native/issues/1000)) ([ebb8006](https://github.com/react-native-community/lottie-react-native/commit/ebb8006da0385e44bb33817d44909376143a1695))
- **android**: Add support for upcoming 0.73 ([#1038](https://github.com/lottie-react-native/lottie-react-native/pull/1038))
- **android**: Fix resize mode in Android ([#992](https://github.com/lottie-react-native/lottie-react-native/pull/992))
- **iOS**: Reset to first frame on app resume bug ([#980](https://github.com/lottie-react-native/lottie-react-native/pull/980))
- **iOS**: Frames being calculated incorrectly ([#1019](https://github.com/lottie-react-native/lottie-react-native/pull/1019))
- **macOS**: react native macos build ([#1031](https://github.com/lottie-react-native/lottie-react-native/pull/1031))
- **iOS**: Memory leak on deallocation ([#1055](https://github.com/lottie-react-native/lottie-react-native/pull/1055))
- **iOS**: Update lottie-ios to 4.2.0 + fix build error ([#1036](https://github.com/lottie-react-native/lottie-react-native/pull/1036))
- **iOS**: prevent jumping to end frame ([#1061](https://github.com/lottie-react-native/lottie-react-native/pull/1061))
- Fabric build on 0.68/0.69 ([#1054](https://github.com/lottie-react-native/lottie-react-native/pull/1054))
- Fix different ios related issues ([3f7e3e](https://github.com/lottie-react-native/lottie-react-native/commit/3f7e3e6aebf24daa052c9552ab96489c1fa4a547))

### Internal Changes

- Move project to monorepo [077429](https://github.com/lottie-react-native/lottie-react-native/commit/077429f164502b955063a2eaeb4321ba4ec5d95d)
- Update examples to typescript ([300e63](https://github.com/lottie-react-native/lottie-react-native/commit/300e633f0261942e5ead8fa4335dd09afb583dd9))
- Remove redundant logging from the project ([#1024](https://github.com/lottie-react-native/lottie-react-native/pull/1024))

### BREAKING CHANGES

- BREAKING CHANGE: Removed using Animated API by default in the source code ([#992](https://github.com/lottie-react-native/lottie-react-native/pull/992))

- BREAKING CHANGE: Removed absolute style being applied to the LottieView ([#992](https://github.com/lottie-react-native/lottie-react-native/pull/992))

- BREAKING CHANGE: Removed default aspect ratio styling ([#992](https://github.com/lottie-react-native/lottie-react-native/pull/992))

- BREAKING CHANGE: Removed default width and height being applied ([#992](https://github.com/lottie-react-native/lottie-react-native/pull/992))

  Check [here](https://github.com/lottie-react-native/lottie-react-native/pull/992) for more information.

- BREAKING CHANGE: Renamed AnimatedLottieViewProps to LottieViewProps ([9fd591](https://github.com/lottie-react-native/lottie-react-native/commit/9fd591fd7f864fdbf5235ba35d0a7240ec9ab360))

Full changelog can be found [here](https://github.com/react-native-community/lottie-react-native/compare/v5.1.5...v6.0.0).

### Known issues:

- Initial render with json source is not always working as expected on iOS when new architecture is turned on (https://github.com/lottie-react-native/lottie-react-native/issues/1043)

## 5.1.4

- Support for lottie-ios version 3.4.0
- Update tvOS deployment target to 11.0

## 5.1.3

- Fix Android compilation issue

## 5.1.2

- Fix compilation issues on Android

## 5.1.1

- Remove deprecated-react-native-prop-types import

## 5.1.0

- Upgrade lottie-android dependency to 5.1.1
- Fix ViewPropTypes imports
- Support for remote animations
- Support for dynamic text
- Support changing lottie props for ongoing animations
- Regular chore tasks

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
- Add testID prop to LottieView typescript definition
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
