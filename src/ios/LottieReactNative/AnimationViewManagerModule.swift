#if canImport(React)
import React
#endif

import Lottie

@objc(LottieAnimationView)
class AnimationViewManagerModule: RCTViewManager {
    
    override func view() -> UIView! {
        return ContainerView()
    }
    
    @objc
    override func constantsToExport() -> [AnyHashable : Any]! {
        return ["VERSION": 1]
    }
    
    
    @objc(play:fromFrame:toFrame:)
    public func play(_ reactTag: NSNumber, startFrame: NSNumber, endFrame:NSNumber) {
        
        self.bridge.uiManager.addUIBlock { (uiManager, viewRegistry) in
            guard let view = viewRegistry?[reactTag] else {
               return
            }
            
            if (!view.isKind(of: ContainerView.self)) {
                // log error
                // TODO preprocessor macros are not available in Swift. Need to find a way to log eror they React native does with RCTLogError until then loggig to the console in debug mode
                if (RCT_DEV == 1) {
                     print("Invalid view returned from registry, expecting ContainerView")
                }

            } else {
                let lottieView = view as! ContainerView
                let callback: LottieCompletionBlock = { animationFinished in
                    if ((lottieView.onAnimationFinish) != nil) {
                        lottieView.onAnimationFinish!(["isCancelled":animationFinished])
                    }
                }
                
                if ( startFrame.intValue != -1 && endFrame.intValue != -1) {
                    lottieView.play(fromFrame: AnimationFrameTime(truncating: startFrame), toFrame: AnimationFrameTime(truncating: endFrame), completion: callback)
                } else {
                    lottieView.play(completion: callback)
                }
            }
        }      
    }
    
    @objc(reset:)
    public func reset(_ reactTag: NSNumber) {
        self.bridge.uiManager.addUIBlock { (uiManager, viewRegistry) in
            guard let view = viewRegistry?[reactTag] else {
                if (RCT_DEV == 1) {
                    print("Invalid view returned from registry, expecting ContainerView")
                }
                return
            }
            
            if (!view.isKind(of: ContainerView.self)) {
                // log error
            } else {
                let lottieView = view as! ContainerView
                lottieView.reset()
            }
        }
    }
    
    override static func requiresMainQueueSetup() -> Bool {
        return true
    }
    
}
