class HybridLottieAnimationView: HybridLottieAnimationViewSpec {
  // Props
  var sourceName: String?
  
  var sourceJson: String?
  
  var sourceURL: String?
  
  var sourceDotLottieURI: String?
  
  var resizeMode: String?
  
  var renderMode: String?
  
  var imageAssetsFolder: String?
  
  var progress: Double?
  
  var speed: Double?
  
  var loop: Bool?
  
  var autoPlay: Bool?
  
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
  func play(startFrame: Double, endFrame: Double) throws {
    
  }
  func reset() throws {
    
  }
  
  func pause() throws {
    
  }
  
  func resume() throws {
    
  }
  
  // View
  var view: UIView = UIView()
  
}
