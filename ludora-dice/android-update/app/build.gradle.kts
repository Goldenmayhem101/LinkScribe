plugins {
    id("com.android.application")
    id("org.jetbrains.kotlin.android")
}

// Real AdMob IDs live in gradle.properties (admobAppId, rewardedUnit, interstitialUnit)
val admobAppId = (project.findProperty("admobAppId") as String?) ?: "ca-app-pub-3940256099942544~3347511713"
val realRewarded = (project.findProperty("rewardedUnit") as String?) ?: "ca-app-pub-3940256099942544/5224354917"
val serverUrl = (project.findProperty("serverUrl") as String?) ?: ""
val privacyUrl = (project.findProperty("privacyUrl") as String?) ?: ""
// Live content (new items/events without a Play Store update). Change it in gradle.properties with contentUrl=...
val contentUrl = (project.findProperty("contentUrl") as String?) ?: "https://raw.githubusercontent.com/goldenmayhem101/ludora-live/main/"
// Google Play Games project ID (Play Console > Play Games Services > Configuration). Empty = cloud save is off.
val playGamesId = ((project.findProperty("playGamesId") as String?) ?: "").trim()

android {
    namespace = "com.goldenmayhem.ludoradice"
    compileSdk = 36

    defaultConfig {
        applicationId = "com.goldenmayhem.ludoradice"   // the package name you type in Google Play Console
        minSdk = 26
        targetSdk = 36                                 // Android 16, required by Google Play
        versionCode = 12                                // raise by 1 for every upload to Google Play
        versionName = "1.10"
        manifestPlaceholders["admobAppId"] = admobAppId
        resValue("string", "game_services_project_id", playGamesId)
        buildConfigField("String", "PLAY_GAMES_ID", "\"$playGamesId\"")
    }

    buildFeatures { buildConfig = true }

    buildTypes {
        // Debug builds (the green Run button) always use Google's TEST ads, so you never click your own real ads.
        debug {
            buildConfigField("String", "REWARDED_UNIT", "\"ca-app-pub-3940256099942544/5224354917\"")
            buildConfigField("String", "SERVER_URL", "\"$serverUrl\"")
            buildConfigField("String", "PRIVACY_URL", "\"$privacyUrl\"")
            buildConfigField("String", "CONTENT_URL", "\"$contentUrl\"")
        }
        // The signed release you upload to Google Play uses your real Ludora ad units from gradle.properties.
        release {
            isMinifyEnabled = false
            proguardFiles(getDefaultProguardFile("proguard-android-optimize.txt"), "proguard-rules.pro")
            buildConfigField("String", "REWARDED_UNIT", "\"$realRewarded\"")
            buildConfigField("String", "SERVER_URL", "\"$serverUrl\"")
            buildConfigField("String", "PRIVACY_URL", "\"$privacyUrl\"")
            buildConfigField("String", "CONTENT_URL", "\"$contentUrl\"")
        }
    }
    compileOptions {
        sourceCompatibility = JavaVersion.VERSION_17
        targetCompatibility = JavaVersion.VERSION_17
    }
    kotlinOptions { jvmTarget = "17" }
}

dependencies {
    implementation("androidx.appcompat:appcompat:1.7.0")
    implementation("androidx.core:core-splashscreen:1.0.1")
    implementation("androidx.webkit:webkit:1.11.0")
    implementation("com.google.android.gms:play-services-ads:23.3.0")
    implementation("com.google.android.gms:play-services-games-v2:22.1.0")  // Google Play cloud save
    implementation("com.google.android.ump:user-messaging-platform:3.0.0")
    implementation("com.google.android.play:review-ktx:2.0.2")   // Google Play in-app rating card
    implementation("androidx.work:work-runtime-ktx:2.9.1")       // daily reminder notification
}
