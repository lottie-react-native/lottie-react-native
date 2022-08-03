package com.airbnb.android.react.lottie;

import android.animation.Animator;
import android.content.Context;
import android.content.ContextWrapper;
import android.os.Handler;
import android.os.Looper;
import android.util.Log;
import android.view.View;
import android.view.View.OnAttachStateChangeListener;
import android.widget.ImageView;

import androidx.annotation.NonNull;
import androidx.core.view.ViewCompat;

import com.airbnb.lottie.LottieAnimationView;
import com.airbnb.lottie.RenderMode;
import com.facebook.react.bridge.Arguments;
import com.facebook.react.bridge.ReactContext;
import com.facebook.react.bridge.ReadableArray;
import com.facebook.react.bridge.WritableMap;
import com.facebook.react.common.MapBuilder;
import com.facebook.react.uimanager.ThemedReactContext;
import com.facebook.react.uimanager.events.RCTModernEventEmitter;

import java.io.BufferedReader;
import java.io.InputStreamReader;
import java.net.URL;
import java.util.Map;

final class LottieAnimationViewManagerImpl {

    private LottieAnimationViewManagerImpl() {
        //This hides the constructor and avoid accidental instance creation
    }

    static final String REACT_CLASS = "LottieAnimationView";

    static Map<String, Object> getExportedViewConstants() {
        return MapBuilder.<String, Object>builder()
                .put("VERSION", 1)
                .build();
    }

    static LottieAnimationView createViewInstance(@NonNull ThemedReactContext context) {
        final LottieAnimationView view = new LottieAnimationView(context);
        view.setScaleType(ImageView.ScaleType.CENTER_INSIDE);
        view.addAnimatorListener(new Animator.AnimatorListener() {
            @Override
            public void onAnimationStart(Animator animation) {
                //do nothing
            }

            @Override
            public void onAnimationEnd(Animator animation) {
                sendOnAnimationFinishEvent(view, false);
            }

            @Override
            public void onAnimationCancel(Animator animation) {
                sendOnAnimationFinishEvent(view, true);
            }

            @Override
            public void onAnimationRepeat(Animator animation) {
                //do nothing
            }
        });
        return view;
    }

    static void sendOnAnimationFinishEvent(final LottieAnimationView view, boolean isCancelled) {
        WritableMap event = Arguments.createMap();
        event.putBoolean("isCancelled", isCancelled);
        Context ctx = view.getContext();
        ReactContext reactContext = null;
        while (ctx instanceof ContextWrapper) {
            if (ctx instanceof ReactContext) {
                reactContext = (ReactContext) ctx;
                break;
            }
            ctx = ((ContextWrapper) ctx).getBaseContext();
        }
        if (reactContext != null) {
            reactContext.getJSModule(RCTModernEventEmitter.class).receiveEvent(
                    view.getId(),
                    view.getId(),
                    "animationFinish",
                    event);
        }
    }

    static Map getExportedCustomBubblingEventTypeConstants() {
        return MapBuilder.builder()
                .put("animationFinish",
                        MapBuilder.of("phasedRegistrationNames",
                                MapBuilder.of("bubbled", "onAnimationFinish")
                        )
                )
                .build();
    }

    static void play(LottieAnimationView view, int startFrame, int endFrame) {
        new Handler(Looper.getMainLooper()).post(() -> {
            if (startFrame != -1 && endFrame != -1) {
                if (startFrame > endFrame) {
                    view.setMinAndMaxFrame(endFrame, startFrame);
                    if (view.getSpeed() > 0) {
                        view.reverseAnimationSpeed();
                    }
                } else {
                    view.setMinAndMaxFrame(startFrame, endFrame);
                    if (view.getSpeed() < 0) {
                        view.reverseAnimationSpeed();
                    }
                }
            }
            if (ViewCompat.isAttachedToWindow(view)) {
                view.setProgress(0f);
                view.playAnimation();
            } else {
                view.addOnAttachStateChangeListener(new OnAttachStateChangeListener() {
                    @Override
                    public void onViewAttachedToWindow(View v) {
                        LottieAnimationView view = (LottieAnimationView) v;
                        view.setProgress(0f);
                        view.playAnimation();
                        view.removeOnAttachStateChangeListener(this);
                    }

                    @Override
                    public void onViewDetachedFromWindow(View v) {
                        view.removeOnAttachStateChangeListener(this);
                    }
                });
            }
        });
    }

    static void reset(LottieAnimationView view) {
        new Handler(Looper.getMainLooper()).post(() -> {
            if (ViewCompat.isAttachedToWindow(view)) {
                view.cancelAnimation();
                view.setProgress(0f);
            }
        });
    }

    static void pause(LottieAnimationView view) {
        new Handler(Looper.getMainLooper()).post(() -> {
            if (ViewCompat.isAttachedToWindow(view)) {
                view.pauseAnimation();
            }
        });
    }

    static void resume(LottieAnimationView view) {
        new Handler(Looper.getMainLooper()).post(() -> {
            if (ViewCompat.isAttachedToWindow(view)) {
                view.resumeAnimation();
            }
        });
    }

    static void setSourceName(LottieAnimationView view, String name, Map<LottieAnimationView, LottieAnimationViewPropertyManager> propManagersMap) {
        // To match the behaviour on iOS we expect the source name to be
        // extensionless. This means "myAnimation" corresponds to a file
        // named `myAnimation.json` in `main/assets`. To maintain backwards
        // compatibility we only add the .json extension if no extension is
        // passed.
        if (!name.contains(".")) {
            name = name + ".json";
        }
        getOrCreatePropertyManager(view, propManagersMap).setAnimationName(name);
    }

    static void setSourceJson(LottieAnimationView view, String json, Map<LottieAnimationView, LottieAnimationViewPropertyManager> propManagersMap) {
        getOrCreatePropertyManager(view, propManagersMap).setAnimationJson(json);
    }

    static void setSourceURL(LottieAnimationView view, String urlString, Map<LottieAnimationView, LottieAnimationViewPropertyManager> propManagersMap) {
        final String finalUrlString = urlString;
        final LottieAnimationView finalView = view;

        Thread thread = new Thread(() -> {
            try {
                BufferedReader in = new BufferedReader(new InputStreamReader(new URL(finalUrlString).openStream()));
                String inputLine;
                StringBuilder json = new StringBuilder();

                while ((inputLine = in.readLine()) != null)
                    json.append(inputLine);

                in.close();

                final String js = json.toString();

                new Handler(Looper.getMainLooper()).post(() -> {
                    getOrCreatePropertyManager(finalView, propManagersMap).setAnimationJson(js);
                    getOrCreatePropertyManager(finalView, propManagersMap).commitChanges();
                });
            } catch (Exception e) {
                Log.e(LottieAnimationViewManagerImpl.class.getName(), "Error loading animation from URL: " + e);
            }
        });

        thread.start();
    }

    static void setCacheComposition(LottieAnimationView view, boolean cacheComposition) {
        view.setCacheComposition(cacheComposition);
    }

    static void setResizeMode(LottieAnimationView view, String resizeMode, Map<LottieAnimationView, LottieAnimationViewPropertyManager> propManagersMap) {
        ImageView.ScaleType mode = null;
        if ("cover".equals(resizeMode)) {
            mode = ImageView.ScaleType.CENTER_CROP;
        } else if ("contain".equals(resizeMode)) {
            mode = ImageView.ScaleType.CENTER_INSIDE;
        } else if ("center".equals(resizeMode)) {
            mode = ImageView.ScaleType.CENTER;
        }
        getOrCreatePropertyManager(view, propManagersMap).setScaleType(mode);
    }

    static void setRenderMode(LottieAnimationView view, String renderMode, Map<LottieAnimationView, LottieAnimationViewPropertyManager> propManagersMap) {
        RenderMode mode = null;
        if ("AUTOMATIC".equals(renderMode)) {
            mode = RenderMode.AUTOMATIC;
        } else if ("HARDWARE".equals(renderMode)) {
            mode = RenderMode.HARDWARE;
        } else if ("SOFTWARE".equals(renderMode)) {
            mode = RenderMode.SOFTWARE;
        }
        getOrCreatePropertyManager(view, propManagersMap).setRenderMode(mode);
    }

    static void setProgress(LottieAnimationView view, float progress, Map<LottieAnimationView, LottieAnimationViewPropertyManager> propManagersMap) {
        getOrCreatePropertyManager(view, propManagersMap).setProgress(progress);
    }

    static void setSpeed(LottieAnimationView view, double speed, Map<LottieAnimationView, LottieAnimationViewPropertyManager> propManagersMap) {
        getOrCreatePropertyManager(view, propManagersMap).setSpeed((float) speed);
    }

    static void setLoop(LottieAnimationView view, boolean loop, Map<LottieAnimationView, LottieAnimationViewPropertyManager> propManagersMap) {
        getOrCreatePropertyManager(view, propManagersMap).setLoop(loop);
    }

    static void setEnableMergePaths(LottieAnimationView view, boolean enableMergePaths, Map<LottieAnimationView, LottieAnimationViewPropertyManager> propManagersMap) {
        getOrCreatePropertyManager(view, propManagersMap).setEnableMergePaths(enableMergePaths);
    }

    static void onAfterUpdateTransaction(LottieAnimationView view, Map<LottieAnimationView, LottieAnimationViewPropertyManager> propManagersMap) {
        getOrCreatePropertyManager(view, propManagersMap).commitChanges();
    }

    static void setImageAssetsFolder(LottieAnimationView view, String imageAssetsFolder, Map<LottieAnimationView, LottieAnimationViewPropertyManager> propManagersMap) {
        getOrCreatePropertyManager(view, propManagersMap).setImageAssetsFolder(imageAssetsFolder);
    }

    static void setColorFilters(LottieAnimationView view, ReadableArray colorFilters, Map<LottieAnimationView, LottieAnimationViewPropertyManager> propManagersMap) {
        getOrCreatePropertyManager(view, propManagersMap).setColorFilters(colorFilters);
    }

    static void setTextFilters(LottieAnimationView view, ReadableArray textFilters, Map<LottieAnimationView, LottieAnimationViewPropertyManager> propManagersMap) {
        getOrCreatePropertyManager(view, propManagersMap).setTextFilters(textFilters);
    }

    static LottieAnimationViewPropertyManager getOrCreatePropertyManager(LottieAnimationView view,
                                                                         Map<LottieAnimationView, LottieAnimationViewPropertyManager> propManagersMap) {
        LottieAnimationViewPropertyManager result = propManagersMap.get(view);
        if (result == null) {
            result = new LottieAnimationViewPropertyManager(view);
            propManagersMap.put(view, result);
        }
        return result;
    }
}
