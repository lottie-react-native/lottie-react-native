require 'json'

package = JSON.parse(File.read(File.join(__dir__, "package.json")))

folly_compiler_flags = '-DFOLLY_NO_CONFIG -DFOLLY_MOBILE=1 -DFOLLY_USE_LIBCPP=1 -Wno-comma -Wno-shorten-64-to-32'

Pod::Spec.new do |s|
  s.name                    = package["name"]
  s.version                 = package['version']
  s.summary                 = package["description"]
  s.license                 = package["license"]

  s.author                  = package["author"]
  s.homepage                = package["homepage"]

  s.ios.deployment_target   = '12.4'
  s.osx.deployment_target   = '10.10'
  s.tvos.deployment_target  = '12.4'

  s.source                  = { :git => "https://github.com/lottie-react-native/lottie-react-native.git", :tag => "v#{s.version}" }
  s.source_files            = "ios/**/*.{h,m,mm,swift}"
  s.exclude_files           = "ios/Fabric"

  s.dependency 'React-Core'
  s.dependency 'lottie-ios', '~> 3.5.0'

  s.compiler_flags  = folly_compiler_flags

  s.pod_target_xcconfig    = {
    "HEADER_SEARCH_PATHS" => "\"$(PODS_ROOT)/boost\"",
    "CLANG_CXX_LANGUAGE_STANDARD" => "c++17",
  }

  if ENV['RCT_NEW_ARCH_ENABLED'] == '1' then
    s.subspec "fabric" do |ss|
      ss.dependency "React-RCTFabric"
      ss.dependency "React-Codegen"
      ss.source_files       = "ios/Fabric/**/*.{h,m,mm,swift}"
      ss.exclude_files      = "ios/**/*.{swift}"
    end
  end
end
