# Gloamwood

A vertical (portrait) 2D fantasy platformer for Android, built in **Godot 4.3** at $0.
Every stage is generated from a seed: terrain, gaps, floating ledges, climbing towers,
coins, monsters, checkpoints and an exit portal. Biomes rotate every two stages.

| | |
|---|---|
| Engine | Godot 4.3 stable, `gl_compatibility` renderer (widest Android support) |
| Screen | 720×1280 portrait, `keep_width` (taller phones show more height) |
| Art | Original, painted in code (`tools/bake`) and baked to PNG per biome. No third-party assets. |
| Install | Debug APK in `releases/` (sideload on Android) |

## Play / controls
- **Desktop:** arrows / A-D move, Space / W jump, J / X spark, Esc pause.
- **Phone:** D-pad (or analog stick in Settings) on the left; JUMP, SPARK (tap to shoot, hold to charge) and DASH on the right.
- **Keyboard:** L / Shift dashes.
- Land on a monster's head to stomp it. Dash through enemies to hit them. Slide down walls and jump off them.
- Touch a checkpoint crystal to save your respawn point. Walk into the portal to finish the stage. Every 5th stage has a boss.
- Coins buy upgrades and heroes. Daily rewards, quests and achievements are in Quests & Rewards. The run resumes where you left off.

## Project layout
```
gloamwood/
  project.godot            settings (portrait, renderer, stretch)
  export_presets.cfg       Android export (debug, no Gradle)
  scenes/main.tscn         single scene; everything else is built from code
  scripts/
    main.gd                orchestrator: layers, parallax, stage build, combat, FX, camera, autoplay bot
    level_gen.gd           seeded chunk generator, hazards, chests, boss arenas + jump-reachability validator
    player.gd              hero physics, dash, wall jump, charge, per-hero stats, drawing, scarf
    monster.gd             8 monster types + Titan boss: AI, telegraphs, attacks, health bars, deaths
    hud.gd                 HUD + multi-touch controls (D-pad/analog), combo, boss bar, toasts
    menu.gd                title, heroes, upgrades, quests, settings, pause, stage clear, game over
    profile.gd             autoload "Profile": save data, resume, upgrades, heroes, daily rewards, quests, achievements, XP
    audio.gd               autoload "Sfx": synthesized sound effects + threaded music generation
  shaders/                 monster (flash/dissolve/elite), grass wind, post (vignette/grain/hurt), portal
  assets/<biome>/          baked art + meta.json (gloamwood, crystal, emberfen)
  tools/bake/              bake.html + bake.js: regenerate the art (needs Node + Playwright)
  tools/test_levels.gd     headless test: 600 stages x 3 difficulties, every hop must be reachable
  tools/export_sounds.gd   render all synthesized sounds/music to WAV
  assets/fonts/            DejaVu fonts (free license, see DEJAVU-LICENSE.txt)
  releases/                built APKs
```

## Commands
```bash
GODOT=/opt/godot/Godot_v4.3-stable_linux.x86_64
$GODOT --headless --path . --editor --quit                            # import assets (first run)
$GODOT --headless --path . --script res://tools/test_levels.gd        # level generator test
$GODOT --path . -- --autoplay                                         # watch the bot play
$GODOT --headless --path . --export-debug "Android" build/gloamwood-debug.apk
node tools/bake/bake.js                                               # re-bake art after editing bake.html palettes
```
Recording frames on a headless Linux box:
```bash
xvfb-run -a -s "-screen 0 800x1400x24" $GODOT --path . --rendering-driver opengl3 \
  --resolution 720x1280 --write-movie /tmp/run.avi --fixed-fps 30 --quit-after 900 -- --autoplay
```

See `HANDOFF.md` for the full status, decisions and next steps.
