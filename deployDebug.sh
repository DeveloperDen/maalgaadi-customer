#!/bin/sh

# 👇 <<<<<<<<<<For Debug App>>>>>>>>>>>>> 👇

react-native bundle --platform android --dev false --entry-file index.js --bundle-output android/app/src/main/assets/index.android.bundle --assets-dest android/app/src/main/res/
cd android && ./gradlew assembleDebug && cd ..

echo "Debug Build Success"

mv android/app/build/outputs/apk/debug/app-debug.apk android/app/build/outputs/apk/debug/Maal🚚Debug.apk

echo "Deployment complete"
