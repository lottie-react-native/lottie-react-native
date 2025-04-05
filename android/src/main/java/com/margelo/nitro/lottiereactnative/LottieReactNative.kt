package com.margelo.nitro.lottiereactnative

import android.animation.Animator
import android.view.View
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
    set(value) {
      propertyManager.animationJson = value
    }

  override var sourceURL: String?
    get() = sourceURL
    set(value) {
      propertyManager.animationURL = value
    }

  override var sourceDotLottieURI: String?
    get() = sourceDotLottieURI
    set(value) {
      propertyManager.sourceDotLottie = value
    }

  override var resizeMode: ResizeMode?
    get() = resizeMode
    set(value) {
      propertyManager.scaleType = when (value) {
        ResizeMode.CENTER -> ImageView.ScaleType.CENTER_INSIDE
        ResizeMode.CONTAIN -> ImageView.ScaleType.FIT_CENTER
        ResizeMode.COVER -> ImageView.ScaleType.CENTER_CROP
        null -> null
      }
    }

  override var renderMode: RenderMode?
    get() = renderMode
    set(value) {
      propertyManager.renderMode = when (value) {
        RenderMode.AUTOMATIC -> com.airbnb.lottie.RenderMode.AUTOMATIC
        RenderMode.HARDWARE -> com.airbnb.lottie.RenderMode.HARDWARE
        RenderMode.SOFTWARE -> com.airbnb.lottie.RenderMode.SOFTWARE
        null -> null
      }
    }

  override var imageAssetsFolder: String?
    get() = imageAssetsFolder
    set(value) {
      propertyManager.imageAssetsFolder = value
    }

  override var progress: Double?
    get() = progress
    set(value) {
      propertyManager.progress = value?.toFloat()
    }

  override var speed: Double?
    get() = speed
    set(value) {
      propertyManager.speed = value?.toFloat()
    }

  override var loop: Boolean?
    get() = loop
    set(value) {
      propertyManager.loop = value
    }

  override var autoPlay: Boolean?
    get() = autoPlay
    set(value) {
      propertyManager.autoPlay = value
    }

  override var enableMergePathsAndroidForKitKatAndAbove: Boolean?
    get() = enableMergePathsAndroidForKitKatAndAbove
    set(value) {
      propertyManager.enableMergePaths = value
    }

  override var enableSafeModeAndroid: Boolean?
    get() = enableSafeModeAndroid
    set(value) {
      propertyManager.enableSafeMode = value
    }

  override var hardwareAccelerationAndroid: Boolean?
    get() = hardwareAccelerationAndroid
    set(value) {
      propertyManager.layerType = when (value) {
        true -> View.LAYER_TYPE_HARDWARE
        false -> View.LAYER_TYPE_SOFTWARE
        null -> null
      }
    }

  override var cacheComposition: Boolean?
    get() = cacheComposition
    set(value) {
      view.setCacheComposition(value ?: false)
    }

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
