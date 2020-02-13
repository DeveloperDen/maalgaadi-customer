package avpstransort.maalgaadicustomerapp;

import avpstransort.maalgaadicustomerapp.RSAUtility;

import android.content.Intent;
import android.util.Log;
import android.os.AsyncTask;
import android.os.Bundle;
import android.view.LayoutInflater;
import android.view.View;
import android.view.ViewGroup;
import android.webkit.JavascriptInterface;
import android.webkit.WebView;
import android.webkit.WebViewClient;
import android.widget.Toast;

import org.apache.http.NameValuePair;
import org.apache.http.message.BasicNameValuePair;
import org.apache.http.util.EncodingUtils;
import org.json.JSONException;
import org.json.JSONObject;

import java.net.SocketException;
import java.net.URLEncoder;
import java.nio.charset.StandardCharsets;
import java.util.ArrayList;
import java.util.Arrays;
import java.util.List;

import androidx.annotation.CallSuper;
import androidx.annotation.Nullable;

import com.facebook.react.ReactActivity;
import com.facebook.react.ReactInstanceManager;
import com.facebook.react.ReactNativeHost;
import com.facebook.react.bridge.CatalystInstance;
import com.facebook.react.bridge.ReactContext;
import com.facebook.react.bridge.WritableNativeArray;
import com.facebook.react.modules.core.DeviceEventManagerModule;
import com.facebook.react.bridge.WritableMap;
import com.facebook.react.bridge.Arguments;

public final class PaymentWebviewScreen extends ReactActivity {
    private WebView webview;
    private JSONObject params;
    private ReactContext reactContext;
    private static final String TRANS_URL = "https://secure.ccavenue.com/transaction/initTrans";
    String encVal;

    @Override
    @CallSuper
    protected void onCreate(@Nullable Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        setContentView(R.layout.activity_example);

        webview = this.<WebView>findViewById(R.id.webview);
        MainApplication application = (MainApplication) PaymentWebviewScreen.this.getApplication();
        ReactNativeHost reactNativeHost = application.getReactNativeHost();
        ReactInstanceManager reactInstanceManager = reactNativeHost.getReactInstanceManager();
        reactContext = reactInstanceManager.getCurrentReactContext();

        try {
            params = new JSONObject(getIntent().getStringExtra("params"));
        }catch (JSONException e) {
            e.printStackTrace();
        }

        new RenderView().execute();
    }

    private class RenderView extends AsyncTask<Void, Void, Void> {
        @Override
        protected void onPreExecute() {
            super.onPreExecute();
        }

        @Override
        protected Void doInBackground(Void... arg0) {
            try {
                encVal = RSAUtility.encrypt(params.getString("amountCurrParam"), params.getString("rsa"));
            }catch (JSONException e) {
                e.printStackTrace();
            }
            return null;
        }

        @Override
        protected void onPostExecute(Void result) {
            super.onPostExecute(result);

            class MyJavaScriptInterface {
                private boolean success = false;
                private String message = "";
                private String encResp;

                @JavascriptInterface
                public void processHTML(String data) {
                    // process the html as needed by the app
                    String output = data.substring(data.indexOf("{"), data.lastIndexOf("}") + 1);
                    try {
                        if (output != null && !output.equalsIgnoreCase("")) {
                            JSONObject jsonObject = new JSONObject(output);
                            success = jsonObject.optBoolean("success");
                            message = jsonObject.optString("message");
                            JSONObject dataObj = jsonObject.optJSONObject("data");
                            if (data != null) {
                                encResp = dataObj.optString("encResp");

                                // Sending event to JS, on transaction is finished.
                                WritableMap transParams = Arguments.createMap();
                                transParams.putString("booking_id", "");
                                transParams.putString("amount", params.getString("amount"));
                                transParams.putString("order_id", params.getString("orderId"));
                                transParams.putString("encResp", encResp);
                                transParams.putString("message", message);
                                transParams.putBoolean("status", success);

                                WritableMap evParams = Arguments.createMap();
                                evParams.putMap("transParams", transParams);
                                sendEvent(reactContext, "TransFinished", evParams);
                                
                                // After sending Transaction Status to Home Screen, trans. activity should close.
                                finish();
                            }
                        }
                    } catch (JSONException e) {
                        e.printStackTrace();
                        Log.e("Error in output: ", output);

                        // Sending event to JS, on page loading is finished.
                        WritableMap evParams = Arguments.createMap();
                        evParams.putString("url", "An error occured while processing the response, please retry if not successfull, or check your balance");
                        sendEvent(reactContext,
                        "PageFinished", evParams);
                    }
                }
            }


            webview.getSettings().setJavaScriptEnabled(true);
            webview.addJavascriptInterface(new MyJavaScriptInterface(), "HTMLOUT");
            webview.setWebViewClient(new WebViewClient() {
                @Override
                public void onPageFinished(WebView view, String url) {
                    super.onPageFinished(webview, url);
                    
                    // Sending event to JS, on page loading is finished.
                    WritableMap evParams = Arguments.createMap();
                    evParams.putString("url", url);
                    sendEvent(reactContext,
                    "PageFinished", evParams);

                    if (url.contains("successPaymentResponseFromCCAPI") || url.contains("cancelPaymentResponseFromCCAPI")) {
                        webview.loadUrl("javascript:window.HTMLOUT.processHTML('<head>'+document.getElementsByTagName('html')[0].innerHTML+'</head>');");
                    }
                }

                @Override
                public void onReceivedError(WebView view, int errorCode, String description, String failingUrl) {
                    Toast.makeText(PaymentWebviewScreen.this, "Error: " + description, Toast.LENGTH_SHORT).show();
                }
            });

            try {
                String custName = params.getString("custName").replaceAll("\\W+","");

                StringBuffer strParams = new StringBuffer();
                strParams.append("access_code" + "=" + "AVHR74EK06AD66RHDA" + "&");
                strParams.append("merchant_id" + "=" + "153491" + "&");
                strParams.append("order_id" + "=" + params.getString("orderId") + "&");
                strParams.append("redirect_url" + "=" + params.getString("redirectURL") + "&");
                strParams.append("cancel_url" + "=" + params.getString("cancelURL") + "&");
                strParams.append("enc_val" + "=" + URLEncoder.encode(encVal) + "&");
                strParams.append("billing_name" + "=" + custName + "&");
                strParams.append("billing_tel" + "=" + params.getString("custNum") + "&");
                strParams.append("billing_email" + "=" + params.getString("custEmail") + "&");
                strParams.append("billing_address" + "=" + params.getString("custAddress") + "&");
                strParams.append("billing_zip" + "=" + params.getString("zipCode") + "&");
                strParams.append("billing_city" + "=" + params.getString("city") + "&");
                strParams.append("billing_state" + "=" + params.getString("state") + "&");
                strParams.append("billing_country" + "=" + "India" + "&");

                // Omiting last '&' from the string
                String vPostParams = strParams.substring(0, strParams.length() - 1);
                webview.postUrl(TRANS_URL, vPostParams.getBytes(StandardCharsets.UTF_8));
            } catch (Exception e) {
                Toast.makeText(PaymentWebviewScreen.this, "Exception occured while opening webview.", Toast.LENGTH_SHORT).show();
                onBackPressed();
            }
        }
    }

    private void sendEvent(ReactContext reactContext,
                       String eventName,
                       @Nullable WritableMap params) {
        reactContext
            .getJSModule(DeviceEventManagerModule.RCTDeviceEventEmitter.class)
            .emit(eventName, params);
    }

    @Override
    public void onBackPressed() {
        finish();
    }
}