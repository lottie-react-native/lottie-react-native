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
  
  var imageAssetsFolder: String? // NOOP
  
  var progress: Double? {
    get { nil }
    set {
      if let progress = newValue {
        propertyManager.progress = CGFloat(progress)
      } else {
        propertyManager.progress = nil
      }
    }
  }
  
  var speed: Double? {
    get { nil }
    set {
      if let speed = newValue {
        propertyManager.speed = CGFloat(speed)
      } else {
        propertyManager.speed = 1
      }
    }
  }
  
  var loop: Bool? {
    get { nil }
    set {
      if let newValue {
        propertyManager.loop = newValue ? .loop : .playOnce
        commandManager.loop = newValue ? .loop : .playOnce
      } else {
        propertyManager.loop = .playOnce
        commandManager.loop = .playOnce
      }
    }
  }
  
  var autoPlay: Bool? {
    get { nil }
    set {
      propertyManager.autoPlay = newValue
    }
  }
  
  var enableMergePathsAndroidForKitKatAndAbove: Bool? // NOOP
  
  var enableSafeModeAndroid: Bool? // NOOP
  
  var hardwareAccelerationAndroid: Bool? // NOOP
  
  var cacheComposition: Bool? // NOOP
  
  var colorFilters: [ColorFilterStruct]? {
    get { nil }
    set {
      propertyManager.colorFilters = newValue
    }
  }
  
  var textFiltersAndroid: [TextFilterAndroidStruct]? // NOOP
  
  var textFiltersIOS: [TextFilterIOSStruct]? {
    get { nil }
    set {
      propertyManager.textFilters = newValue
    }
  }
  
  var onAnimationLoaded: (() -> Void)? {
    get { nil }
    set {
      guard let view = view as? LottieAnimationView else { return }
      view.animationLoaded = { [weak self] _, _ in
        guard let self else { return }
        newValue?()
      }
    }
  }
  
  var onAnimationFailure: ((String) -> Void)?
  
  var onAnimationFinish: ((Bool) -> Void)?
  
  // Methods
  func play(startFrame: Double, endFrame: Double) throws {
    commandManager.play(startFrame: startFrame, endFrame: endFrame)
  }
  
  func reset() throws {
    commandManager.reset()
  }
  
  func pause() throws {
    commandManager.pause()
  }
  
  func resume() throws {
    commandManager.resume()
  }
  
  // View
  var view: UIView = LottieAnimationView()
  
  private lazy var propertyManager: LottieAnimationViewPropertyManager = {
    return LottieAnimationViewPropertyManager(view as? LottieAnimationView, onAnimationFailure, onAnimationFinish)
  }()
  
  private lazy var commandManager: LottieAnimationViewCommandManager = {
    return LottieAnimationViewCommandManager(viewWeakReference: view as? LottieAnimationView, onAnimationFinish)
  }()
  
  func afterUpdate() {
    propertyManager.commitChanges()
  }
}
