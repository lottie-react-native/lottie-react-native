//
//  LottieAnimationViewCommandManager.swift
//  Pods
//
//  Created by Parsa's Content Creation Corner on 2025-04-12.
//
import Lottie

class LottieAnimationViewCommandManager {
  private weak var viewWeakReference: LottieAnimationView?
  private var onFinish: ((Bool) -> Void)?
  
  var loop: LottieLoopMode? = nil
  
  
  init(viewWeakReference: LottieAnimationView?, _ onFinish: ((Bool) -> Void)?) {
    self.viewWeakReference = viewWeakReference
    self.onFinish = onFinish
  }
  
  func play(startFrame: AnimationFrameTime, endFrame: AnimationFrameTime) {
    DispatchQueue.main.async { [weak self, weak viewWeakReference] in
      guard let self else { return }
      guard let view = viewWeakReference else { return }
      view.play(fromFrame: startFrame, toFrame: endFrame, loopMode: self.loop ?? .playOnce, completion: onFinish)
    }
  }
  
  func reset() {
    DispatchQueue.main.async { [weak viewWeakReference] in
      guard let view = viewWeakReference else { return }
      view.currentProgress = 0
      view.pause()
    }
  }
  
  func pause() {
    DispatchQueue.main.async { [weak viewWeakReference] in
      guard let view = viewWeakReference else { return }
      view.pause()
    }
  }
  
  func resume() {
    DispatchQueue.main.async { [weak viewWeakReference, weak self] in
      guard let self else { return }
      guard let view = viewWeakReference else { return }
      view.play(completion: onFinish)
    }
  }
}
