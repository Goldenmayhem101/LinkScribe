# What we did together (Goldenmayhem + Claude), Oct to 24 Nov 2026

A plain-language memory of the long chat, so a new chat (cloud or desktop) knows the story. Rules and facts are in `CLAUDE.md` and `ludora-dice/HANDOFF.md`.

## Timeline
- **Gloamwood** (11 Nov): a Godot 4.3 portrait platformer. Notes in `gloamwood/HANDOFF.md`.
- **Ludora Dice, later renamed Ludo Mayhem:** a fair-dice Ludo game, built as one HTML file inside an Android WebView wrapper.
  - 1.2 to 1.8: new look, 3D dice, boards, frames, pawns, economy, tutorial, 10 then 108 languages.
  - 1.9: events hub, weekly events, inbox, store, guardians, emojis, gifts.
  - 1.10 (versionCode 12): Google Play cloud save, online server on Render, live content updates without the Play Store.
  - 1.11 (versionCode 13): new name "Ludo Mayhem", loading screen, rating card after the first game, "Rate us" button, small pointing hand + glow for your turn, dice thud, slower capture flight, "Delete my online data". 1.11 was sent to Google Play review on 22-23 Nov.
- **Store work:** listing text (title "Ludo Mayhem: Fair Dice Game", 2195-char description), screenshots (phone + tablet), feature graphic, icon, privacy policy page, data-deletion page. A browser-agent chat filled in parts of Play Console (Data safety: 9 data types; content rating; login with outside account = Yes; block/report = No).
- **PixelPicked page** for Ludo Mayhem: tagline and a 36 MB web demo (limit 50 MB).
- **Moonhop 1.2 (versionCode 4)** and **Tiltrix Mayhem 1.0 (versionCode 1):** built and saved in `moonhop/` and `tiltrix/`.
- **Skills pack** installed in `.claude/skills/` (only for new native Kotlin games).
- **Monkey Mayhem:** a Godot zoo game started in another chat (`monkey-mayhem/HANDOFF.md`).

## Mistakes we hit and fixed (don't repeat)
- I once called the update zip a project to "open in Android Studio". It is an overlay: copy it over `C:\Goldenmayhem\LudoraDiceAndroid`.
- Gradle error "Plugin com.android.application not found": the app build file was put in the top folder. The root file only holds the plugin lines (AGP 8.9.1, Kotlin 2.0.21, `apply false`).
- Never reuse a versionCode. Ludora 10 was already used, so 11 then 12 (1.10), 13 (1.11).
- Translations: the game name got transliterated in some languages. Fixed with a protected `{5}` placeholder.
- A glow was invisible because another animation ran on the same element. Add a separate child element.
- The owner asked for the hand pointer to stay SMALL.
- The owner wants every question answered BEFORE work starts, and a preview/list before building.

## Open items (details in HANDOFF.md section 11)
1. Ludo Mayhem 1.12 fixes (Rate button, honest Google sign-in message). Waiting for the owner's "go".
2. Tiltrix: real AdMob ids, new upload key, store text, Play Console forms.
3. Moonhop 1.2: rebuild, sign, upload. Decide about its interstitial ads.
4. About 85 store languages still show old text/name (use Play Console machine translation).
5. Later ideas: paid server for saved online data, tournaments with anti-cheat, Frost Queen animation, looks-only purchases for Ludo Mayhem.
