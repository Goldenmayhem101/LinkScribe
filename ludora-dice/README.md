# Ludora: Fair Play Dice Game, v1.2 update

Package `com.goldenmayhem.ludoradice`, version 1.2 (versionCode 3).

- `android-update/`: the changed files only. Copy them over your own `LudoraDiceAndroid` folder (your `gradle.properties` with the AdMob IDs stays as it is).
  - `app/src/main/assets/index.html`: the game
  - `app/src/main/assets/dice/`: 20 3D dice sprite strips (12 tumble frames + faces 1 to 6)
  - `app/build.gradle.kts`: versionCode 3, versionName 1.2
  - `store/LAUNCH-PACK-v1.2-UPDATE.txt` and `store/screenshots-v1.2/`
- `tools/dice-render/`: Godot 4.3 project that renders the 3D dice (`render.gd`).
- `tools/upgrade/`: how `index.html` is built: `build.py` takes `orig.html` (v1.1) and adds `v2.css`, `v2.js` and `i18n.js`. `fullgame.js` plays full games with entry fees and checks every coin.

See `android-update/README.md` for the full change list.
