package com.airbnb.android.react.lottie;

import android.animation.Animator;
import android.content.Context;

import com.airbnb.lottie.LottieAnimationView;
import com.facebook.react.bridge.Arguments;
import com.facebook.react.bridge.ReactContext;
import com.facebook.react.bridge.WritableMap;
import com.facebook.react.uimanager.events.RCTEventEmitter;

public class ReactLottieAnimationView extends LottieAnimationView implements Animator.AnimatorListener {

    ReactLottieAnimationView(Context context) {
        super(context);
        this.addAnimatorListener(this);
    }

    public void onAnimationStart(Animator animation) {
    }

    public void onAnimationEnd(Animator animation) {
        WritableMap event = Arguments.createMap();
        ReactContext reactContext = (ReactContext)this.getContext();
        reactContext.getJSModule(RCTEventEmitter.class).receiveEvent(this.getId(), "topChange", event);
    }

    public void onAnimationCancel(Animator animation) {
    }

    public void onAnimationRepeat(Animator animation) {
    }
}
