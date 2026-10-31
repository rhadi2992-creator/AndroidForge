package com.streetchase.realescape

import android.app.Activity
import android.util.Log
import com.google.android.gms.ads.*
import com.google.android.gms.ads.interstitial.InterstitialAd
import com.google.android.gms.ads.interstitial.InterstitialAdLoadCallback
import com.google.android.gms.ads.rewarded.RewardedAd
import com.google.android.gms.ads.rewarded.RewardedAdLoadCallback

/**
 * Manages Google Mobile Ads (AdMob) SDK lifecycle for Street Chase: Real Escape.
 * Utilizes official Google test ad unit IDs during development.
 */
class AdMobManager(private val activity: Activity) {

    companion object {
        private const val TAG = "AdMobManager"

        // Production Ad Unit IDs from Google AdMob console
        const val PROD_REWARDED_ID = "ca-app-pub-3133971041724338/3170393048"
        const val PROD_INTERSTITIAL_ID = "ca-app-pub-3133971041724338/5419609870"
        const val PROD_BANNER_ID = "ca-app-pub-3133971041724338/5796556380"
        const val PROD_APP_OPEN_ID = "ca-app-pub-3133971041724338/5183359047"
        const val PROD_NATIVE_ID = "ca-app-pub-3133971041724338/9167283199"

        // Google Test IDs (Used during development/debug)
        const val TEST_REWARDED_ID = "ca-app-pub-3940256099942544/5224354917"
        const val TEST_INTERSTITIAL_ID = "ca-app-pub-3940256099942544/1033173712"
        const val TEST_BANNER_ID = "ca-app-pub-3940256099942544/6300978111"
        const val TEST_APP_OPEN_ID = "ca-app-pub-3940256099942544/9257395921"
    }

    private var rewardedAd: RewardedAd? = null
    private var interstitialAd: InterstitialAd? = null
    private var isRewardedLoading = false
    private var isInterstitialLoading = false

    fun initialize() {
        MobileAds.initialize(activity) { status ->
            Log.d(TAG, "AdMob MobileAds initialized: $status")
            loadRewardedAd()
            loadInterstitialAd()
        }
    }

    fun loadRewardedAd() {
        if (rewardedAd != null || isRewardedLoading) return
        isRewardedLoading = true

        val adRequest = AdRequest.Builder().build()
        RewardedAd.load(activity, TEST_REWARDED_ID, adRequest, object : RewardedAdLoadCallback() {
            override fun onAdLoaded(ad: RewardedAd) {
                rewardedAd = ad
                isRewardedLoading = false
                Log.d(TAG, "AdMob RewardedAd successfully loaded")
            }

            override fun onAdFailedToLoad(loadAdError: LoadAdError) {
                rewardedAd = null
                isRewardedLoading = false
                Log.e(TAG, "RewardedAd failed to load: ${loadAdError.message}")
            }
        })
    }

    fun showRewardedAd(onRewardEarned: (Boolean, String, Int) -> Unit) {
        val ad = rewardedAd
        if (ad != null) {
            ad.fullScreenContentCallback = object : FullScreenContentCallback() {
                override fun onAdDismissedFullScreenContent() {
                    rewardedAd = null
                    loadRewardedAd() // Pre-load next
                }

                override fun onAdFailedToShowFullScreenContent(adError: AdError) {
                    rewardedAd = null
                    loadRewardedAd()
                    onRewardEarned(false, "error", 0)
                }
            }

            ad.show(activity) { rewardItem ->
                Log.d(TAG, "User earned reward: ${rewardItem.type} x${rewardItem.amount}")
                onRewardEarned(true, rewardItem.type, rewardItem.amount)
            }
        } else {
            Log.w(TAG, "Rewarded ad was not ready. Triggering fallback load.")
            loadRewardedAd()
            onRewardEarned(false, "not_ready", 0)
        }
    }

    fun loadInterstitialAd() {
        if (interstitialAd != null || isInterstitialLoading) return
        isInterstitialLoading = true

        val adRequest = AdRequest.Builder().build()
        InterstitialAd.load(activity, TEST_INTERSTITIAL_ID, adRequest, object : InterstitialAdLoadCallback() {
            override fun onAdLoaded(ad: InterstitialAd) {
                interstitialAd = ad
                isInterstitialLoading = false
                Log.d(TAG, "AdMob InterstitialAd successfully loaded")
            }

            override fun onAdFailedToLoad(loadAdError: LoadAdError) {
                interstitialAd = null
                isInterstitialLoading = false
                Log.e(TAG, "InterstitialAd failed to load: ${loadAdError.message}")
            }
        })
    }

    fun showInterstitialAd(onDismissed: () -> Unit) {
        val ad = interstitialAd
        if (ad != null) {
            ad.fullScreenContentCallback = object : FullScreenContentCallback() {
                override fun onAdDismissedFullScreenContent() {
                    interstitialAd = null
                    loadInterstitialAd()
                    onDismissed()
                }

                override fun onAdFailedToShowFullScreenContent(adError: AdError) {
                    interstitialAd = null
                    loadInterstitialAd()
                    onDismissed()
                }
            }
            ad.show(activity)
        } else {
            loadInterstitialAd()
            onDismissed()
        }
    }
}
