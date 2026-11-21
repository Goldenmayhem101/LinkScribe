# Ludora online server

Handles online play for the Ludora app: guest sign-in, friends (friend codes), invites, quick match and game rooms.
The game itself runs on the players' phones; this server only connects them. Needs Node 18 or newer.

## Run it on your computer (optional test)
    npm install
    npm start            # http://localhost:3000 shows "Ludora server is running"

## Put it online (Render, free)
New > Web Service > your GitHub repository, branch `claude/android-3d-shooter-game-3cin11`,
Root Directory `ludora-dice/ludora-server`, Build Command `npm install`, Start Command `npm start`, Instance Type Free.
Then put the address on the `serverUrl=` line of `gradle.properties` in the Android project and upload a new version.

## Settings (Environment variables, all optional)
- `DATA_FILE`: where accounts and friend lists are saved (default `data.json` next to server.js).
  On a host with a persistent disk, point it at the disk, e.g. `/data/ludora.json`.
- `GOOGLE_CLIENT_ID`, `FACEBOOK_APP_ID`, `FACEBOOK_APP_SECRET`: only for a web version. The Android app uses guest sign-in.

## Known limits
- Each game is run by its host's phone. If the host leaves, the game ends. Before tournaments with prizes, the game
  rules should move onto the server so nobody can cheat.
- Free hosting sleeps when nobody plays for 15 minutes; the next player waits up to a minute while it wakes,
  and saved friend lists can reset when it restarts. A paid plan with a disk fixes both.
