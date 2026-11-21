# Ludora – Android project (by Goldenmayhem)

Package name: **com.goldenmayhem.ludoradice** · Targets **Android 16 (API 36)** · Version 1.10 (versionCode 12)

## What's new in 1.10
- Google Play cloud save (`CloudSave.kt`, game side `tools/upgrade/v15.js`): players are signed in to Google Play Games
  automatically and their progress is saved to their Google account after changes and when they leave the app. On a new
  install it comes back on its own; if a phone already has its own progress, the player is asked which one to keep.
  Settings has a "Google Play save" box (Sign in / Save now). The avatar photo stays on the phone.
- Needs `playGamesId=` in gradle.properties (Play Console > Play Games Services > Configuration > Project ID).
  Until it is set, cloud save is off and the game works exactly like 1.9.

## What's new in 1.9
- Activity Center (Weekly Event with a rotating grand prize: Epic dice, Epic pawn, Rare board or Epic frame; daily Mini Event), Inbox
- Store: Shop / Videos / Events / Owned / Offers / Chests. Common items for coins; common dice 30 videos, rare dice 50 videos,
  common frames 15 videos, rare frames 30 videos; everything Epic and Legendary, all non-common boards and pawns are event prizes
- Real animations from Google Flow: legendary dice guardians (▶ in the dice viewer; Frost Queen off until her animation arrives),
  animated emojis above the sender's picture, gifts that fly to the receiver and play on landing
- Lucky Rolls removed completely: every roll is a plain 1 in 6, in every mode
- Dice viewer: solid cube (no gaps), Equip button really equips; store dice pictures cleaned of stray pieces
- Legendary frames: breathing glow, shine and corner twinkles (no more spinning dots over the face)
- Finishing-move words in each character's colours
- Live content (`LiveContent.kt`, `tools/live/`): new items, events, guardian animations and inbox messages download in the
  background without a Play Store update. Only pictures, sounds and a data list are accepted, never code
- Languages: 108 (the phone's language is picked automatically; Settings has a drop-down)
- Online: shows "Online is coming soon" until a game server address is set

## Live content (updates without the Play Store)
See `../tools/live/README.md`. In short: make a pack with `tools/live/mkpack.py`, upload it to the public GitHub repository
`ludora-live` (or set your own address with `contentUrl=` in gradle.properties). Phones download it on their own.


## What's new in 1.8
- `tools/upgrade/v10.js`: Legendary finishing moves. Each of the 30 Legendary pawns has its own show (slam, charge, breath, lightning bolt, beam, tidal wave, gulp, claw slash, meteor, time stop, tornado, foxfire orbs, island rise, roar, shock, pounce, dive, rainbow, holy light, black hole) with its own victim reaction (squashed, launched, frozen and shattered, burnt, zapped, dissolved, swallowed, split, turned to sand, ascended), sounds, buzz and word. Store item sheet has "See finishing move"
- Pawn art re-cleaned from the original cut-outs (`tools/ui-art/clean2.py`): gray pockets and gray rims removed without cutting into bodies; glows kept
- Prices: dice/pawns Common 1M coins, Rare 5M coins, Epic 4,000 diamonds, Legendary 6,000 diamonds; boards Common 2.5M coins, Rare 3,000, Epic 4,000, Legendary 6,000 diamonds. 4 Common dice and 4 Common pawns
- Lucky Rolls: 3 free a day, 5 max saved, 3 per game, now also online (sent to the host, limited per player); in-game "watch a video for +1" when out
- 7-day trials for Common and Rare items (10% of the price in coins)
- Online: host re-sends the game state every 2.5 s and the result after a win, so a dropped message can't leave a player stuck
- Sound polish: dice landing, captures, home, win, button taps

## What's new in 1.7
- Legendary pawns: each of the 30 has its own capture show (the big character drops in, energy burst in its colour, shockwave, themed sparks, its own word like FROZEN! or STORM STRIKE!, a little ghost rises from the knocked-out pawn) and comes alive in its store preview (bounce, jump, blast)
- Pawn art cleaned: the light gray halo / glow cloud left from the ChatGPT background is removed (`tools/ui-art/outline.py`, fallback `dehalo.py`)
- The big old classic pawn is removed; Glossy Classic is the free starter
- Pawn taps listen to touch, pointer and click, and always move the nearest glowing pawn
- Store never wider than the screen (no sideways scrolling)
- New boards: Dune Run art, plus "II" versions of Sunset Glow, Island Breeze, Frost Hall, Moonlit Pier, Sunny Meadow, Treasure Isle, Arctic Ice and Coral Reef. Pixel Lounge background cleaned (no copied game items)
- Prices raised: dice Common 150K / Rare 450K / Epic 3,000 diamonds / Legendary 6,000; pawns 150K / 350K / 3,500 / 7,500; boards 200K / 500K / 3,000 / 6,000
- Lucky Rolls: 3 free each day (leftovers expire at midnight), 5 max saved, 3 per game

## What's new in 1.6
- Every pawn, dice and board replaced with new original illustrated art (made in ChatGPT, cut out with `tools/ui-art/`)
  - `pawnset/`: 99 new pawn characters (25 Rare, 44 Epic, 30 Legendary) plus 3 Common sets; one image per set holding red, green, yellow, blue and white (white is painted for the 10 custom colours)
  - `dice/`: 53 dice (8 Common, 15 Rare, 20 Epic, 10 Legendary). Epic dice show big bold numbers that the build adds to blank ChatGPT faces
  - `boards/`: 34 boards, each a world background (`*-w.webp`) and a board picture with themed stickers in the four yards
- Board is flat and square with a thin edge, so the outer rows are never cut off
- Dice sits right beside each player's picture
- Tapping near a glowing pawn always moves the nearest one
- Computer players use random dice and pawns from the whole collection
- Old dice and pawns that players owned are gone; anyone using one goes back to the classic set

## What's new in 1.5
- New deep look: deep blue home with a dot pattern, chunky 3D buttons (shiny top, thick bottom edge, shadow), chunky white lettering with a dark outline, white 3D pop-ups on top
- Original illustrated art (made in ChatGPT, cut out in `tools/ui-art/`), in `app/src/main/assets/ui/`:
  - `av/`: 24 new profile pictures (also the faces of Ruby, Mint, Sunny and Blu)
  - `sc/`: mode card scenes (Online, Vs Computer, Team 2 vs 2, Pass & Play), fully inside each card
  - `ic/`: coins, diamonds, gift, star, trophy, gear, dice, 6 chests, shop, ticket, calendar, medal, clover, video and more
  - `fx/`: win, team win, "try again" and open-chest pictures
- Home: smaller top bar; Daily / Season / Events banners with the icon beside the words; small Lucky, Free and Medals buttons; new bottom bar (Store, Pass, Home, Events, Daily)
- Dice: the roll is about twice as fast (about 0.45 s instead of 0.85 s), and the turn moves on sooner after a roll
- Dice dots: dark dots on the plain coloured dice and on the Berry, Sundown, Reef and Prism styles (re-rendered in `dice/`)

## What's new in 1.4
- Turn marker: the active player's name tag turns into a pill ("YOUR TURN", "MOVE A PAWN", "Ruby's turn"); a yellow arrow bounces over your dice when it is your roll
- Turn timer drawn around the player's picture frame (green, then yellow, then red). In the last 5 seconds a big countdown number shows inside the frame, with ticks and a buzz. At 0 the game rolls or moves for you ("Time's up! Rolled for you."). Miss 3 turns in a row against the computer and Auto play switches on. 15 seconds per turn (6 in Speed mode)
- After a 6 (or a bump / reaching home with Bonus roll on) a "ROLL AGAIN!" pill pops over the dice
- Computer levels: Easy, Normal, Hard, Expert, in Settings and on the Vs Computer setup screen. Harder levels only choose better moves (guard pawns, bump yours, avoid danger); the dice stay random for everyone. Online fill-in players stay on Normal
- Settings > Ludora: Rate Ludora (opens the Play Store page), Share Ludora (phone's share menu), Send feedback (opens email to goldenmayhem.games@gmail.com), Replay tutorial, Fair play page
- First-time home tour (5 steps, Skip any time), replay from Settings
- MainActivity.kt: two new bridge functions, shareText and sendEmail (email only ever goes to the studio address)
- Store text and honest production-access answers: `store/PLAY-STORE-TEXT-and-PRODUCTION-ANSWERS-v1.4.txt`

## What's new in 1.3
- New white look with thin, even dark outlines on every icon, button and card
- New home: player picture (with your equipped frame) top left, coins and diamonds bar on top, settings top right; one big mode card at a time that you swipe: Online, Vs Computer, Team 2 vs 2, Pass & Play. No game title, no Rules icon (How to play is in Settings)
- New setup screens for each mode: 2 or 4 players, round mode pictures you swipe through with an "i" that explains the mode, entry fee with − and +, and the prize worked out automatically
- Winner takes all: the prize is entry × players (Team: entry × 4, shared by the two partners). 2nd place no longer gets the entry back
- Online: pick 2 or 4 players and tap Find Players; players with the same choices meet at the same table. If only 2 of 4 show up after 30 seconds, the computer fills the empty seats. Everyone pays the entry when the game starts
- Team 2 vs 2: Online, or Friends (create a room and share the code, or join with a code)
- Your colour: blue, yellow, green, red, or a white pawn you can paint in 10 colours (white, purple, orange, pink, teal, black, brown, gold, sky, lime). Your base and path take your colour too, and other players see it online
- "Computer" is only shown when you play against the computer
- Chests: Iron, Silver and Gold from wins; the new Crystal chest only from 500,000 and 1,000,000 games. Each chest opens its own window (start unlocking, or open now with a video). Chests give only coins and diamonds
- Profile: 16 people pictures, a blank picture, or your own photo; your equipped frame shows around your picture on the home screen, in your profile and in games; country flag
- No animals on the home screen or in the profile pictures

## What's new in 1.2
- Real 3D dice for all 20 dice styles (rendered in Godot, files in `app/src/main/assets/dice/`)
- Bigger, more detailed boards: big glowing pawn cups, name tabs, a glowing rim, board name banner
- Illustrated faces for Ruby, Mint, Sunny and Blu; tap any player to see them, send a gift or mute them
- Bottom bar in the game: reactions, quick chat, gifts (game coins only) and Lucky Roll
- Board spinner before each game ("Playing on Ruby's board")
- Coin games are now "Entry fee" and "Prize pool" (no betting wording)
- Win screen shows what you earned, a video button to get the game reward again, and a bar toward your next goal item
- Free monthly Season Pass (30 tiers), weekly Token Hunt (tokens on the board), chest row on the home screen
- 7-day bonus can be doubled with a video
- Profile with full stats and 12 achievements with bronze, silver and gold medals
- The first game teaches as you play (pointing hand); the rule cards stay under How to play
- 10 languages in Settings > Language; Arabic reads right to left
- Fixed: Play again after an entry-fee game now charges the fee again (before, it paid the prize without the fee)
- Fixed: winning with Auto play on now counts as your win (before, you lost the prize pool)
- Store update text and new screenshots: `store/LAUNCH-PACK-v1.2-UPDATE.txt`, `store/screenshots-v1.2/`

## 1. Open it
1. Unzip this folder somewhere easy, e.g. `C:\Goldenmayhem\LudoraAndroid`.
2. Android Studio: **File > Open**, pick the `LudoraAndroid` folder, **Trust**.
3. If it asks "Please Select Gradle JVM", click **Use JVM 21**. Wait for Gradle sync to finish.
4. Optional test: plug in your phone (USB debugging on) and press the green **Run** button. Debug builds always show Google's test ads.

## 2. AdMob IDs (still to do)
In AdMob create an app called "Ludora" (Android, not listed yet) with ONE **Rewarded** ad unit. Ludora has no pop-up ads, so no Interstitial.
Open `gradle.properties`, remove the `#` in front of the two AdMob lines and paste the app ID and the rewarded unit ID.
Until you do, every build uses Google's test ads. Never tap your own real ads.

## 3. Make a NEW upload key and BACK IT UP
1. **Build > Generate Signed App Bundle or APK > Android App Bundle > Next**.
2. Key store path: **Create new...** and save it as `C:\Goldenmayhem\ludoradice-upload.jks`. Do not reuse another game's key.
3. Your own password, alias `upload`, your name, **OK**, then **release > Create**.
4. **Back up the .jks file and its password right away** (Google Drive + USB stick).
5. The bundle lands in `app\release\app-release.aab`.

## 4. Online play (optional, later)
The app works fully offline (vs the computer, team match, pass and play). Online rooms, friends and quick match need the Ludora server
(folder `ludora-dice/ludora-server` in the repository; steps in its README). When it is hosted, paste its address on the `serverUrl=` line in `gradle.properties`
(e.g. `https://ludora-xxxx.onrender.com`), raise `versionCode`, and upload an update. Then also use the "online" answers in `store/LAUNCH-PACK.txt` (Data safety, content rating).
Google/Facebook sign-in does not work inside an app, so the app uses guest play online.

## 5. Google Play Console
Everything for Google Play is in `store/LAUNCH-PACK.txt`: listing text, store settings, every App content answer, closed test setup,
a tester recruitment post and draft answers for the production application. The `store` folder also has the icon, the feature graphic,
7 phone screenshots and 7 tablet screenshots, and `privacy.html` (the policy, already published at the link in the pack).
For every later update, raise `versionCode` by 1 in `app/build.gradle.kts`.

## What's inside
- The whole game: `app/src/main/assets/index.html` (works offline, fonts built in)
- Golden Mayhem kit: studio intro with "Produced by Shawn Morris", tutorial with a pointing hand, Daily Challenge, free gift timer, chests, collection store, settings, rate-us card
- Rewarded ads only, Google consent form + "Ad privacy options", rating card, daily reminder, vibration, avatar photo picker: `MainActivity.kt`
- Daily reminder (about 6 pm, can be switched off in Settings): `Reminder.kt`

## Security built in
Target API 36, no plain-http traffic, the game runs from the app's own private https address, file and content access off,
Safe Browsing on, outside links open in the browser. Android back gesture closes menus, opens Settings during a game and only leaves the app from the home screen.
