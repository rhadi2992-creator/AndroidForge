export const ADMOB_CONFIG = {
  appId: 'ca-app-pub-3133971041724338~1435685725',
  publisherId: 'pub-3133971041724338',
  testUnits: {
    banner: 'ca-app-pub-3940256099942544/6300978111',
    interstitial: 'ca-app-pub-3940256099942544/1033173712',
    rewarded: 'ca-app-pub-3940256099942544/5224354917',
    appOpen: 'ca-app-pub-3940256099942544/9257395921',
  },
  productionUnits: {
    banner: 'ca-app-pub-3133971041724338/5796556380',
    interstitial: 'ca-app-pub-3133971041724338/5419609870',
    rewarded: 'ca-app-pub-3133971041724338/3170393048',
    appOpen: 'ca-app-pub-3133971041724338/5183359047',
    nativeAdvanced: 'ca-app-pub-3133971041724338/9167283199',
  },
};

export type AdType = 'banner' | 'interstitial' | 'rewarded' | 'appOpen';

export interface AdRequestResult {
  success: boolean;
  rewardEarned?: boolean;
  rewardType?: string;
  rewardAmount?: number;
  error?: string;
}

interface NativeAndroidBridge {
  showRewardedAd?: (rewardType: string, callbackName: string) => void;
  showInterstitialAd?: (callbackName: string) => void;
  showBannerAd?: (position: string) => void;
  hideBannerAd?: () => void;
  vibrate?: (ms: number) => void;
  isAdLoaded?: (adType: string) => boolean;
}

declare global {
  interface Window {
    AndroidBridge?: NativeAndroidBridge;
    __admobCallback?: (resultJson: string) => void;
  }
}

class AdMobService {
  private lastInterstitialTime = 0;
  private readonly INTERSTITIAL_COOLDOWN_MS = 60000; // 60 seconds between interstitial ads
  private simListener: ((modalData: { type: AdType; title: string; reward: string; onComplete: (earned: boolean) => void }) => void) | null = null;

  public registerSimulatorUI(listener: (modalData: { type: AdType; title: string; reward: string; onComplete: (earned: boolean) => void }) => void) {
    this.simListener = listener;
  }

  public isNativeAndroid(): boolean {
    return typeof window !== 'undefined' && !!window.AndroidBridge;
  }

  public triggerHaptic(durationMs = 25): void {
    if (typeof window !== 'undefined' && window.AndroidBridge?.vibrate) {
      window.AndroidBridge.vibrate(durationMs);
    } else if (typeof navigator !== 'undefined' && navigator.vibrate) {
      navigator.vibrate(durationMs);
    }
  }

  public showBanner(visible = true): void {
    if (this.isNativeAndroid() && window.AndroidBridge) {
      if (visible) {
        window.AndroidBridge.showBannerAd?.('bottom');
      } else {
        window.AndroidBridge.hideBannerAd?.();
      }
    }
  }

  public canShowInterstitial(): boolean {
    return Date.now() - this.lastInterstitialTime > this.INTERSTITIAL_COOLDOWN_MS;
  }

  public showInterstitial(placement = 'level_transition'): Promise<boolean> {
    if (!this.canShowInterstitial()) {
      return Promise.resolve(false);
    }

    this.lastInterstitialTime = Date.now();

    return new Promise((resolve) => {
      if (this.isNativeAndroid() && window.AndroidBridge?.showInterstitialAd) {
        const callbackName = `__admob_interstitial_${Date.now()}`;
        (window as unknown as Record<string, (json: string) => void>)[callbackName] = (json: string) => {
          delete (window as unknown as Record<string, unknown>)[callbackName];
          try {
            const data = JSON.parse(json);
            resolve(!!data.success);
          } catch {
            resolve(true);
          }
        };
        window.AndroidBridge.showInterstitialAd(callbackName);
      } else if (this.simListener) {
        this.simListener({
          type: 'interstitial',
          title: `AdMob Interstitial Ad (${placement})`,
          reward: 'Sponsored Break',
          onComplete: (earned) => resolve(earned),
        });
      } else {
        // Fallback instant
        resolve(true);
      }
    });
  }

  public showRewardedRevive(): Promise<AdRequestResult> {
    return this.requestRewarded('revive', 'Emergency Ad Revive');
  }

  public showRewardedBonusCoins(amount = 250): Promise<AdRequestResult> {
    return this.requestRewarded('bonus_coins', `+${amount} Bonus Gold Coins`, amount);
  }

  private requestRewarded(rewardType: string, rewardDescription: string, amount = 1): Promise<AdRequestResult> {
    return new Promise((resolve) => {
      if (this.isNativeAndroid() && window.AndroidBridge?.showRewardedAd) {
        const callbackName = `__admob_rewarded_${Date.now()}`;
        (window as unknown as Record<string, (json: string) => void>)[callbackName] = (json: string) => {
          delete (window as unknown as Record<string, unknown>)[callbackName];
          try {
            const data = JSON.parse(json);
            resolve({
              success: !!data.success,
              rewardEarned: !!data.rewardEarned,
              rewardType: data.rewardType || rewardType,
              rewardAmount: data.rewardAmount || amount,
            });
          } catch (e) {
            resolve({ success: false, error: 'Malformed callback' });
          }
        };
        window.AndroidBridge.showRewardedAd(rewardType, callbackName);
      } else if (this.simListener) {
        this.simListener({
          type: 'rewarded',
          title: 'Google Mobile Ads — Rewarded Video Ad',
          reward: rewardDescription,
          onComplete: (earned) => {
            resolve({
              success: true,
              rewardEarned: earned,
              rewardType,
              rewardAmount: amount,
            });
          },
        });
      } else {
        // Safe fallback
        resolve({
          success: true,
          rewardEarned: true,
          rewardType,
          rewardAmount: amount,
        });
      }
    });
  }
}

export const admobService = new AdMobService();
