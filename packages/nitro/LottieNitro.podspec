require "json"

package = JSON.parse(File.read(File.join(__dir__, "package.json")))

Pod::Spec.new do |s|
  s.name         = "LottieNitro"
  s.version      = package["version"]
  s.summary      = package["description"]
  s.homepage     = package["homepage"]
  s.license      = package["license"]
  s.authors      = package["author"]

  s.swift_version = '5.9'
  s.platforms    = { :ios => min_ios_version_supported }
  s.source       = {
    :git => "https://github.com/lottie-react-native/lottie-react-native.git",
    :tag => "v#{s.version}"
  }

  s.source_files = [
    "ios/**/*.swift",
    "ios/**/*.{m,mm}",
  ]

  s.resource_bundles = {
    'Lottie_React_Native_Nitro_Privacy' => ['ios/PrivacyInfo.xcprivacy'],
  }

  load 'nitrogen/generated/ios/LottieNitro+autolinking.rb'
  add_nitrogen_files(s)

  s.dependency 'lottie-ios', '4.6.0'

  s.dependency 'React-jsi'
  s.dependency 'React-callinvoker'
  install_modules_dependencies(s)
end
