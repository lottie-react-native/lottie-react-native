import Lottie
import Foundation

@objc protocol LottieContainerViewDelegate {
    func onAnimationFinish(isCancelled: Bool);
}

@objc(LottieContainerView)
class ContainerView: RCTView {
    private var speed: CGFloat = 0.0
    private var progress: CGFloat = 0.0
    private var loop: LottieLoopMode = .playOnce
    private var sourceJson: String = ""
    private var resizeMode: String = ""
    private var sourceName: String = ""
    private var colorFilters: [NSDictionary] = []
    private var textFilters: [NSDictionary] = []
    private var renderMode: RenderingEngineOption = .automatic
    @objc weak var delegate: LottieContainerViewDelegate? = nil

    @objc var onAnimationFinish: RCTBubblingEventBlock?
    var animationView: LottieAnimationView?
    
    override func traitCollectionDidChange(_ previousTraitCollection: UITraitCollection?) {
        super.traitCollectionDidChange(previousTraitCollection)
        if #available(iOS 13.0, tvOS 13.0, *) {
            if (self.traitCollection.hasDifferentColorAppearance(comparedTo: previousTraitCollection)) {
                applyColorProperties()
                print("dark mode changed")
            }
        }
    }

    @objc func setSpeed(_ newSpeed: CGFloat) {
        speed = newSpeed

        if (newSpeed != 0.0) {
            animationView?.animationSpeed = newSpeed
            if (!(animationView?.isAnimationPlaying ?? true)) {
                animationView?.play()
            }
        } else if (animationView?.isAnimationPlaying ?? false) {
            animationView?.pause()
        }
    }

    @objc func setProgress(_ newProgress: CGFloat) {
        progress = newProgress
        animationView?.currentProgress = progress
    }

    override func reactSetFrame(_ frame: CGRect) {
        super.reactSetFrame(frame)
        animationView?.reactSetFrame(frame)
    }

    @objc func setLoop(_ isLooping: Bool) {
        loop = isLooping ? .loop : .playOnce
        animationView?.loopMode = loop
    }
    
    @objc func setTextFiltersIOS(_ newTextFilters: [NSDictionary]) {
        textFilters = newTextFilters
        
        if (textFilters.count > 0) {
            var filters = [String:String]()
            for filter in textFilters {
                let key = filter.value(forKey: "keypath") as! String
                let value = filter.value(forKey: "text") as! String
                filters[key] = value;
            }
            
            let starAnimationView = LottieAnimationView()
            starAnimationView.textProvider = DictionaryTextProvider(filters)
            starAnimationView.animation = animationView?.animation
            replaceAnimationView(next: starAnimationView)
        }
    }

    func getLottieConfiguration() -> LottieConfiguration {
        return LottieConfiguration(
            renderingEngine: renderMode
        )
    }
       
    @objc func setRenderMode(_ newRenderMode: String) {
        switch newRenderMode {
        case "SOFTWARE":
            if (renderMode == .mainThread) {
                return
            }
            renderMode = .mainThread
        case "HARDWARE":
            if (renderMode == .coreAnimation) {
                return
            }
            renderMode = .coreAnimation
        case "AUTOMATIC":
            fallthrough
        default:
            if (renderMode == .automatic) {
                return
            }
            renderMode = .automatic
        }
        if (animationView != nil) {
            let starAnimationView = LottieAnimationView(
                animation: animationView?.animation,
                configuration: getLottieConfiguration()
            )
            replaceAnimationView(next: starAnimationView)
        }
    }

    @objc func setSourceURL(_ newSourceURLString: String) {
        var url = URL(string: newSourceURLString)
        
        if(url?.scheme == nil) {
            // interpret raw URL paths as relative to the resource bundle
            url = URL(fileURLWithPath: newSourceURLString, relativeTo: Bundle.main.resourceURL)
        }
    
        if(url != nil) {
            DispatchQueue.global(qos: .default).async {
                do {
                    let sourceJson = try String(contentsOf: url!)
                    guard let data = sourceJson.data(using: String.Encoding.utf8),
                    let animation = try? JSONDecoder().decode(LottieAnimation.self, from: data) else {
                        if (RCT_DEBUG == 1) {
                            print("Unable to decode the lottie animation object from the fetched URL source")
                        }
                        return
                    }

                    DispatchQueue.main.async {
                        let starAnimationView = LottieAnimationView(
                            animation: animation,
                            configuration: self.getLottieConfiguration()
                        )
                        self.replaceAnimationView(next: starAnimationView)
                        self.animationView?.play()
                    }
                } catch {
                    if (RCT_DEBUG == 1) {
                        print("Unable to load the lottie animation URL")
                    }
                }
            }
        }
    }

    @objc func setSourceJson(_ newSourceJson: String) {
        sourceJson = newSourceJson

        guard let data = sourceJson.data(using: String.Encoding.utf8),
        let animation = try? JSONDecoder().decode(LottieAnimation.self, from: data) else {
            if (RCT_DEBUG == 1) {
                print("Unable to create the lottie animation object from the JSON source")
            }
            return
        }

        let starAnimationView = LottieAnimationView(
            animation: animation,
            configuration: getLottieConfiguration()
        )
        replaceAnimationView(next: starAnimationView)
    }

    @objc func setSourceName(_ newSourceName: String) {
        if (newSourceName == sourceName) {
          return
        }
        sourceName = newSourceName

        let starAnimationView = LottieAnimationView(
            name: sourceName,
            configuration: getLottieConfiguration()
        )
        replaceAnimationView(next: starAnimationView)
    }

    @objc func setResizeMode(_ resizeMode: String) {
        switch (resizeMode) {
        case "cover":
            animationView?.contentMode = .scaleAspectFill
        case "contain":
            animationView?.contentMode = .scaleAspectFit
        case "center":
            animationView?.contentMode = .center
        default: break
        }
    }

    @objc func setColorFilters(_ newColorFilters: [NSDictionary]) {
        colorFilters = newColorFilters
        applyColorProperties()
    }

    // There is no Nullable CGFloat in Objective-C, so this function uses a Nullable NSNumber and converts it later
    @objc(playFromFrame:toFrame:)
    func objcCompatiblePlay(fromFrame: NSNumber? = nil, toFrame: AnimationFrameTime) {
        let convertedFromFrame = fromFrame != nil ? CGFloat(truncating: fromFrame!) : nil;
        play(fromFrame: convertedFromFrame, toFrame: toFrame);
    }
    
    func getCompletionCallback() -> LottieCompletionBlock {
        return { animationFinished in
            if let onFinish = self.onAnimationFinish {
                onFinish(["isCancelled": !animationFinished])
            }
            self.delegate?.onAnimationFinish(isCancelled: !animationFinished);
            if (animationFinished) {
                // Force the animation to stay on the last frame when the animation ends
                self.animationView?.currentProgress = 1;
            }
        };
    }
    
    func play(fromFrame: AnimationFrameTime? = nil, toFrame: AnimationFrameTime) {
        animationView?.play(fromFrame: fromFrame, toFrame: toFrame, loopMode: self.loop, completion: getCompletionCallback());
    }

    @objc func play() {
        animationView?.play(completion: getCompletionCallback())
    }

    @objc func reset() {
        animationView?.currentProgress = 0;
        animationView?.pause()
    }

    @objc func pause() {
        animationView?.pause()
    }

    @objc func resume() {
        play()
    }

    // reset the animationView frame whenever the view's frame changes
    override var frame: CGRect {
        didSet {
            animationView?.reactSetFrame(frame)
        }
    }
    
    // MARK: Private
    func replaceAnimationView(next: LottieAnimationView) {
        animationView?.removeFromSuperview()

        let contentMode = animationView?.contentMode ?? .scaleAspectFit
        animationView = next
        addSubview(next)
        animationView?.contentMode = contentMode
        animationView?.reactSetFrame(frame)
        animationView?.backgroundBehavior = .pauseAndRestore
        animationView?.animationSpeed = speed
        animationView?.loopMode = loop
        applyColorProperties()
    }
    
    func applyColorProperties() {
        guard let animationView = animationView else { return }

        if (colorFilters.count > 0) {
            for filter in colorFilters {
                let keypath: String = "\(filter.value(forKey: "keypath") as! String).**.Color"
                let fillKeypath = AnimationKeypath(keypath: keypath)
                let colorFilterValueProvider = ColorValueProvider((filter.value(forKey: "color") as! PlatformColor).lottieColorValue)
                animationView.setValueProvider(colorFilterValueProvider, keypath: fillKeypath)
            }
        }
    }
}
