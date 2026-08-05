package com.margelo.nitro.lottienitro

import android.animation.Animator
import android.graphics.ColorFilter
import android.graphics.Typeface
import android.net.Uri
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

/**
 * Nitro view backing `LottieView` on Android.
 *
 * Ported from v7's `LottieAnimationViewManagerImpl.kt` +
 * `LottieAnimationViewPropertyManager.kt`, with the structure reworked. v7's
 * property manager committed eagerly from inside the source setters, so
 * `commitChanges()` ran two or more times per transaction, and its `.lottie`
 * branch used a bare `return` inside a `let` — a non-local return that skipped
 * every remaining prop. Those props only landed because a second commit followed,
 * and an unresolvable raw name wedged the view permanently. Here the setters are
 * pure stores and everything is applied once from [afterUpdate].
 *
 * Nitro calls the setters and [afterUpdate] synchronously on the UI thread (via
 * `SurfaceMountingManager`, `@UiThread`), so no posting is needed.
 *
 * Imperative commands are intentionally still no-ops — they land with the ref in
 * a later change.
 */
@Keep
@DoNotStrip
class HybridLottieView(
  val context: ThemedReactContext,
) : HybridLottieViewSpec() {
  /**
   * One animation view for the component's lifetime. Keeping the same instance is
   * what buys us lottie-android's own `cancelLoaderTask()`, which detaches the
   * listeners of a superseded composition load — so a stale load cannot reach us.
   *
   * `CENTER_INSIDE` matches v7's `createViewInstance`, so appearance before the
   * first `resizeMode` prop arrives is identical.
   */
  private val animationView = LottieAnimationView(context).apply {
    scaleType = ImageView.ScaleType.CENTER_INSIDE
  }

  override val view: View = animationView

  // MARK: Props (pure stores)

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

  // MARK: Applied state
  //
  // Native value diffing is mandatory, not an optimisation: Nitro compares props
  // with strict equality, which is reference identity for arrays, so an inline
  // `colorFilters={[...]}` arrives "changed" on every commit.

  private sealed interface SourceKind {
    data class Name(val v: String) : SourceKind
    data class Json(val v: String) : SourceKind
    data class Url(val v: String) : SourceKind
    data class DotLottie(val v: String) : SourceKind
  }

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
  private var appliedColorFilters: List<LottieColorFilter> = emptyList()
  private var installedColorKeyPaths: List<KeyPath> = emptyList()

  /** Bumped on every source change, before the load starts. */
  private var loadGeneration = 0L

  private var suppressFinishDepth = 0
  private var finishEmittedForRun = false
  private var sourceJustChanged = false

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
    // Ported unchanged from v7's property manager, so text layers can use fonts
    // registered with React Native.
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

  // MARK: Lifecycle

  override fun afterUpdate() {
    withFinishSuppressed {
      val nextSource = pendingSource()
      sourceJustChanged = nextSource != appliedSource

      // cacheComposition first: the single-arg setAnimation* overloads read the
      // field. v7 applied it straight from the prop setter, so ordering relative
      // to the source was down to luck.
      (cacheComposition ?: true).let {
        if (it != appliedCacheComposition || !appliedDidApplyOnce) {
          animationView.setCacheComposition(it)
          appliedCacheComposition = it
        }
      }

      // Before the composition: clearComposition() nulls the ImageAssetManager,
      // which is rebuilt lazily from this string. v7 applied it after, too late.
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
        // clearComposition() drops the composition layer, so previously applied
        // value callbacks are gone with it.
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
    // Detach before cancelling, so nothing can emit into a torn-down runtime.
    loadGeneration++
    suppressFinishDepth++
    animationView.removeAnimatorListener(animatorListener)
    animationView.removeAllLottieOnCompositionLoadedListener()
    animationView.setFailureListener(null)
    installedColorKeyPaths.forEach {
      animationView.clearValueCallback(it, LottieProperty.COLOR_FILTER)
    }
    installedColorKeyPaths = emptyList()
    animationView.setTextDelegate(null)
    animationView.cancelAnimation()
    animationView.clearAnimation()
    onAnimationFinish = null
    onAnimationFailure = null
    onAnimationLoaded = null
  }

  // MARK: Props valid without a composition

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

    // A View layer type, NOT a RenderMode. v7 conflated the two names but not the
    // implementations; this mirrors v7's behaviour including forcing SOFTWARE
    // rather than LAYER_TYPE_NONE when false.
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
      // Empty clears, which v7 could not do (guarded by size() > 0). Must be null
      // rather than an empty delegate: any present delegate flips useTextGlyphs()
      // off, silently switching from embedded glyphs to font rendering. The setter
      // is a bare field store, so invalidate explicitly.
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

  // MARK: Source loading

  /**
   * Fixed precedence, so a caller bypassing the JS wrapper and sending several
   * source props is deterministic. v7 had none — the last setter won.
   *
   * `""` means absent: the wrapper always sends all four (TODO.md item 8).
   */
  private fun pendingSource(): SourceKind? {
    sourceJson?.takeIf { it.isNotEmpty() }?.let { return SourceKind.Json(it) }
    sourceName?.takeIf { it.isNotEmpty() }?.let { return SourceKind.Name(it) }
    sourceDotLottieURI?.takeIf { it.isNotEmpty() }?.let { return SourceKind.DotLottie(it) }
    sourceURL?.takeIf { it.isNotEmpty() }?.let { return SourceKind.Url(it) }
    return null
  }

  private fun applySource(source: SourceKind?) {
    val generation = loadGeneration
    // Only pass an explicit cache key when caching is on. v7 always passed one,
    // which meant `cacheComposition: false` was silently ignored for sourceURL —
    // the two-arg overloads bypass the flag.
    fun key(s: String): String? = if (appliedCacheComposition) s.hashCode().toString() else null

    try {
      when (source) {
        null -> animationView.setAnimation(null as String?)

        is SourceKind.Json -> animationView.setAnimationFromJson(source.v, key(source.v))

        is SourceKind.Name -> {
          // v7 appends .json when the name is extensionless, to match iOS.
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
      // v7 let FileNotFoundException propagate out of onAfterUpdateTransaction,
      // crashing on the UI thread instead of reporting.
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
          // v7 had no exists() guard here, so FileInputStream threw synchronously.
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

    // Bundled raw resource — the release-mode counterpart of the metro URL path.
    val resourceId = animationView.resources.getIdentifier(
      assetName, "raw", context.packageName,
    )
    if (resourceId == 0) {
      // v7 only logged via RNLog.e AND left the field set, so every later commit
      // early-returned and no prop ever applied again for that view.
      emitFailure("Animation for $assetName was not found in raw resources")
      return
    }
    animationView.setAnimation(resourceId)
  }

  // MARK: Props needing a composition

  /**
   * Invoked from two places: the composition-loaded listener, and the tail of
   * [afterUpdate] when the source did not change. That convergence is what lets
   * the sync and async source paths share one code path.
   *
   * Everything here is gated on an actual composition rather than relying on
   * lottie's `lazyCompositionTasks`: `clearComposition()` does not clear that
   * queue, so an op queued in one commit can replay onto a different source
   * loaded two commits later.
   */
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

    // Seek first, then resume. resumeAnimation() continues from the current frame
    // whereas playAnimation() resets it, so this is what makes progress survive
    // playback start — v7 applied progress first and then called playAnimation(),
    // which reset it.
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
        // resumeAnimation() does not notifyStart, so the latch must be reset here
        // as well as in onAnimationStart.
        finishEmittedForRun = false
        animationView.resumeAnimation()
      }
    }
    // autoPlay true -> false is a no-op, matching v7 on both platforms.
    appliedAutoPlay = wantsPlay
  }

  /**
   * Reconciles rather than accumulates. v7 only ever added value callbacks and
   * never nulled the field, so callbacks piled up on every commit and a keypath
   * removed from the array kept its tint for the view's lifetime.
   */
  private fun reconcileColorFilters() {
    val next = colorFilters?.toList() ?: emptyList()
    if (next == appliedColorFilters && !sourceJustChanged && appliedDidApplyOnce) return

    val desired = mutableListOf<Pair<KeyPath, Int>>()
    for (filter in next) {
      val color = LottieColorParser.parse(filter.color)
      if (color == null) {
        // v7 filled Color.TRANSPARENT silently, or broke out of the whole loop.
        emitFailure(
          "Unparseable colorFilters color \"${filter.color}\" for keypath \"${filter.keypath}\""
        )
        continue
      }
      // v7's Android keypath shape, verbatim: append the descendant glob, then
      // split on literal dots. iOS uses a different shape and deliberately stays
      // different — see TODO.md.
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

  // MARK: Events

  /**
   * Single emit per run. lottie-android's `LottieValueAnimator.notifyCancel()`
   * unconditionally calls `notifyEnd()` after `super.notifyCancel()`, so a cancel
   * is always followed by an end — v7 emitted both.
   */
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

  // MARK: Imperative commands (not implemented yet)

  override fun play(startFrame: Double, endFrame: Double) {
    // Lands with the ref in a later change.
  }

  override fun reset() {}
  override fun pause() {}
  override fun resume() {}

  private companion object {
    /** Matches `ReactFontManager`'s "unset" sentinel, as v7 used. */
    const val UNSET = -1
  }
}
