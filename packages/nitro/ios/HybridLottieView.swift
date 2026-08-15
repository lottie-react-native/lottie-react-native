import Lottie
import NitroModules
import UIKit

class HybridLottieView: HybridLottieViewSpec {
  private let animationView = LottieAnimationView(frame: .zero)

  var view: UIView { animationView }

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

  private struct ColorFilterSnapshot: Hashable {
    let keypath: String

    let colorBits: UInt64

    var color: Double { Double(bitPattern: colorBits) }

    init(keypath: String, color: Double) {
      self.keypath = keypath
      self.colorBits = color.bitPattern
    }
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

  private var loadGeneration: UInt64 = 0
  private var inFlightLoad: URLSessionDataTask?

  private var suppressFinishDepth = 0
  private var playbackEpoch: UInt64 = 0

  private var sourceJustChanged = false

  override init() {
    super.init()
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

      appliedCacheComposition = cacheComposition ?? true

      applyImageProvider()
      applyTextProvider()

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
        applyCompositionDependent()
      }

      appliedDidApplyOnce = true
      sourceJustChanged = false
    }
  }

  func onDropView() {
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

  private func pendingSource() -> SourceKind? {
    if let s = sourceJson, !s.isEmpty { return .json(s) }
    if let s = sourceName, !s.isEmpty { return .name(s) }
    if let s = sourceDotLottieURI, !s.isEmpty { return .dotLottie(s) }
    if let s = sourceURL, !s.isEmpty { return .url(s) }
    return nil
  }

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
        emitFailure("Unable to find the lottie animation named \"\(name)\" in the main bundle")
        return
      }
      animationView.animation = animation

    case .url(let raw):
      guard let url = resolveURL(raw) else {
        emitFailure("Invalid Lottie animation URL: \(raw)")
        return
      }
      animationView.animation = nil
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

  private func applyCompositionDependent() {
    guard animationView.animation != nil else { return }
    withFinishSuppressed {
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
    appliedAutoPlay = wantsPlay
  }

  private func reconcileColorFilters() {
    let next = (colorFilters ?? []).map {
      ColorFilterSnapshot(keypath: $0.keypath, color: $0.color)
    }
    guard next != appliedColorFilters || sourceJustChanged || !appliedDidApplyOnce else { return }

    var desired: [AnimationKeypath: UIColor] = [:]
    for filter in next {
      guard let color = Self.colorFromARGB(filter.color) else {
        emitFailure(
          "Unresolvable colorFilters color for keypath \"\(filter.keypath)\""
        )
        continue
      }
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

  private static func colorFromARGB(_ value: Double) -> UIColor? {
    guard value >= -2_147_483_648, value <= 4_294_967_295 else { return nil }
    let argb = UInt32(truncatingIfNeeded: Int64(value))
    return UIColor(
      red: CGFloat((argb >> 16) & 0xFF) / 255,
      green: CGFloat((argb >> 8) & 0xFF) / 255,
      blue: CGFloat(argb & 0xFF) / 255,
      alpha: CGFloat((argb >> 24) & 0xFF) / 255
    )
  }

  private func makeFinishCompletion() -> LottieCompletionBlock {
    playbackEpoch &+= 1
    let epoch = playbackEpoch
    return { [weak self] finished in
      guard let self,
            epoch == self.playbackEpoch,
            self.suppressFinishDepth == 0 else { return }
      self.playbackEpoch &+= 1
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

  private func pendingTextFilters() -> [String: String] {
    Dictionary(
      (textFiltersIOS ?? []).map { ($0.keypath, $0.text) },
      uniquingKeysWith: { _, last in last }
    )
  }

  func play(startFrame: Double, endFrame: Double) throws {
  }

  func reset() throws {}
  func pause() throws {}
  func resume() throws {}
}
