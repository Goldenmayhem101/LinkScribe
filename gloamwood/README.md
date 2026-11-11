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
- **Phone:** left thumb = move stick, right thumb = **JUMP** (tap again in the air for a double jump) and **SPARK** (shoot). Top-right = pause.
- **Desktop:** arrows / A-D move, Space / W jump, J / X spark, Esc pause.
- Land on a monster's head to stomp it. Touch a checkpoint crystal to save your respawn point. Walk into the portal to finish the stage.

## Project layout
```
gloamwood/
  project.godot            settings (portrait, renderer, stretch)
  export_presets.cfg       Android export (debug, no Gradle)
  scenes/main.tscn         single scene; everything else is built from code
  scripts/
    main.gd                orchestrator: layers, parallax, stage build, combat, FX, camera, autoplay bot
    level_gen.gd           seeded chunk generator + jump-reachability validator
    player.gd              hero physics, moves, procedural drawing, scarf
    monster.gd             brute / spike / cyclops AI, telegraphs, attacks, hit + death
    hud.gd                 HUD + multi-touch controls, drawn in code
  shaders/                 monster (flash/dissolve/elite), grass wind, post (vignette/grain/hurt), portal
  assets/<biome>/          baked art + meta.json (gloamwood, crystal, emberfen)
  tools/bake/              bake.html + bake.js: regenerate the art (needs Node + Playwright)
  tools/test_levels.gd     headless test: 600 stages, every hop must be reachable
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
