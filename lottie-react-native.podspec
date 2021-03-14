require 'json'

package = JSON.parse(File.read(File.join(__dir__, 'package.json')))

Pod::Spec.new do |s|
  s.name         = "lottie-react-native"
  s.version      = package['version']
  s.summary      = "Lottie component for React Native (iOS and Android)"

  s.authors      = { "intelligibabble" => "leland.m.richardson@gmail.com" }
  s.homepage     = "https://github.com/airbnb/lottie-react-native#readme"
  s.license      = package['license']
  s.ios.deployment_target = '9.0'
  s.osx.deployment_target = '10.10'

  s.source       = { :git => "https://github.com/react-community/lottie-react-native.git", :tag => "v#{s.version}" }
  s.source_files  = "src/ios/**/*.{h,m,swift}"

  s.requires_arc = true

  s.pod_target_xcconfig = { 'DEFINES_MODULE' => 'YES' }

  s.dependency 'React-Core'
  s.dependency 'lottie-ios', '~> 3.1.8'
end
