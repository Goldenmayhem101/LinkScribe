package com.goldenmayhem.ludoradice

import android.content.Context
import android.webkit.WebResourceResponse
import org.json.JSONObject
import java.io.File
import java.io.FileInputStream
import java.net.HttpURLConnection
import java.net.URL
import java.security.MessageDigest

/**
 * Live content: new dice, boards, frames, events and pictures that arrive WITHOUT a Play Store update.
 *
 * On start the app reads <contentUrl>/manifest.json. When its "version" is newer than what the phone has,
 * the files it lists are downloaded in the background, each one checked against its SHA-256 fingerprint,
 * and saved in the app's private storage. From then on the game uses those files instead of the built-in ones.
 *
 * Only data is ever accepted: pictures, sounds and the live.json item list. Never code (no .html, .js, .dex, .so),
 * which keeps the app inside Google Play's rules. Bug fixes and new features still go through a normal Play Store update.
 */
class LiveContent(private val ctx: Context, private val baseUrl: String) {
    private val root = File(ctx.filesDir, "live")
    private val prefs = ctx.getSharedPreferences("live", Context.MODE_PRIVATE)
    @Volatile private var busy = false

    val version: Int get() = prefs.getInt("v", 0)

    companion object {
        private val SAFE = Regex("^[A-Za-z0-9_\\-]+(/[A-Za-z0-9_\\-.]+)*\\.(webp|png|jpg|json|mp3|ogg|wav)$")
        private fun mime(p: String) = when (p.substringAfterLast('.').lowercase()) {
            "webp" -> "image/webp"; "png" -> "image/png"; "jpg" -> "image/jpeg"; "json" -> "application/json"
            "mp3" -> "audio/mpeg"; "ogg" -> "audio/ogg"; "wav" -> "audio/wav"; else -> "application/octet-stream"
        }
        private const val CHECK_EVERY_MS = 3L * 60 * 60 * 1000   // look for new content at most every 3 hours
    }

    private fun safe(p: String) = SAFE.matches(p) && !p.contains("..")

    /** A downloaded file that replaces (or adds to) the game's built-in files, or null to use the built-in one. */
    fun open(path: String): WebResourceResponse? {
        if (!safe(path)) return null
        val f = File(root, path)
        if (!f.isFile || !f.canonicalPath.startsWith(root.canonicalPath + File.separator)) return null
        return try {
            WebResourceResponse(mime(path), if (path.endsWith(".json")) "utf-8" else null, FileInputStream(f)).apply {
                responseHeaders = mapOf("Cache-Control" to "no-cache")
            }
        } catch (_: Exception) { null }
    }

    /** Checks for new content in the background. progress(done, total) while downloading; ready(version, message) when finished. */
    fun check(appVersion: Int, force: Boolean, progress: (Int, Int) -> Unit, ready: (Int, String) -> Unit) {
        if (baseUrl.isBlank() || busy) return
        val now = System.currentTimeMillis()
        if (!force && now - prefs.getLong("t", 0) < CHECK_EVERY_MS) return
        busy = true
        Thread {
            try { prefs.edit().putLong("t", now).apply(); update(appVersion, progress, ready) } catch (_: Exception) { } finally { busy = false }
        }.start()
    }

    private fun get(u: String): ByteArray {
        val c = URL(u).openConnection() as HttpURLConnection
        c.connectTimeout = 15000; c.readTimeout = 30000; c.useCaches = false
        try {
            if (c.responseCode != 200) throw Exception("http " + c.responseCode)
            return c.inputStream.use { it.readBytes() }
        } finally { c.disconnect() }
    }

    private fun sha(b: ByteArray) = MessageDigest.getInstance("SHA-256").digest(b).joinToString("") { "%02x".format(it) }
    private fun shaFile(f: File) = if (f.isFile) sha(f.readBytes()) else ""

    private fun update(appVersion: Int, progress: (Int, Int) -> Unit, ready: (Int, String) -> Unit) {
        if (!baseUrl.startsWith("https://")) return
        val base = baseUrl.trimEnd('/') + "/"
        val m = JSONObject(String(get(base + "manifest.json?t=" + System.currentTimeMillis() / 60000), Charsets.UTF_8))
        val v = m.optInt("version", 0)
        if (v <= version) return                              // nothing new
        if (m.optInt("minApp", 0) > appVersion) return        // this pack needs a newer app from the Play Store
        val files = m.getJSONObject("files")
        val need = ArrayList<Pair<String, String>>()
        val keep = HashSet<String>()
        for (p in files.keys()) {
            if (!safe(p)) throw Exception("unsafe path")
            val h = files.getJSONObject(p).getString("sha256").lowercase()
            keep.add(p)
            if (shaFile(File(root, p)) != h) need.add(p to h)
        }
        val stage = File(ctx.filesDir, "live_new"); stage.deleteRecursively(); stage.mkdirs()
        progress(0, need.size)
        var n = 0
        for ((p, h) in need) {
            var b = get(base + p + "?v=" + v)
            if (sha(b) != h) { b = get(base + p + "?v=" + v + "&r=1"); if (sha(b) != h) throw Exception("file check failed: $p") }
            val f = File(stage, p); f.parentFile?.mkdirs(); f.writeBytes(b)
            n++; progress(n, need.size)
        }
        // everything arrived and checked: move it into place, drop files the new pack no longer lists
        root.mkdirs()
        for ((p, _) in need) { val dst = File(root, p); dst.parentFile?.mkdirs(); File(stage, p).copyTo(dst, overwrite = true) }
        root.walkBottomUp().forEach { f ->
            if (f.isFile && f.relativeTo(root).invariantSeparatorsPath !in keep) f.delete()
            else if (f.isDirectory && f != root && (f.list()?.isEmpty() == true)) f.delete()
        }
        stage.deleteRecursively()
        prefs.edit().putInt("v", v).apply()
        ready(v, m.optString("message", ""))
    }
}
