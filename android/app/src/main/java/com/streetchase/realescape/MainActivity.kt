package com.streetchase.realescape

import android.annotation.SuppressLint
import android.os.Build
import android.os.Bundle
import android.view.View
import android.view.WindowInsets
import android.view.WindowInsetsController
import android.webkit.WebChromeClient
import android.webkit.WebSettings
import android.webkit.WebView
import android.webkit.WebViewClient
import androidx.activity.OnBackPressedCallback
import androidx.appcompat.app.AppCompatActivity

class MainActivity : AppCompatActivity() {

    private lateinit var webView: WebView
    private lateinit var adMobManager: AdMobManager

    @SuppressLint("SetJavaScriptEnabled")
    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)

        // Enable immersive sticky fullscreen
        hideSystemUI()

        // Initialize AdMob
        adMobManager = AdMobManager(this)
        adMobManager.initialize()

        // Initialize hardware-accelerated WebView
        webView = WebView(this)
        setContentView(webView)

        webView.settings.apply {
            javaScriptEnabled = true
            domStorageEnabled = true
            databaseEnabled = true
            mediaPlaybackRequiresUserGesture = false
            cacheMode = WebSettings.LOAD_DEFAULT
            allowFileAccess = true
            allowContentAccess = true
            // WebGL & GPU hardware acceleration
            setRenderPriority(WebSettings.RenderPriority.HIGH)
        }

        // Bridge JS <-> Kotlin
        val webAppInterface = WebAppInterface(this, webView, adMobManager)
        webView.addJavascriptInterface(webAppInterface, "AndroidBridge")

        webView.webChromeClient = WebChromeClient()
        webView.webViewClient = object : WebViewClient() {
            override fun onPageFinished(view: WebView?, url: String?) {
                super.onPageFinished(view, url)
            }
        }

        // Load built web assets (or development server)
        webView.loadUrl("file:///android_asset/index.html")

        // Handle Android Back Button
        onBackPressedDispatcher.addCallback(this, object : OnBackPressedCallback(true) {
            override fun handleOnBackPressed() {
                // Inform running game to pause or return to main menu
                webView.evaluateJavascript("if (window.__onAndroidBackPressed) { window.__onAndroidBackPressed(); } else { history.back(); }", null)
            }
        })
    }

    private fun hideSystemUI() {
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.R) {
            window.insetsController?.let { controller ->
                controller.hide(WindowInsets.Type.statusBars() or WindowInsets.Type.navigationBars())
                controller.systemBarsBehavior = WindowInsetsController.BEHAVIOR_SHOW_TRANSIENT_BARS_BY_SWIPE
            }
        } else {
            @Suppress("DEPRECATION")
            window.decorView.systemUiVisibility = (
                View.SYSTEM_UI_FLAG_IMMERSIVE_STICKY
                or View.SYSTEM_UI_FLAG_LAYOUT_STABLE
                or View.SYSTEM_UI_FLAG_LAYOUT_HIDE_NAVIGATION
                or View.SYSTEM_UI_FLAG_LAYOUT_FULLSCREEN
                or View.SYSTEM_UI_FLAG_HIDE_NAVIGATION
                or View.SYSTEM_UI_FLAG_FULLSCREEN
            )
        }
    }

    override fun onResume() {
        super.onResume()
        hideSystemUI()
        webView.onResume()
        webView.evaluateJavascript("if (window.__onAppResume) { window.__onAppResume(); }", null)
    }

    override fun onPause() {
        super.onPause()
        webView.onPause()
        webView.evaluateJavascript("if (window.__onAppPause) { window.__onAppPause(); }", null)
    }

    override fun onDestroy() {
        webView.destroy()
        super.onDestroy()
    }
}
