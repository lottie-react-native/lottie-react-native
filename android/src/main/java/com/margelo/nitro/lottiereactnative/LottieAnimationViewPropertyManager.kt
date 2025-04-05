package com.margelo.nitro.lottiereactnative

import android.graphics.ColorFilter
import android.graphics.Typeface
import android.util.Log
import android.widget.ImageView
import com.airbnb.lottie.LottieAnimationView
import com.airbnb.lottie.RenderMode
import com.airbnb.lottie.FontAssetDelegate
import com.airbnb.lottie.LottieDrawable
import com.airbnb.lottie.LottieProperty
import com.airbnb.lottie.SimpleColorFilter
import com.airbnb.lottie.TextDelegate
import com.airbnb.lottie.model.KeyPath
import com.airbnb.lottie.value.LottieValueCallback
import com.facebook.react.bridge.ColorPropConverter
import com.facebook.react.bridge.ReadableArray
import com.facebook.react.bridge.ReadableMap
import com.facebook.react.bridge.ReadableType
import com.facebook.react.common.assets.ReactFontManager
import com.facebook.react.util.RNLog
import com.facebook.react.views.text.TextAttributeProps.UNSET
import java.io.File
import java.io.FileInputStream
import java.lang.ref.WeakReference
import java.util.regex.Pattern
import java.util.zip.ZipInputStream
import androidx.core.net.toUri

/**
 * Class responsible for applying the properties to the LottieView. The way react-native works makes
 * it impossible to predict in which order properties will be set, also some of the properties of
 * the LottieView needs to be set simultaneously.
 *
 * To solve this, instance of this class accumulates all changes to the view and applies them at the
 * end of react transaction, so it could control how changes are applied.
 */
class LottieAnimationViewPropertyManager(view: LottieAnimationView) {
  private val viewWeakReference: WeakReference<LottieAnimationView>
  private val TAG = "lottie-react-native"


  /**
   * Should be set to true if one of the animationName related parameters has changed as a result
   * of last reconciliation. We need to update the animation in this case.
   */
  private var animationNameDirty = false

  var animationName: String? = null
    set(value) {
      field = value
      this.animationNameDirty = true
    }
  var scaleType: ImageView.ScaleType? = null
  var imageAssetsFolder: String? = null
  var enableMergePaths: Boolean? = null
  var enableSafeMode: Boolean? = null
  var colorFilters: Array<ColorFilterStruct>? = null
  var textFilters: Array<TextFilterAndroidStruct>? = null
  var renderMode: RenderMode? = null
  var layerType: Int? = null
  var animationJson: String? = null
  var animationURL: String? = null
  var sourceDotLottie: String? = null
  var progress: Float? = null
  var loop: Boolean? = null
  var autoPlay: Boolean? = null
  var speed: Float? = null

  init {
    viewWeakReference = WeakReference(view)

    view.setFontAssetDelegate(object : FontAssetDelegate() {
      override fun fetchFont(fontFamily: String): Typeface {
        return ReactFontManager.getInstance()
          .getTypeface(fontFamily, UNSET, UNSET, view.context.assets)
      }

      override fun fetchFont(fontFamily: String, fontStyle: String, fontName: String): Typeface {
        val weight = when (fontStyle) {
          "Thin" -> 100
          "Light" -> 200
          "Normal", "Regular" -> 400
          "Medium" -> 500
          "Bold" -> 700
          "Black" -> 900
          else -> UNSET
        }
        return ReactFontManager.getInstance()
          .getTypeface(fontName, UNSET, weight, view.context.assets)
      }
    })
  }

  /**
   * Updates the view with changed fields. Majority of the properties here are independent so they
   * are has to be reset to null as soon as view is updated with the value.
   *
   * The only exception from this rule is the group of the properties for the animation. For now
   * this is animationName and cacheStrategy. These two properties are should be set
   * simultaneously if the dirty flag is set.
   */
  fun commitChanges() {
    val view = viewWeakReference.get() ?: return

    textFilters?.let { filters ->
      val textDelegate = TextDelegate(view)
      filters.forEach {
        textDelegate.setText(it.find, it.replace)
      }
      view.setTextDelegate(textDelegate)
    }

    animationJson?.let {
      view.setAnimationFromJson(it, it.hashCode().toString())
      animationJson = null
    }

    animationURL?.let {
      var file = File(it)
      if (file.exists()) {
        view.setAnimation(FileInputStream(file), it.hashCode().toString())
      } else {
        view.setAnimationFromUrl(it, it.hashCode().toString())
      }
      animationURL = null
    }

    sourceDotLottie?.let { assetName ->
      var file = File(assetName)
      if (file.exists()) {
        view.setAnimation(
          ZipInputStream(FileInputStream(file)),
          assetName.hashCode().toString()
        )
        sourceDotLottie = null
        return
      }

      val scheme = runCatching { assetName.toUri().scheme }.getOrNull()
      if (scheme != null) {
        // if the asset path has file:// prefix, which indicates locally stored file, parse the path to be able to load it properly
        // This is useful for apps, which are using OTA (CodePush, Expo-Updates etc.)
        if (scheme == "file") {
          val uri = assetName.toUri()
          uri.path?.let { path ->
            val fileWithScheme = File(path)
            view.setAnimation(
              ZipInputStream(FileInputStream(fileWithScheme)),
              assetName.hashCode().toString()
            )
          } ?: Log.w(TAG, "URI path is null for asset: $assetName")
        } else {
          view.setAnimationFromUrl(assetName)
        }
        sourceDotLottie = null
        return
      }

      // resource needs to be loaded in release mode: https://github.com/facebook/react-native/issues/24963#issuecomment-532168307
      val resourceId = view.resources.getIdentifier(
        assetName,
        "raw",
        view.context.packageName
      )

      if (resourceId == 0) {
        RNLog.e("Animation for $assetName was not found in raw resources")
        return
      }

      view.setAnimation(resourceId)
      animationNameDirty = false
      sourceDotLottie = null
    }

    if (animationNameDirty) {
      view.setAnimation(animationName)
      animationNameDirty = false
    }

    progress?.let {
      view.progress = it
      progress = null
    }

    loop?.let {
      view.repeatCount = if (it) LottieDrawable.INFINITE else 0
      loop = null
    }

    autoPlay?.let {
      if (it && !view.isAnimating) {
        view.playAnimation()
      }
    }

    speed?.let {
      view.speed = it
      speed = null
    }

    scaleType?.let {
      view.scaleType = it
      scaleType = null
    }

    renderMode?.let {
      view.renderMode = it
      renderMode = null
    }

    layerType?.let { view.setLayerType(it, null) }

    imageAssetsFolder?.let {
      view.imageAssetsFolder = it
      imageAssetsFolder = null
    }

    enableMergePaths?.let {
      view.enableMergePathsForKitKatAndAbove(it)
      enableMergePaths = null
    }

    enableSafeMode?.let {
      view.setSafeMode(it)
      enableSafeMode = null
    }

    colorFilters?.let { colorFilters ->
      colorFilters.forEach {
        parseColorFilter(it, view)
      }
    }
  }

  private fun parseColorFilter(
    colorFilter: ColorFilterStruct,
    view: LottieAnimationView
  ) {
    val color: Int = ColorPropConverter.getColor(colorFilter.color, view.context)
    val path = colorFilter.keypath
    val pathGlob = "$path.**"
    val keys = pathGlob.split(Pattern.quote(".").toRegex())
      .dropLastWhile { it.isEmpty() }
      .toTypedArray()
    val keyPath = KeyPath(*keys)

    val filter: ColorFilter = SimpleColorFilter(color)
    val colorFilterCallback = LottieValueCallback(filter)

    view.addValueCallback(keyPath, LottieProperty.COLOR_FILTER, colorFilterCallback)
  }
}
