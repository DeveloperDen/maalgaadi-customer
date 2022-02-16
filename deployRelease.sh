#!/bin/sh

# 👇 <<<<<<<<<<For Release App>>>>>>>>>>>>> 👇

react-native bundle --platform android --dev false --entry-file index.js --bundle-output android/app/src/main/assets/index.android.bundle --assets-dest android/app/src/main/res  && rm -rf ./android/app/src/main/res/drawable-* && rm -rf ./android/app/src/main/res/raw/
cd android/ && ./gradlew assembleRelease && cd ..

echo "Release Build Success"

mv android/app/build/outputs/apk/release/app-release.apk android/app/build/outputs/apk/release/Maal🚚👨‍💼.apk

echo "Deployment complete"

