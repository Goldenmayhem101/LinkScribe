package com.goldenmayhem.ludoradice

import android.Manifest
import android.annotation.SuppressLint
import android.content.Intent
import android.os.Bundle
import android.os.SystemClock
import android.view.View
import android.view.WindowManager
import android.webkit.JavascriptInterface
import android.webkit.WebChromeClient
import android.webkit.WebResourceRequest
import android.webkit.WebResourceResponse
import android.webkit.WebView
import android.webkit.WebViewClient
import android.widget.Toast
import androidx.activity.OnBackPressedCallback
import androidx.activity.result.contract.ActivityResultContracts
import androidx.appcompat.app.AppCompatActivity
import androidx.core.splashscreen.SplashScreen.Companion.installSplashScreen
import androidx.core.view.WindowCompat
import androidx.core.view.WindowInsetsCompat
import androidx.core.view.WindowInsetsControllerCompat
import androidx.webkit.WebViewAssetLoader
import com.google.android.gms.ads.AdRequest
import com.google.android.gms.ads.FullScreenContentCallback
import com.google.android.gms.ads.LoadAdError
import com.google.android.gms.ads.MobileAds
import com.google.android.gms.ads.rewarded.RewardedAd
import com.google.android.gms.ads.rewarded.RewardedAdLoadCallback
import com.google.android.ump.ConsentInformation
import com.google.android.ump.ConsentRequestParameters
import com.google.android.ump.UserMessagingPlatform
import com.google.android.play.core.review.ReviewManagerFactory
import java.util.concurrent.atomic.AtomicBoolean

class MainActivity : AppCompatActivity() {

    // Set in app/build.gradle.kts: test ads in debug builds, your real Ludora ad units in release builds.
    private val rewardedUnit = BuildConfig.REWARDED_UNIT

    // The game is served from the app's own files under this private https address (no file:// access needed).
    private val appOrigin = "https://appassets.androidplatform.net"
    private val startUrl = "$appOrigin/assets/index.html"

    private lateinit var web: WebView
    private lateinit var consent: ConsentInformation
    private val adsStarted = AtomicBoolean(false)
    private var rewarded: RewardedAd? = null
    private var fileCb: android.webkit.ValueCallback<Array<android.net.Uri>>? = null
    private var pageReady = false
    private val launchedAt = SystemClock.uptimeMillis()

    // Asks Android 13+ for permission to show the daily reminder; turns the reminder off if the player says no.
    private val notifPermission = registerForActivityResult(ActivityResultContracts.RequestPermission()) { granted ->
        Reminder.set(this, granted)
        if (!granted) Toast.makeText(this, "Reminders are off. You can allow notifications later in Settings.", Toast.LENGTH_LONG).show()
    }

    private val photoPicker = registerForActivityResult(ActivityResultContracts.GetContent()) { uri ->
        fileCb?.onReceiveValue(if (uri != null) arrayOf(uri) else null); fileCb = null
    }

    @SuppressLint("SetJavaScriptEnabled")
    override fun onCreate(savedInstanceState: Bundle?) {
        // Android launch screen with the Ludora icon; it stays up until the game page has loaded (max ~3 s)
        val splash = installSplashScreen()
        super.onCreate(savedInstanceState)
        splash.setKeepOnScreenCondition { !pageReady && SystemClock.uptimeMillis() - launchedAt < 3000 }

        // full-screen game: hide the status and navigation bars, swipe from the edge to show them
        WindowCompat.setDecorFitsSystemWindows(window, false)
        WindowInsetsControllerCompat(window, window.decorView).apply {
            hide(WindowInsetsCompat.Type.systemBars())
            systemBarsBehavior = WindowInsetsControllerCompat.BEHAVIOR_SHOW_TRANSIENT_BARS_BY_SWIPE
        }
        window.addFlags(WindowManager.LayoutParams.FLAG_KEEP_SCREEN_ON)

        val assets = WebViewAssetLoader.Builder()
            .addPathHandler("/assets/", WebViewAssetLoader.AssetsPathHandler(this))
            .build()

        web = WebView(this)
        setContentView(web)
        web.settings.apply {
            javaScriptEnabled = true
            domStorageEnabled = true            // saves levels, stars, coins, skins and settings
            mediaPlaybackRequiresUserGesture = false
            allowFileAccess = false             // security: the page can't read files on the phone
            allowContentAccess = false
            setSupportMultipleWindows(false)    // links that open "new tabs" come back to shouldOverrideUrlLoading
            setGeolocationEnabled(false)
            safeBrowsingEnabled = true
        }
        web.overScrollMode = View.OVER_SCROLL_NEVER
        web.setBackgroundColor(0xFF0A0F3A.toInt())
        web.webChromeClient = object : WebChromeClient() {
            // lets the player pick a photo for their avatar (Settings > Your photo)
            override fun onShowFileChooser(w: WebView, cb: android.webkit.ValueCallback<Array<android.net.Uri>>, p: FileChooserParams): Boolean {
                fileCb?.onReceiveValue(null); fileCb = cb
                try { photoPicker.launch("image/*") } catch (_: Exception) { fileCb = null; cb.onReceiveValue(null); return false }
                return true
            }
        }
        web.webViewClient = object : WebViewClient() {
            override fun shouldInterceptRequest(view: WebView, request: WebResourceRequest): WebResourceResponse? =
                assets.shouldInterceptRequest(request.url)

            // Only the game itself runs inside the app. Any other link (e.g. the privacy policy) opens in the browser.
            override fun shouldOverrideUrlLoading(view: WebView, request: WebResourceRequest): Boolean {
                val url = request.url.toString()
                if (url.startsWith(appOrigin)) return false
                try { startActivity(Intent(Intent.ACTION_VIEW, request.url)) } catch (_: Exception) {}
                return true
            }

            override fun onPageFinished(view: WebView, url: String) { pageReady = true }
        }
        web.addJavascriptInterface(AdsBridge(), "AndroidAds")
        web.addJavascriptInterface(AppBridge(), "AndroidApp")
        web.loadUrl(startUrl)

        // Back button: pauses a run, closes menus, and only leaves the app from the home screen
        onBackPressedDispatcher.addCallback(this, object : OnBackPressedCallback(true) {
            override fun handleOnBackPressed() {
                web.evaluateJavascript("(window.__back?window.__back():'home')") {
                    if (it.contains("home")) moveTaskToBack(true)
                }
            }
        })

        // Ask for ad consent where the law requires it (EU/UK etc.), then start ads.
        consent = UserMessagingPlatform.getConsentInformation(this)
        consent.requestConsentInfoUpdate(this, ConsentRequestParameters.Builder().build(), {
            UserMessagingPlatform.loadAndShowConsentFormIfRequired(this) { startAdsIfAllowed() }
        }, { startAdsIfAllowed() })
        startAdsIfAllowed() // returning players who already answered can start right away
    }

    private fun startAdsIfAllowed() {
        if (!consent.canRequestAds() || !adsStarted.compareAndSet(false, true)) return
        MobileAds.initialize(this) { loadRewarded() }
    }

    private fun loadRewarded() {
        RewardedAd.load(this, rewardedUnit, AdRequest.Builder().build(), object : RewardedAdLoadCallback() {
            override fun onAdLoaded(ad: RewardedAd) { rewarded = ad }
            override fun onAdFailedToLoad(error: LoadAdError) { rewarded = null }
        })
    }

    private fun reply(id: Int, ok: Boolean) {
        runOnUiThread { web.evaluateJavascript("window.__adResult && window.__adResult($id, $ok)", null) }
    }

    inner class AdsBridge {
        @JavascriptInterface
        fun showRewarded(id: Int) {
            runOnUiThread {
                val ad = rewarded
                if (ad == null) {
                    Toast.makeText(this@MainActivity, "No video available right now. Try again in a moment.", Toast.LENGTH_SHORT).show()
                    if (adsStarted.get()) loadRewarded()
                    reply(id, false); return@runOnUiThread
                }
                var earned = false
                ad.fullScreenContentCallback = object : FullScreenContentCallback() {
                    override fun onAdDismissedFullScreenContent() { rewarded = null; loadRewarded(); reply(id, earned) }
                    override fun onAdFailedToShowFullScreenContent(e: com.google.android.gms.ads.AdError) { rewarded = null; loadRewarded(); reply(id, false) }
                }
                ad.show(this@MainActivity) { earned = true }
            }
        }

        // Settings > "Ad privacy choices" button appears only where the law requires it
        @JavascriptInterface
        fun privacyOptionsRequired(): Boolean =
            consent.privacyOptionsRequirementStatus == ConsentInformation.PrivacyOptionsRequirementStatus.REQUIRED

        @JavascriptInterface
        fun showPrivacyOptions() {
            runOnUiThread { UserMessagingPlatform.showPrivacyOptionsForm(this@MainActivity) { startAdsIfAllowed() } }
        }
    }

    inner class AppBridge {
        // Google Play's own rating card. Google decides whether it appears (it limits how often players see it).
        @JavascriptInterface
        fun requestReview() {
            runOnUiThread {
                val rm = ReviewManagerFactory.create(this@MainActivity)
                rm.requestReviewFlow().addOnCompleteListener { task ->
                    if (task.isSuccessful) rm.launchReviewFlow(this@MainActivity, task.result)
                }
            }
        }

        @JavascriptInterface
        fun setReminder(on: Boolean) {
            runOnUiThread {
                if (on && !Reminder.canNotify(this@MainActivity)) notifPermission.launch(Manifest.permission.POST_NOTIFICATIONS)
                else Reminder.set(this@MainActivity, on)
            }
        }

        @JavascriptInterface
        fun reminderOn(): Boolean = Reminder.isOn(this@MainActivity) && Reminder.canNotify(this@MainActivity)

        // Short haptic tap (respects the game's Vibration setting, which is checked in the game itself)
        @JavascriptInterface
        fun vibrate(ms: Int) {
            val v = if (android.os.Build.VERSION.SDK_INT >= 31)
                (getSystemService(android.os.VibratorManager::class.java))?.defaultVibrator
            else @Suppress("DEPRECATION") getSystemService(android.os.Vibrator::class.java)
            try { v?.vibrate(android.os.VibrationEffect.createOneShot(ms.coerceIn(5, 300).toLong(), android.os.VibrationEffect.DEFAULT_AMPLITUDE)) } catch (_: Exception) {}
        }

        // Online server address (set in gradle.properties). Empty = online play is off and the game stays offline.
        @JavascriptInterface
        fun serverUrl(): String = BuildConfig.SERVER_URL

        @JavascriptInterface
        fun privacyUrl(): String = BuildConfig.PRIVACY_URL

        // Opens a web page (the privacy policy) in the phone's browser
        @JavascriptInterface
        fun openUrl(url: String) {
            if (!url.startsWith("https://")) return
            runOnUiThread { try { startActivity(Intent(Intent.ACTION_VIEW, android.net.Uri.parse(url))) } catch (_: Exception) {} }
        }

        @JavascriptInterface
        fun shareText(text: String) {
            val t = text.take(500)
            runOnUiThread {
                try {
                    val send = Intent(Intent.ACTION_SEND).apply { type = "text/plain"; putExtra(Intent.EXTRA_TEXT, t) }
                    startActivity(Intent.createChooser(send, "Share Ludora"))
                } catch (_: Exception) {}
            }
        }

        @JavascriptInterface
        fun sendEmail(to: String, subject: String, body: String) {
            if (to != "goldenmayhem.games@gmail.com") return   // only ever opens mail to the studio address
            runOnUiThread {
                try {
                    val mail = Intent(Intent.ACTION_SENDTO).apply {
                        data = android.net.Uri.parse("mailto:")
                        putExtra(Intent.EXTRA_EMAIL, arrayOf(to))
                        putExtra(Intent.EXTRA_SUBJECT, subject.take(120))
                        putExtra(Intent.EXTRA_TEXT, body.take(2000))
                    }
                    startActivity(Intent.createChooser(mail, "Send feedback"))
                } catch (_: Exception) {
                    Toast.makeText(this@MainActivity, "No email app found. Write to " + to, Toast.LENGTH_LONG).show()
                }
            }
        }
    }

    override fun onPause() { super.onPause(); web.onPause() }
    override fun onResume() { super.onResume(); web.onResume() }
}
