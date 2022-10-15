package com.airbnb.android.react.lottie;

import androidx.annotation.NonNull;
import androidx.annotation.Nullable;

import com.airbnb.lottie.LottieAnimationView;
import com.facebook.react.bridge.ReadableArray;
import com.facebook.react.module.annotations.ReactModule;
import com.facebook.react.uimanager.SimpleViewManager;
import com.facebook.react.uimanager.ThemedReactContext;
import com.facebook.react.uimanager.ViewManagerDelegate;
import com.facebook.react.uimanager.annotations.ReactProp;
import com.facebook.react.viewmanagers.LottieAnimationViewManagerDelegate;
import com.facebook.react.viewmanagers.LottieAnimationViewManagerInterface;

import java.util.Map;
import java.util.WeakHashMap;

@ReactModule(name = LottieAnimationViewManagerImpl.REACT_CLASS)
class LottieAnimationViewManager extends SimpleViewManager<LottieAnimationView>
        implements LottieAnimationViewManagerInterface<LottieAnimationView> {

    private final Map<LottieAnimationView, LottieAnimationViewPropertyManager> propManagersMap = new WeakHashMap<>();

    private final ViewManagerDelegate<LottieAnimationView> delegate;

    public LottieAnimationViewManager() {
        delegate = new LottieAnimationViewManagerDelegate<>(this);
    }

    private LottieAnimationViewPropertyManager getOrCreatePropertyManager(LottieAnimationView view) {
        LottieAnimationViewPropertyManager result = propManagersMap.get(view);
        if (result == null) {
            result = new LottieAnimationViewPropertyManager(view);
            propManagersMap.put(view, result);
        }
        return result;
    }

    @Override
    protected ViewManagerDelegate<LottieAnimationView> getDelegate() {
        return delegate;
    }

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
    protected void onAfterUpdateTransaction(@NonNull LottieAnimationView view) {
        super.onAfterUpdateTransaction(view);
        getOrCreatePropertyManager(view).commitChanges();
    }

    @Override
    public void receiveCommand(@NonNull LottieAnimationView root, String commandId, ReadableArray args) {
        delegate.receiveCommand(root, commandId, args);
    }

    @Override
    public void play(LottieAnimationView view, int startFrame, int endFrame) {
        LottieAnimationViewManagerImpl.play(view, startFrame, endFrame);
    }

    @Override
    public void reset(LottieAnimationView view) {
        LottieAnimationViewManagerImpl.reset(view);
    }

    @Override
    public void pause(LottieAnimationView view) {
        LottieAnimationViewManagerImpl.pause(view);
    }

    @Override
    public void resume(LottieAnimationView view) {
        LottieAnimationViewManagerImpl.resume(view);
    }

    @Override
    @ReactProp(name = "sourceName")
    public void setSourceName(LottieAnimationView view, String name) {
        LottieAnimationViewManagerImpl.setSourceName(view, name, getOrCreatePropertyManager(view));
    }

    @Override
    @ReactProp(name = "sourceJson")
    public void setSourceJson(LottieAnimationView view, String json) {
        LottieAnimationViewManagerImpl.setSourceJson(view, json, getOrCreatePropertyManager(view));
    }

    @Override
    @ReactProp(name = "sourceURL")
    public void setSourceURL(LottieAnimationView view, String urlString) {
        LottieAnimationViewManagerImpl.setSourceURL(view, urlString, getOrCreatePropertyManager(view));
    }

    @Override
    @ReactProp(name = "cacheComposition")
    public void setCacheComposition(LottieAnimationView view, boolean cacheComposition) {
        LottieAnimationViewManagerImpl.setCacheComposition(view, cacheComposition);
    }

    @Override
    @ReactProp(name = "resizeMode")
    public void setResizeMode(LottieAnimationView view, String resizeMode) {
        LottieAnimationViewManagerImpl.setResizeMode(view, resizeMode, getOrCreatePropertyManager(view));
    }

    @Override
    @ReactProp(name = "renderMode")
    public void setRenderMode(LottieAnimationView view, String renderMode) {
        LottieAnimationViewManagerImpl.setRenderMode(view, renderMode, getOrCreatePropertyManager(view));
    }

    @Override
    @ReactProp(name = "progress")
    public void setProgress(LottieAnimationView view, float progress) {
        LottieAnimationViewManagerImpl.setProgress(view, progress, getOrCreatePropertyManager(view));
    }

    @Override
    @ReactProp(name = "speed")
    public void setSpeed(LottieAnimationView view, double speed) {
        LottieAnimationViewManagerImpl.setSpeed(view, speed, getOrCreatePropertyManager(view));
    }

    @Override
    @ReactProp(name = "loop")
    public void setLoop(LottieAnimationView view, boolean loop) {
        LottieAnimationViewManagerImpl.setLoop(view, loop, getOrCreatePropertyManager(view));
    }

    @Override
    @ReactProp(name = "imageAssetsFolder")
    public void setImageAssetsFolder(LottieAnimationView view, String imageAssetsFolder) {
        LottieAnimationViewManagerImpl.setImageAssetsFolder(view, imageAssetsFolder, getOrCreatePropertyManager(view));
    }

    @Override
    @ReactProp(name = "enableMergePathsAndroidForKitKatAndAbove")
    public void setEnableMergePathsAndroidForKitKatAndAbove(LottieAnimationView view, boolean enableMergePaths) {
        LottieAnimationViewManagerImpl.setEnableMergePaths(view, enableMergePaths, getOrCreatePropertyManager(view));
    }

    @Override
    @ReactProp(name = "colorFilters")
    public void setColorFilters(LottieAnimationView view, @Nullable ReadableArray colorFilters) {
        LottieAnimationViewManagerImpl.setColorFilters(view, colorFilters, getOrCreatePropertyManager(view));
    }

    @Override
    @ReactProp(name = "textFiltersAndroid")
    public void setTextFiltersAndroid(LottieAnimationView view, @Nullable ReadableArray textFilters) {
        LottieAnimationViewManagerImpl.setTextFilters(view, textFilters, getOrCreatePropertyManager(view));
    }

    // this props is not available on Android, however we must override the setter
    @Override
    public void setTextFiltersIOS(LottieAnimationView view, @Nullable ReadableArray value) {
        //ignore - do nothing here
    }
}
