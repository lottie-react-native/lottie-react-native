package com.margelo.nitro.lottienitro

import android.animation.Animator
import android.graphics.ColorFilter
import android.graphics.Typeface
import android.net.Uri
import android.os.Handler
import android.os.Looper
import android.view.View
import android.widget.ImageView
import androidx.annotation.Keep
import com.airbnb.lottie.FontAssetDelegate
import com.airbnb.lottie.LottieAnimationView
import com.airbnb.lottie.LottieDrawable
import com.airbnb.lottie.LottieProperty
import com.airbnb.lottie.RenderMode as LottieRenderMode
import com.airbnb.lottie.SimpleColorFilter
import com.airbnb.lottie.TextDelegate
import com.airbnb.lottie.model.KeyPath
import com.airbnb.lottie.value.LottieValueCallback
import com.facebook.proguard.annotations.DoNotStrip
import com.facebook.react.uimanager.ThemedReactContext
import com.facebook.react.views.text.ReactFontManager
import java.io.File
import java.io.FileInputStream
import java.util.regex.Pattern
import java.util.zip.ZipInputStream

@Keep
@DoNotStrip
class HybridLottieView(
  val context: ThemedReactContext,
) : HybridLottieViewSpec() {
  private val animationView = LottieAnimationView(context).apply {
    scaleType = ImageView.ScaleType.CENTER_INSIDE
  }

  override val view: View = animationView

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

  private sealed interface SourceKind {
    data class Name(val v: String) : SourceKind
    data class Json(val v: String) : SourceKind
    data class Url(val v: String) : SourceKind
    data class DotLottie(val v: String) : SourceKind
  }

  private data class ColorFilterSnapshot(val keypath: String, val colorBits: Long)

  private var appliedDidApplyOnce = false
  private var appliedSource: SourceKind? = null
  private var appliedRenderMode: LottieRenderMode? = null
  private var appliedScaleType: ImageView.ScaleType? = null
  private var appliedImageAssetsFolder = ""
  private var appliedCacheComposition = true
  private var appliedProgress = 0f
  private var appliedSpeed = 1f
  private var appliedLoop = true
  private var appliedAutoPlay = false
  private var appliedLayerType: Int? = null
  private var appliedEnableMergePaths: Boolean? = null
  private var appliedApplyOpacityToLayers: Boolean? = null
  private var appliedEnableSafeMode: Boolean? = null
  private var appliedTextFilters: List<TextFilterAndroid> = emptyList()
  private var appliedColorFilters: List<ColorFilterSnapshot> = emptyList()
  private var installedColorKeyPaths: List<KeyPath> = emptyList()

  private var loadGeneration = 0L

  private var suppressFinishDepth = 0
  private var finishEmittedForRun = false
  private var sourceJustChanged = false

  private var pendingAttachPlay: View.OnAttachStateChangeListener? = null

  private val animatorListener = object : Animator.AnimatorListener {
    override fun onAnimationStart(animation: Animator) {
      finishEmittedForRun = false
    }

    override fun onAnimationCancel(animation: Animator) = emitFinish(true)
    override fun onAnimationEnd(animation: Animator) = emitFinish(false)
    override fun onAnimationRepeat(animation: Animator) = Unit
  }

  init {
    animationView.addAnimatorListener(animatorListener)
    animationView.setFailureListener { emitFailure(it.message ?: it.toString()) }
    animationView.addLottieOnCompositionLoadedListener {
      onAnimationLoaded?.invoke()
      applyCompositionDependent()
    }
    animationView.setFontAssetDelegate(object : FontAssetDelegate() {
      override fun fetchFont(fontFamily: String): Typeface =
        ReactFontManager.getInstance().getTypeface(fontFamily, UNSET, UNSET, context.assets)

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
          .getTypeface(fontName, UNSET, weight, context.assets)
      }
    })
  }

  override fun afterUpdate() {
    withFinishSuppressed {
      val nextSource = pendingSource()
      sourceJustChanged = nextSource != appliedSource

      (cacheComposition ?: true).let {
        if (it != appliedCacheComposition || !appliedDidApplyOnce) {
          animationView.setCacheComposition(it)
          appliedCacheComposition = it
        }
      }

      (imageAssetsFolder ?: "").let {
        if (it != appliedImageAssetsFolder) {
          animationView.imageAssetsFolder = it
          appliedImageAssetsFolder = it
        }
      }

      applyIndependentFlags()
      applyTextFilters()

      if (sourceJustChanged) {
        appliedSource = nextSource
        loadGeneration++
        installedColorKeyPaths = emptyList()
        applySource(nextSource)
      } else if (animationView.composition != null) {
        applyCompositionDependent()
      }

      appliedDidApplyOnce = true
      sourceJustChanged = false
    }
  }

  override fun onDropView() {
    loadGeneration++
    suppressFinishDepth++
    animationView.removeAnimatorListener(animatorListener)
    animationView.removeAllLottieOnCompositionLoadedListener()
    animationView.setFailureListener(null)
    installedColorKeyPaths.forEach {
      animationView.clearValueCallback(it, LottieProperty.COLOR_FILTER)
    }
    installedColorKeyPaths = emptyList()
    pendingAttachPlay?.let { animationView.removeOnAttachStateChangeListener(it) }
    pendingAttachPlay = null
    animationView.setTextDelegate(null)
    animationView.cancelAnimation()
    animationView.clearAnimation()
    onAnimationFinish = null
    onAnimationFailure = null
    onAnimationLoaded = null
  }

  private fun applyIndependentFlags() {
    resizeMode?.let { mode ->
      val scaleType = when (mode) {
        ResizeMode.COVER -> ImageView.ScaleType.CENTER_CROP
        ResizeMode.CONTAIN -> ImageView.ScaleType.FIT_CENTER
        ResizeMode.CENTER -> ImageView.ScaleType.CENTER_INSIDE
      }
      if (scaleType != appliedScaleType) {
        animationView.scaleType = scaleType
        appliedScaleType = scaleType
      }
    }

    renderMode?.let { mode ->
      val native = when (mode) {
        RenderMode.AUTOMATIC -> LottieRenderMode.AUTOMATIC
        RenderMode.HARDWARE -> LottieRenderMode.HARDWARE
        RenderMode.SOFTWARE -> LottieRenderMode.SOFTWARE
      }
      if (native != appliedRenderMode) {
        animationView.renderMode = native
        appliedRenderMode = native
      }
    }

    hardwareAccelerationAndroid?.let {
      val layerType = if (it) View.LAYER_TYPE_HARDWARE else View.LAYER_TYPE_SOFTWARE
      if (layerType != appliedLayerType) {
        animationView.setLayerType(layerType, null)
        appliedLayerType = layerType
      }
    }

    enableMergePathsAndroidForKitKatAndAbove?.let {
      if (it != appliedEnableMergePaths) {
        animationView.enableMergePathsForKitKatAndAbove(it)
        appliedEnableMergePaths = it
      }
    }
    applyOpacityToLayersAndroid?.let {
      if (it != appliedApplyOpacityToLayers) {
        animationView.setApplyingOpacityToLayersEnabled(it)
        appliedApplyOpacityToLayers = it
      }
    }
    enableSafeModeAndroid?.let {
      if (it != appliedEnableSafeMode) {
        animationView.setSafeMode(it)
        appliedEnableSafeMode = it
      }
    }
  }

  private fun applyTextFilters() {
    val next = textFiltersAndroid?.toList() ?: emptyList()
    if (next == appliedTextFilters && appliedDidApplyOnce) return

    if (next.isEmpty()) {
      if (appliedTextFilters.isNotEmpty()) {
        animationView.setTextDelegate(null)
        animationView.invalidate()
      }
    } else {
      animationView.setTextDelegate(
        TextDelegate(animationView).apply {
          next.forEach { setText(it.find, it.replace) }
        }
      )
    }
    appliedTextFilters = next
  }

  private fun pendingSource(): SourceKind? {
    sourceJson?.takeIf { it.isNotEmpty() }?.let { return SourceKind.Json(it) }
    sourceName?.takeIf { it.isNotEmpty() }?.let { return SourceKind.Name(it) }
    sourceDotLottieURI?.takeIf { it.isNotEmpty() }?.let { return SourceKind.DotLottie(it) }
    sourceURL?.takeIf { it.isNotEmpty() }?.let { return SourceKind.Url(it) }
    return null
  }

  private fun applySource(source: SourceKind?) {
    val generation = loadGeneration
    fun key(s: String): String? = if (appliedCacheComposition) s.hashCode().toString() else null

    try {
      when (source) {
        null -> animationView.setAnimation(null as String?)

        is SourceKind.Json -> animationView.setAnimationFromJson(source.v, key(source.v))

        is SourceKind.Name -> {
          val name = if (source.v.contains(".")) source.v else "${source.v}.json"
          animationView.setAnimation(name)
        }

        is SourceKind.Url -> {
          val file = File(source.v)
          if (file.exists()) {
            animationView.setAnimation(FileInputStream(file), key(source.v))
          } else {
            animationView.setAnimationFromUrl(source.v)
          }
        }

        is SourceKind.DotLottie -> applyDotLottie(source.v)
      }
    } catch (t: Throwable) {
      if (generation == loadGeneration) emitFailure(t.message ?: t.toString())
    }
  }

  private fun applyDotLottie(assetName: String) {
    val file = File(assetName)
    if (file.exists()) {
      animationView.setAnimation(
        ZipInputStream(FileInputStream(file)),
        if (appliedCacheComposition) assetName.hashCode().toString() else null,
      )
      return
    }

    val scheme = runCatching { Uri.parse(assetName).scheme }.getOrNull()
    if (scheme != null) {
      if (scheme == "file") {
        val path = Uri.parse(assetName).path
        if (path == null) {
          emitFailure("URI path is null for .lottie asset: $assetName")
          return
        }
        val fileWithScheme = File(path)
        if (!fileWithScheme.exists()) {
          emitFailure("The .lottie file does not exist: $path")
          return
        }
        animationView.setAnimation(
          ZipInputStream(FileInputStream(fileWithScheme)),
          if (appliedCacheComposition) assetName.hashCode().toString() else null,
        )
      } else {
        animationView.setAnimationFromUrl(assetName)
      }
      return
    }

    val resourceId = animationView.resources.getIdentifier(
      assetName, "raw", context.packageName,
    )
    if (resourceId == 0) {
      emitFailure("Animation for $assetName was not found in raw resources")
      return
    }
    animationView.setAnimation(resourceId)
  }

  private fun applyCompositionDependent() {
    if (animationView.composition == null) return
    withFinishSuppressed {
      (loop ?: true).let {
        if (it != appliedLoop || sourceJustChanged || !appliedDidApplyOnce) {
          animationView.repeatCount = if (it) LottieDrawable.INFINITE else 0
          appliedLoop = it
        }
      }
      (speed ?: 1.0).toFloat().let {
        if (it != appliedSpeed || sourceJustChanged || !appliedDidApplyOnce) {
          animationView.speed = it
          appliedSpeed = it
        }
      }

      reconcileColorFilters()
      applyPlayback()
    }
  }

  private fun applyPlayback() {
    val wantsPlay = autoPlay ?: false
    val next = (progress ?: 0.0).toFloat()
    val progressChanged = next != appliedProgress

    if (progressChanged) {
      animationView.progress = next
      appliedProgress = next
    }

    if (wantsPlay) {
      val shouldStart = !appliedAutoPlay ||
        progressChanged ||
        sourceJustChanged ||
        !animationView.isAnimating
      if (shouldStart) {
        finishEmittedForRun = false
        animationView.resumeAnimation()
      }
    }
    appliedAutoPlay = wantsPlay
  }

  private fun reconcileColorFilters() {
    val next = (colorFilters ?: emptyArray()).map {
      ColorFilterSnapshot(it.keypath, it.color.toRawBits())
    }
    if (next == appliedColorFilters && !sourceJustChanged && appliedDidApplyOnce) return

    val desired = mutableListOf<Pair<KeyPath, Int>>()
    for (filter in next) {
      val color = colorFromARGB(Double.fromBits(filter.colorBits))
      if (color == null) {
        emitFailure(
          "Unresolvable colorFilters color for keypath \"${filter.keypath}\""
        )
        continue
      }
      val keys = "${filter.keypath}.**"
        .split(Pattern.quote(".").toRegex())
        .dropLastWhile { it.isEmpty() }
        .toTypedArray()
      desired.add(KeyPath(*keys) to color)
    }

    val desiredKeyPaths = desired.map { it.first }
    (installedColorKeyPaths - desiredKeyPaths.toSet()).forEach {
      animationView.clearValueCallback(it, LottieProperty.COLOR_FILTER)
    }
    desired.forEach { (keyPath, color) ->
      animationView.addValueCallback(
        keyPath,
        LottieProperty.COLOR_FILTER,
        LottieValueCallback<ColorFilter>(SimpleColorFilter(color)),
      )
    }
    installedColorKeyPaths = desiredKeyPaths
    appliedColorFilters = next
  }

  private fun colorFromARGB(value: Double): Int? {
    if (value < -2_147_483_648.0 || value > 4_294_967_295.0) return null
    return value.toLong().toInt()
  }

  private fun emitFinish(cancelled: Boolean) {
    if (suppressFinishDepth > 0) return
    if (finishEmittedForRun) return
    finishEmittedForRun = true
    onAnimationFinish?.invoke(cancelled)
  }

  private fun emitFailure(message: String) {
    onAnimationFailure?.invoke(message)
  }

  private inline fun withFinishSuppressed(body: () -> Unit) {
    suppressFinishDepth++
    try {
      body()
    } finally {
      suppressFinishDepth--
    }
  }

  override fun play(startFrame: Double, endFrame: Double) {
    val hasRange = startFrame != -1.0 && endFrame != -1.0
    onUiThread {
      if (hasRange) {
        animationView.setMinAndMaxFrame(startFrame.toInt(), endFrame.toInt())
      } else {
        val composition = animationView.composition
        if (composition != null) {
          val start = composition.startFrame.toInt()
          val end = composition.endFrame.toInt()
          if (animationView.minFrame.toInt() != start || animationView.maxFrame.toInt() != end) {
            animationView.setMinAndMaxFrame(start, end)
          }
        }
      }

      whenAttached {
        finishEmittedForRun = false
        if (hasRange) {
          animationView.playAnimation()
        } else {
          animationView.resumeAnimation()
        }
      }
    }
  }

  override fun reset() {
    onUiThread {
      animationView.cancelAnimation()
      animationView.progress = 0f
      appliedProgress = 0f
    }
  }

  override fun pause() {
    onUiThread {
      animationView.pauseAnimation()
      emitFinish(true)
    }
  }

  override fun resume() {
    onUiThread {
      finishEmittedForRun = false
      animationView.resumeAnimation()
    }
  }

  private inline fun onUiThread(crossinline body: () -> Unit) {
    if (Looper.myLooper() == Looper.getMainLooper()) {
      body()
    } else {
      Handler(Looper.getMainLooper()).post { body() }
    }
  }

  private fun whenAttached(body: () -> Unit) {
    if (animationView.isAttachedToWindow) {
      body()
      return
    }
    pendingAttachPlay?.let { animationView.removeOnAttachStateChangeListener(it) }
    val listener = object : View.OnAttachStateChangeListener {
      override fun onViewAttachedToWindow(v: View) {
        animationView.removeOnAttachStateChangeListener(this)
        pendingAttachPlay = null
        body()
      }

      override fun onViewDetachedFromWindow(v: View) {
        animationView.removeOnAttachStateChangeListener(this)
        pendingAttachPlay = null
      }
    }
    pendingAttachPlay = listener
    animationView.addOnAttachStateChangeListener(listener)
  }

  private companion object {
    const val UNSET = -1
  }
}
