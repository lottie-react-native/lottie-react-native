package com.margelo.nitro.lottienitro

import com.facebook.react.BaseReactPackage
import com.facebook.react.bridge.NativeModule
import com.facebook.react.bridge.ReactApplicationContext
import com.facebook.react.module.model.ReactModuleInfoProvider
import com.facebook.react.uimanager.ViewManager
import com.margelo.nitro.lottienitro.views.HybridLottieViewManager

/**
 * Registers the Nitro view with React Native. Nitro's own autolinking generates
 * the constructor plumbing but does not register views on Android, so all of
 * this is required:
 *
 *  1. The class must be named `*Package` and extend a React package — the
 *     Community CLI's `findPackageClassName` regex is what makes the library
 *     autolink at all. Without a match the Gradle project is never included.
 *  2. [createViewManagers] must return the generated manager, or there is no
 *     Java-side view creation, prop batching or drop handling.
 *  3. The companion initialiser is load-bearing: the Fabric
 *     ComponentDescriptor is registered at `JNI_OnLoad`, so the native library
 *     has to be loaded before the first surface starts. Without it React Native
 *     falls back to `UnimplementedNativeViewComponentDescriptor`.
 */
class LottieNitroPackage : BaseReactPackage() {
  override fun getModule(
    name: String,
    reactContext: ReactApplicationContext,
  ): NativeModule? = null

  override fun getReactModuleInfoProvider(): ReactModuleInfoProvider =
    ReactModuleInfoProvider { HashMap() }

  override fun createViewManagers(
    reactContext: ReactApplicationContext,
  ): List<ViewManager<*, *>> = listOf(HybridLottieViewManager())

  companion object {
    init {
      LottieNitroOnLoad.initializeNative()
    }
  }
}
