package com.margelo.nitro.lottienitro

import android.view.View
import androidx.annotation.Keep
import com.facebook.proguard.annotations.DoNotStrip
import com.facebook.react.uimanager.ThemedReactContext

/**
 * Stub implementation of the `LottieView` Nitro view.
 *
 * Renders an empty [View] and stores every prop without acting on it. This
 * exists so the module codegens, compiles and registers end to end; real Lottie
 * rendering (and the `lottie-android` dependency) lands in a later change.
 *
 * The constructor signature is fixed by the generated
 * `HybridLottieViewManager.createViewInstance`, which calls
 * `HybridLottieView(reactContext)`. [Keep] and [DoNotStrip] are required because
 * the class is instantiated from JNI by name.
 *
 * `beforeUpdate()`, `afterUpdate()` and `onDropView()` are open no-ops on
 * `com.margelo.nitro.views.HybridView`, so they are omitted.
 *
 * `ResizeMode`, `RenderMode`, `LottieColorFilter`, `TextFilterAndroid` and
 * `TextFilterIOS` are generated into this same package, so they need no import.
 * The color filter struct is named `LottieColorFilter` precisely so it cannot
 * shadow `android.graphics.ColorFilter` here.
 */
@Keep
@DoNotStrip
class HybridLottieView(
  val context: ThemedReactContext,
) : HybridLottieViewSpec() {
  override val view: View = View(context)

  // Props
  //
  // Stored only. A real implementation applies these to a LottieAnimationView,
  // most usefully from `afterUpdate()` so a prop batch is applied once.

  override var resizeMode: ResizeMode? = null
  override var renderMode: RenderMode? = null

  override var sourceName: String? = null
  override var sourceJson: String? = null
  override var sourceURL: String? = null
  override var sourceDotLottieURI: String? = null

  override var imageAssetsFolder: String? = null

  override var progress: Double? = null
  override var speed: Double? = null

  override var loop: Boolean? = null
  override var autoPlay: Boolean? = null

  override var enableMergePathsAndroidForKitKatAndAbove: Boolean? = null
  override var applyOpacityToLayersAndroid: Boolean? = null
  override var enableSafeModeAndroid: Boolean? = null
  override var hardwareAccelerationAndroid: Boolean? = null
  override var cacheComposition: Boolean? = null

  override var colorFilters: Array<LottieColorFilter>? = null
  override var textFiltersAndroid: Array<TextFilterAndroid>? = null
  override var textFiltersIOS: Array<TextFilterIOS>? = null

  override var onAnimationFinish: ((isCancelled: Boolean) -> Unit)? = null
  override var onAnimationFailure: ((error: String) -> Unit)? = null
  override var onAnimationLoaded: (() -> Unit)? = null

  // Methods
  //
  // Unlike v7's Fabric commands, which arrived already on the UI thread, Nitro
  // methods are direct JSI calls on the JS thread. A real implementation must
  // post to the UI thread before touching the view.

  override fun play(startFrame: Double, endFrame: Double) {
    // no-op
  }

  override fun reset() {
    // no-op
  }

  override fun pause() {
    // no-op
  }

  override fun resume() {
    // no-op
  }
}
