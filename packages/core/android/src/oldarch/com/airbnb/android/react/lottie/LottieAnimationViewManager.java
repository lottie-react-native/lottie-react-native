package com.airbnb.android.react.lottie;

import androidx.annotation.NonNull;

import com.airbnb.lottie.LottieAnimationView;
import com.facebook.react.bridge.ReadableArray;
import com.facebook.react.uimanager.SimpleViewManager;
import com.facebook.react.uimanager.ThemedReactContext;
import com.facebook.react.uimanager.annotations.ReactProp;

import java.util.Map;
import java.util.WeakHashMap;

class LottieAnimationViewManager extends SimpleViewManager<LottieAnimationView> {

    private final Map<LottieAnimationView, LottieAnimationViewPropertyManager> propManagersMap = new WeakHashMap<>();

    @Override
    public Map<String, Object> getExportedViewConstants() {
        return LottieAnimationViewManagerImpl.getExportedViewConstants();
    }

    @NonNull
    @Override
    public String getName() {
        return LottieAnimationViewManagerImpl.REACT_CLASS;
    }

    @NonNull
    @Override
    public LottieAnimationView createViewInstance(@NonNull ThemedReactContext context) {
        return LottieAnimationViewManagerImpl.createViewInstance(context);
    }

    @Override
    public Map getExportedCustomBubblingEventTypeConstants() {
        return LottieAnimationViewManagerImpl.getExportedCustomBubblingEventTypeConstants();
    }

    @Override
    public void receiveCommand(@NonNull LottieAnimationView view, String commandName, ReadableArray args) {
        switch (commandName) {
            case "play":
                LottieAnimationViewManagerImpl.play(view, args.getInt(0), args.getInt(1));
                break;
            case "reset":
                LottieAnimationViewManagerImpl.reset(view);
                break;
            case "pause":
                LottieAnimationViewManagerImpl.pause(view);
                break;
            case "resume":
                LottieAnimationViewManagerImpl.resume(view);
                break;
            default:
                // do nothing
        }
    }

    @ReactProp(name = "sourceName")
    public void setSourceName(LottieAnimationView view, String name) {
        LottieAnimationViewManagerImpl.setSourceName(view, name, propManagersMap);
    }

    @ReactProp(name = "sourceJson")
    public void setSourceJson(LottieAnimationView view, String json) {
        LottieAnimationViewManagerImpl.setSourceJson(view, json, propManagersMap);
    }

    @ReactProp(name = "sourceURL")
    public void setSourceURL(LottieAnimationView view, String urlString) {
        LottieAnimationViewManagerImpl.setSourceURL(view, urlString, propManagersMap);
    }

    @ReactProp(name = "cacheComposition")
    public void setCacheComposition(LottieAnimationView view, boolean cacheComposition) {
        LottieAnimationViewManagerImpl.setCacheComposition(view, cacheComposition);
    }

    @ReactProp(name = "resizeMode")
    public void setResizeMode(LottieAnimationView view, String resizeMode) {
        LottieAnimationViewManagerImpl.setResizeMode(view, resizeMode, propManagersMap);
    }

    @ReactProp(name = "renderMode")
    public void setRenderMode(LottieAnimationView view, String renderMode) {
        LottieAnimationViewManagerImpl.setRenderMode(view, renderMode, propManagersMap);
    }

    @ReactProp(name = "progress")
    public void setProgress(LottieAnimationView view, float progress) {
        LottieAnimationViewManagerImpl.setProgress(view, progress, propManagersMap);
    }

    @ReactProp(name = "speed")
    public void setSpeed(LottieAnimationView view, double speed) {
        LottieAnimationViewManagerImpl.setSpeed(view, speed, propManagersMap);
    }

    @ReactProp(name = "loop")
    public void setLoop(LottieAnimationView view, boolean loop) {
        LottieAnimationViewManagerImpl.setLoop(view, loop, propManagersMap);
    }

    @ReactProp(name = "imageAssetsFolder")
    public void setImageAssetsFolder(LottieAnimationView view, String imageAssetsFolder) {
        LottieAnimationViewManagerImpl.setImageAssetsFolder(view, imageAssetsFolder, propManagersMap);
    }

    @ReactProp(name = "enableMergePathsAndroidForKitKatAndAbove")
    public void setEnableMergePaths(LottieAnimationView view, boolean enableMergePaths) {
        LottieAnimationViewManagerImpl.setEnableMergePaths(view, enableMergePaths, propManagersMap);
    }

    @ReactProp(name = "colorFilters")
    public void setColorFilters(LottieAnimationView view, ReadableArray colorFilters) {
        LottieAnimationViewManagerImpl.setColorFilters(view, colorFilters, propManagersMap);
    }

    @ReactProp(name = "textFiltersAndroid")
    public void setTextFilters(LottieAnimationView view, ReadableArray textFilters) {
        LottieAnimationViewManagerImpl.setTextFilters(view, textFilters, propManagersMap);
    }

    @Override
    protected void onAfterUpdateTransaction(@NonNull LottieAnimationView view) {
        super.onAfterUpdateTransaction(view);
        LottieAnimationViewManagerImpl.onAfterUpdateTransaction(view, propManagersMap);
    }
}
