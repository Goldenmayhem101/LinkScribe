# Tiltrix Mayhem – Android project (by Goldenmayhem)

Package name: **com.goldenmayhem.tiltrix** · Targets **Android 16 (API 36)** · Version 1.0 (versionCode 1)

## 1. Open it
1. Unzip this folder somewhere easy, e.g. `C:\Goldenmayhem\TiltrixAndroid`.
2. Android Studio: **File > Open**, pick the `TiltrixAndroid` folder, **Trust**.
3. If it asks "Please Select Gradle JVM", click **Use JVM 21**. Wait for Gradle sync to finish.
4. Optional test: plug in your phone (USB debugging on) and press the green **Run** button. Debug builds always show Google's test ads.

## 2. AdMob (you still need to do this once)
`gradle.properties` holds Google's public TEST ids, so the game runs but earns nothing. Before the build you upload to Google Play,
create a Tiltrix app in AdMob with a Rewarded unit and a "Between Games" Interstitial unit, and paste your 3 real ids into `gradle.properties`.
Debug builds always use Google's test ads. Never tap your own real ads.

## 3. Make a NEW upload key and BACK IT UP
1. **Build > Generate Signed App Bundle or APK > Android App Bundle > Next**.
2. Key store path: **Create new...** and save it as `C:\Goldenmayhem\tiltrix-upload.jks`. Do not reuse another game's key.
3. Your own password, alias `upload`, your name, **OK**, then **release > Create**.
4. **Back up the .jks file and its password right away** (Google Drive + USB stick).
5. The bundle lands in `app\release\app-release.aab`.

## 4. Google Play Console
Store listing text, icon, feature graphic and screenshots are kept separately (the icon and 4 screenshot backgrounds are in the `store` folder you sent).
For every later update, raise `versionCode` by 1 in `app/build.gradle.kts`.

## What's inside
- The whole game: `app/src/main/assets/index.html` (works offline, fonts built in)
- Golden Mayhem kit: studio intro, tutorial with a pointing hand, 30 levels with stars, Daily Challenge calendar + streak,
  free gift timer, chests, shop (skins + boosters), settings (music, sound, vibration, daily reminder, privacy), rate-us card
- Ads (rewarded + gently paced interstitials), Google consent form + "Ad privacy choices", rating card, reminder, vibration: `MainActivity.kt`
- Daily Challenge reminder (about 6 pm, player can turn it on/off in Settings): `Reminder.kt`

## Security built in
Target API 36, no plain-http traffic, the game runs from the app's own private https address, file and content access off,
Safe Browsing on, outside links open in the browser. Android back gesture pauses a game, closes menus and only leaves the app from the home screen.
