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
    get() = null
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
    get() = null
    set(value) {
      propertyManager.animationJson = value
    }

  override var sourceURL: String?
    get() = null
    set(value) {
      propertyManager.animationURL = value
    }

  override var sourceDotLottieURI: String?
    get() = null
    set(value) {
      propertyManager.sourceDotLottie = value
    }

  override var resizeMode: ResizeMode?
    get() = null
    set(value) {
      propertyManager.scaleType = when (value) {
        ResizeMode.CENTER -> ImageView.ScaleType.CENTER_INSIDE
        ResizeMode.CONTAIN -> ImageView.ScaleType.FIT_CENTER
        ResizeMode.COVER -> ImageView.ScaleType.CENTER_CROP
        null -> null
      }
    }

  override var renderMode: RenderMode?
    get() = null
    set(value) {
      propertyManager.renderMode = when (value) {
        RenderMode.AUTOMATIC -> com.airbnb.lottie.RenderMode.AUTOMATIC
        RenderMode.HARDWARE -> com.airbnb.lottie.RenderMode.HARDWARE
        RenderMode.SOFTWARE -> com.airbnb.lottie.RenderMode.SOFTWARE
        null -> null
      }
    }

  override var imageAssetsFolder: String?
    get() = null
    set(value) {
      propertyManager.imageAssetsFolder = value
    }

  override var progress: Double?
    get() = null
    set(value) {
      propertyManager.progress = value?.toFloat()
    }

  override var speed: Double?
    get() = null
    set(value) {
      propertyManager.speed = value?.toFloat()
    }

  override var loop: Boolean?
    get() = null
    set(value) {
      propertyManager.loop = value
    }

  override var autoPlay: Boolean?
    get() = null
    set(value) {
      propertyManager.autoPlay = value
    }

  override var enableMergePathsAndroidForKitKatAndAbove: Boolean?
    get() = null
    set(value) {
      propertyManager.enableMergePaths = value
    }

  override var enableSafeModeAndroid: Boolean?
    get() = null
    set(value) {
      propertyManager.enableSafeMode = value
    }

  override var hardwareAccelerationAndroid: Boolean?
    get() = null
    set(value) {
      propertyManager.layerType = when (value) {
        true -> View.LAYER_TYPE_HARDWARE
        false -> View.LAYER_TYPE_SOFTWARE
        null -> null
      }
    }

  override var cacheComposition: Boolean?
    get() = null
    set(value) {
      view.setCacheComposition(value ?: false)
    }

  override var colorFilters: Array<ColorFilterStruct>?
    get() = null
    set(value) {
      propertyManager.colorFilters = value
    }

  override var textFiltersAndroid: Array<TextFilterAndroidStruct>?
    get() = null
    set(value) {
      propertyManager.textFilters = value
    }

  override var textFiltersIOS: Array<TextFilterIOSStruct>? = null // NOOP

  override var onAnimationFinish: ((Boolean) -> Unit)? = null

  override var onAnimationFailure: ((String) -> Unit)? = null

  override var onAnimationLoaded: (() -> Unit)? = null

  // Methods
  override fun play(startFrame: Double, endFrame: Double) {
    commandManager.play(startFrame.toInt(), endFrame.toInt())
  }

  override fun reset() {
    commandManager.reset()
  }

  override fun pause() {
    commandManager.pause()
  }

  override fun resume() {
    commandManager.resume()
  }

  private val propertyManager by lazy {
    LottieAnimationViewPropertyManager(view)
  }

  private val commandManager by lazy {
    LottieAnimationViewCommandManager(view)
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
