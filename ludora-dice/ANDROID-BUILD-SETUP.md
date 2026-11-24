# Android build setup (so Claude can compile and check games)

The owner's real builds are made in Android Studio on their Windows PC (`C:\Goldenmayhem\...`), signed by them. The setup below is only so Claude can
COMPILE and test a project to catch errors early. It never needs a keystore or password.

## On the desktop (Windows) session
- Nothing to install if Android Studio is already there. Android Studio brings its own JDK and SDK:
  - SDK folder is usually `C:\Users\<name>\AppData\Local\Android\Sdk`.
  - In the project folder create `local.properties` with `sdk.dir=C\:\\Users\\<name>\\AppData\\Local\\Android\\Sdk` (do not commit it).
  - Build: `gradlew.bat :app:assembleRelease` (the wrapper downloads Gradle 8.11.1). Needs Java 17 or 21 (Android Studio's "jbr" works).

## In a Linux cloud session (what worked on 22-24 Nov 2026)
Tools used: Java 21, Gradle 8.14.3 at `/opt/gradle`, Android SDK at `/opt/android/sdk` with `platforms;android-36`, `build-tools;35.0.0`
and `platform-tools`. Plugins: AGP 8.9.1, Kotlin 2.0.21. compileSdk/targetSdk 36, minSdk 26.
1. Check Java: `java -version` (21 is fine). If missing: `apt-get install -y openjdk-21-jdk-headless`.
2. Get Gradle (no wrapper jar is in the projects): download Gradle 8.14.3 from services.gradle.org, unzip to `/opt/gradle`.
3. Get the SDK command-line tools from developer.android.com ("commandlinetools-linux") into `/opt/android/sdk/cmdline-tools/latest`, then:
   `yes | sdkmanager --licenses` and `sdkmanager "platform-tools" "platforms;android-36" "build-tools;35.0.0"`
   (If outbound downloads are blocked, read `/root/.ccr/README.md` and the environment network docs; the hosts needed are dl.google.com,
   services.gradle.org and maven.google.com / repo.maven.apache.org.)
4. In the project folder: `echo "sdk.dir=/opt/android/sdk" > local.properties` then
   `/opt/gradle/bin/gradle --no-daemon :app:assembleRelease` (takes 2-5 minutes).
5. Check the result: `/opt/android/sdk/build-tools/35.0.0/aapt2 dump badging app/build/outputs/apk/release/app-release-unsigned.apk`
   (look at package, versionCode, versionName, label, screen.portrait "not-required").
6. Delete `app/build`, `build`, `.gradle` and `local.properties` before zipping a project. Never zip a `.jks`.
   The warning "License for package Android SDK Platform-Tools not accepted" is harmless.

## Testing a game's index.html
Serve or open the file with Playwright (already installed in cloud sessions), collect `pageerror` and failed requests, take a screenshot.
Ads, rating card, reminder and Google sign-in only work inside the real Android app: the owner tests those on a phone.
