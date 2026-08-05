require "json"

package = JSON.parse(File.read(File.join(__dir__, "package.json")))

# `s.name` must match `iosModuleName` in nitro.json — the generated Swift/C++
# bridge headers are namespaced by it.
Pod::Spec.new do |s|
  s.name         = "LottieNitro"
  s.version      = package["version"]
  s.summary      = package["description"]
  s.homepage     = package["homepage"]
  s.license      = package["license"]
  s.authors      = package["author"]

  s.platforms    = { :ios => min_ios_version_supported }
  s.source       = {
    :git => "https://github.com/lottie-react-native/lottie-react-native.git",
    :tag => "v#{s.version}"
  }

  s.source_files = [
    "ios/**/*.swift",
    "ios/**/*.{m,mm}",
  ]

  # Adds every nitrogen-generated source, the NitroModules dependency, and the
  # c++20 / objcxx interop build settings the generated bridge requires.
  load 'nitrogen/generated/ios/LottieNitro+autolinking.rb'
  add_nitrogen_files(s)

  s.dependency 'React-jsi'
  s.dependency 'React-callinvoker'
  install_modules_dependencies(s)
end
