package com.margelo.nitro.lottienitro

import android.view.View
import androidx.annotation.Keep
import com.facebook.proguard.annotations.DoNotStrip
import com.facebook.react.uimanager.ThemedReactContext

/**
 * Stub implementation of the `LottieView` Nitro view.
 *
 * Renders an empty [View]. This exists so the module codegens, compiles and
 * registers end to end; Lottie rendering lands in a later change.
 *
 * The constructor signature is fixed by the generated
 * `HybridLottieViewManager.createViewInstance`, which calls
 * `HybridLottieView(reactContext)`. [Keep] and [DoNotStrip] are required because
 * the class is instantiated from JNI by name.
 */
@Keep
@DoNotStrip
class HybridLottieView(
  val context: ThemedReactContext,
) : HybridLottieViewSpec() {
  override val view: View = View(context)

  // Stored only — no rendering yet.
  override var placeholder: Boolean = false
}
