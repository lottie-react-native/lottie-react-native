package com.margelo.nitro.lottiereactnative

import android.animation.Animator
import android.widget.ImageView
import com.airbnb.lottie.LottieAnimationView
import com.facebook.proguard.annotations.DoNotStrip
import com.facebook.react.uimanager.ThemedReactContext

@DoNotStrip
class HybridLottieAnimationView(
  val context: ThemedReactContext,
) : HybridLottieAnimationViewSpec() {
  // Props
  override var sourceName: String?
    get() = sourceName
    set(name) {
      // To match the behaviour on iOS we expect the source name to be
      // extensionless. This means "myAnimation" corresponds to a file
      // named `myAnimation.json` in `main/assets`. To maintain backwards
      // compatibility we only add the .json extension if no extension is
      // passed.
      propertyManager.animationName = when (name?.contains(".")) {
        true -> name
        false -> "$name.json"
        null -> null
      }
    }

  override var sourceJson: String?
    get() = sourceJson
    set(json) {
      propertyManager.animationJson = json
    }

  override var sourceURL: String?
    get() = sourceURL
    set(url) {
      propertyManager.animationURL = url
    }

  override var sourceDotLottieURI: String?
    get() = sourceDotLottieURI
    set(dotLottie) {
      propertyManager.sourceDotLottie = dotLottie
    }
  override var resizeMode: String? = null
  override var renderMode: String? = null
  override var imageAssetsFolder: String? = null
  override var progress: Double? = null
  override var speed: Double? = null
  override var loop: Boolean?
    get() = loop
    set(loop) {
      propertyManager.loop = loop
    }
  override var autoPlay: Boolean?
    get() = autoPlay
    set(autoPlay) {
      propertyManager.autoPlay = autoPlay
    }
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

  private val propertyManager by lazy {
    LottieAnimationViewPropertyManager(view)
  }

  // View
  override val view: LottieAnimationView = LottieAnimationView(context).apply {
    scaleType = ImageView.ScaleType.CENTER_INSIDE
    setFailureListener {
      onAnimationFailure?.invoke(it.message ?: "")
    }
    addLottieOnCompositionLoadedListener {
      onAnimationLoaded?.invoke()
    }
    addAnimatorListener(
      object : Animator.AnimatorListener {
        override fun onAnimationStart(animation: Animator) {
          // Do nothing
        }

        override fun onAnimationEnd(animation: Animator) {
          onAnimationFinish?.invoke(false)
        }

        override fun onAnimationCancel(animation: Animator) {
          onAnimationFinish?.invoke(true)
        }

        override fun onAnimationRepeat(animation: Animator) {
          // Do nothing
        }
      }
    )
  }

  override fun afterUpdate() {
    propertyManager.commitChanges()
  }
}
