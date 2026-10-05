package com.airbnb.android.react.lottie

import android.animation.Animator
import com.airbnb.android.react.lottie.LottieAnimationViewManagerImpl.setApplyOpacityToLayers
import com.airbnb.android.react.lottie.LottieAnimationViewManagerImpl.setColorFilters
import com.airbnb.android.react.lottie.LottieAnimationViewManagerImpl.setEnableMergePaths
import com.airbnb.android.react.lottie.LottieAnimationViewManagerImpl.setEnableSafeMode
import com.airbnb.android.react.lottie.LottieAnimationViewManagerImpl.setHardwareAcceleration
import com.airbnb.android.react.lottie.LottieAnimationViewManagerImpl.setImageAssetsFolder
import com.airbnb.android.react.lottie.LottieAnimationViewManagerImpl.setLoop
import com.airbnb.android.react.lottie.LottieAnimationViewManagerImpl.setProgress
import com.airbnb.android.react.lottie.LottieAnimationViewManagerImpl.setRenderMode
import com.airbnb.android.react.lottie.LottieAnimationViewManagerImpl.setResizeMode
import com.airbnb.android.react.lottie.LottieAnimationViewManagerImpl.setSourceJson
import com.airbnb.android.react.lottie.LottieAnimationViewManagerImpl.setSourceName
import com.airbnb.android.react.lottie.LottieAnimationViewManagerImpl.setSourceURL
import com.airbnb.android.react.lottie.LottieAnimationViewManagerImpl.setSpeed
import com.airbnb.android.react.lottie.LottieAnimationViewManagerImpl.setTextFilters
import com.airbnb.android.react.lottie.LottieAnimationViewManagerImpl.setAutoPlay
import com.airbnb.android.react.lottie.LottieAnimationViewManagerImpl.setSourceDotLottieURI
import com.facebook.react.bridge.ReadableArray
import com.facebook.react.bridge.ReadableMap
import com.facebook.react.module.annotations.ReactModule
import com.facebook.react.uimanager.PointerEvents
import com.facebook.react.uimanager.SimpleViewManager
import com.facebook.react.uimanager.ThemedReactContext
import com.facebook.react.uimanager.ViewManagerDelegate
import com.facebook.react.uimanager.annotations.ReactProp
import com.facebook.react.viewmanagers.LottieAnimationViewManagerDelegate
import com.facebook.react.viewmanagers.LottieAnimationViewManagerInterface
import java.util.*

@ReactModule(name = LottieAnimationViewManagerImpl.REACT_CLASS)
class LottieAnimationViewManager :
    SimpleViewManager<ReactLottieAnimationView>(),
    LottieAnimationViewManagerInterface<ReactLottieAnimationView> {
    private val propManagersMap =
        WeakHashMap<ReactLottieAnimationView, LottieAnimationViewPropertyManager>()
    private val delegate: ViewManagerDelegate<ReactLottieAnimationView>

    init {
        delegate = LottieAnimationViewManagerDelegate(this)
    }

    private fun getOrCreatePropertyManager(view: ReactLottieAnimationView): LottieAnimationViewPropertyManager {
        var result = propManagersMap[view]
        if (result == null) {
            result = LottieAnimationViewPropertyManager(view)
            propManagersMap[view] = result
        }
        return result
    }

    override fun getDelegate(): ViewManagerDelegate<ReactLottieAnimationView> {
        return delegate
    }

    override fun getExportedViewConstants(): Map<String, Any> {
        return LottieAnimationViewManagerImpl.exportedViewConstants
    }

    override fun getName(): String {
        return LottieAnimationViewManagerImpl.REACT_CLASS
    }

    public override fun createViewInstance(context: ThemedReactContext): ReactLottieAnimationView {
        val view = LottieAnimationViewManagerImpl.createViewInstance(context)
         view.setFailureListener {
            LottieAnimationViewManagerImpl.sendAnimationFailureEvent(view, it)
        }
        view.addLottieOnCompositionLoadedListener {
            LottieAnimationViewManagerImpl.sendAnimationLoadedEvent(view)
        }
        view.addAnimatorListener(object : Animator.AnimatorListener {
            override fun onAnimationStart(animation: Animator) {
                //do nothing
            }

            override fun onAnimationEnd(animation: Animator) {
                LottieAnimationViewManagerImpl.sendOnAnimationFinishEvent(view, false)
            }

            override fun onAnimationCancel(animation: Animator) {
                LottieAnimationViewManagerImpl.sendOnAnimationFinishEvent(view, true)
            }

            override fun onAnimationRepeat(animation: Animator) {
                //do nothing
            }
        })
        return view
    }

    override fun getExportedCustomDirectEventTypeConstants(): MutableMap<String, Any>? {
        return LottieAnimationViewManagerImpl.getExportedCustomDirectEventTypeConstants()
    }

    override fun onAfterUpdateTransaction(view: ReactLottieAnimationView) {
        super.onAfterUpdateTransaction(view)
        getOrCreatePropertyManager(view).commitChanges()
    }

    override fun receiveCommand(
        root: ReactLottieAnimationView,
        commandId: String,
        args: ReadableArray?
    ) {
        delegate.receiveCommand(root, commandId, args)
    }

    override fun play(view: ReactLottieAnimationView, startFrame: Int, endFrame: Int) {
        LottieAnimationViewManagerImpl.play(view, startFrame, endFrame)
    }

    override fun reset(view: ReactLottieAnimationView) {
        LottieAnimationViewManagerImpl.reset(view)
    }

    override fun pause(view: ReactLottieAnimationView) {
        LottieAnimationViewManagerImpl.pause(view)
    }

    override fun resume(view: ReactLottieAnimationView) {
        LottieAnimationViewManagerImpl.resume(view)
    }

    @ReactProp(name = "pointerEvents")
    override fun setPointerEvents(view: ReactLottieAnimationView, pointerEvents: String?) {
        view.pointerEvents = PointerEvents.parsePointerEvents(pointerEvents)
    }

    @ReactProp(name = "sourceName")
    override fun setSourceName(view: ReactLottieAnimationView, name: String?) {
        setSourceName(name, getOrCreatePropertyManager(view))
    }

    @ReactProp(name = "sourceJson")
    override fun setSourceJson(view: ReactLottieAnimationView, json: String?) {
        setSourceJson(json, getOrCreatePropertyManager(view))
    }

    @ReactProp(name = "sourceURL")
    override fun setSourceURL(view: ReactLottieAnimationView, urlString: String?) {
        setSourceURL(urlString, getOrCreatePropertyManager(view))
    }
    
    @ReactProp(name = "sourceDotLottieURI")
    override fun setSourceDotLottieURI(view: ReactLottieAnimationView, urlString: String?) {
        setSourceDotLottieURI(urlString, getOrCreatePropertyManager(view))
    }

    @ReactProp(name = "cacheComposition")
    override fun setCacheComposition(view: ReactLottieAnimationView, cacheComposition: Boolean) {
        LottieAnimationViewManagerImpl.setCacheComposition(view, cacheComposition)
    }

    @ReactProp(name = "resizeMode")
    override fun setResizeMode(view: ReactLottieAnimationView, resizeMode: String?) {
        setResizeMode(resizeMode, getOrCreatePropertyManager(view))
    }

    @ReactProp(name = "renderMode")
    override fun setRenderMode(view: ReactLottieAnimationView, renderMode: String?) {
        setRenderMode(renderMode, getOrCreatePropertyManager(view))
    }

    @ReactProp(name = "progress")
    override fun setProgress(view: ReactLottieAnimationView, progress: Float) {
        setProgress(progress, getOrCreatePropertyManager(view))
    }

    @ReactProp(name = "speed")
    override fun setSpeed(view: ReactLottieAnimationView, speed: Double) {
        setSpeed(speed, getOrCreatePropertyManager(view))
    }

    @ReactProp(name = "loop")
    override fun setLoop(view: ReactLottieAnimationView, loop: Boolean) {
        setLoop(loop, getOrCreatePropertyManager(view))
    }

    @ReactProp(name = "autoPlay")
    override fun setAutoPlay(view: ReactLottieAnimationView, autoPlay: Boolean) {
        setAutoPlay(autoPlay, getOrCreatePropertyManager(view))
    }

    @ReactProp(name = "imageAssetsFolder")
    override fun setImageAssetsFolder(view: ReactLottieAnimationView, imageAssetsFolder: String?) {
        setImageAssetsFolder(imageAssetsFolder, getOrCreatePropertyManager(view))
    }

    @ReactProp(name = "enableMergePathsAndroidForKitKatAndAbove")
    override fun setEnableMergePathsAndroidForKitKatAndAbove(
        view: ReactLottieAnimationView,
        enableMergePaths: Boolean
    ) {
        setEnableMergePaths(enableMergePaths, getOrCreatePropertyManager(view))
    }

    @ReactProp(name = "applyOpacityToLayersAndroid")
    override fun setApplyOpacityToLayersAndroid(
        view: ReactLottieAnimationView,
        applyOpacityToLayers: Boolean
    ) {
        setApplyOpacityToLayers(applyOpacityToLayers, getOrCreatePropertyManager(view))
    }

    @ReactProp(name = "enableSafeModeAndroid")
    override fun setEnableSafeModeAndroid(view: ReactLottieAnimationView, enableSafeMode: Boolean) {
        setEnableSafeMode(enableSafeMode, getOrCreatePropertyManager(view))
    }

    @ReactProp(name = "hardwareAccelerationAndroid")
    override fun setHardwareAccelerationAndroid(
        view: ReactLottieAnimationView,
        hardwareAccelerationAndroid: Boolean
    ) {
        setHardwareAcceleration(hardwareAccelerationAndroid, getOrCreatePropertyManager(view))
    }

    @ReactProp(name = "colorFilters")
    override fun setColorFilters(view: ReactLottieAnimationView, colorFilters: ReadableArray?) {
        setColorFilters(colorFilters, getOrCreatePropertyManager(view))
    }

    @ReactProp(name = "textFiltersAndroid")
    override fun setTextFiltersAndroid(view: ReactLottieAnimationView, textFilters: ReadableArray?) {
        setTextFilters(textFilters, getOrCreatePropertyManager(view))
    }

    // this props is not available on Android, however we must override the setter
    override fun setTextFiltersIOS(view: ReactLottieAnimationView?, value: ReadableArray?) {
        //ignore - do nothing here
    }

    // Only here to solve an iOS issue with codegen. Check dummy prop in LottieAnimationViewNativeComponent.ts
    override fun setDummy(view: ReactLottieAnimationView, value: ReadableMap?) {
        //ignore - do nothing here
    }
}
