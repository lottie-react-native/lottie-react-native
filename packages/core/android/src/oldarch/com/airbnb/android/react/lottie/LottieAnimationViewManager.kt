package com.airbnb.android.react.lottie

import android.animation.Animator
import com.airbnb.android.react.lottie.LottieAnimationViewManagerImpl.pause
import com.airbnb.android.react.lottie.LottieAnimationViewManagerImpl.play
import com.airbnb.android.react.lottie.LottieAnimationViewManagerImpl.reset
import com.airbnb.android.react.lottie.LottieAnimationViewManagerImpl.resume
import com.airbnb.android.react.lottie.LottieAnimationViewManagerImpl.setAutoPlay
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
import com.airbnb.android.react.lottie.LottieAnimationViewManagerImpl.setSourceDotLottieURI
import com.airbnb.android.react.lottie.LottieAnimationViewManagerImpl.setSourceJson
import com.airbnb.android.react.lottie.LottieAnimationViewManagerImpl.setSourceName
import com.airbnb.android.react.lottie.LottieAnimationViewManagerImpl.setSourceURL
import com.airbnb.android.react.lottie.LottieAnimationViewManagerImpl.setSpeed
import com.airbnb.android.react.lottie.LottieAnimationViewManagerImpl.setTextFilters
import com.facebook.react.bridge.ReadableArray
import com.facebook.react.uimanager.PointerEvents
import com.facebook.react.uimanager.SimpleViewManager
import com.facebook.react.uimanager.ThemedReactContext
import com.facebook.react.uimanager.annotations.ReactProp
import java.util.WeakHashMap

class LottieAnimationViewManager : SimpleViewManager<ReactLottieAnimationView>() {
    private val propManagersMap =
        WeakHashMap<ReactLottieAnimationView, LottieAnimationViewPropertyManager>()

    private fun getOrCreatePropertyManager(
        view: ReactLottieAnimationView
    ): LottieAnimationViewPropertyManager {
        var result = propManagersMap[view]
        if (result == null) {
            result = LottieAnimationViewPropertyManager(view)
            propManagersMap[view] = result
        }
        return result
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
        view.addAnimatorListener(
            object : Animator.AnimatorListener {
                override fun onAnimationStart(animation: Animator) {
                    // do nothing
                }

                override fun onAnimationEnd(animation: Animator) {
                    LottieAnimationViewManagerImpl.sendOnAnimationFinishEvent(view, false)
                }

                override fun onAnimationCancel(animation: Animator) {
                    LottieAnimationViewManagerImpl.sendOnAnimationFinishEvent(view, true)
                }

                override fun onAnimationRepeat(animation: Animator) {
                    // do nothing
                }
            }
        )
        return view
    }

    override fun getExportedCustomDirectEventTypeConstants(): MutableMap<String, Any>? {
        return LottieAnimationViewManagerImpl.getExportedCustomDirectEventTypeConstants()
    }

    override fun receiveCommand(
        view: ReactLottieAnimationView,
        commandName: String,
        args: ReadableArray?
    ) {
        when (commandName) {
            "play" -> play(view, args?.getInt(0) ?: -1, args?.getInt(1) ?: -1)
            "reset" -> reset(view)
            "pause" -> pause(view)
            "resume" -> resume(view)
            else -> {
                // do nothing
            }
        }
    }

    @ReactProp(name = "pointerEvents")
    fun setPointerEvents(view: ReactLottieAnimationView, pointerEvents: String?) {
        view.pointerEvents = PointerEvents.parsePointerEvents(pointerEvents)
    }

    @ReactProp(name = "sourceName")
    fun setSourceName(view: ReactLottieAnimationView, name: String?) {
        setSourceName(name, getOrCreatePropertyManager(view))
    }

    @ReactProp(name = "sourceJson")
    fun setSourceJson(view: ReactLottieAnimationView, json: String?) {
        setSourceJson(json, getOrCreatePropertyManager(view))
    }

    @ReactProp(name = "sourceURL")
    fun setSourceURL(view: ReactLottieAnimationView, urlString: String?) {
        setSourceURL(urlString, getOrCreatePropertyManager(view))
    }

    @ReactProp(name = "cacheComposition")
    fun setCacheComposition(view: ReactLottieAnimationView?, cacheComposition: Boolean) {
        LottieAnimationViewManagerImpl.setCacheComposition(view!!, cacheComposition)
    }

    @ReactProp(name = "resizeMode")
    fun setResizeMode(view: ReactLottieAnimationView, resizeMode: String?) {
        setResizeMode(resizeMode, getOrCreatePropertyManager(view))
    }

    @ReactProp(name = "renderMode")
    fun setRenderMode(view: ReactLottieAnimationView, renderMode: String?) {
        setRenderMode(renderMode, getOrCreatePropertyManager(view))
    }

    @ReactProp(name = "hardwareAccelerationAndroid")
    fun setHardwareAccelerationAndroid(
        view: ReactLottieAnimationView,
        hardwareAccelerationAndroid: Boolean?
    ) {
        setHardwareAcceleration(hardwareAccelerationAndroid!!, getOrCreatePropertyManager(view))
    }

    @ReactProp(name = "progress")
    fun setProgress(view: ReactLottieAnimationView, progress: Float) {
        setProgress(progress, getOrCreatePropertyManager(view))
    }

    @ReactProp(name = "speed")
    fun setSpeed(view: ReactLottieAnimationView, speed: Double) {
        setSpeed(speed, getOrCreatePropertyManager(view))
    }

    @ReactProp(name = "loop")
    fun setLoop(view: ReactLottieAnimationView, loop: Boolean) {
        setLoop(loop, getOrCreatePropertyManager(view))
    }

    @ReactProp(name = "autoPlay")
    fun setAutoPlay(view: ReactLottieAnimationView, autoPlay: Boolean) {
        setAutoPlay(autoPlay, getOrCreatePropertyManager(view))
    }

    @ReactProp(name = "imageAssetsFolder")
    fun setImageAssetsFolder(view: ReactLottieAnimationView, imageAssetsFolder: String?) {
        setImageAssetsFolder(imageAssetsFolder, getOrCreatePropertyManager(view))
    }

    @ReactProp(name = "enableMergePathsAndroidForKitKatAndAbove")
    fun setEnableMergePaths(view: ReactLottieAnimationView, enableMergePaths: Boolean) {
        setEnableMergePaths(enableMergePaths, getOrCreatePropertyManager(view))
    }

    @ReactProp(name = "applyOpacityToLayersAndroid")
    fun setApplyOpacityToLayersAndroid(
        view: ReactLottieAnimationView,
        applyOpacityToLayers: Boolean
    ) {
        setApplyOpacityToLayers(applyOpacityToLayers, getOrCreatePropertyManager(view))
    }

    @ReactProp(name = "enableSafeModeAndroid")
    fun setEnableSafeMode(view: ReactLottieAnimationView, enableSafeMode: Boolean) {
        setEnableSafeMode(enableSafeMode, getOrCreatePropertyManager(view))
    }

    @ReactProp(name = "colorFilters")
    fun setColorFilters(view: ReactLottieAnimationView, colorFilters: ReadableArray?) {
        setColorFilters(colorFilters, getOrCreatePropertyManager(view))
    }

    @ReactProp(name = "textFiltersAndroid")
    fun setTextFilters(view: ReactLottieAnimationView, textFilters: ReadableArray?) {
        setTextFilters(textFilters, getOrCreatePropertyManager(view))
    }

    @ReactProp(name = "sourceDotLottieURI")
    fun setSourceDotLottie(view: ReactLottieAnimationView, uri: String?) {
        setSourceDotLottieURI(uri, getOrCreatePropertyManager(view))
    }

    override fun onAfterUpdateTransaction(view: ReactLottieAnimationView) {
        super.onAfterUpdateTransaction(view)
        getOrCreatePropertyManager(view).commitChanges()
    }
}
