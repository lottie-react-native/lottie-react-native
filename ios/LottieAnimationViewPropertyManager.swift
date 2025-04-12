//
//  LottieAnimationViewPropertyManager.swift
//  Pods
//
//  Created by Parsa's Content Creation Corner on 2025-04-06.
//

import Lottie
import UIKit

class LottieAnimationViewPropertyManager {
  private weak var viewWeakReference: LottieAnimationView?
  private var onFailure: ((String) -> Void)?
  private var onFinish: ((Bool) -> Void)?
  
  var loop: LottieLoopMode? = nil
  var autoPlay: Bool? = nil
  var animationName: String? = nil
  var animationJSONString: String? = nil
  var animationURLString: String? = nil
  var animationDotLottie: String? = nil
  var contentMode: UIView.ContentMode? = nil
  var renderMode: RenderingEngineOption? = nil
  var progress: AnimationProgressTime? = nil
  var speed: CGFloat? = nil
  var colorFilters: [ColorFilterStruct]? = nil
  var textFilters: [TextFilterIOSStruct]? = nil
  
  init(_ viewWeakReference: LottieAnimationView?,_ onFailure: ((String) -> Void)?, _ onFinish: ((Bool) -> Void)?) {
    self.viewWeakReference = viewWeakReference
    self.onFailure = onFailure
    self.onFinish = onFinish
  }
  
  func commitChanges() {
    guard let view = viewWeakReference else { return }
    
    if let currentTextFilters = textFilters {
      var filters = [String: String]()
      for filter in currentTextFilters {
        filters[filter.keypath] = filter.text
      }

      view.textProvider = DictionaryTextProvider(filters)
    }
    
    if let currentAnimationJSONString = animationJSONString {
      defer { animationJSONString = nil }
      guard let data = currentAnimationJSONString.data(using: .utf8), let animation = try? JSONDecoder().decode(LottieAnimation.self, from: data) else {
        onFailure?("Unable to create the lottie animation object from the JSON source")
        return
      }
      view.animation = animation
    }
    
    if let currentAnimationURLString = animationURLString {
      defer { animationURLString = nil }
      var url = URL(string: currentAnimationURLString)
      
      if url?.scheme == nil {
        url = URL(fileURLWithPath: currentAnimationURLString, relativeTo: Bundle.main.resourceURL)
      }
      
      guard let url else {
        onFailure?("Unable to create a valid URL from the string: \(currentAnimationURLString)")
        return
      }
      Task {
        guard let animation = await LottieAnimation.loadedFrom(url: url) else {
          onFailure?("Unable to load the lottie animation from the URL: \(url)")
          return
        }
        await MainActor.run {
          view.animation = animation
        }
      }
    }
    
    if let currentAnimationDotLottie = animationDotLottie {
      defer { animationDotLottie = nil }
      guard let url = URL(string: currentAnimationDotLottie) else {
        onFailure?("Unable to create a valid URL from the string: \(currentAnimationDotLottie)")
        return
      }
      
      Task {
        guard let animation = await LottieAnimation.loadedFrom(url: url) else {
          onFailure?("Unable to load the dotlottie animation from the URL: \(url)")
          return
        }
        await MainActor.run {
          view.animation = animation
        }
      }
    }
    
    if let currentAnimationName = animationName {
      defer { animationName = nil }
      guard let animation = LottieAnimation.named(currentAnimationName) else {
        onFailure?("Unable to find the lottie animation named: \(currentAnimationName)")
        return
      }
      view.animation = animation
    }
    if let currentProgress = progress {
      view.currentProgress = currentProgress
      progress = nil
    }
    
    if let currentLoop = loop {
      view.loopMode = currentLoop
      loop = nil
    }
    
    if let autoPlay {
      if autoPlay && !view.isAnimationPlaying {
        view.play(completion: onFinish)
      }
    }
    
    if let currentSpeed = speed {
      view.animationSpeed = currentSpeed
      speed = nil
    }
    
    if let currentScaleType = contentMode {
      view.contentMode = currentScaleType
      contentMode = nil
    }
    
    if let currentRenderMode = renderMode {
      view.configuration.renderingEngine = currentRenderMode
      view.play(completion: onFinish) // When you change render mode, it stops the animation.
      renderMode = nil
    }
    
    if let currentColorFilters = colorFilters {
      for filter in currentColorFilters {
        let key = filter.keypath
        guard let platformColor = UIColor(hexString: key) else { break }
        let keypath: String = "\(key).**.Color"
        let fillKeypath = AnimationKeypath(keypath: keypath)
        let colorFilterValueProvider = ColorValueProvider(platformColor.lottieColorValue)
        view.setValueProvider(colorFilterValueProvider, keypath: fillKeypath)
      }
      colorFilters = nil
    }
  }
}
