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

## 2. Current state (v0.2.0)
Working and verified in a cloud session (software rendering, recorded frames):
- **Self-generating stages** (`scripts/level_gen.gd`):
  - Seeded chunk generator with these chunk types: flat, gap, step, floaters (floating ledges), tower (vertical zig-zag climb to a plateau), drop, arena.
  - Difficulty rises per stage (gap width, enemy budget, elite chance). The run seed and stage number are mixed into each stage seed.
  - **Reachability validator:** every hop is simulated against the hero's jump physics, and a helper ledge is inserted wherever a jump is impossible.
  - `tools/test_levels.gd` passes: **600 stages, 0 unreachable hops**.
- **Biomes:** Gloamwood → Crystal Caverns → Emberfen, rotating every 2 stages. Each has its own 5-color palette, and the monsters are recolored per biome.
- **Hero:**
  - Run, variable-height jump, double jump, coyote time, jump buffer, Spark projectile, stomp.
  - Squash & stretch, dust puffs, a ribbon scarf (Line2D verlet sim), aura + PointLight2D, ground light pool, hit flicker.
- **Monsters:** each has a readable warning before attacking, a white hit flash, knockback, damage numbers, fur-burst particles, a dissolve death with a glowing edge, and drops coins that pop out and get pulled toward the hero.
  - **Brute:** chest glow and shake, then a leap and **ground-pound shockwave**.
  - **Spike:** bristles, then fires a **fan of quills**.
  - **Cyclops** (winged flyer): eye charge, then a **beam** aimed at the hero.
  - **Elites:** bigger, more HP, purple shimmer + aura.
- **Effects:**
  - 6 parallax layers + sky (stars, twinkles, moon, god rays), drifting fog, lantern glows that ride the near-tree layer, fireflies, pollen, falling leaves.
  - Wind-shader grass that parts around the hero, CanvasModulate + dynamic lights (hero, portal, checkpoints).
  - Additive glow sprites, screen shake, hit-stop, vignette + grain + red hurt pulse, and a multiply color grade per biome.
- **Game loop:** 3 hearts, checkpoints (crystal shrines), falling into a pit costs a heart, "Try again" respawn, a swirling exit portal with a fade transition and title card, coin total saved to `user://save.cfg`.
- **HUD/controls:** hearts, coin counter with bump, stage name + progress bar, pause; a multi-touch stick + JUMP + SPARK with press feedback. Keyboard works for desktop.
- **Autoplay bot:** `-- --autoplay` plays the game for demos and automated visual checks. It reaches stage 2 by itself and sometimes dies on towers; it's a simple bot, not a game bug.
- **Android:** `releases/gloamwood-v0.2.0-debug.apk` (55 MB, armv7 + arm64, debug-signed). Install on the phone after allowing "install unknown apps".

**Not verified:** performance and touch feel on a real phone (only tested in a headless Linux renderer), audio (none yet), the GitHub Actions workflow (added but not yet confirmed green).

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
Gotchas learned:
- GDScript `var x := dict.value` fails to parse (Variant inference). Use `var x = ...` or an explicit type.
- `ShaderMaterial.get_shader_parameter` returns null until the parameter is set, so initialize parameters in setup.
- Repeating textures bleed their opposite edge into the top row; region rects are inset by 1 px.
- Don't pipe Godot's output into `head` while recording: SIGPIPE kills the run. Redirect to a file instead.
- Art changes: edit palettes in `tools/bake/bake.js` (or painting code in `bake.html`), run `node tools/bake/bake.js`, then re-import.

## 5. Architecture notes
- **One scene**; `main.gd` builds everything in code. Logical world width is 400 units, and the camera zoom is 1.8 (720 px viewport).
- **Draw layers:** sky CanvasLayer(-20) → backdrop CanvasLayer(-10), with manual parallax via region-repeat sprites → world (layer 0: CanvasModulate, level, player, FX, camera) → foreground CanvasLayer(5) → post CanvasLayer(8) → HUD CanvasLayer(10).
- **Coordinates:** world ground at y = 0, with up negative. The generator outputs rects `{r: Rect2, kind: "ground"|"plat"}`. Ground rects extend 1400 px down; platforms are 18 px tall and one-way.
- **Physics:** custom AABB in `player.gd::_move`, not Godot physics bodies, which keeps the generator and physics in sync. Jump constants live in both `player.gd` and `level_gen.gd`, so **change them together**.
- **FX:** `fx_burst`/`fx_dust` spawn one-shot CPUParticles2D. Rings, text, shockwaves and beams are dict items drawn by `fx_norm`/`fx_add` (additive). Projectiles are dicts in `main.projectiles`.
- **Monster art:** PNG at 3× scale with `meta.json` (origin, eye positions, colors). Eyes are drawn live so they track the hero.

## 6. Roadmap (owner-approved direction, in priority order)
1. **Test on the owner's phone:** install the APK, check FPS and touch feel, and tune control sizes and positions. Add a quality setting (particles/lights) if it's slow.
2. **Audio ($0):** generate SFX procedurally (jsfxr-style) or use CC0 packs (Kenney, OpenGameArt). Add ambient forest loops and music that shifts with the action.
3. **More monster effects:**
   - Fur/horn jiggle via a vertex shader, a spawn-from-portal animation, eyes that glow in darkness.
   - Status tints (freeze/burn), an elite trail.
   - A **boss every 5 stages** with phases and arena effects.
4. **Hero moves:** dash with afterimages, wall slide sparks, charged Spark, combo counter, upgrades bought with coins between stages.
5. **Sci-fi biome:** "Derelict Starship" (neon, steam vents, sparks, laser drones), plus "Sky Ruins" (wind gusts). Bake new palettes and painted props.
6. **Generator:** secret coin rooms, moving platforms, hazards (thorns, crumbling ledges), weather per stage (rain + puddle reflections, aurora, lightning flashes).
7. **Lighting upgrade:** normal maps for monsters/trees so the hero's light shades them, and light occluders for soft shadows.
8. **Release pipeline:** a release keystore (kept out of git; GitHub secret), a release APK/AAB, an itch.io page.
9. **Menus:** title screen, settings (volume, quality, control layout), stage select by seed.

## 7. History
- v0.1: an HTML canvas preview (portrait twilight forest) went through 4 rounds of visual critique and fixes. The owner approved the direction and asked for more effects, better monster effects and self-generating stages.
- v0.2 (this): moved to Godot 4.3. Art was baked from the preview's painting code into 3 biome palettes. Self-generating stages with a validator, monster AI and attacks, the full effects pass, HUD/touch, autoplay bot, debug APK export, and a CI workflow.
