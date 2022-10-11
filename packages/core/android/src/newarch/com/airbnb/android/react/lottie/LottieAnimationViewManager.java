package com.airbnb.android.react.lottie;

import androidx.annotation.NonNull;

import com.airbnb.lottie.LottieAnimationView;
import com.facebook.react.module.annotations.ReactModule;
import com.facebook.react.uimanager.SimpleViewManager;
import com.facebook.react.uimanager.ThemedReactContext;
import com.facebook.react.uimanager.ViewManagerDelegate;
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
    public void setSourceName(LottieAnimationView view, String name) {
        LottieAnimationViewManagerImpl.setSourceName(view, name, propManagersMap);
    }

    @Override
    public void setSourceJson(LottieAnimationView view, String json) {
        LottieAnimationViewManagerImpl.setSourceJson(view, json, propManagersMap);
    }

    @Override
    public void setSourceURL(LottieAnimationView view, String urlString) {
        LottieAnimationViewManagerImpl.setSourceURL(view, urlString, propManagersMap);
    }

    @Override
    public void setCacheComposition(LottieAnimationView view, boolean cacheComposition) {
        LottieAnimationViewManagerImpl.setCacheComposition(view, cacheComposition);
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
    public void setResizeMode(LottieAnimationView view, String resizeMode) {
        LottieAnimationViewManagerImpl.setResizeMode(view, resizeMode, propManagersMap);
    }

    @Override
    public void setRenderMode(LottieAnimationView view, String renderMode) {
        LottieAnimationViewManagerImpl.setRenderMode(view, renderMode, propManagersMap);
    }

    @Override
    public void setProgress(LottieAnimationView view, float progress) {
        LottieAnimationViewManagerImpl.setProgress(view, progress, propManagersMap);
    }

    @Override
    public void setSpeed(LottieAnimationView view, double speed) {
        LottieAnimationViewManagerImpl.setSpeed(view, speed, propManagersMap);
    }

    @Override
    public void setLoop(LottieAnimationView view, boolean loop) {
        LottieAnimationViewManagerImpl.setLoop(view, loop, propManagersMap);
    }

    @Override
    public void setImageAssetsFolder(LottieAnimationView view, String imageAssetsFolder) {
        LottieAnimationViewManagerImpl.setImageAssetsFolder(view, imageAssetsFolder, propManagersMap);
    }

    @Override
    public void setEnableMergePathsAndroidForKitKatAndAbove(LottieAnimationView view, boolean enableMergePaths) {
        LottieAnimationViewManagerImpl.setEnableMergePaths(view, enableMergePaths, propManagersMap);
    }

    @Override
    public void setColorFilters(LottieAnimationView view, String colorFilters) {
        //LottieAnimationViewManagerImpl.setColorFilters(view, colorFilters, propManagersMap);
        //TODO use GSON to transform new filters to usable object
    }

    @Override
    public void setTextFilters(LottieAnimationView view, String textFilters) {
        //LottieAnimationViewManagerImpl.setColorFilters(view, colorFilters, propManagersMap);
        //TODO use GSON to transform new filters to usable object
    }

    @Override
    protected void onAfterUpdateTransaction(@NonNull LottieAnimationView view) {
        super.onAfterUpdateTransaction(view);
        LottieAnimationViewManagerImpl.onAfterUpdateTransaction(view, propManagersMap);
    }
}
