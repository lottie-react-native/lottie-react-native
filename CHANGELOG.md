## 2.5.0 (April 3, 2018)
* Fixed typescript support 
* Bump Lottie to 2.5
* Support Carthage projects
* Fix resizeMode for iOS and TypeScript

## 2.3.2 (January 5, 2018)
* Moved eslint deps to devDeps
* Expose hardwareAccelerationAndroid (#254)

## 2.3.1 (December 5, 2017)
* Bumped lottie-ios and lottie-android


## 2.3.0 (November 24, 2017)
### Features and Improvements

* speed prop
* enableMergePathsAndroidForKitKatAndAbove prop for Android KitKat and above
* Bump Lottie-Android to 2.3.0
* Bump Lottie-iOS to 2.1.4
* Added resizeMode prop similar to <Image>
* Added play(fromFrame, toFrame)
* Removed the need for a style prop
  ### Bugs Fixed
* Improved the json serialization perf ~10x
* Fixed some build related issues on iOS and for newer versions of RN
* Enabled dev menu and reload for Android and iOS sample apps

## 1.0.6 (Feb 13, 2017)

* Fix name conflict with new release of ios cocoapod

## 1.0.5 (Feb 10, 2017)

* Allow iOS to be statically linked properly with react-native link

## 1.0.2 - 1.0.4 (Feb 8, 2017)

* Fix Android NativeModule name
* Depend on lottie-ios through NPM in order to make static linking easier
* Fix bad Lottie.xcodeproj reference for static linking
* Fix iOS header import order for static linking

## 1.0.1 (Feb 2, 2017)

* Fix Header / Build issues with iOS on RN 0.40+

## 1.0.0 (Feb 1, 2017)

* Official Release!
