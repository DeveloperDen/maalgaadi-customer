#!/bin/sh

react-native bundle --platform android --dev false --entry-file index.js --bundle-output android/app/src/main/assets/index.android.bundle --assets-dest android/app/src/main/res  && rm -rf ./android/app/src/main/res/drawable-* && rm -rf ./android/app/src/main/res/raw/
cd android/ && ./gradlew assembleRelease && cd ..
# cd android/ && ./gradlew assembleDebug && cd ..
echo "Build Success"

# for release Apk use below location
mv android/app/build/outputs/apk/release/app-release.apk android/app/build/outputs/apk/release/Maal🚚.apk

# for debug Apk use below location
# mv android/app/build/outputs/apk/debug/app-debug.apk android/app/build/outputs/apk/debug/Maal🚚Debug.apk
echo "Deployment complete"
