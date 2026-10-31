import { PlayerProgress } from '../types/game';

const STORAGE_KEY = 'street_chase_real_escape_save_v1';

const DEFAULT_PROGRESS: PlayerProgress = {
  coins: 500, // Starter bonus coins
  gems: 10,  // Starter bonus gems
  highScore: 0,
  totalDistanceRun: 0,
  unlockedLevel: 1,
  completedLevels: {},
  selectedCharacterId: 'marcus-dash',
  unlockedCharacters: ['marcus-dash'],
  recoveredJewellery: 0,
  recoveredHandbags: 0,
  arrestedSuspects: 0,
  totalRecoveredItems: 0,
  powerUpUpgrades: {
    magnet: 1,
    shield: 1,
    boost: 1,
    doubleCoins: 1,
    invincible: 1,
  },
  settings: {
    musicEnabled: true,
    sfxEnabled: true,
    musicVolume: 0.75,
    sfxVolume: 0.85,
    vibrationEnabled: true,
    graphicsQuality: 'high',
    swipeSensitivity: 1.0,
  },
};

export function loadProgress(): PlayerProgress {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return { ...DEFAULT_PROGRESS };
    const parsed = JSON.parse(raw);
    return {
      ...DEFAULT_PROGRESS,
      ...parsed,
      recoveredJewellery: parsed.recoveredJewellery ?? 0,
      recoveredHandbags: parsed.recoveredHandbags ?? 0,
      arrestedSuspects: parsed.arrestedSuspects ?? 0,
      totalRecoveredItems: parsed.totalRecoveredItems ?? 0,
      settings: {
        ...DEFAULT_PROGRESS.settings,
        ...(parsed.settings || {}),
      },
      powerUpUpgrades: {
        ...DEFAULT_PROGRESS.powerUpUpgrades,
        ...(parsed.powerUpUpgrades || {}),
      },
      completedLevels: parsed.completedLevels || {},
      unlockedCharacters: parsed.unlockedCharacters || ['marcus-dash'],
    };
  } catch (e) {
    console.warn('Failed to load save data, using defaults', e);
    return { ...DEFAULT_PROGRESS };
  }
}

export function saveProgress(progress: PlayerProgress): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(progress));
    // Also notify native Android wrapper if available
    if (typeof (window as unknown as { AndroidBridge?: { onDataSaved?: (json: string) => void } }).AndroidBridge?.onDataSaved === 'function') {
      (window as unknown as { AndroidBridge: { onDataSaved: (json: string) => void } }).AndroidBridge.onDataSaved(JSON.stringify(progress));
    }
  } catch (e) {
    console.error('Failed to save progress', e);
  }
}
