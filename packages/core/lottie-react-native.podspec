require 'json'

package = JSON.parse(File.read(File.join(__dir__, "package.json")))

# Read the React Native version from the package.json relative to the podspec file
react_package_file = File.expand_path("../react-native/package.json", File.dirname(__FILE__))
react_package = JSON.parse(File.read(react_package_file))
minor_react_version = react_package['version'].split('.')[1].to_i

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

  s.dependency 'lottie-ios', '~> 4.3.3'

  s.swift_version = '5.6'

  # install_modules_dependencies has been defined since React Native 70
  # if you only support React Native 70+, we can remove the `if defined?() else` statement
  # TODO(workaround): checking RN version for backward comaptibility reasons since lottie is not compatible with RN 72 and below with install_modules_dependencies
  # TODO: We need to replace this line with   if defined?(install_modules_dependencies)
  if minor_react_version >= 73
    install_modules_dependencies(s)
    if !(ENV['RCT_NEW_ARCH_ENABLED'] == '1') then
      s.exclude_files = "ios/Fabric"
    end
  else
    if ENV['RCT_NEW_ARCH_ENABLED'] == '1' then
      folly_compiler_flags = '-DFOLLY_NO_CONFIG -DFOLLY_MOBILE=1 -DFOLLY_USE_LIBCPP=1 -Wno-comma -Wno-shorten-64-to-32'
      s.compiler_flags = folly_compiler_flags + " -DRCT_NEW_ARCH_ENABLED=1"
      s.pod_target_xcconfig    = {
        "HEADER_SEARCH_PATHS" => "\"$(PODS_ROOT)/boost\"",
        "OTHER_CPLUSPLUSFLAGS" => "-DFOLLY_NO_CONFIG -DFOLLY_MOBILE=1 -DFOLLY_USE_LIBCPP=1",
        "CLANG_CXX_LANGUAGE_STANDARD" => "c++17",
        "DEFINES_MODULE" => "YES",
      }

      s.dependency "React-RCTFabric"
      s.dependency "React-Codegen"
      s.dependency "RCT-Folly"
      s.dependency "RCTRequired"
      s.dependency "RCTTypeSafety"
      s.dependency "ReactCommon/turbomodule/core"
    else
      s.dependency 'React-Core'
      s.exclude_files = "ios/Fabric"
    end
  end
end
