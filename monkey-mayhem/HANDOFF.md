# Monkey Mayhem: handoff for the next Claude session

Last updated: 22 November 2026 (project set up, no game code written yet).

## Paste this into the new chat
> I'm Goldenmayhem, a solo game studio owner (not a programmer). My games live in my GitHub repo `goldenmayhem101/LinkScribe`, branch `claude/android-3d-shooter-game-3cin11`. Read `CLAUDE.md` and `monkey-mayhem/HANDOFF.md` first, then continue **Monkey Mayhem**. Talk to me in plain language. If my message has a question in it, answer it first before you start any work. Show me a preview before you build anything into the game, and don't build until I say go.

## 1. What this is
- A chaotic first-person zoo game for Android phones, **landscape**. You are a caged monkey. Visitors come to look, you steal their stuff, throw things, and cause chaos. Inspired by the genre of "I Am Monkey"; mechanics are fine to borrow, but **name, characters and all art must be fully original**.
- Name: **Monkey Mayhem** (matches the Goldenmayhem brand).
- **Next game: Gorilla Mayhem.** Same props, visitors, zookeepers, missions, shop and controls; only the player character changes (monkey -> gorilla, plus a few tweaks). So: keep the player character SEPARATE and swappable, and keep everything shared in reusable scenes/scripts (planned layout in section 5).
- Engine: **Godot 4.4+**, Mobile renderer, Jolt physics, GDScript with static typing. (Gloamwood in this repo uses Godot 4.3; check what is installed and tell the owner if 4.4 is needed.)
- Money rules (from CLAUDE.md): rewarded video ads only, no pop-ups, **no in-app purchases**. Bananas are an earned in-game currency only.

## 2. Owner decisions so far
- Landscape. First test = ONE cage only (simple), so the owner can judge the look and feel.
- Use Claude Code with this repo to build. The owner tests on their phone and builds/signs/uploads to Google Play themselves.
- Visuals: owner has given none yet. First test uses plain placeholder shapes (box cage, capsule monkey, coloured props). Real art comes later via ChatGPT batches (see section 6).

## 3. The source: `monkey-mayhem/source/google-chat-full.md`
The owner's full Google AI Mode chat (about 4,800 lines): the plan, the 5-step prompt pack, real GDScript for several scripts, a CLAUDE.md for the game, three contraband toys, zone unlocks and the endgame stampede. **Never edit it.** It was written by a different AI for Godot 4.4: treat the code as a draft. Check it in Godot, fix errors, adapt for landscape and original art. Search the file for a script name to find its code and its prompt.

## 4. Build checklist (status: todo / built / tested)
Order follows the source chat. Update this list every session.

| # | Item | Script / scene | Status |
|---|------|----------------|--------|
| 1 | Global signals | `signal_bus.gd` (autoload) | todo |
| 2 | Chaos meter, 3 tiers (Tourists / Annoyed+Zookeepers / Lockdown) | `chaos_manager.gd` (autoload) | todo |
| 3 | Touch HUD: left joystick, right-side look drag, jump/grab/throw buttons, chaos bar, mission banner | `touch_ui.gd`, `touch_ui.tscn` | todo |
| 4 | Monkey movement, jump, climbing ("climbable" group) | `player_monkey.gd` (+ `player_movement.gd` if split) | todo |
| 5 | Grab / throw / eat-or-use ("grabbable", "edible", "interactive") | `grab_system.gd` | todo |
| 6 | Throw aim arc | `throw_trajectory.gd` | todo |
| 7 | Visitor AI state machine, ragdoll reaction, steals/drops items | `visitor_ai.gd` | todo |
| 8 | Visitor spawner (max 6 at once) | `visitor_spawner.gd` | todo |
| 9 | Reusable prop physics (damage threshold, break on impact, pitch-random sound) | `prop_component.gd` | todo |
| 10 | Zookeepers (tier 2-3) + tranquilizer darts | `zookeeper_ai.gd`, `tranq_dart.gd` | todo |
| 11 | Missions (8-10 funny ones, 2 active) | `mission_manager.gd` (autoload) | todo |
| 12 | Unlocks + local save (`user://save_data.cfg`) | `unlock_manager.gd` (autoload) | todo |
| 13 | Mission pop-up + shop UI | `progression_ui.gd` | todo |
| 14 | Juice: hit-stop, screen shake | `camera_juice.gd`, `juice_manager.gd` | todo |
| 15 | Contraband toy: Exploding Soda Can | `exploding_soda.gd` | todo |
| 16 | Contraband toy: Mega Airhorn | `mega_airhorn.gd` | todo |
| 17 | Contraband toy: Stinky Durian | `stinky_durian.gd` | todo |
| 18 | Zone 2 (LATER, not first test): keycard door | `keycard_door.gd` | todo |
| 19 | Zone 2 (LATER): ice zone + penguin | `ice_zone.gd`, `penguin_ai.gd` | todo |
| 20 | Endgame (LATER): Security Room stampede | `master_override.gd`, `stampede_animal.gd` | todo |
| 21 | Android export + test on the owner's phone (do right after item 5) | export preset | todo |

First playable test = items 1-13 plus 21, one cage, placeholder art. Then 14-17. Zones and stampede (18-20) are later, and need their own preview first.

## 5. Planned folder layout (so Gorilla Mayhem can reuse it)
- `monkey-mayhem/` = Godot project root.
- `shared/` = everything reusable: autoloads, touch UI, grab system, visitors, zookeepers, props, missions, unlocks, shop.
- `characters/monkey/` = the monkey only (model, skins, speed/jump numbers). Gorilla later goes in `characters/gorilla/`.
- `zoo/cage_1/` = the first cage scene.
- `art/` = cut-out art; `source/` = the Google chat.
If the owner wants Gorilla Mayhem, copy the project, swap the character folder, rename, and tweak numbers; do not fork the shared code by hand.

## 6. Visuals plan
- Prototype: placeholder shapes only.
- Real art: follow CLAUDE.md. Offer the owner ONE batch prompt for ChatGPT (5 rows x 5 variants, 1536x1536, flat #D9D9D9 background, glossy 2.5D, dark outline #170F45). Owner generates and sends the images back; cut them with `ludora-dice/tools/ui-art/` tools. 3D models are the harder part: for a 3D first-person game ask the owner which look they want (flat painted 2D sprites in a 3D scene vs low-poly 3D) before ordering any art, and show a preview.
- Need list (originals only): the monkey's hands/arms and skins, visitors (several types), zookeepers, props (banana, ball, phone, camera, bottle, watermelon), cage and zoo, UI icons, app icon, store images.

## 7. Open questions for the owner
- 2D painted look vs low-poly 3D for the characters.
- Final icon / store art later.

## 8. Lessons learned
(none yet)
