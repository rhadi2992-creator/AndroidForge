import React, { useState } from 'react';
import { X, Smartphone, Code2, Copy, Check, ShieldCheck, Terminal, Layers, Download, Loader2 } from 'lucide-react';
import { ADMOB_CONFIG } from '../services/admobBridge';
import { downloadProjectZip } from '../services/zipExporter';

interface AndroidExportModalProps {
  onClose: () => void;
}

export const AndroidExportModal: React.FC<AndroidExportModalProps> = ({ onClose }) => {
  const [copiedSection, setCopiedSection] = useState<string | null>(null);
  const [isZipping, setIsZipping] = useState(false);
  const [zipProgress, setZipProgress] = useState(0);

  const handleDownloadZip = async () => {
    setIsZipping(true);
    setZipProgress(10);
    try {
      await downloadProjectZip((percent) => setZipProgress(percent));
    } catch (e) {
      console.error('Failed to download project zip', e);
    } finally {
      setTimeout(() => {
        setIsZipping(false);
        setZipProgress(0);
      }, 1000);
    }
  };

  const copyToClipboard = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedSection(id);
    setTimeout(() => setCopiedSection(null), 2000);
  };

  const gradleSnippet = `// android/app/build.gradle.kts
dependencies {
    implementation("androidx.core:core-ktx:1.15.0")
    implementation("androidx.appcompat:appcompat:1.7.0")
    implementation("com.google.android.material:material:1.12.0")
    implementation("androidx.webkit:webkit:1.12.1")
    // Official Google Mobile Ads SDK for AdMob Integration
    implementation("com.google.android.gms:play-services-ads:23.6.0")
}`;

  const manifestSnippet = `<!-- android/app/src/main/AndroidManifest.xml -->
<manifest xmlns:android="http://schemas.android.com/apk/res/android">
    <uses-permission android:name="android.permission.INTERNET" />
    <uses-permission android:name="android.permission.VIBRATE" />

    <application
        android:label="Street Chase: Real Escape"
        android:hardwareAccelerated="true">
        <!-- Official AdMob App ID -->
        <meta-data
            android:name="com.google.android.gms.ads.APPLICATION_ID"
            android:value="${ADMOB_CONFIG.appId}"/>
    </application>
</manifest>`;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/90 backdrop-blur-md">
      <div className="bg-slate-900 border border-slate-700/80 rounded-3xl w-full max-w-3xl max-h-[92vh] flex flex-col shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-pink-500/20 border border-pink-500/40 flex items-center justify-center text-pink-400">
              <Smartphone className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-2xl font-black font-['Teko'] text-white uppercase tracking-wider">
                Android Kotlin & AdMob Architecture
              </h2>
              <p className="text-xs text-slate-400">
                Complete Android Studio project with native WebAppInterface and Google Mobile Ads SDK.
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="w-9 h-9 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white flex items-center justify-center transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {/* Prominent Download Full ZIP Banner */}
          <div className="bg-gradient-to-r from-emerald-950/80 via-slate-850 to-slate-850 border border-emerald-500/50 rounded-2xl p-4 flex flex-col sm:flex-row items-center justify-between gap-4 shadow-xl">
            <div className="flex items-center gap-3.5">
              <div className="w-12 h-12 rounded-2xl bg-emerald-500/20 border border-emerald-500/40 flex items-center justify-center text-emerald-400 shrink-0">
                <Download className="w-6 h-6" />
              </div>
              <div>
                <h3 className="text-lg font-black font-['Teko'] text-white uppercase tracking-wide">
                  DOWNLOAD FULL PROJECT ZIP ARCHIVE
                </h3>
                <p className="text-xs text-slate-300">
                  Includes complete 3D game source, Three.js shaders, Android Studio project (/android), and AdMob ads.txt.
                </p>
              </div>
            </div>

            <button
              onClick={handleDownloadZip}
              disabled={isZipping}
              className={`w-full sm:w-auto px-5 py-3 rounded-xl font-black text-xs uppercase tracking-wider flex items-center justify-center gap-2 transition active:scale-95 cursor-pointer shadow-lg shrink-0 ${
                isZipping
                  ? 'bg-slate-800 text-slate-400 cursor-wait'
                  : 'bg-gradient-to-r from-emerald-500 to-emerald-600 hover:from-emerald-600 hover:to-emerald-700 text-slate-950 shadow-emerald-500/25'
              }`}
            >
              {isZipping ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin text-emerald-400" />
                  <span>Packaging ({zipProgress}%)...</span>
                </>
              ) : (
                <>
                  <Download className="w-4 h-4" />
                  <span>Download ZIP (.zip)</span>
                </>
              )}
            </button>
          </div>

          {/* Architecture Overview */}
          <div className="bg-slate-850 border border-slate-800 rounded-2xl p-4 space-y-2">
            <h3 className="text-sm font-bold text-white flex items-center gap-2">
              <Layers className="w-4 h-4 text-amber-400" /> Hybrid Native + Three.js Engine Architecture
            </h3>
            <p className="text-xs text-slate-300 leading-relaxed">
              The game is packaged as an Android Studio application. The core WebGL Three.js game runs in a hardware-accelerated Android <code className="text-amber-400">WebView</code>, while monetization, vibration haptics, lifecycle state, and AdMob ads are executed natively in Kotlin via a bi-directional <code className="text-amber-400">@JavascriptInterface WebAppInterface</code>.
            </p>
          </div>

          {/* AdMob Configuration Table */}
          <div className="space-y-2">
            <h4 className="text-xs font-bold text-amber-400 uppercase tracking-widest flex items-center gap-1.5">
              <ShieldCheck className="w-4 h-4 text-emerald-400" /> Google Mobile Ads SDK (AdMob) Identifiers
            </h4>
            <div className="bg-slate-950 rounded-2xl border border-slate-800 p-3 font-mono text-xs space-y-1.5">
              <div className="flex justify-between text-slate-400">
                <span>Publisher ID:</span>
                <span className="text-amber-400">{ADMOB_CONFIG.publisherId}</span>
              </div>
              <div className="flex justify-between text-slate-400">
                <span>AdMob App ID:</span>
                <span className="text-slate-200">{ADMOB_CONFIG.appId}</span>
              </div>
              <div className="flex justify-between text-slate-400">
                <span>Rewarded Video (Revive & Coins):</span>
                <span className="text-amber-400">{ADMOB_CONFIG.productionUnits.rewarded}</span>
              </div>
              <div className="flex justify-between text-slate-400">
                <span>Interstitial Ad (Level Breaks):</span>
                <span className="text-sky-400">{ADMOB_CONFIG.productionUnits.interstitial}</span>
              </div>
              <div className="flex justify-between text-slate-400">
                <span>Adaptive Banner Ad:</span>
                <span className="text-emerald-400">{ADMOB_CONFIG.productionUnits.banner}</span>
              </div>
              <div className="flex justify-between text-slate-400">
                <span>App Open Ad:</span>
                <span className="text-purple-400">{ADMOB_CONFIG.productionUnits.appOpen}</span>
              </div>
              <div className="flex justify-between text-slate-400">
                <span>Native Advanced Ad:</span>
                <span className="text-pink-400">{ADMOB_CONFIG.productionUnits.nativeAdvanced}</span>
              </div>
              <div className="pt-2 border-t border-slate-800 flex justify-between text-slate-400">
                <span>ads.txt Verified:</span>
                <span className="text-emerald-300">google.com, pub-3133971041724338, DIRECT, f08c47fec0942fa0</span>
              </div>
            </div>
          </div>

          {/* Code Snippets */}
          <div className="space-y-4">
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <span className="text-xs font-bold text-slate-300 flex items-center gap-1">
                  <Code2 className="w-3.5 h-3.5 text-pink-400" /> Android Gradle Dependencies
                </span>
                <button
                  onClick={() => copyToClipboard(gradleSnippet, 'gradle')}
                  className="text-xs text-amber-400 hover:text-amber-300 flex items-center gap-1 cursor-pointer"
                >
                  {copiedSection === 'gradle' ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                  {copiedSection === 'gradle' ? 'Copied' : 'Copy'}
                </button>
              </div>
              <pre className="bg-slate-950 p-3 rounded-xl border border-slate-800 text-[11px] font-mono text-slate-300 overflow-x-auto">
                {gradleSnippet}
              </pre>
            </div>

            <div>
              <div className="flex items-center justify-between mb-1.5">
                <span className="text-xs font-bold text-slate-300 flex items-center gap-1">
                  <Code2 className="w-3.5 h-3.5 text-pink-400" /> AndroidManifest.xml Integration
                </span>
                <button
                  onClick={() => copyToClipboard(manifestSnippet, 'manifest')}
                  className="text-xs text-amber-400 hover:text-amber-300 flex items-center gap-1 cursor-pointer"
                >
                  {copiedSection === 'manifest' ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                  {copiedSection === 'manifest' ? 'Copied' : 'Copy'}
                </button>
              </div>
              <pre className="bg-slate-950 p-3 rounded-xl border border-slate-800 text-[11px] font-mono text-slate-300 overflow-x-auto">
                {manifestSnippet}
              </pre>
            </div>
          </div>

          {/* Android Build Instructions */}
          <div className="space-y-2 pt-2 border-t border-slate-800">
            <h4 className="text-xs font-bold text-amber-400 uppercase tracking-widest flex items-center gap-1.5">
              <Terminal className="w-4 h-4" /> Build Commands (Android Studio & Terminal)
            </h4>
            <div className="bg-slate-950 p-3.5 rounded-2xl border border-slate-800 space-y-2 text-xs">
              <p className="text-slate-400">1. Compile web assets for Android:</p>
              <code className="block bg-slate-900 px-3 py-1.5 rounded-lg text-amber-300 font-mono">
                npm run build
              </code>
              <p className="text-slate-400 mt-2">2. Assemble Debug APK in Android Studio:</p>
              <code className="block bg-slate-900 px-3 py-1.5 rounded-lg text-emerald-300 font-mono">
                ./gradlew assembleDebug
              </code>
              <p className="text-slate-400 mt-2">3. Assemble Signed Release APK:</p>
              <code className="block bg-slate-900 px-3 py-1.5 rounded-lg text-sky-300 font-mono">
                ./gradlew assembleRelease
              </code>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
