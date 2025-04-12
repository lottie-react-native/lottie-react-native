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
  
  var loop: Bool? = nil
  var autoPlay: Bool? = nil
  var animationName: String? = nil
  var animationJSONString: String? = nil
  var animationURLString: String? = nil
  var animationDotLottie: String? = nil
  var contentMode: UIView.ContentMode? = nil
  var renderMode: RenderingEngineOption? = nil
  var progress: AnimationProgressTime? = nil
  var speed: CGFloat? = nil
  
  init(_ viewWeakReference: LottieAnimationView?,_ onFailure: ((String) -> Void)?) {
    self.viewWeakReference = viewWeakReference
    self.onFailure = onFailure
  }
  
  func commitChanges() {
    guard let view = viewWeakReference else { return }
    
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
      view.loopMode = currentLoop ? .loop : .playOnce
      loop = nil
    }
    
    if let autoPlay {
      if autoPlay && !view.isAnimationPlaying {
        view.play()
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
      renderMode = nil
    }
  }
}
