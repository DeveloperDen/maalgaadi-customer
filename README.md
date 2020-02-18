# Maalgaadi Customer
Maalgaadi Customer is a React Native project.

## Points which might help after/on setup of project
- Google Places Autocomplete module modified to change the UI. [REMOVED DEPENDENCY]

- Firebase Messaging might need to be modified for Android Oreo(for reference: https://developer.android.com/about/versions/oreo/background).

- Geolocation Services needs to be added in Pod file in iOS.

- Also Geolocation Services need "@react-native-community/geolocation" to be installed.

- react-native-push-notifications need "@react-native-community/push-notification-ios" to be installed.

- For Firebase Messaging, in iOS, Push Notifications need to be enabled in Xcode in App > Capabilities, and also add Background Mode > Remote Notifications.

- If Xcode hangs:
https://www.cocoanetics.com/2017/01/psa-xcode-hanging-opening-projects/

- Add GoogleService-Info.plist in iOS

-  To setup React Native Firebase(5.x) (consider docs).

- Work around for the error "Firebase error 1001" is https://github.com/invertase/react-native-firebase/issues/2657#issuecomment-549181244

- Modified react-native-easy-toast to contain 'Warning' icon.
[REMOVED DEPENDENCY]

- To setup react-native-maps, use its official docs (https://github.com/react-native-community/react-native-maps/blob/master/docs/installation.md).

- NativeEventEmitter takes NativeModule as its argument for iOS, and needs Objective C/Swift files to be already set with 'supportedEvents' (and Header File) as it checks at runtime while adding listener if the event is supported by the file.

- If Android build gives following error: 
"Error: Activity class {avpstransort.maalgaadicustomerapp/avpstransort.maalgaadicustomerapp.MainActivity} does not exist."
then, run following in Android Studio terminal:
```adb uninstall avpstransort.maalgaadicustomerapp```

- Set 'Enable Bitcode' in Build Settings to 'NO' in Xcode in case of the error shown in the attached screenshot.
![Screenshot of Xcode error](https://lh4.googleusercontent.com/f4lcT2-GEdrNoR8CqKv2cxzk-88XHz4dNQenLYlMbqtH-L-RVVQ_1YnLNGvxtb7v6ZIn82Jke3BRo_nQn8RTlASdkmwyLo_dXplhzge2=s1388)

- If an unexpected error occurs while 'Distribute App' process, following might work: 
Go to Preferences/Settings > Network > Advanced > Proxies > Uncheck 'SOCKS Proxy' and Check only 'Auto Proxy Discovery' and 'Auto Proxy configuration'.

# Developer Support
Mob: 8269262610
Mob: 9755299999
