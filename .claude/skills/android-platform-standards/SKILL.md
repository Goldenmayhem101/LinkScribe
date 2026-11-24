---
name: android-platform-standards
description: Official Android platform, Jetpack Compose, Edge-to-Edge, R8/AGP build optimization, adaptive layouts, and Google Play compliance workflows grounded in developer.android.com and github.com/android/skills. Use when scaffolding Android Gradle projects, configuring R8 keep rules, auditing edge-to-edge UI, building adaptive Compose screens, or troubleshooting ADB/Android CLI builds.
---

> **Studio note (added when installed, 24 Nov 2026):** use this only for NEW fully native Kotlin/Compose games. Our shipped games
> (Ludo Mayhem, Moonhop) are HTML games inside an Android WebView wrapper, and Gloamwood/Monkey Mayhem use Godot, so do NOT
> rebuild them with this. Our projects use **compileSdk/targetSdk 36** (not 35), so keep using 36 or the newest Google Play requires.
> Never ask for or handle keystores or passwords. Follow `CLAUDE.md` (plain language, preview first, rewarded ads only).

# Android Platform, Compose & Build Standards

## 1. Modern Gradle, AGP & R8 Optimization
- Target `compileSdk = 35`, `minSdk = 26`, `targetSdk = 35` using Kotlin `2.0+` with `org.jetbrains.kotlin.plugin.compose` and Jetpack Compose BOM.
- Always configure `release` builds with `isMinifyEnabled = true`, `isShrinkResources = true`, and targeted `proguard-rules.pro` keep rules (avoid broad `-keep class **` rules that block R8 DEX shrinking).
- Enforce 16 KB page-size alignment (`packaging { jniLibs { useLegacyPackaging = false } }`).

## 2. Edge-to-Edge & Adaptive UI (April 2027 Standards)
- Call `enableEdgeToEdge()` in `ComponentActivity.onCreate` and apply `WindowInsets` (`safeDrawing` / `systemBars`) only to interactive HUD controls while allowing full-bleed canvases and backgrounds to draw behind system bars.
- Support resizable windows (`android:resizeableActivity="true"`) and adaptive aspect ratios (`9:16` compact, `1:1` / `4:3` unfolded foldables, expanded tablets, and desktop/ChromeOS windows).

## 3. Android CLI & Official Google Skills Sync
- When `android` CLI (`developer.android.com/tools/agents/android-skills`) is installed on the machine, keep official Google skills updated via:
  - `android skills add --all` or `/plugin marketplace add android/skills` + `/plugin install android-skills@android-skills` inside Claude Code.
- Reference local `../_reference-repos/` (`android/games-samples`, `playgameservices/native-pc-sdk-sample`, `android/compose-samples`) before writing platform-specific integrations.

## 4. Google Play Verification & Release Readiness
- Ensure every project includes a deep-link `<intent-filter>` in `AndroidManifest.xml` for Play Console deep-link validation and Engage SDK surfaces.
- Document package registration (`com.studio.<package>` for 2027 Android Developer Verification / 50-device Limited Distribution testing) and required Play Store screenshot ratios (`9:16`, `1:1`, `4:3`) in `PLAY_STORE_CHECKLIST.md`.
