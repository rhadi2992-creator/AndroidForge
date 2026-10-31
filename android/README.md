# Street Chase: Real Escape — Android Project Documentation

This directory contains the complete native Android project files for **Street Chase: Real Escape**, integrated with the **Google Mobile Ads (AdMob) SDK**.

## Project Architecture

- **WebView Host**: Modern Android hardware-accelerated WebView rendering the 3D Three.js runner at up to 60/120 FPS.
- **Bi-directional JavaScript Bridge**: `WebAppInterface.kt` exposes native vibration haptics, SharedPreferences storage sync, and Google AdMob rewarded & interstitial ads directly to the JavaScript engine.
- **Official Google Mobile Ads SDK**: Integrated via `com.google.android.gms:play-services-ads:23.6.0`.
- **Fullscreen Immersive Sticky Mode**: Full viewport utilization with transient system bars.

---

## Official Google AdMob Test Ad Unit IDs Configured

| Ad Format | Official Test Unit ID | Usage in Street Chase |
| :--- | :--- | :--- |
| **Application ID** | `ca-app-pub-3940256099942544~3347511713` | Configured in `AndroidManifest.xml` |
| **Rewarded Video** | `ca-app-pub-3940256099942544/5224354917` | Emergency Revive (1 per run) & Free Bonus Coins |
| **Interstitial** | `ca-app-pub-3940256099942544/1033173712` | Level Completion natural transition |
| **Banner** | `ca-app-pub-3940256099942544/6300978111` | Non-intrusive bottom menu placement |
| **App Open** | `ca-app-pub-3940256099942544/9257395921` | Cold launch game boot |

---

## How to Build the Android APK

### Step 1: Export Web Assets to Android Assets
From the root project directory:
```bash
npm run build
mkdir -p android/app/src/main/assets
cp -r dist/* android/app/src/main/assets/
```

### Step 2: Open in Android Studio
1. Launch **Android Studio**.
2. Select **Open an existing project** and choose the `/android` directory.
3. Allow Gradle to sync dependencies.

### Step 3: Build Debug APK
Run via terminal inside the `/android` folder:
```bash
./gradlew assembleDebug
```
The output APK is generated at:
`android/app/build/outputs/apk/debug/app-debug.apk`

### Step 4: Build Signed Release APK
```bash
./gradlew assembleRelease
```
The output APK is generated at:
`android/app/build/outputs/apk/release/app-release-unsigned.apk`

---

## Switching to Production AdMob IDs Before Google Play Release

1. Open `android/app/src/main/AndroidManifest.xml`:
   Replace `ca-app-pub-3940256099942544~3347511713` with your Google AdMob App ID.
2. Open `android/app/src/main/java/com/streetchase/realescape/AdMobManager.kt`:
   Update `TEST_REWARDED_ID` and `TEST_INTERSTITIAL_ID` with your production AdMob unit IDs.
