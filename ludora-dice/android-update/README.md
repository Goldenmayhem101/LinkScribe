# Ludora – Android project (by Goldenmayhem)

Package name: **com.goldenmayhem.ludoradice** · Targets **Android 16 (API 36)** · Version 1.4 (versionCode 5)

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
(folder `ludora-server` in the zip). When it is hosted, paste its address on the `serverUrl=` line in `gradle.properties`
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
