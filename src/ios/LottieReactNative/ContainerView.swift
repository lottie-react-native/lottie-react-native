#if canImport(React)
import React
#endif

import Lottie

class ContainerView:RCTView {
    
    private var speed:CGFloat = 0.0
    private var progress:CGFloat = 0.0
    private var loop:LottieLoopMode = .playOnce
    private var sourceJson:String = ""
    private var resizeMode:String = ""
    private var sourceName:String = ""
    @objc var onAnimationFinish:RCTBubblingEventBlock?
    var animationView:AnimationView?

    
    @objc func setSpeed(_ speed: CGFloat) {
        self.speed = speed
    }
    
    @objc func setProgress(_ progress: CGFloat) {
        self.progress = progress
        if (self.animationView != nil) {
            self.animationView?.currentProgress =  progress;
        }
    }
    
    override func reactSetFrame(_ frame: CGRect) {
        super.reactSetFrame(frame)
        if (self.animationView != nil) {
            self.animationView?.reactSetFrame(frame);
        }
    }
    
    @objc func setLoop(_ loop: Bool) {
        if (loop) {
            self.loop = .loop
        } else {
            self.loop = .playOnce
        }
        
        if (self.animationView != nil) {
            self.animationView?.loopMode =  self.loop;
        }
    }
    
    @objc func setSourceJson(_ sourceJson: String) {
        self.sourceJson = sourceJson
        let starAnimationView = AnimationView()
        guard let data: Data = sourceJson.data(using: String.Encoding.utf8) else {
            if (RCT_DEV == 1) {
                print("Unable to create Data from the json string")
            }
            return
        }
        
        do {
            let animation = try JSONDecoder().decode(Animation.self, from: data)
            starAnimationView.animation = animation
            self.replaceAnimationView(next: starAnimationView)
        } catch {
            if (RCT_DEV == 1) {
                print("Unable to create the lottie animation obeject from the JSON source")
            }
        }
    }
    
    @objc func setSourceName(_ sourceName: String) {
        self.sourceName = sourceName
    }
    
    @objc func setResizeMode(_ resizeMode: String) {
        if ( resizeMode == "cover" ) {
            animationView?.contentMode = .scaleAspectFill
        } else if ( resizeMode == "contain" ) {
            animationView?.contentMode = .scaleAspectFit
        } else if ( resizeMode == "center" ) {
            animationView?.contentMode = .center
        }
    }
    
    
    func play(fromFrame: AnimationFrameTime? = nil,
                     toFrame: AnimationFrameTime,
                     completion: LottieCompletionBlock? = nil) {
        if (self.animationView != nil) {
            self.animationView?.play(fromFrame: fromFrame, toFrame: toFrame, loopMode: self.loop, completion: completion);
        }
    }
    
    func play( completion: LottieCompletionBlock? = nil) {
        if (self.animationView != nil) {
             if (completion != nil) {
                self.animationView?.play(completion: completion);
             } else {
                 self.animationView?.play()
            }
        }
    }
    
    func play() {
        if (self.animationView != nil) {
           self.animationView?.play()
        }
    }
    
    func reset() {
        if (self.animationView != nil) {
            self.animationView?.currentProgress = 0;
            self.animationView?.pause()
        }
    }
    
    // MARK: Private
    
    func replaceAnimationView(next:AnimationView) {
        var contentMode:UIView.ContentMode = .scaleAspectFit
        if (self.animationView != nil) {
            contentMode = self.animationView?.contentMode ?? .scaleAspectFit
            self.animationView?.removeFromSuperview()
        }
        
        self.animationView = next
        self.addSubview(next)
        self.animationView?.contentMode = contentMode
        self.animationView?.reactSetFrame(self.frame)
        self.applyProperties()
    }
    
    func applyProperties() {
        self.animationView?.currentProgress = self.progress;
        self.animationView?.animationSpeed = self.speed;
        self.animationView?.loopMode = self.loop;
    }
}
