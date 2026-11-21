package com.goldenmayhem.ludoradice

import android.app.Activity
import com.google.android.gms.games.PlayGames
import com.google.android.gms.games.PlayGamesSdk
import com.google.android.gms.games.SnapshotsClient
import com.google.android.gms.games.snapshot.Snapshot
import com.google.android.gms.games.snapshot.SnapshotMetadataChange
import org.json.JSONObject

/**
 * Google Play cloud save (Play Games Services "Saved games").
 *
 * The player is signed in to Google Play Games automatically (no password, no extra screen). Their progress is kept
 * as one saved game called "ludora" in their own Google account, so it comes back after a reinstall or on a new phone.
 * If two phones saved different progress, Google keeps the one that is further along (more games played, then XP).
 *
 * Turned off until playGamesId is set in gradle.properties. Without it the game works exactly as before.
 */
class CloudSave(private val act: Activity, private val js: (String) -> Unit) {
    val enabled = BuildConfig.PLAY_GAMES_ID.isNotBlank()
    @Volatile private var signedIn = false
    @Volatile private var name = ""
    @Volatile private var busy = false
    private var pending: Triple<String, Long, String>? = null

    companion object { private const val SAVE_NAME = "ludora" }

    fun status(): String = if (!enabled) "off" else if (signedIn) "in" else "out"

    /** Call once from onCreate. Google signs the player in automatically when it can. */
    fun start() {
        if (!enabled) return
        try { PlayGamesSdk.initialize(act) } catch (_: Exception) { return }
        check(false)
    }

    /** interactive = true when the player tapped "Sign in" in Settings. */
    fun check(interactive: Boolean) {
        if (!enabled) return
        try {
            val c = PlayGames.getGamesSignInClient(act)
            (if (interactive) c.signIn() else c.isAuthenticated()).addOnCompleteListener { t ->
                signedIn = t.isSuccessful && t.result?.isAuthenticated == true
                report()
                if (signedIn) PlayGames.getPlayersClient(act).currentPlayer.addOnSuccessListener { p ->
                    name = p?.displayName ?: ""; report()
                }
            }
        } catch (_: Exception) { signedIn = false; report() }
    }

    private fun report() = js("window.__cloud&&__cloud.state('" + status() + "'," + JSONObject.quote(name) + ")")

    private fun open(ok: (Snapshot) -> Unit, fail: () -> Unit) {
        val client = PlayGames.getSnapshotsClient(act)
        client.open(SAVE_NAME, true, SnapshotsClient.RESOLUTION_POLICY_HIGHEST_PROGRESS)
            .addOnSuccessListener { d ->
                if (!d.isConflict) { d.data?.let(ok) ?: fail(); return@addOnSuccessListener }
                // two phones saved at the same time: keep the one that is further along
                val c = d.conflict ?: return@addOnSuccessListener fail()
                val a = c.snapshot; val b = c.conflictingSnapshot
                val pick = if (a.metadata.progressValue >= b.metadata.progressValue) a else b
                client.resolveConflict(c.conflictId, pick)
                    .addOnSuccessListener { r -> if (!r.isConflict && r.data != null) ok(r.data!!) else fail() }
                    .addOnFailureListener { fail() }
            }
            .addOnFailureListener { fail() }
    }

    /** Reads the cloud save and hands it to the game (empty string when there is none yet). */
    fun load() {
        if (!signedIn) { js("window.__cloud&&__cloud.loaded('')"); return }
        open({ s ->
            val text = try { String(s.snapshotContents.readFully(), Charsets.UTF_8) } catch (_: Exception) { "" }
            PlayGames.getSnapshotsClient(act).discardAndClose(s)
            js("window.__cloud&&__cloud.loaded(" + JSONObject.quote(text) + ")")
        }, { js("window.__cloud&&__cloud.loaded('')") })
    }

    /** Writes the game's progress to the cloud. Calls made while a save is running are merged into one. */
    fun save(data: String, progress: Long, desc: String) {
        if (!signedIn) { js("window.__cloud&&__cloud.saved(false)"); return }
        synchronized(this) { if (busy) { pending = Triple(data, progress, desc); return }; busy = true }
        open({ s ->
            s.snapshotContents.writeBytes(data.toByteArray(Charsets.UTF_8))
            val change = SnapshotMetadataChange.Builder().setDescription(desc.take(100)).setProgressValue(progress).build()
            PlayGames.getSnapshotsClient(act).commitAndClose(s, change).addOnCompleteListener { t -> done(t.isSuccessful) }
        }, { done(false) })
    }

    private fun done(ok: Boolean) {
        js("window.__cloud&&__cloud.saved($ok)")
        val next = synchronized(this) { busy = false; val p = pending; pending = null; p }
        if (next != null) save(next.first, next.second, next.third)
    }
}
