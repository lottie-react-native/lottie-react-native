// swift-tools-version: 6.0

import PackageDescription

let reactHeaders: [Target.Dependency] = [
    .product(name: "ReactHeaders", package: "ReactNative"),
    .product(name: "ReactNativeHeaders", package: "ReactNative"),
    .product(name: "ReactNativeDependenciesHeaders", package: "ReactNative"),
    .product(name: "ReactAppHeaders", package: "React-GeneratedCode"),
]

let package = Package(
    name: "LottieReactNative",
    platforms: [.iOS(.v15)],
    products: [
        .library(
            name: "LottieReactNative",
            targets: ["LottieReactNative", "LottieReactNativeObjC"]
        ),
    ],
    dependencies: [
        .package(name: "ReactNative", path: "../../../../xcframeworks"),
        .package(name: "React-GeneratedCode", path: "../../../ios"),
        .package(url: "https://github.com/airbnb/lottie-spm.git", exact: "4.6.0"),
    ],
    targets: [
        .target(
            name: "LottieReactNativeObjC",
            dependencies: reactHeaders,
            path: "ios",
            sources: [
                "Fabric/LottieAnimationViewComponentView.mm",
                "LottieReactNative/LRNAnimationViewManagerObjC.m",
                "LottieReactNative/RCTConvert+Lottie.m",
            ],
            publicHeadersPath: "Fabric",
            cSettings: [
                .headerSearchPath("Fabric"),
                .headerSearchPath("LottieReactNative"),
            ],
            cxxSettings: [
                .headerSearchPath("Fabric"),
                .headerSearchPath("LottieReactNative"),
                .define("DEBUG", .when(configuration: .debug)),
                .define("NDEBUG", .when(configuration: .release)),
            ],
            linkerSettings: [
                .linkedFramework("UIKit"),
                .linkedFramework("Foundation"),
                .linkedFramework("CoreGraphics"),
            ]
        ),
        .target(
            name: "LottieReactNative",
            dependencies: reactHeaders + [
                .product(name: "Lottie", package: "lottie-ios"),
            ],
            path: "ios",
            sources: [
                "LottieReactNative/AnimationViewManagerModule.swift",
                "LottieReactNative/ContainerView.swift",
                "LottieReactNative/PlatformColor.swift",
            ],
            resources: [
                .copy("PrivacyInfo.xcprivacy"),
            ],
            linkerSettings: [
                .linkedFramework("UIKit"),
                .linkedFramework("Foundation"),
                .linkedFramework("CoreGraphics"),
            ]
        ),
    ],
    cxxLanguageStandard: .cxx20
)
