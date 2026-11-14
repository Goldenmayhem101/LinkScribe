# Gloamwood upgrade: PAUSED (resume here)

Live preview: https://claude.ai/artifact/UgvgXTafX3vXzjiEeJrjJh (page = `gloamwood-upgrade.html`)
2D vector test (Fuzzhorn, Emberwing): https://claude.ai/artifact/VWJTQQxCL6qmeLKQzcWfKR

## Where we are
- Game itself: last shipped build is v0.5.3 (no foreground plants, no focus pauses, weaker charge shot, more/tougher monsters). Nothing below is in the game yet.
- Preview (approval pending) covers: weapons (real art, swings, trails, 3 upgrade looks), chests (5 tiers + reveal window), endless worlds based on 30 real mysterious places (5 stages each, new monsters every stage, elite on stage 3, boss on stage 5, remixed places after world 30), monster book (locked = dark silhouette + name + world), bosses, world map, stars/challenges, outfits, game feel, movable controls.
- Monsters: owner generated new 2D art in ChatGPT (flat cartoon, dark outline, facing left, flat gray background).
  - 154 of 267 monsters have new art (`new-art/`, mapping in `newmap.json`: original id -> sheet_cell). Glacibear (m03) restored.
  - 113 still use older restyled art. Reference sheets for them: `refsheets/missing01..10.png` (key in `refsheets/key-missing.json`). Owner was sent these plus the prompt.
  - Catalog (names, body type, attack, colour, element, facing): `catalog.js`. Animation + 30 attacks: `anim.js`. World planner: `worlds.js`.

## Next steps when the owner says continue
1. Owner sends the new sheets for missing01..10 -> cut with `tools/cutgray.py <sheet> <outdir> <prefix>` (4x3 grid, gray bg), map by eye to originals (ChatGPT may reorder/duplicate), convert to `mon/<id>.webp` (max 300px), set facing `l` in `catalog.js`, republish.
2. Optional: mouth-open and eyes-closed versions for real attack faces and blinks.
3. Owner reviews the whole preview (monster animations, worlds, weapons, chests...) and approves.
4. Then build it into the Godot game (gloamwood/scripts), test (tools/test_levels.gd etc.), export APK, commit.

## Prompt to give ChatGPT (with one reference sheet uploaded)
Redraw ALL 12 monsters from the attached reference sheet as 2D game sprites for my mobile platformer. Keep each monster's identity exactly (species, shape, colours, markings, horns, wings, eyes, limbs); only change the art style and pose. Flat 2D vector cartoon, simple rounded shapes, soft smooth gradients, thin even dark purple-black outline (#1C1430), no fur strands / 3D render / glossy look, slightly muted moonlit colours, cute big eyes. Full body, side view facing LEFT, feet at bottom of cell, mouth slightly open. Exactly 12 in a 4x3 grid in the SAME order, wide space around each, ONE plain flat solid light gray (#D9D9D9) background, no glow/halos/floor/shadows/text/borders, 1536x1024.
