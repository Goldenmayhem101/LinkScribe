# Ludora: Fair Play Dice Game, v1.3 update

Package `com.goldenmayhem.ludoradice`, version 1.3 (versionCode 4).

- `android-update/`: the changed files only. Copy them over your own `LudoraDiceAndroid` folder (your `gradle.properties` with the AdMob IDs stays as it is).
  - `app/src/main/assets/index.html`: the game
  - `app/src/main/assets/dice/`: 20 3D dice sprite strips (12 tumble frames + faces 1 to 6)
  - `app/build.gradle.kts`: versionCode 4, versionName 1.3
  - `store/LAUNCH-PACK-v1.2-UPDATE.txt` and `store/screenshots-v1.2/`
- `tools/dice-render/`: Godot 4.3 project that renders the 3D dice (`render.gd`).
- `tools/upgrade/`: how `index.html` is built: `build.py` takes `orig.html` (v1.1) and adds `v2.css`/`v7.css` and `v2.js` … `v7.js` and `i18n.js` (`mk7.py` assembles `v7.js` from `v7glue.js` and the approved preview parts). `full7.js` plays full games and checks winner-takes-all coins; `online7.js` plays a 2-player online match against a local copy of the server. `fullgame.js` plays full games with entry fees and checks every coin.

See `android-update/README.md` for the full change list.
