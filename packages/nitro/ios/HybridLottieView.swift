import Lottie
import NitroModules
import UIKit

/// Stub implementation of the `LottieView` Nitro view.
///
/// Renders an empty `UIView` and stores every prop without acting on it. This
/// exists so the module codegens, compiles and registers end to end; real
/// Lottie rendering (and the `lottie-ios` dependency) lands in a later change.
///
/// `beforeUpdate()`, `afterUpdate()` and `onDropView()` have default no-op
/// implementations in NitroModules' `HybridView` protocol extension, so they are
/// omitted. The implicit zero-argument init is required because the generated
/// `LottieNitroAutolinking.swift` calls `HybridLottieView()`.
///
/// `ResizeMode`, `RenderMode`, `LottieColorFilter`, `TextFilterIOS` and
/// `TextFilterAndroid` are generated into this same module, so they need no
/// import.
class HybridLottieView: HybridLottieViewSpec {
  /// One animation view for the component's lifetime.
  ///
  /// It never needs replacing: `configuration` and `animation` are settable vars
  /// whose `didSet` rebuilds the layer in place, and `makeAnimationLayer`
  /// re-applies registered value providers and carries the image and text
  /// providers across. React Native frames it for us via `RCTViewComponentView`.
  private let animationView = LottieAnimationView(frame: .zero)

  var view: UIView { animationView }

  // MARK: - Props
  //
  // Stored only. A real implementation applies these to a LottieAnimationView,
  // most usefully from `afterUpdate()` so a prop batch is applied once.

  var resizeMode: ResizeMode?
  var renderMode: RenderMode?

  var sourceName: String?
  var sourceJson: String?
  var sourceURL: String?
  var sourceDotLottieURI: String?

  var imageAssetsFolder: String?

  var progress: Double?
  var speed: Double?

  var loop: Bool?
  var autoPlay: Bool?

  var enableMergePathsAndroidForKitKatAndAbove: Bool?
  var applyOpacityToLayersAndroid: Bool?
  var enableSafeModeAndroid: Bool?
  var hardwareAccelerationAndroid: Bool?
  var cacheComposition: Bool?

  var colorFilters: [LottieColorFilter]?
  var textFiltersAndroid: [TextFilterAndroid]?
  var textFiltersIOS: [TextFilterIOS]?

  var onAnimationFinish: ((_ isCancelled: Bool) -> Void)?
  var onAnimationFailure: ((_ error: String) -> Void)?
  var onAnimationLoaded: (() -> Void)?

  // MARK: - Methods
  //
  // Unlike v7's Fabric commands, which arrived already on the UI thread, Nitro
  // methods are direct JSI calls on the JS thread. A real implementation must
  // hop to the main thread before touching the view.

  func play(startFrame: Double, endFrame: Double) throws {
    // no-op
  }

  func reset() throws {
    // no-op
  }

  func pause() throws {
    // no-op
  }

  func resume() throws {
    // no-op
  }
}
