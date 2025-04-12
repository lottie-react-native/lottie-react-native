import Lottie

class HybridLottieAnimationView: HybridLottieAnimationViewSpec {
  // Props
  var sourceName: String? {
    get { nil }
    set {
      propertyManager.animationName = newValue
    }
  }
  
  var sourceJson: String? {
    get { nil }
    set {
      propertyManager.animationJSONString = newValue
    }
  }
  
  var sourceURL: String? {
    get { nil }
    set {
      propertyManager.animationURLString = newValue
    }
  }
  
  var sourceDotLottieURI: String? {
    get { nil }
    set {
      propertyManager.animationDotLottie = newValue
    }
  }
  
  var resizeMode: ResizeMode {
    get { .notSet }
    set {
      switch newValue {
      case .cover:
        propertyManager.contentMode = .scaleAspectFill
      case .contain:
        propertyManager.contentMode = .scaleAspectFit
      case .center:
        propertyManager.contentMode = .center
      case .notSet:
        propertyManager.contentMode = nil
      }
    }
  }
  
  var renderMode: RenderMode {
    get { .notSet }
    set {
      switch newValue {
      case .automatic:
        propertyManager.renderMode = .automatic
      case .hardware:
        propertyManager.renderMode = .coreAnimation
      case .software:
        propertyManager.renderMode = .mainThread
      case .notSet:
        propertyManager.renderMode = nil
      }
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
  
  private lazy var propertyManager: LottieAnimationViewPropertyManager = {
    return LottieAnimationViewPropertyManager(view as? LottieAnimationView, onAnimationFailure)
  }()
  
//  private func replaceAnimationView(next: LottieAnimationView) {
//    guard var view = view as? LottieAnimationView else { return }
//    // TODO: this probably breaks propertManager since the reference changed. Figure out how to get rid of this function, or have a method on property manager for updating the weak reference
//    view = next
//
//    view.backgroundBehavior = .pauseAndRestore
//    view.animationSpeed = speed
//    view.loopMode = loop
//    view.currentProgress = progress
//
//    applyContentMode()
//    applyColorProperties()
//    playIfNeeded()

//    view.animationLoaded = { [weak self] _, _ in
//      guard let self else { return }
//      self.onAnimationLoaded?()
//    }
//  }
  
  func afterUpdate() {
    propertyManager.commitChanges()
  }
}
