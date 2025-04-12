import Lottie

class HybridLottieAnimationView: HybridLottieAnimationViewSpec {
  // Props
  var sourceName: String? {
    get { nil }
    set {
      guard let newValue else { return }
      let animationView = LottieAnimationView(
        name: newValue,
        configuration: lottieConfiguration
      )
      replaceAnimationView(next: animationView)
    }
  }
  
  var sourceJson: String? {
    get { nil }
    set {
      guard let newValue else { return }
      guard let data = newValue.data(using: .utf8), let animation = try? JSONDecoder().decode(LottieAnimation.self, from: data) else {
        onAnimationFailure?("Unable to create the lottie animation object from the JSON source")
        return
      }
      let animationView = LottieAnimationView(
        animation: animation,
        configuration: lottieConfiguration
      )
      replaceAnimationView(next: animationView)
    }
  }
  
  var sourceURL: String?
  
  var sourceDotLottieURI: String?
  
  var resizeMode: ResizeMode = .notSet
  
  var renderMode: RenderMode {
    get { .notSet }
    set {
      switch newValue {
      case .software:
        if (_internalRenderMode == .mainThread) {
          return
        }
        _internalRenderMode = .mainThread
      case .hardware:
        if (_internalRenderMode == .coreAnimation) {
          return
        }
        _internalRenderMode = .coreAnimation
      default:
        if (_internalRenderMode == .automatic) {
          return
        }
        _internalRenderMode = .automatic
      }
      guard let oldAnimationView = view as? LottieAnimationView else { return }
      let animationView = LottieAnimationView(
        animation: oldAnimationView.animation,
        configuration: lottieConfiguration
      )
      replaceAnimationView(next: animationView)
    }
  }
  
  var imageAssetsFolder: String?
  
  var progress: Double?
  
  var speed: Double?
  
  var loop: Bool? {
    get { nil }
    set {
      propertyManager.loop = newValue
    }
  }
  
  var autoPlay: Bool? {
    get { nil }
    set {
      propertyManager.autoPlay = newValue
    }
  }
  
  var enableMergePathsAndroidForKitKatAndAbove: Bool?
  
  var enableSafeModeAndroid: Bool?
  
  var hardwareAccelerationAndroid: Bool?
  
  var cacheComposition: Bool?
  
  var colorFilters: [ColorFilterStruct]?
  
  var textFiltersAndroid: [TextFilterAndroidStruct]?
  
  var textFiltersIOS: [TextFilterIOSStruct]?
  
  var onAnimationLoaded: (() -> Void)?
  
  var onAnimationFailure: ((String) -> Void)?
  
  var onAnimationFinish: ((Bool) -> Void)?
  
  // Methods
  // MARK: Since these are grabbed by ref, it is possible for these NOT to be on the UI thread, be careful when calling these to only touch UI stuff after doing a Dispatch.main.async
  func play(startFrame: Double, endFrame: Double) throws {
    
  }
  func reset() throws {
    
  }
  
  func pause() throws {
    
  }
  
  func resume() throws {
    
  }
  
  // View
  var view: UIView = LottieAnimationView()
  
  private var _internalRenderMode: RenderingEngineOption = .automatic
  
  private lazy var propertyManager: LottieAnimationViewPropertyManager = {
    return LottieAnimationViewPropertyManager(view as? LottieAnimationView)
  }()
  
  private var lottieConfiguration: LottieConfiguration {
    LottieConfiguration(
      renderingEngine: _internalRenderMode
    )
  }
  
  private func replaceAnimationView(next: LottieAnimationView) {
    guard var view = view as? LottieAnimationView else { return }
    // TODO: this probably breaks propertManager since the reference changed. Figure out how to get rid of this function, or have a method on property manager for updating the weak reference
    view = next

    view.backgroundBehavior = .pauseAndRestore
//    view.animationSpeed = speed
//    view.loopMode = loop
//    view.currentProgress = progress
//
//    applyContentMode()
//    applyColorProperties()
//    playIfNeeded()

    view.animationLoaded = { [weak self] _, _ in
      guard let self else { return }
      self.onAnimationLoaded?()
    }
  }
  
  func afterUpdate() {
    propertyManager.commitChanges()
  }
}
