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

## 2. Current state (v0.5.0)
**What changed in v0.5.0, from owner feedback on v0.4.0** ("auto-run is buggy, take it out", "tap a monster to target it", "a melee weapon that fits the atmosphere and attacks automatically up close", "more polished effects", "stages all look the same", "endless worlds", "upgrades per character, cap 10, rising cost", "try wardrobe items before buying", "weapons look generic, add many more", "character more defined", "audio should change per world"):
- **Auto-run removed** entirely (HUD and settings).
- **Tap-to-target:** tap a monster on screen to lock on (red rotating brackets). All shots go to it while it lives; tap it again or tap empty ground to release. Aim assist still picks the nearest monster in front when nothing is locked. (`weapons.gd: try_target`; it uses the viewport canvas transform to turn screen taps into world positions.)
- **Melee, automatic:** swings whenever a monster is within reach, and also parries enemy shots.
  - 6 melee weapons, each drawn in the hero's hand with a swing animation: Lantern Staff (default), Moon Sickle, Thorn Lash, Crystal Rapier, Ember Hammer (shockwave), Void Scythe.
- **8 ranged weapons, each with its own look and behavior:**
  - Spark Bolt, Seeker Wisps (homing)
  - Frost Shards (slow monsters 50%), Moon Lance (instant piercing beam)
  - Ember Scatter (5 pellets), Leafwing (boomerang)
  - Storm Orb (chain lightning), Star Mortar (lobbed AoE shell)
  - All combat lives in `scripts/weapons.gd`.
- **6 worlds** (`LevelGen.BIOMES`):
  - Gloamwood (mixed forest), Crystal Caverns (crystal spires), Emberfen (dead swamp trees), Frostveil (snowy pines), Verdant Hollow (lush sunset grove), Void Reach (neon crystals, aurora).
  - Each has its own baked palette and tree mix (`tools/bake/bake.js` STYLE), its own music, and its own sound-effect flavor (warm / glass / ember / synth).
  - **5 stages per world, the 5th is a boss.** After world 6 the cycle repeats as "Gloamwood II", "III" and so on, forever, with difficulty still rising (monster HP, count and boss HP). Stage length is capped so deep stages don't get absurdly long.
  - Per-stage variety from the seed: weather (rain, storm with lightning and thunder, snow, ash, motes, pollen, fireflies, aurora) and time of day (twilight, deep night, dawn, moonrise tint).
  - Only the current world's textures stay loaded (VRAM on phones).
- **Upgrades are per hero**: 8 upgrades with 10 levels each, cost = base × 1.45^level.
  - The upgrades: Vitality +10 HP, Spark Power +10% ranged, Blade Edge +10% melee, Quick Hands +5% speed, Moss Armor −3.5% damage, Wind Step, Coin Magnet, Fortune.
  - Old v0.4 global upgrades migrate (doubled, capped at 10) to whichever hero was selected.
- **Wardrobe:** tap any item to **try it on** a live preview of the real hero before buying.
  - 12 scarves (aurora gradient), 10 cloaks (starlit pattern), 10 hats (leaf, flower, horns, fox ears, toadstool, antenna, witch hat, halo, crown), 6 eye colors, 9 trails (sparkles, embers, petals, snowflakes, leaves, bubbles, stardust, rainbow).
  - Free items always count as owned.
- **Hero redesign:** ink outline, hem trim, mitten hands, a glowing belt lantern, eye glow in the chosen color, the melee weapon in hand, and aim and shoot poses.
- **Effects polish:**
  - Directional hit streaks and kill flashes with a short dynamic light and camera punch.
  - Monster hit stagger, idle breathing, slowed-blue tint, a pop-then-dissolve death.
  - Lightning flashes in storms, aurora ribbons.
  - Monster health is now fractional, so damage numbers can show decimals.
- **Test-mode safety:** `--autoplay`, `--showcase`, `--weapon`, `--melee` and `--hero` set `Profile.no_save` so tests never overwrite a real save.

### Carried over from v0.4.0
**What changed in v0.4.0, from owner feedback on v0.3.0** ("monsters too strong, no health bar, no power-ups, menu looks bad, want auto-run, can't fight flyers, want more weapons and customization, an annoying background sound, can't hear the music"):
- **Health:** a real **health bar** (100 HP, varying by hero; *Vitality* upgrade adds +20) replaces hearts.
  - Every attack has its own damage: contact 8–20, quills/bolts 8, clods 10, beams 12–16, shockwaves 12–20, thorns 10, falls 15.
  - Damage is scaled by difficulty and the *Moss Armor* upgrade (−12% per level). Checkpoints heal fully.
- **Easier early game:**
  - Monster attack wind-ups are slower and rests between attacks longer in early stages (`main.tele_k` / `main.calm`, scaled by stage and difficulty).
  - Fewer monsters in the first stages.
  - Flyers now hover within jump reach.
- **Power-ups**, placed in stages, in chests and dropped by monsters:
  - Heal (+35), small health orbs (+12)
  - Shield (blocks 3 hits)
  - Triple Shot, Homing, Rapid Fire, Coin Magnet
  - **Star** (invincible, defeats monsters on touch)
  - Timers show under the health bar.
- **Weapons (Armory):** Spark (default), Seeker Wisps (homing), Moon Lance (instant piercing beam), Ember Scatter (5-shot burst).
  - **Aim assist** makes every weapon aim at the nearest monster in front, flyers overhead included (can be turned off in Settings).
  - Holding the button charges a big shot with any weapon.
- **Wardrobe:** scarf colors (8), cloak tints (6), hats (leaf, horns, star antenna, lantern crown), trails (sparkles, embers, petals), with a live preview.
- ~~Auto-run~~ (removed in v0.5.0 at the owner's request)
- **Menus redesigned:**
  - Glass cards, raised press-down buttons, drawn icons, a consistent header (back · title · coins).
  - An icon-tile home screen with level and coin chips, and big star icons on stage clear.
- **Audio:**
  - Music is much louder and existing saves get raised once.
  - The music's noise hi-hat was removed and its arpeggio softened. The repeated warning buzz, combo ticks, hits and lasers were made gentler.
  - New power-up, heal, shield and lance sounds.
- **APK** is 64-bit only now (33 MB instead of 56 MB) because the bigger file was hard to download on the phone. Re-enable `architectures/armeabi-v7a` in `export_presets.cfg` to support very old 32-bit phones.

### Carried over from v0.3.0
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

**Android:** `releases/gloamwood-v0.5.0.apk`. The owner reported that v0.2 gameplay was smooth on their phone.

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
Testing flags (after `--`): `--showcase` (spawns every power-up plus a cyclops, drone and slime, and locks onto the cyclops), `--weapon=spark|seeker|shard|lance|scatter|boomerang|thunder|cannon`, `--melee=staff|sickle|lash|rapier|hammer|scythe`, `--autoplay` (bot demo, nothing saved), `--botplay` / `--botplay=continue` (bot plays a real saved run, so it exercises the stage clear screen and resume), `--stage=N`, `--menu=title|heroes|upgrades|quests|settings|daily`, `--hero=<id>`. Use `--audio-driver Dummy` in the container (it has no sound card; the ALSA `ERR_CANT_OPEN` message is harmless).

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
2. Tune the v0.4 balance from the owner's playtest: damage numbers, power-up frequency, weapon prices.
3. More bosses: one per biome (Crystal Wyrm, Ember Hag) with their own arenas and attacks.
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
- v0.4 (this): health bar and damage values, gentler early game, power-ups, 4 weapons with aim assist, wardrobe, auto-run, menu redesign, audio rebalance, 64-bit-only APK.
- v0.5 (this): auto-run removed, tap-to-target, auto melee (6 weapons), 8 distinct ranged weapons, 6 worlds with weather and time of day, endless world cycle, per-hero upgrades to level 10, try-on wardrobe (5 slots), hero redesign, world-specific music and sound, effects polish.
