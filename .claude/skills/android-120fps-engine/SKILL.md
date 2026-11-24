---
name: android-120fps-engine
description: Build production-grade, 120 FPS mobile games in pure Kotlin using Jetpack Compose Canvas, Android 13+ AGSL RuntimeShaders, zero-GC object pools, procedural AudioTrack synthesis, ADPF thermal scaling, Game Mode API, April 2027 foldable/PC continuity, and Google Play Games Services v2 / Game Stats / Sidekick hooks. Use when creating, scaffolding, optimizing, or debugging Android games without third-party engines.
---

> **Studio note (added when installed, 24 Nov 2026):** use this only for NEW fully native Kotlin/Compose games. Our shipped games
> (Ludo Mayhem, Moonhop) are HTML games inside an Android WebView wrapper, and Gloamwood/Monkey Mayhem use Godot, so do NOT
> rebuild them with this. Our projects use **compileSdk/targetSdk 36** (not 35), so keep using 36 or the newest Google Play requires.
> Never ask for or handle keystores or passwords. Follow `CLAUDE.md` (plain language, preview first, rewarded ads only).

# Android 120 FPS Native Game Engine Standard

## 1. Frame Loop & Hardware 120Hz Lock
- Drive the game loop exclusively via `withFrameNanos { frameTimeNanos -> ... }` inside `LaunchedEffect`, clamping `dt <= 0.033f` and sub-stepping physics (`4` sub-steps per frame) for deterministic, jitter-free collisions.
- In `MainActivity.kt`, call `enableEdgeToEdge()`, lock `window.attributes.preferredDisplayModeId` to the display mode with the highest `refreshRate`, and call `Surface.setFrameRate(120f, FRAME_RATE_COMPATIBILITY_DEFAULT)` where supported.
- Query `GameManager.getGameMode()` (Android 12+): cap to 60 FPS and halve particle emitters in `GAME_MODE_BATTERY` (~25% power savings); unlock 120 FPS and full shader octaves in `GAME_MODE_PERFORMANCE` / `GAME_MODE_STANDARD`.

## 2. Zero Garbage Collection (GC) Pressure
- Pre-allocate all `Paint`, `Path`, `Shader`, `FloatArray`, and entity object pools (`Array(N) { Entity() }`) outside `Canvas`.
- NEVER allocate objects, lambdas, strings, or `Color` wrappers inside `onDraw`.

## 3. AGSL Shaders & Procedural Pentatonic Audio
- Write custom `RuntimeShader` programs in `GameShaders.kt` updated via `setFloatUniform` for 3D specular highlights, subsurface glow, rim bounce light, and parallax backgrounds, paired with a clean `Brush` fallback for Android < 13.
- Synthesize zero-latency PCM sound effects in `SoundSynth.kt` using `AudioTrack` (`MODE_STATIC`) mapped to a major pentatonic scale (`C5, D5, E5, G5, A5, C6`) with zero external audio assets.

## 4. ADPF Thermals & 16 KB Page-Size Alignment
- Monitor `PowerManager.getThermalHeadroom(5)` and `getCurrentThermalStatus()` to smoothly scale `effectQuality` (`1.0f` nominal -> `0.5f` at `THERMAL_STATUS_MODERATE` or higher), plus expose a manual toggle in the pause menu.
- Configure `packaging { jniLibs { useLegacyPackaging = false } }` for 16 KB memory page-size compatibility and R8 release minification (`isMinifyEnabled = true`, `isShrinkResources = true`).

## 5. April 2027 Foldable, Large Screen, Controller & PC Continuity
- Never hardcode portrait phone pixel dimensions. Compute a responsive logical playfield inside `BoxWithConstraints` / `Canvas` that centers across `9:16` phones, `1:1` and `4:3` unfolded foldables, tablets, and desktop windows while extending the background shader edge-to-edge.
- Preserve active state across configuration changes (`configChanges="orientation|screenSize|screenLayout|smallestScreenSize|keyboardHidden"`) and auto-pause active gameplay if aspect ratio changes mid-run.
- Support touch gestures, mouse/keyboard (`Arrow keys` / `WASD` + `Space` / `Enter`), and gamepad D-pad/A-button events (`onKeyDown` / `onGenericMotionEvent`).

## 6. Google Play Games v2, Game Stats & Sidekick Hooks
- Structure `PlayServicesBridge.kt` around PGS v2 (`PlayGamesSdk.initialize`, `PlayGames.getLeaderboardsClient`, `PlayGames.getAchievementsClient`—no deprecated v1 APIs) behind a compile-safe stub interface.
- Emit structured **Game Stats** signals (`onMatchCompleted`, `onComboMilestone`, `onTierUnlocked`) for daily Streaks, 48-hour Sprints, Leagues, and Play Games Rewards, plus `onHighlightMoment` hooks for **Sidekick Playbacks** 30s clips while keeping screen corners clear of the floating Sidekick handle.
