# Gloamwood: handoff for the next Claude session

## Paste this into the new chat
> I'm continuing my Android game **Gloamwood**, a vertical (portrait) 2D fantasy/sci-fi platformer built in Godot 4.3 at zero cost. The code is in my GitHub repo `goldenmayhem101/LinkScribe`, folder `gloamwood/`, on branch `claude/android-3d-shooter-game-3cin11`. Read `gloamwood/HANDOFF.md` and `gloamwood/README.md` first. Then set up the environment as described in "Fresh session setup", run the level test and an autoplay recording to confirm everything works, and continue with the roadmap. I can't use a computer, so you do all the building, testing and APK exports. Show me screenshots or frames from recordings when visuals change. Keep it $0: no paid assets or services.

---

## 1. What the owner wants
- **Platform:** Android phone game, **portrait/vertical**. The owner plays and tests on their phone and has no computer.
- **Genre:** 2D platformer with shooting. Fantasy + sci-fi mix. Stages **generate themselves** and progress endlessly.
- **Look:** premium indie, hand-painted and atmospheric: layered parallax, glow, fog, particles, strong effects ("more visual effects, monster effects, everything").
- **Enemies:** fuzzy cartoon monsters (horns, googly eyes, big toothy mouths). The owner showed Magnific/Freepik stock images of this style. Those are **premium-licensed, so don't use them.** The monsters here are original, painted in code in that spirit.
- **Budget:** $0. Free tools only (Godot, free Android tooling, GitHub). Google Play costs $25 one time, so sideload the APK instead (or itch.io).
- **Model:** use Opus 5.5 for most work. It's cheaper on plan usage, and Fable costs about 2× per token. Switch to Fable only for a very hard problem.

## 2. Current state (v0.3.0)
Verified in a cloud session with a software renderer, recorded frames, and bot-played runs.

**Gameplay**
- **Stages generate themselves** (`level_gen.gd`).
  - Chunk types: flat, gap, step, floating ledges, climbing tower, drop, monster arena, moving ledge, crumbling ledges, thorn strip, and a bounce pad leading to a hidden treasure ledge.
  - A jump-physics validator inserts a helper ledge wherever a hop is impossible. `tools/test_levels.gd` passes 600 stages across all 3 difficulties with 0 unreachable hops.
  - **Every 5th stage is a boss stage**: a shorter level, then an arena with the **Gloam Titan**. The portal stays locked until the boss dies.
- **Biomes:** Gloamwood → Crystal Caverns → Emberfen, rotating every 2 stages, with monsters recolored per biome.
- **Hero moves:** run, variable jump, air jumps, coyote time, jump buffer, **dash** (i-frames, damages enemies, afterimages), **wall slide and wall jump**, stomp, tap **Spark**, **hold to charge a big piercing Spark**.
- **Heroes (unlockable):** Lumen (balanced), Vesper (3-way spark, Lv 3, 350 coins), Cinder (piercing sparks, sturdier, Lv 5, 800 coins), Nyx (triple jump, fast, Lv 8, 1500 coins).
- **Monsters:** each has a readable warning before attacking and a health bar. Elites are bigger and shimmer. **Golden** variants drop a coin shower.
  - Brute: ground-pound shockwave.
  - Spike: quill fan.
  - Cyclops (flyer): beam.
  - **Charger:** paws the ground, charges, then is dazed.
  - **Burrower:** invulnerable underground, pops up, throws a dirt clod.
  - **Drone** (sci-fi, drawn in code): 3-bolt laser burst.
  - **Slime** (drawn in code): splits into 2 minis.
  - **Gloam Titan boss**, 3 phases: ground-pound with debris, charge, quill storm, summons minis, triple-eye beams. It has a boss health bar with phase markers, an intro card, roars and boss music.
- **Combo counter:** hits, kills, stomps and dash hits chain within 2.6 s. The coin multiplier is ×1.5 per 5 combo, up to ×3, with toasts at 10, 25 and 50.
- **Stage props:** chests (random coins, jackpot or a heart), bounce mushrooms, thorns, moving and crumbling ledges, checkpoints, the portal.
- **Difficulty:** Relaxed / Normal / Hard changes enemy count, HP, gap widths and boss HP. The curve also rises per stage.

**Reasons to keep playing** (researched retention patterns, kept fair, no purchases)
- Coins → **permanent upgrades**: Heart Vessel, Spark Core, Quick Hands, Coin Magnet, Wind Step, Lucky Charm.
- **Player level / XP** with coin rewards per level. Heroes are gated by level and coins, and the next unlock always shows a progress bar.
- **7-day daily reward calendar** (50 → 500). Missing a day only restarts the calendar; nothing is lost.
- **3 daily quests** chosen by date from 9 types.
- **9 tiered achievements** with claimable rewards.
- **3-star stage rating** (clear / 70% coins / no damage), new-record callouts and best-stage stats.
- Variable rewards: chests and golden monsters.

**Menus and persistence**
- **Screens:** title (the bot plays behind it), Continue / New run, Heroes, Upgrades, Quests & Rewards (with badge count), Settings, daily reward popup, pause, stage clear, game over.
- **Settings:**
  - music and SFX volume
  - **D-pad or analog stick**, control size
  - vibration, difficulty, graphics Low/High
- **Resume:** the run auto-saves on checkpoints, pause, the app going to the background, and app close. It stores stage, seed, position, hearts, collected coins, killed monsters, opened chests, boss state and stage stats. **Continue** restores it exactly; levels regenerate identically from the seed.
- Profile is saved in `user://profile.json` (`profile.gd`).

**Audio**
- All synthesized in code (`audio.gd`), so there are no files and no licenses: 30 SFX plus music loops for each biome, the menu and the boss, generated on a worker thread.
- `tools/export_sounds.gd` writes them to WAV for checking.

**Android:** `releases/gloamwood-v0.3.0-debug.apk`. The owner reported that v0.2 gameplay was smooth on their phone.

**Not verified yet:**
- touch feel of the new buttons, the D-pad/analog switch and the dash button on a real phone
- vibration on device
- whether the music sounds good to the owner (the levels were checked numerically: no clipping)
- GitHub Actions (the push was blocked)

## 3. Fresh session setup (cloud container, ~5 min)
The container is wiped between sessions, so re-run this. `dl.google.com` was **blocked** by the environment's network policy, so the Android SDK comes from Ubuntu's `apksigner`/`zipalign` packages plus a small fake SDK folder.
```bash
# Godot 4.3 + export templates (the templates file is ~1 GB)
mkdir -p /opt/godot && cd /opt/godot
curl -sSL -o godot.zip https://github.com/godotengine/godot/releases/download/4.3-stable/Godot_v4.3-stable_linux.x86_64.zip && unzip -oq godot.zip
curl -sSL -o templates.tpz https://github.com/godotengine/godot/releases/download/4.3-stable/Godot_v4.3-stable_export_templates.tpz
TD=~/.local/share/godot/export_templates/4.3.stable; mkdir -p $TD
unzip -o -j -q templates.tpz templates/android_debug.apk templates/android_release.apk templates/version.txt -d $TD
# Android signing tools + minimal SDK layout Godot accepts
apt-get update -qq && apt-get install -y -qq apksigner zipalign
mkdir -p /opt/android/sdk/build-tools/34.0.0 /opt/android/sdk/platform-tools /opt/android/sdk/cmdline-tools/latest/bin /opt/android/keys
ln -sf /usr/bin/apksigner /opt/android/sdk/build-tools/34.0.0/apksigner
ln -sf /usr/bin/zipalign /opt/android/sdk/build-tools/34.0.0/zipalign
printf '#!/bin/sh\necho "Android Debug Bridge version 1.0.41"\n' > /opt/android/sdk/platform-tools/adb; chmod +x /opt/android/sdk/platform-tools/adb
printf '#!/bin/sh\nexit 0\n' > /opt/android/sdk/cmdline-tools/latest/bin/sdkmanager; chmod +x /opt/android/sdk/cmdline-tools/latest/bin/sdkmanager
keytool -genkeypair -keystore /opt/android/keys/debug.keystore -storepass android -alias androiddebugkey -keypass android \
  -keyalg RSA -keysize 2048 -validity 10000 -dname "CN=Android Debug,O=Android,C=US"
# Godot editor settings for Android export (run Godot once first so the file exists)
G=/opt/godot/Godot_v4.3-stable_linux.x86_64; cd <repo>/gloamwood && $G --headless --path . --editor --quit
```
Then add these lines under `[resource]` in `~/.config/godot/editor_settings-4.3.tres`:
```
export/android/android_sdk_path = "/opt/android/sdk"
export/android/java_sdk_path = "/usr/lib/jvm/java-21-openjdk-amd64"
export/android/debug_keystore = "/opt/android/keys/debug.keystore"
export/android/debug_keystore_user = "androiddebugkey"
export/android/debug_keystore_pass = "android"
```
Tools already present in the container: Java 21, Xvfb + Mesa (llvmpipe), ffmpeg, Node + Playwright + Chromium, Python + PIL.

## 4. Verify, then build
```bash
$G --headless --path . --script res://tools/test_levels.gd          # expect: unreachable=0
xvfb-run -a -s "-screen 0 800x1400x24" $G --path . --rendering-driver opengl3 --resolution 720x1280 \
  --write-movie /tmp/run.avi --fixed-fps 30 --quit-after 900 -- --autoplay   # then ffmpeg -ss N -i /tmp/run.avi -frames:v 1 f.png
$G --headless --path . --export-debug "Android" build/gloamwood-debug.apk
cp build/gloamwood-debug.apk releases/gloamwood-vX.Y.Z-debug.apk   # bump version/code + version/name in export_presets.cfg
```
Testing flags (after `--`): `--autoplay` (bot demo, nothing saved), `--botplay` / `--botplay=continue` (bot plays a real saved run, so it exercises the stage clear screen and resume), `--stage=N`, `--menu=title|heroes|upgrades|quests|settings|daily`, `--hero=<id>`. Use `--audio-driver Dummy` in the container (it has no sound card; the ALSA `ERR_CANT_OPEN` message is harmless).

Gotchas learned:
- GDScript `var x := dict.value` fails to parse (Variant inference). Use `var x = ...` or an explicit type.
- `ShaderMaterial.get_shader_parameter` returns null until the parameter is set, so initialize parameters in setup.
- Repeating textures bleed their opposite edge into the top row; region rects are inset by 1 px.
- Don't pipe Godot's output into `head` while recording: SIGPIPE kills the run. Redirect to a file instead.
- `--script` tools run without autoloads: use `get_node_or_null("/root/Profile")` in code those tools load.
- The default Godot font lacks ★ ● ✓ ♥: the UI uses the bundled DejaVu fonts (`assets/fonts`, free license).
- Art changes: edit palettes in `tools/bake/bake.js` (or painting code in `bake.html`), run `node tools/bake/bake.js`, then re-import.

## 5. Architecture notes
- **One scene**; `main.gd` builds everything in code. Logical world width is 400 units, and the camera zoom is 1.8 (720 px viewport).
- **Draw layers:** sky CanvasLayer(-20) → backdrop CanvasLayer(-10), with manual parallax via region-repeat sprites → world (layer 0: CanvasModulate, level, player, FX, camera) → foreground CanvasLayer(5) → post CanvasLayer(8) → HUD CanvasLayer(10).
- **Coordinates:** world ground at y = 0, with up negative. The generator outputs rects `{r: Rect2, kind: "ground"|"plat"}`. Ground rects extend 1400 px down; platforms are 18 px tall and one-way.
- **Physics:** custom AABB in `player.gd::_move`, not Godot physics bodies, which keeps the generator and physics in sync. Jump constants live in both `player.gd` and `level_gen.gd`, so **change them together**.
- **FX:** `fx_burst`/`fx_dust` spawn one-shot CPUParticles2D. Rings, text, shockwaves and beams are dict items drawn by `fx_norm`/`fx_add` (additive). Projectiles are dicts in `main.projectiles`.
- **Monster art:** PNG at 3× scale with `meta.json` (origin, eye positions, colors). Eyes are drawn live so they track the hero.

## 6. Roadmap (next ideas)
1. Owner playtest of v0.3.0: control sizes, D-pad vs analog, difficulty curve, boss fairness, music taste.
2. More bosses: one per biome (Crystal Wyrm, Ember Hag) with their own arenas and attacks.
3. The sci-fi biome "Derelict Starship" (drones, laser gates, steam vents) and "Sky Ruins" (wind gusts).
4. Weather per stage (rain and puddle reflections, aurora, lightning), normal-mapped lighting.
5. Cosmetics bought with coins: scarf colors, trails. A weekly challenge seed with a local best score.
6. Release pipeline: release keystore as a GitHub secret, release APK/AAB, itch.io page.
7. Optional: a cloud save (needs a free backend), but local-only keeps it $0 and simple.

## 7. History
- v0.1: an HTML canvas preview (portrait twilight forest) went through 4 rounds of visual critique and fixes. The owner approved the direction and asked for more effects, better monster effects and self-generating stages.
- v0.2: moved to Godot 4.3. Art was baked from the preview's painting code into 3 biome palettes. Self-generating stages with a validator, monster AI and attacks, the full effects pass, HUD/touch, autoplay bot, debug APK export, and a CI workflow.
- v0.3 (this):
  - Sound and music, menus, upgrades, heroes, daily rewards, quests, achievements, XP and levels, stars.
  - Resume, D-pad or analog, dash, wall jump, charged spark, combo counter, monster health bars.
  - 4 new monster types, golden and elite variants, the Gloam Titan boss every 5 stages.
  - New level pieces (moving and crumbling ledges, thorns, bounce pads, chests, hidden ledges) and difficulty settings.
