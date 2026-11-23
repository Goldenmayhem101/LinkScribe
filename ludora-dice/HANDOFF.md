# Ludo Mayhem (formerly Ludora): handoff for the next Claude session

Last updated: 23 November 2026 (1.11 shipped to Google Play review, PixelPicked page started, Moonhop 1.1 fixed).

## Paste this into the new chat
> I'm Goldenmayhem, a solo game studio owner (not a programmer). My games live in my GitHub repo `goldenmayhem101/LinkScribe`, branch `claude/android-3d-shooter-game-3cin11`. Read `CLAUDE.md` and `ludora-dice/HANDOFF.md` first. They hold my rules, how I like to work, and the full state of my live Google Play game **Ludo Mayhem** (formerly Ludora). Then help me with: **[write the new project or task here]**. Talk to me in plain language. If my message has a question in it, answer it first before you start any work. Show me a preview before you build anything into a game, and don't build until I say go.

---

## 1. How to work with the owner (most important)
- **Plain language, step by step.** The owner is not a programmer. "Dummy it down" means numbered steps that say exactly what to click.
- **Answer questions first.** If the owner's message contains a question mark, or anything that sounds like a question (even a rhetorical one), answer it or ask about it **before** doing any work.
- **Preview first, build on "go".** Show a list or a picture of what you plan to do. Don't build anything into a game until the owner says to go ahead.
- **Files over paste.** The owner prefers a ready file to drop in, or a zip to download, over long text to copy. When it is text for a form (a store description, for example), give it in one clean copy-paste block.
- **The owner works on Windows.** The Android project is at `C:\Goldenmayhem\LudoraDiceAndroid`, built in Android Studio. The owner builds, signs and uploads it themselves.
- **There is a second "browser agent" chat** that can click around Play Console and Google Cloud for the owner. When the owner asks for "a prompt for the other chat", write a long, numbered walkthrough it can follow. It should tell the other chat:
  - to save only and never press Send for review,
  - never to touch passwords,
  - to stop when a verification step appears,
  - to report back anything it couldn't do.
- **Ask before making visual assets.** Art comes from ChatGPT using the batch prompt format in `CLAUDE.md`. Give the prompt first. The owner generates the images and sends them back. Then cut them with the tools listed in `CLAUDE.md`.
- **Keep it small and tasteful.** The owner pointed out several times that things were too big. Example: the turn hand had to be small.

## 2. Hard rules (never break)
- Never put keystores (.jks), passwords or tokens in a file or a reply. Never ask the owner to type a password into chat. The owner signs builds and enters passwords themselves.
- **Email addresses:**
  - Studio email, for use in games and on public pages: **goldenmayhem.games@gmail.com**.
  - Never use the owner's personal email anywhere public.
- **All art and names must be original.** Don't copy any existing game, film or brand.
- **Ads:** rewarded videos the player chooses only. No pop-ups or interstitials.
  - **Known conflict, ask the owner before touching it:** Moonhop (see section 7) already ships gently paced "between games" interstitials, which breaks this rule. Do not remove or add ads there without the owner deciding.
- **Purchases:**
  - No in-app purchases in any game except Ludo Mayhem.
  - Ludo Mayhem may sell **looks only**. Never sell coins, Lucky Rolls or anything that turns into coins (coins are used for bets). No paid random chests.
  - No IAP has been built yet.
- **Git:** commit and push only to `claude/android-3d-shooter-game-3cin11`. Never open a pull request unless asked.
- **Never reuse a versionCode** on Google Play. Always go up by 1, per game. Last used: Ludo Mayhem **13** (1.11); Moonhop **3** (1.1).

## 3. Ludo Mayhem: the facts
- **Store:** https://play.google.com/store/apps/details?id=com.goldenmayhem.ludoradice
- **Package:** `com.goldenmayhem.ludoradice`. This never changes; only the display name changed.
- **Store title:** "Ludo Mayhem: Fair Dice Game".
- **Releases:**
  - **Current release: 1.11 (versionCode 13).** The owner was publishing it on 22 Nov 2026.
  - 1.10 (versionCode 12) was the version before that, in production.
- **What the game is:** an HTML game in a WebView. One file, `app/src/main/assets/index.html`, plus `ui/`, `dice/`, `pawns/`, and `lang/` (107 language files, 108 languages with English).
- **Online server:**
  - `ludora-dice/ludora-server` (Node + ws), on Render's free plan: https://ludora-server-h62p.onrender.com
  - It **auto-deploys** whenever this branch is pushed.
  - Free plan: it sleeps when idle and keeps no data across restarts. A paid plan for persistence is a "later" item.
- **Data deletion page:** https://ludora-server-h62p.onrender.com/delete-data. This is the URL in Play Console Data safety.
- **Privacy policy:**
  - Artifact https://claude.ai/artifact/RM6P5yFsZenntMRaZwMeT9, titled "Ludo Mayhem Privacy Policy", dated 22 Nov 2026. Update it when data use changes.
  - Note: the local source file was in a temporary folder and is gone, so read the artifact before republishing it.
- **AdMob:**
  - IDs are in the owner's `gradle.properties` (`ca-app-pub-3920854813859561~3188337821`, rewarded `/2553913004`).
  - These are not secret, but keep them only in that file.
- **Google Play Games cloud save:**
  - Project ID `107976173248`, set as `playGamesId=` in `gradle.properties`.
  - Code: `CloudSave.kt` plus `tools/upgrade/v15.js`.
  - The Play Games setup in Play Console is done.
- **Live updates without the Play Store:**
  - Explained in `tools/live/README.md`.
  - Packs are pictures, sounds and `live.json` only, never code, uploaded to a public `ludora-live` repo.
- **Version history:** release notes are in `android-update/store/WHATS-NEW-v1.x.txt`.

### What 1.11 added
- **New name:** "Ludo Mayhem" everywhere: the game, all languages, the app label, notifications, store text, the privacy page and the server page.
- **Look:**
  - New logo and launcher icon.
  - Slow, polished loading screen.
- **Rating:**
  - The rating card appears after the first finished game, at most 3 asks (spaced by at least 3 games and 2 days).
  - "Rate us" button on the home screen.
- **Play feel:**
  - A small pointing hand and a soft glow replace the YOUR TURN banner.
  - Dice land with a thud instead of bouncing.
  - A captured pawn flies home more slowly.
- **Settings:**
  - "Delete my online data" button.
  - Cloud save box fix.
- **Play Store fix:** the portrait-only warning is fixed (`screen.portrait` set as not required).
- **Inbox:** a news item about the new name.

## 4. Where everything is (repo `ludora-dice/`)
- **`android-update/`:** ONLY the changed files, an overlay.
  - The owner copies them over `C:\Goldenmayhem\LudoraDiceAndroid`. This is not a full project, so never tell them to "open it in Android Studio".
  - `android-update/store/`: store text (`STORE-LISTING-v1.11.txt`), release notes, and store images (`listing-v1.11/`).
- **`downloads/`:** zips the owner downloads from GitHub, e.g. `Ludo-Mayhem-1.11-update.zip`. Big zips sometimes fail to download from the GitHub page. If so, give the "raw" link or split the zip.
- **`tools/upgrade/`:** how `index.html` is built.
  - `build.py` takes `orig.html` (v1.1), adds the CSS layers v2…v16 and the JS layers v2…v16 plus `i18n.js`, and writes `index.html` (or `dbg.html` with `--debug`, which adds `window.__ev` for tests).
  - Everything runs in one closure, so later layers can wrap functions like `showWin`, `updateTurn` and `fly`.
  - **New features go in a new layer:** `v17.js` / `v17.css`, added to the lists in `build.py`.
  - `build.py` also swaps in the 1.11 loading screen, and renames visible "Ludora" text to "Ludo Mayhem". Code names such as `window.Ludora`, the `ludora.v3` save key and `LudoraHooks` keep "Ludora" on purpose. **Don't rename them**: that would wipe players' saves.
  - Test scripts:
    - `audit.js`: screens at 4 sizes, looks for errors.
    - `fullgame.js` / `full7.js`: plays full games.
    - `online7.js`: an online match against a local server.
  - Test the built page by serving it with `python3 -m http.server` and driving it with Playwright.
- **`tools/lang/`:** translations.
  - `nllb.py` uses the NLLB-200 model. The env vars `ALL`, `KEYS`, `OUT`, `ONLY`, `RAWPH` and `CTXPASS` are explained in the file.
  - `mklang.py` merges results into `lang/*.json`.
  - The game name is protected with the `{5}` placeholder. Emoji and native digits are repaired.
  - The NLLB model must be downloaded again in a new session; it isn't saved in the repo.
- **`tools/live/`:** live update packs.
- **`tools/ui-art/`, `tools/art-1.11/`, `tools/store-art*/`, `tools/compose_wide.js`:** art cutting and making store images. Store images are made by placing real game screenshots on designed backgrounds with Playwright.
- **`ludora-server/`:** the online server.
  - `server.js` handles rooms, quick match, friends, and `/account/delete`.
  - `public/` holds the status page and `delete-data.html`.

### Building an Android release to test it here (optional)
- The full Android base project isn't in the repo; only the overlay is. To test a build, you need the base project.
- In a past session, the Android SDK (platform 36, build-tools 35.0.0) was installed by hand at `/opt/android/sdk`, and the build was run with `gradle :app:assembleRelease`.
- In a new session, this has to be set up again. Usually just give the owner the overlay and let them build in Android Studio.

## 5. Play Console status (22 Nov 2026)
**Done:**
- English store listing renamed to Ludo Mayhem.
- Play Games Services set up.
- Data safety and content rating answers given:
  - Data safety: 9 data types. 5 are ads data shared with AdMob. 4 are app data, not shared: name, user IDs, in-game messages and other user content.
  - Logging in with an account created outside the app: **Yes** (Google Play Games).
  - Blocking and reporting other players: **No**. There's no free-text chat, only preset phrases and emoji.
- Delete-data URL set.

**Owner's next steps:**
- Publish 1.11 (13) with the new store images and release notes.
- Check the list of pending changes before sending them.
- Check that cloud save works in the store build.

**Still open:**
- About 85 store-listing languages still show the old text or name. Fix them with Play Console's machine translation from the new English listing.

## 6. Ideas the owner mentioned for later (not started)
- Paid server so online data survives restarts.
- Tournaments with server-side anti-cheat.
- "Frost Queen" animation delivered as a live update.
- Looks-only in-app purchases for Ludo Mayhem: pawns, dice, boards, frames, bundles, a premium row in the weekly event, and removing the banner.

## 7. Other projects in this repo
- **`gloamwood/`:** a Godot 4.3 portrait platformer. It has its own `gloamwood/HANDOFF.md`, so read that one for Gloamwood work.
- **A new game:** make a new folder at the repo root. Write a `HANDOFF.md` for it like this one when the work gets big.

## 8. Lessons learned (avoid repeating these mistakes)
- **The owner edits files in Notepad.** When a Gradle file is wrong, send the whole correct file. Don't send "change line 12" instructions.
- **Root vs app build file:** the root `build.gradle.kts` (plugins with `apply false`) and the app `app/build.gradle.kts` are different files. The owner once mixed them up.
- **Play Console version confusion:**
  - When an old draft in another track gets grouped with production, tell the owner to discard the old draft.
  - Warnings that only say "this release has issues" can usually be acknowledged. Check what they say first.
- **Long translations:** text in long languages gets cut off. A fit-text shrinker exists (v13/v14 layers).
- **Animations on top of animations:** a glow was invisible because another animation was already running on the same element. Add a separate child element instead.
- **Background jobs:** a local test server only lives for the session. Start it again when needed.

## 9. Moonhop (second live game) and PixelPicked
- **Moonhop** is a separate Android game: package `com.goldenmayhem.moonhop`, folder `C:\Goldenmayhem\MoonhopAndroid` on the owner's PC. It is **not in this repo**. The owner sends the project as a zip each time.
  - Version 1.1, versionCode 3. Its game is one file, `app/src/main/assets/index.html`, about 6 MB with fonts built in.
  - AdMob: rewarded plus "Between Games" interstitial. The real IDs are in its `gradle.properties` (not secret), and debug builds use Google's test ads.
  - Own upload key `moonhop-upload.jks`. Never reuse the Ludo Mayhem key, and never handle the key or its password.
  - On 23 Nov 2026 it was checked (no code errors, no secrets in the zip). The "screen.portrait not required" line was added to its manifest and its README was corrected. The fixed zip is `MoonhopAndroid-v1.1-fixed.zip`, which the owner must rebuild and upload.
  - Ads, rating card and reminder only work inside the Android build, so ask the owner to test them on a phone.
- **PixelPicked** (pixelpicked.com/submit) is a site where the owner lists games. The page needs a game title, a tagline of 150 characters at most, and optionally a playable demo zip.
  - Ludo Mayhem title: "Ludo Mayhem". Tagline used: "Fair dice, no pay-to-win. Race your pawns home with friends online, in 108 languages. Ads only if you choose."
  - **Demo zip limit is 50 MB.** The Ludo Mayhem demo is `Ludo-Mayhem-demo-lite.zip`, 36 MB. HTML5, `index.html` at the root.
  - How it was built:
    1. Copy `index.html`, `boards`, `dice`, `pawns`, `pawnset`, `ui` and `live.json` from the app's assets. Leave out `lang` (11 MB, English works without it).
    2. Shrink pictures larger than 600 px.
    3. Halve the frames of animated `.webp` files at quality 50. This brought it from 90 MB to 36 MB.
    4. Test it in a browser. The only 404s are three pawn pictures that are missing in the real app too, plus `config.json`, which only exists on the server.
  - Online play and Google Play features do not work in a web demo. Mention this to players.

## 10. More lessons from the 22-23 Nov sessions
- Big file changes: rebuild from a clean copy instead of patching a half-finished folder, especially after an interrupted command.
- Always send the owner finished files (`SendUserFile`) instead of paths inside the container.
- When asked to "double check" something, run it for real (syntax check plus a browser load) and report plainly what is fine and what is only a note.
- Store forms: the owner pastes text in directly, so give each field's text in its own clean block, with character limits respected (count them).
