import Lottie
import NitroModules
import UIKit

/// Nitro view backing `LottieView` on iOS.
///
/// Ported from v7's `packages/core/ios/LottieReactNative/ContainerView.swift`,
/// with the structure reworked around Nitro's batching. v7 applied each prop
/// immediately as it arrived, which built the animation view two or three times
/// per commit and silently dropped the text provider whenever `renderMode`
/// changed after `textFiltersIOS`. Here the setters are pure stores and
/// everything is applied once, in a correct order, from `afterUpdate()`.
///
/// Nitro calls the setters and `afterUpdate()` synchronously on the main thread
/// (via `RCTViewComponentView.updateProps`, under `RCTAssertMainQueue`), so no
/// dispatching is needed for any Lottie call.
///
/// Imperative commands (`play`/`reset`/`pause`/`resume`) are intentionally still
/// no-ops — they land with the ref in a later change.
class HybridLottieView: HybridLottieViewSpec {
  /// One animation view for the component's lifetime.
  ///
  /// It never needs replacing: `configuration` and `animation` are settable vars
  /// whose `didSet` rebuilds the layer in place, and `makeAnimationLayer`
  /// re-applies registered value providers and carries the image and text
  /// providers across. React Native frames it for us via `RCTViewComponentView`.
  private let animationView = LottieAnimationView(frame: .zero)

  var view: UIView { animationView }

  // MARK: - Props (pure stores; nothing is applied until afterUpdate)

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

  // MARK: - Applied state

  /// Value-typed snapshots of what has actually been pushed to Lottie.
  ///
  /// Native diffing is mandatory, not an optimisation: Nitro compares props with
  /// `jsi::Value::strictEquals`, which is reference identity for arrays, so an
  /// inline `colorFilters={[...]}` arrives "changed" on every single commit.
  private struct ColorFilterSnapshot: Hashable {
    let keypath: String
    let color: String
  }

  private enum SourceKind: Equatable {
    case name(String), json(String), url(String), dotLottie(String)
  }

  private var appliedDidApplyOnce = false
  private var appliedSource: SourceKind?
  private var appliedRenderMode: String?
  private var appliedResizeMode: String?
  private var appliedImageAssetsFolder = ""
  private var appliedCacheComposition = true
  private var appliedProgress: Double = 0
  private var appliedSpeed: Double = 1
  private var appliedLoop = true
  private var appliedAutoPlay = false
  private var appliedTextFilters: [String: String] = [:]
  private var appliedColorFilters: [ColorFilterSnapshot] = []
  private var installedColorKeypaths: Set<AnimationKeypath> = []

  /// Bumped on every source change, before the load starts. An async completion
  /// carrying a stale generation is dropped, which makes the behaviour
  /// last-*requested* wins where v7 was last-*completed*.
  private var loadGeneration: UInt64 = 0
  private var inFlightLoad: URLSessionDataTask?

  /// Gates spurious `onAnimationFinish`. Three separate Lottie paths invoke a
  /// stored completion with `finished: false` — the `currentProgress` setter, the
  /// `animation`/`configuration` didSet, and every `play()` overload — all via
  /// `removeCurrentAnimationIfNecessary()`. Lottie's own `ignoreDelegate`
  /// suppression covers only one of them, so we supply the rest.
  private var suppressFinishDepth = 0
  private var playbackEpoch: UInt64 = 0

  private var sourceJustChanged = false

  // MARK: - Lifecycle

  /// The generated `LottieNitroAutolinking.swift` calls `HybridLottieView()`, so
  /// this must stay zero-argument. `override` because `HybridLottieViewSpec` is a
  /// composition including the `open class HybridLottieViewSpec_base`, which
  /// declares `public init()`.
  override init() {
    super.init()
    // Lottie's `animationLoaded` fires on every `animation` didSet, which is the
    // one hook both the sync and async source paths pass through. Installing it
    // once here is what lets `applyCompositionDependent()` be reached from either.
    //
    // Its own didSet fires immediately when an animation is already present; at
    // init there is none, so this is safe.
    animationView.animationLoaded = { [weak self] _, _ in
      guard let self else { return }
      self.onAnimationLoaded?()
      self.applyCompositionDependent()
    }
  }

  func afterUpdate() {
    withFinishSuppressed {
      let nextSource = pendingSource()
      sourceJustChanged = nextSource != appliedSource

      // cacheComposition is consumed by the loaders below, so snapshot first.
      appliedCacheComposition = cacheComposition ?? true

      // imageProvider and textProvider are read when the layer is built, so both
      // must precede the source. v7 never implemented imageAssetsFolder on iOS at
      // all (zero references in its entire iOS tree).
      applyImageProvider()
      applyTextProvider()

      // renderMode before the source, so one commit builds one layer. v7 applied
      // it after, rebuilding the view a second time on first mount.
      applyRenderMode()
      applyResizeMode()

      if sourceJustChanged {
        appliedSource = nextSource
        loadGeneration &+= 1
        inFlightLoad?.cancel()
        inFlightLoad = nil
        installedColorKeypaths = []
        apply(source: nextSource)
      } else {
        // Nothing re-entered the post-load path, so run it for whatever
        // composition-dependent prop did change.
        applyCompositionDependent()
      }

      appliedDidApplyOnce = true
      sourceJustChanged = false
    }
  }

  func onDropView() {
    // Order matters: invalidate generations and detach before stopping, so
    // nothing can emit into a torn-down runtime.
    loadGeneration &+= 1
    playbackEpoch &+= 1
    suppressFinishDepth += 1
    inFlightLoad?.cancel()
    inFlightLoad = nil
    animationView.animationLoaded = nil
    for keypath in installedColorKeypaths {
      animationView.removeValueProvider(for: keypath)
    }
    installedColorKeypaths = []
    animationView.stop()
    animationView.animation = nil
    onAnimationFinish = nil
    onAnimationFailure = nil
    onAnimationLoaded = nil
  }

  // MARK: - Props valid without a composition

  private func applyImageProvider() {
    let folder = imageAssetsFolder ?? ""
    guard folder != appliedImageAssetsFolder || !appliedDidApplyOnce else { return }
    animationView.imageProvider = folder.isEmpty
      ? BundleImageProvider(bundle: .main, searchPath: nil)
      : BundleImageProvider(bundle: .main, searchPath: folder)
    appliedImageAssetsFolder = folder
  }

  private func applyTextProvider() {
    let next = pendingTextFilters()
    guard next != appliedTextFilters || !appliedDidApplyOnce else { return }
    // Empty clears, which v7 could not do (it was guarded by `count > 0`).
    animationView.textProvider = next.isEmpty
      ? DefaultTextProvider()
      : DictionaryTextProvider(next)
    appliedTextFilters = next
  }

  private func applyRenderMode() {
    guard let mode = renderMode else { return }
    let key = String(describing: mode)
    guard key != appliedRenderMode else { return }
    let engine: RenderingEngineOption
    switch mode {
    case .software: engine = .mainThread
    case .hardware: engine = .coreAnimation
    case .automatic: engine = .automatic
    }
    animationView.configuration = LottieConfiguration(renderingEngine: engine)
    appliedRenderMode = key
  }

  private func applyResizeMode() {
    guard let mode = resizeMode else { return }
    let key = String(describing: mode)
    guard key != appliedResizeMode else { return }
    switch mode {
    case .cover: animationView.contentMode = .scaleAspectFill
    case .contain: animationView.contentMode = .scaleAspectFit
    case .center: animationView.contentMode = .center
    }
    appliedResizeMode = key
  }

  // MARK: - Source loading

  /// Fixed precedence, so a caller bypassing the JS wrapper and sending several
  /// source props is still deterministic. v7 had none — the last setter won,
  /// i.e. C++ prop declaration order.
  ///
  /// `""` means absent: the wrapper always sends all four (see TODO.md item 8).
  private func pendingSource() -> SourceKind? {
    if let s = sourceJson, !s.isEmpty { return .json(s) }
    if let s = sourceName, !s.isEmpty { return .name(s) }
    if let s = sourceDotLottieURI, !s.isEmpty { return .dotLottie(s) }
    if let s = sourceURL, !s.isEmpty { return .url(s) }
    return nil
  }

  /// v7 applied this bundle-relative fallback to `sourceURL` only, so a
  /// bundle-relative `.lottie` path silently failed. Applied to both here.
  private func resolveURL(_ raw: String) -> URL? {
    if let url = URL(string: raw), url.scheme != nil { return url }
    return URL(fileURLWithPath: raw, relativeTo: Bundle.main.resourceURL)
  }

  private func apply(source: SourceKind?) {
    let generation = loadGeneration
    let cache = appliedCacheComposition ? LottieAnimationCache.shared : nil
    let dotCache = appliedCacheComposition ? DotLottieCache.sharedCache : nil

    switch source {
    case .none:
      animationView.animation = nil

    case .json(let json):
      guard let data = json.data(using: .utf8),
            let animation = try? LottieAnimation.from(data: data) else {
        emitFailure("Unable to create the lottie animation object from the JSON source")
        return
      }
      animationView.animation = animation

    case .name(let name):
      guard let animation = LottieAnimation.named(name, bundle: .main, animationCache: cache) else {
        // v7 was silent here — a nil animation, no event, a blank view.
        emitFailure("Unable to find the lottie animation named \"\(name)\" in the main bundle")
        return
      }
      animationView.animation = animation

    case .url(let raw):
      guard let url = resolveURL(raw) else {
        emitFailure("Invalid Lottie animation URL: \(raw)")
        return
      }
      animationView.animation = nil  // blank the region while loading, as v7 did
      inFlightLoad = LottieAnimation.loadedFrom(url: url, closure: { [weak self] animation in
        guard let self, generation == self.loadGeneration else { return }
        self.inFlightLoad = nil
        guard let animation else {
          self.emitFailure("Unable to fetch the Lottie animation from the URL: \(url.absoluteString)")
          return
        }
        self.animationView.animation = animation
      }, animationCache: cache)

    case .dotLottie(let raw):
      guard let url = resolveURL(raw) else {
        emitFailure("Invalid .lottie URL: \(raw)")
        return
      }
      animationView.animation = nil
      inFlightLoad = DotLottieFile.loadedFrom(url: url, dotLottieCache: dotCache) { [weak self] result in
        guard let self, generation == self.loadGeneration else { return }
        self.inFlightLoad = nil
        switch result {
        case .failure(let error):
          self.emitFailure(error.localizedDescription)
        case .success(let file):
          self.animationView.loadAnimation(nil, from: file)
        }
      }
    }
  }

  // MARK: - Props needing a composition

  /// Invoked from two places: here at the tail of `afterUpdate()` when the source
  /// did not change, and from the `animationLoaded` hook when it did. That
  /// convergence is what lets the sync and async source paths share one path.
  private func applyCompositionDependent() {
    guard animationView.animation != nil else { return }
    withFinishSuppressed {
      // A .lottie load overwrites loopMode, animationSpeed and imageProvider from
      // the manifest, so re-asserting unconditionally is simpler than an ordering
      // rule.
      appliedLoop = loop ?? true
      appliedSpeed = speed ?? 1
      animationView.loopMode = appliedLoop ? .loop : .playOnce
      animationView.animationSpeed = CGFloat(appliedSpeed)

      reconcileColorFilters()
      applyPlayback()
    }
  }

  private func applyPlayback() {
    let wantsPlay = autoPlay ?? false
    let next = progress ?? 0
    let progressChanged = next != appliedProgress
    appliedProgress = next

    if wantsPlay {
      let shouldStart = !appliedAutoPlay
        || progressChanged
        || sourceJustChanged
        || !animationView.isAnimationPlaying
      if shouldStart {
        // Folding progress into the play call is what makes it survive playback
        // start. v7's Android applied progress first and then called
        // playAnimation(), which reset it.
        let from = next >= 1 ? 0 : next
        animationView.play(
          fromProgress: AnimationProgressTime(from),
          toProgress: 1,
          loopMode: appliedLoop ? .loop : .playOnce,
          completion: makeFinishCompletion()
        )
      }
    } else if progressChanged {
      animationView.currentProgress = AnimationProgressTime(next)
    }
    // autoPlay true -> false is a no-op, matching v7 on both platforms.
    appliedAutoPlay = wantsPlay
  }

  /// Reconciles rather than accumulates. v7 only ever added value providers, so a
  /// keypath removed from the array kept its tint for the view's lifetime.
  private func reconcileColorFilters() {
    let next = (colorFilters ?? []).map {
      ColorFilterSnapshot(keypath: $0.keypath, color: $0.color)
    }
    guard next != appliedColorFilters || sourceJustChanged || !appliedDidApplyOnce else { return }

    var desired: [AnimationKeypath: UIColor] = [:]
    for filter in next {
      guard let color = LottieColorParser.parse(filter.color) else {
        // v7 filled transparent silently, and `break`ed out of the whole loop.
        emitFailure(
          "Unparseable colorFilters color \"\(filter.color)\" for keypath \"\(filter.keypath)\""
        )
        continue
      }
      // v7's iOS keypath shape, verbatim. Android's differs and deliberately
      // stays different — see TODO.md.
      desired[AnimationKeypath(keypath: "\(filter.keypath).**.Color")] = color
    }

    for stale in installedColorKeypaths.subtracting(desired.keys) {
      animationView.removeValueProvider(for: stale)
    }
    for (keypath, color) in desired {
      animationView.setValueProvider(ColorValueProvider(color.lottieColorValue), keypath: keypath)
    }
    installedColorKeypaths = Set(desired.keys)
    appliedColorFilters = next
  }

  // MARK: - Events

  private func makeFinishCompletion() -> LottieCompletionBlock {
    playbackEpoch &+= 1
    let epoch = playbackEpoch
    return { [weak self] finished in
      guard let self,
            epoch == self.playbackEpoch,
            self.suppressFinishDepth == 0 else { return }
      self.playbackEpoch &+= 1  // one emit per run
      self.onAnimationFinish?(!finished)
    }
  }

  private func withFinishSuppressed(_ body: () -> Void) {
    suppressFinishDepth += 1
    defer { suppressFinishDepth -= 1 }
    body()
  }

  private func emitFailure(_ message: String) {
    onAnimationFailure?(message)
  }

  // MARK: - Helpers

  private func pendingTextFilters() -> [String: String] {
    Dictionary(
      (textFiltersIOS ?? []).map { ($0.keypath, $0.text) },
      uniquingKeysWith: { _, last in last }
    )
  }

  // MARK: - Imperative commands (not implemented yet)

  func play(startFrame: Double, endFrame: Double) throws {
    // Lands with the ref in a later change.
  }

  func reset() throws {}
  func pause() throws {}
  func resume() throws {}
}
