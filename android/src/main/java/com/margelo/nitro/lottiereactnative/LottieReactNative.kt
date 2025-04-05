package com.margelo.nitro.lottiereactnative
  
import com.facebook.proguard.annotations.DoNotStrip

@DoNotStrip
class LottieReactNative : HybridLottieReactNativeSpec() {
  override fun multiply(a: Double, b: Double): Double {
    return a * b
  }
}
