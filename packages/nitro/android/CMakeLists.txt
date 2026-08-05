cmake_minimum_required(VERSION 3.9.0)
project(LottieNitro)

# The library name must match `androidCxxLibName` in nitro.json — the generated
# LottieNitroOnLoad.kt calls System.loadLibrary("LottieNitro") and the generated
# autolinking CMake does target_sources(LottieNitro ...).
set(PACKAGE_NAME LottieNitro)
set(CMAKE_VERBOSE_MAKEFILE ON)
set(CMAKE_CXX_STANDARD 20)

add_library(${PACKAGE_NAME} SHARED
        src/main/cpp/cpp-adapter.cpp
)

# Adds all nitrogen-generated C++ sources plus fbjni / ReactAndroid /
# NitroModules linkage.
include(${CMAKE_SOURCE_DIR}/../nitrogen/generated/android/LottieNitro+autolinking.cmake)

include_directories("src/main/cpp")

find_library(LOG_LIB log)

target_link_libraries(
        ${PACKAGE_NAME}
        ${LOG_LIB}
        android
)
