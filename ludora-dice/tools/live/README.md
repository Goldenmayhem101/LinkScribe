# Ludora live updates (no Play Store update needed)

Small updates (a new dice, a board, a frame, an event, a new guardian animation, an inbox message, moving an item
between Store / Videos / Events) reach players automatically. When the game opens it checks for a new pack, downloads
it in the background (a small "Downloading new items" pill shows), and refreshes itself on the home screen.
Players never wait in a match: if they are playing, it applies when they get back to the home screen.

Bug fixes and new features still need a normal Play Store update. Packs can only hold pictures, sounds and the
live.json list (never code), which keeps Ludora inside Google Play's rules.

## Where packs live
The app looks at the address in `contentUrl` (android-update gradle.properties). If you never set it, it uses
`https://raw.githubusercontent.com/goldenmayhem101/ludora-live/main/`
so the easiest setup is:
1. On GitHub, create a new PUBLIC repository named `ludora-live`.
2. Upload the contents of your pack folder (live.json, manifest.json and the pictures) to its main branch.
That's it. Phones pick it up the next time the game opens (and every few hours while it's used).

## Making a pack
1. Copy `example-pack` to a new folder, edit `live.json`, and put new pictures at the same paths the game uses.
2. Run: `python3 tools/live/mkpack.py my-pack --message "Frost Fest is here!"`
   It checks the files and writes `manifest.json` (the version number goes up by 1 each time).
3. Upload the whole folder to the `ludora-live` repository (replace the old files).

Each pack is the full set: list every live file you still want. Files left out are removed from phones.

## What live.json can do
- `items`: new or changed items, e.g. `{"die":[{"id":"x_frost","name":"Frost Rune","r":"epic","like":"e_crystal"}]}`
  (`like` copies an existing item first, then your fields replace its values; add its pictures to the pack)
- `src`: where an item comes from: `{"die:x_frost":{"ev":1}}` events only, `{"shop":1}` store, `{"vid":50}` 50 videos
- `guardians` and `guardianOn`: give a legendary dice a guardian and turn on its ▶, e.g. the Frost Queen:
  put the animation at `ui/v19/gd/r5_03.webp` and add `"guardianOn":["r5_03"]`
- `anim`: emoji or gift keys that now have an animated picture in `ui/v19/anim/<key>.webp`
- `inbox`: messages for the Inbox
- `themes`: weekly event names and pictures, e.g. `[["Frost Fest","wk3","#5fb8ff"]]` (picture at `ui/v19/ev/wk3.webp`)
- `atlas` / `holes`: frame artwork positions (for new frames)

`minApp` (`--min-app 11`) makes a pack wait for phones that have at least that app version.
