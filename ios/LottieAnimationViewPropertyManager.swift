//
//  LottieAnimationViewPropertyManager.swift
//  Pods
//
//  Created by Parsa's Content Creation Corner on 2025-04-06.
//

import Lottie

class LottieAnimationViewPropertyManager {
  private weak var viewWeakReference: LottieAnimationView?
  
  var loop: Bool? = nil
  var autoPlay: Bool? = nil
  
  init(_ viewWeakReference: LottieAnimationView?) {
    self.viewWeakReference = viewWeakReference
  }
  
  func commitChanges() {
    guard let view = viewWeakReference else { return }
    
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
