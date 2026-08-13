#include <fbjni/fbjni.h>
#include <jni.h>

#include "LottieNitroOnLoad.hpp"

// `registerAllNatives()` is what registers the Fabric ComponentDescriptor for
// LottieView (via JHybridLottieViewStateUpdater::registerNatives). It only runs
// once this library has been loaded, which is why LottieNitroPackage forces
// System.loadLibrary("LottieNitro") in its companion object initialiser.
JNIEXPORT jint JNICALL JNI_OnLoad(JavaVM* vm, void*) {
  return facebook::jni::initialize(vm, [] {
    margelo::nitro::lottienitro::registerAllNatives();
  });
}
