package com.margelo.nitro.lottiereactnative

import android.os.Handler
import android.os.Looper
import android.view.View
import com.airbnb.lottie.LottieAnimationView

class LottieAnimationViewCommandManager(view: LottieAnimationView) {
  fun play(view: LottieAnimationView, startFrame: Int, endFrame: Int) {
    val withCustomFrames = startFrame != -1 && endFrame != -1
    Handler(Looper.getMainLooper()).post {
      if (withCustomFrames) {
        if (startFrame > endFrame) {
          view.setMinAndMaxFrame(endFrame, startFrame)
          if (view.speed > 0) {
            view.reverseAnimationSpeed()
          }
        } else {
          view.setMinAndMaxFrame(startFrame, endFrame)
          if (view.speed < 0) {
            view.reverseAnimationSpeed()
          }
        }
      } else {
        val actualStartFrame = view.composition?.startFrame?.toInt()
        val actualEndFrame = view.composition?.endFrame?.toInt()

        val minFrame = view.minFrame.toInt()
        val maxFrame = view.maxFrame.toInt()
        if (actualStartFrame != null && actualEndFrame != null && (minFrame != actualStartFrame || maxFrame != actualEndFrame)) {
          view.setMinAndMaxFrame(actualStartFrame, actualEndFrame)
        }
      }
      if (view.isAttachedToWindow) {
        if (withCustomFrames) {
          view.playAnimation()
        } else {
          view.resumeAnimation()
        }
      } else {
        view.addOnAttachStateChangeListener(object : View.OnAttachStateChangeListener {
          override fun onViewAttachedToWindow(v: View) {
            val listenerView = v as LottieAnimationView
            if (withCustomFrames) {
              view.playAnimation()
            } else {
              view.resumeAnimation()
            }
            listenerView.removeOnAttachStateChangeListener(this)
          }

          override fun onViewDetachedFromWindow(v: View) {
            val listenerView = v as LottieAnimationView
            listenerView.removeOnAttachStateChangeListener(this)
          }
        })
      }
    }
  }

  fun reset(view: LottieAnimationView) {
    Handler(Looper.getMainLooper()).post {
      if (view.isAttachedToWindow) {
        view.cancelAnimation()
        view.progress = 0f
      }
    }
  }

  fun pause(view: LottieAnimationView) {
    Handler(Looper.getMainLooper()).post {
      if (view.isAttachedToWindow) {
        view.pauseAnimation()
      }
    }
  }

  fun resume(view: LottieAnimationView) {
    Handler(Looper.getMainLooper()).post {
      if (view.isAttachedToWindow) {
        view.resumeAnimation()
      }
    }
  }
}
