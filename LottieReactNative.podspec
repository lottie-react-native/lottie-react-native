require "json"

package = JSON.parse(File.read(File.join(__dir__, "package.json")))

Pod::Spec.new do |s|
  s.name         = "LottieReactNative"
  s.version      = package["version"]
  s.summary      = package["description"]
  s.homepage     = package["homepage"]
  s.license      = package["license"]
  s.authors      = package["author"]

  s.ios.deployment_target   = '15.1'
  s.osx.deployment_target   = '10.15'
  s.tvos.deployment_target  = '13.0'
  s.visionos.deployment_target = '1.0'

  s.platforms    = { :ios => min_ios_version_supported }
  s.source       = { :git => "https://github.com/lottie-react-native/lottie-react-native.git", :tag => "#{s.version}" }

  s.source_files = "ios/**/*.{h,m,mm,swift}"
  s.resource_bundles = {
    'Lottie_React_Native_Privacy' => ['ios/PrivacyInfo.xcprivacy'],
  }

  s.dependency 'lottie-ios', '4.5.1'

  s.swift_version = '5.9'

  load 'nitrogen/generated/ios/LottieReactNative+autolinking.rb'
  add_nitrogen_files(s)

# Use install_modules_dependencies helper to install the dependencies if React Native version >=0.71.0.
# See https://github.com/facebook/react-native/blob/febf6b7f33fdb4904669f99d795eba4c0f95d7bf/scripts/cocoapods/new_architecture.rb#L79.
if respond_to?(:install_modules_dependencies, true)
  install_modules_dependencies(s)
else
  s.dependency "React-Core"
end
end
