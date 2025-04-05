#include <jni.h>
#include "lottiereactnativeOnLoad.hpp"

JNIEXPORT jint JNICALL JNI_OnLoad(JavaVM* vm, void*) {
  return margelo::nitro::lottiereactnative::initialize(vm);
}
