import NitroModules
import UIKit

/// Stub implementation of the `LottieView` Nitro view.
///
/// Renders an empty `UIView`. This exists so the module codegens, compiles and
/// registers end to end; Lottie rendering lands in a later change.
///
/// `beforeUpdate()`, `afterUpdate()` and `onDropView()` have default no-op
/// implementations in NitroModules' `HybridView` protocol extension, so they
/// are omitted here. The implicit zero-argument init is required because the
/// generated `LottieNitroAutolinking.swift` calls `HybridLottieView()`.
class HybridLottieView: HybridLottieViewSpec {
  var view: UIView = UIView()

  // Stored only — no rendering yet.
  var placeholder: Bool = false
}
