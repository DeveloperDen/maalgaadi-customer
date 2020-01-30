package avpstransort.maalgaadicustomerapp;

import android.os.AsyncTask;
import android.content.pm.PackageInfo;
import android.content.pm.PackageManager;
import android.content.Context;

import androidx.annotation.CallSuper;
import androidx.annotation.Nullable;

import org.jsoup.Jsoup;
import org.jsoup.nodes.Document;
import org.jsoup.nodes.Element;
import org.jsoup.select.Elements;

import android.app.Activity;
import android.content.Intent;
import android.net.Uri;

import com.facebook.react.bridge.NativeModule;
import com.facebook.react.bridge.ReactApplicationContext;
import com.facebook.react.modules.core.DeviceEventManagerModule;
import com.facebook.react.bridge.ReactContext;
import com.facebook.react.bridge.ReactContextBaseJavaModule;
import com.facebook.react.bridge.ReactMethod;
import com.facebook.react.bridge.WritableMap;
import com.facebook.react.bridge.Arguments;

import java.util.Map;
import java.util.HashMap;

public class VersionChecker extends ReactContextBaseJavaModule {
    private static ReactApplicationContext reactContext;
    private double latestVersion, currentVersion;
    
    VersionChecker(ReactApplicationContext context) {
        super(context);
        reactContext = context;
    }
    
    @Override
    public String getName() {
        return "VersionChecker";
    }
    
    @ReactMethod
    void checkVersion(double currentVersion) {
        new GetLatestVersion().execute();
        currentVersion = currentVersion;
    }
    
    private void sendEvent(@Nullable boolean versionResult) {
        WritableMap evParams = Arguments.createMap();
        evParams.putBoolean("isUpdated", versionResult);
        
        reactContext
        .getJSModule(DeviceEventManagerModule.RCTDeviceEventEmitter.class)
        .emit("VersionCheck", evParams);
    }
    
    private class GetLatestVersion
    extends AsyncTask<String, String, Double> {
        
        @Override
        protected void onPreExecute() {
            super.onPreExecute();
        }
        
        @Override
        protected Double doInBackground(String... params) {
            try {
                Document document = Jsoup.connect("https://play.google.com/store/apps/details?id=avpstransort.maalgaadicustomerapp")
                .timeout(30000)
                .userAgent("Mozilla/5.0 (Windows; U; WindowsNT 5.1; en-US; rv1.8.1.6) Gecko/20070725 Firefox/2.0.0.6")
                .referrer("http://www.google.com")
                .get();
                if (document != null) {
                    Elements element = document.getElementsContainingOwnText("Current Version");
                    for (Element ele : element) {
                        if (ele.siblingElements() != null) {
                            Elements sibElemets = ele.siblingElements();
                            for (Element sibElemet : sibElemets) {
                                return Double.parseDouble(sibElemet.text());
                            }
                        }
                    }
                }
            } catch (Exception ignored) {
                ignored.printStackTrace();
            }
            
            return currentVersion;
        }
        
        
        @Override
        protected void onPostExecute(Double latestVersion) {
            super.onPostExecute(latestVersion);
            
            if (latestVersion != 0) {
                if (currentVersion >= latestVersion) {
                    // Application is up to date.
                    sendEvent(true);
                } else {
                    // Update application.
                    sendEvent(false);
                }
            } else {
                // Application is up to date.
                sendEvent(true);
            }
        }
        
    }
}