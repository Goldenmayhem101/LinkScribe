# Ludora: Fair Play Dice Game, v1.4 update

Package `com.goldenmayhem.ludoradice`, version 1.4 (versionCode 5).

- `android-update/`: the changed files only. Copy them over your own `LudoraDiceAndroid` folder (your `gradle.properties` with the AdMob IDs stays as it is).
  - `app/src/main/assets/index.html`: the game
  - `app/src/main/java/com/goldenmayhem/ludoradice/MainActivity.kt`: NEW in 1.4, adds Share and Send feedback (replace your old file)
  - `app/src/main/assets/dice/`, `pawns/`: art
  - `app/build.gradle.kts`: versionCode 5, versionName 1.4
  - `store/WHATS-NEW-v1.4.txt`: release notes
  - `store/PLAY-STORE-TEXT-and-PRODUCTION-ANSWERS-v1.4.txt`: store description and honest production-access answers
- `tools/dice-render/`: Godot 4.3 project that renders the 3D dice (`render.gd`).
- `tools/upgrade/`: how `index.html` is built: `build.py` takes `orig.html` (v1.1) and adds `v2.css`/`v7.css`/`v8.css` and `v2.js` … `v8.js` and `i18n.js` (`mk7.py` assembles `v7.js` from `v7glue.js` and the approved preview parts). `v8.js` is the 1.4 layer: turn marker, frame timer, roll-again pill, Hard/Expert computer, Settings extras, home tour. `full7.js` plays full games and checks winner-takes-all coins; `online7.js` plays a 2-player online match against a local copy of the server.

See `android-update/README.md` for the full change list.
