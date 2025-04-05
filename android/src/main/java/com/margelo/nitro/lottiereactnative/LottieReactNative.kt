package com.margelo.nitro.lottiereactnative

import android.view.View
import com.facebook.proguard.annotations.DoNotStrip
import com.facebook.react.uimanager.ThemedReactContext

@DoNotStrip
class HybridLottieAnimationView(
  val context: ThemedReactContext,
) : HybridLottieAnimationViewSpec() {
  // Props
  override var sourceName: String? = null
  override var sourceJson: String? = null
  override var sourceURL: String? = null
  override var sourceDotLottieURI: String? = null
  override var resizeMode: String? = null
  override var renderMode: String? = null
  override var imageAssetsFolder: String? = null
  override var progress: Double? = null
  override var speed: Double? = null
  override var loop: Boolean? = null
  override var autoPlay: Boolean? = null
  override var enableMergePathsAndroidForKitKatAndAbove: Boolean? = null
  override var enableSafeModeAndroid: Boolean? = null
  override var hardwareAccelerationAndroid: Boolean? = null
  override var cacheComposition: Boolean? = null
  override var colorFilters: Array<ColorFilterStruct>? = null
  override var textFiltersAndroid: Array<TextFilterAndroidStruct>? = null
  override var textFiltersIOS: Array<TextFilterIOSStruct>? = null
  override var onAnimationFinish: ((Boolean) -> Unit)? = null
  override var onAnimationFailure: ((String) -> Unit)? = null
  override var onAnimationLoaded: (() -> Unit)? = null

  // Methods
  override fun play(startFrame: Double, endFrame: Double) {
    TODO("Not yet implemented")
  }

  override fun reset() {
    TODO("Not yet implemented")
  }

  override fun pause() {
    TODO("Not yet implemented")
  }

  override fun resume() {
    TODO("Not yet implemented")
  }

  // View
  override val view: View = View(context)
}
