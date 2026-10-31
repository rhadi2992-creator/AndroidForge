package com.streetchase.realescape

import android.app.Activity
import android.content.Context
import android.os.Build
import android.os.VibrationEffect
import android.os.Vibrator
import android.os.VibratorManager
import android.webkit.JavascriptInterface
import android.webkit.WebView
import org.json.JSONObject

/**
 * Bi-directional JavaScript-to-Kotlin interface exposed to the WebGL game inside WebView.
 */
class WebAppInterface(
    private val activity: Activity,
    private val webView: WebView,
    private val adMobManager: AdMobManager
) {

    @JavascriptInterface
    fun showRewardedAd(rewardType: String, callbackName: String) {
        activity.runOnUiThread {
            adMobManager.showRewardedAd { earned, type, amount ->
                val json = JSONObject().apply {
                    put("success", true)
                    put("rewardEarned", earned)
                    put("rewardType", type)
                    put("rewardAmount", amount)
                }
                executeJsCallback(callbackName, json.toString())
            }
        }
    }

    @JavascriptInterface
    fun showInterstitialAd(callbackName: String) {
        activity.runOnUiThread {
            adMobManager.showInterstitialAd {
                val json = JSONObject().apply {
                    put("success", true)
                }
                executeJsCallback(callbackName, json.toString())
            }
        }
    }

    @JavascriptInterface
    fun vibrate(durationMs: Long) {
        try {
            val vibrator = if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.S) {
                val vm = activity.getSystemService(Context.VIBRATOR_MANAGER_SERVICE) as VibratorManager
                vm.defaultVibrator
            } else {
                @Suppress("DEPRECATION")
                activity.getSystemService(Context.VIBRATOR_SERVICE) as Vibrator
            }

            if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.O) {
                vibrator.vibrate(VibrationEffect.createOneShot(durationMs, VibrationEffect.DEFAULT_AMPLITUDE))
            } else {
                @Suppress("DEPRECATION")
                vibrator.vibrate(durationMs)
            }
        } catch (e: Exception) {
            e.printStackTrace()
        }
    }

    @JavascriptInterface
    fun onDataSaved(json: String) {
        // Persist to native SharedPreferences as secondary backup
        val prefs = activity.getSharedPreferences("street_chase_save", Context.MODE_PRIVATE)
        prefs.edit().putString("save_data", json).apply()
    }

    private fun executeJsCallback(callbackName: String, jsonParam: String) {
        val script = "if (window['$callbackName']) { window['$callbackName']($jsonParam); }"
        webView.evaluateJavascript(script, null)
    }
}
