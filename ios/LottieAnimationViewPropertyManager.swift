//
//  LottieAnimationViewPropertyManager.swift
//  Pods
//
//  Created by Parsa's Content Creation Corner on 2025-04-06.
//

import Lottie

class LottieAnimationViewPropertyManager {
  private weak var viewWeakReference: LottieAnimationView?
  private var onFailure: ((String) -> Void)?
  
  var loop: Bool? = nil
  var autoPlay: Bool? = nil
  var animationName: String? = nil
  var animationJSONString: String? = nil
  var animationURLString: String? = nil
  var animationDotLottie: String? = nil
  
  init(_ viewWeakReference: LottieAnimationView?,_ onFailure: ((String) -> Void)?) {
    self.viewWeakReference = viewWeakReference
    self.onFailure = onFailure
  }
  
  func commitChanges() {
    guard let view = viewWeakReference else { return }
    
    if let currentAnimationJSONString = animationJSONString {
      guard let data = currentAnimationJSONString.data(using: .utf8), let animation = try? JSONDecoder().decode(LottieAnimation.self, from: data) else {
        onFailure?("Unable to create the lottie animation object from the JSON source")
        return
      }
      view.animation = animation
      animationJSONString = nil
    }
    
    if let currentAnimationName = animationName {
      guard let animation = LottieAnimation.named(currentAnimationName) else {
        onFailure?("Unable to find the lottie animation named: \(currentAnimationName)")
        return
      }
      view.animation = animation
      animationName = nil
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
  }
}
