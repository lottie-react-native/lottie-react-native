package com.margelo.nitro.lottiereactnative

import android.view.View
import com.facebook.proguard.annotations.DoNotStrip
import com.facebook.react.uimanager.ThemedReactContext

@DoNotStrip
class HybridLottieAnimationView(
  val context: ThemedReactContext
) : HybridLottieAnimationViewSpec() {
  // Props
  override var sourceName: String? = null
  override var sourceJson: String? = null
  override var sourceURL: String? = null
  override var sourceDotLottieURI: String? = null

  // Methods
  override fun play(startFrame: Double, endFrame: Double) {
    TODO("Not yet implemented")
  }

  // View
  override val view: View = View(context)
}
