package com.airbnb.android.react.lottie

import android.content.Context
import com.airbnb.lottie.LottieAnimationView
import com.facebook.react.uimanager.PointerEvents
import com.facebook.react.uimanager.ReactPointerEventsView

class ReactLottieAnimationView(context: Context) :
    LottieAnimationView(context), ReactPointerEventsView {
    override var pointerEvents: PointerEvents = PointerEvents.AUTO
}
