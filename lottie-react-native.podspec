require 'json'

package = JSON.parse(File.read(File.join(__dir__, "package.json")))

Pod::Spec.new do |s|
  s.name         = package["name"]
  s.version      = package['version']
  s.summary      = package["description"]
  s.homepage     = package["homepage"]
  s.license      = { :type => "Apache-2.0", :file => "LICENSE" }
  s.author      = { "author" => "leland.m.richardson@gmail.com" }
  s.ios.deployment_target = '11.0'
  s.osx.deployment_target = '10.10'
  s.tvos.deployment_target = '11.0'
  s.source       = { :git => "https://github.com/lottie-react-native/lottie-react-native.git", :tag => "v#{s.version}" }
  s.source_files  = "ios/**/*.{h,m,swift}"
  s.swift_version = "5.0"

  s.dependency 'React-Core'
  s.dependency 'lottie-ios', '~> 3.4.1'
end
