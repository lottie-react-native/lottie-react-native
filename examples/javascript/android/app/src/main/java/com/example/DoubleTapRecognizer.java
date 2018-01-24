package com.example;


import android.os.Handler;
import android.view.View;
import android.widget.EditText;

/**
 * Copied and only slightly modified from:
 * https://raw.githubusercontent.com/facebook/react-native/master/ReactAndroid/src/main/java/com/facebook/react/devsupport/DoubleTapReloadRecognizer.java
 */
public class DoubleTapRecognizer {
  private static final long DOUBLE_TAP_DELAY = 200;
  private boolean doRefresh = false;
  private final int keyCode;

  public DoubleTapRecognizer(int keyCode) {
    this.keyCode = keyCode;
  }

  public boolean didDoubleTap(int keyCode, View view) {
    if (keyCode == this.keyCode && !(view instanceof EditText)) {
      if (doRefresh) {
        doRefresh = false;
        return true;
      } else {
        doRefresh = true;
        new Handler().postDelayed(new Runnable() {
          @Override
          public void run() {
            doRefresh = false;
          }
        }, DOUBLE_TAP_DELAY);
      }
    }
    return false;
  }
}