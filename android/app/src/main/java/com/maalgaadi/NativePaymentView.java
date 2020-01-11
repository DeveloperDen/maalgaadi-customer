package avpstransort.maalgaadicustomerapp;

import android.widget.Toast;

import android.app.Activity;
import android.content.Intent;
import android.net.Uri;

import com.facebook.react.bridge.NativeModule;
import com.facebook.react.bridge.ReactApplicationContext;
import com.facebook.react.bridge.ReactContext;
import com.facebook.react.bridge.ReactContextBaseJavaModule;
import com.facebook.react.bridge.ReactMethod;

import java.util.Map;
import java.util.HashMap;

public class NativePaymentView extends ReactContextBaseJavaModule {
  private static ReactApplicationContext reactContext;

  private static final String DURATION_SHORT_KEY = "SHORT";
  private static final String DURATION_LONG_KEY = "LONG";

  NativePaymentView(ReactApplicationContext context) {
    super(context);
    reactContext = context;
  }

  @Override
  public String getName() {
    return "NativePaymentView";
  }

  @Override
  public Map<String, Object> getConstants() {
    final Map<String, Object> constants = new HashMap<>();
    constants.put(DURATION_SHORT_KEY, Toast.LENGTH_SHORT);
    constants.put(DURATION_LONG_KEY, Toast.LENGTH_LONG);
    return constants;
  }

  @ReactMethod
  public void show(String message, int duration) {
    Toast.makeText(getReactApplicationContext(), message, duration).show();
  }

  @ReactMethod
    void navigateToPaymentScreen(String params) {
        Activity activity = getCurrentActivity();
        if (activity != null) {
            Intent intent = new Intent(activity, PaymentWebviewScreen.class);
            intent.putExtra("params", params);
            activity.startActivity(intent);
        }
    }
}