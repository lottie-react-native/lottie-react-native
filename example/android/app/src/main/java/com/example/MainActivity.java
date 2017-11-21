package com.example;

import android.os.Bundle;
import android.view.KeyEvent;
import android.view.View;

import com.facebook.react.ReactActivity;

public class MainActivity extends ReactActivity {

    private final DoubleTapRecognizer doubleTapMenuRecognizer = new DoubleTapRecognizer (KeyEvent.KEYCODE_D);

    /**
     * Returns the name of the main component registered from JavaScript.
     * This is used to schedule rendering of the component.
     */
    @Override
    protected String getMainComponentName() {
        return "example";
    }

    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        getReactInstanceManager().getDevSupportManager().setDevSupportEnabled(true);
    }

    @Override
    public boolean onKeyUp(int keyCode, KeyEvent event) {
        View currentFocus = getCurrentFocus();
        if (doubleTapMenuRecognizer.didDoubleTap(keyCode, currentFocus)) {
            getReactInstanceManager().getDevSupportManager().showDevOptionsDialog();
            return true;
        }
        return super.onKeyUp(keyCode, event);
    }
}
