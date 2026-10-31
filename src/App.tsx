import React, { useEffect, useRef, useState, useCallback } from 'react';
import { GameEngine } from './game/GameEngine';
import { HUD } from './components/HUD';
import { MainMenu } from './components/MainMenu';
import { LevelSelectModal } from './components/LevelSelectModal';
import { CharacterSelectModal } from './components/CharacterSelectModal';
import { ShopModal } from './components/ShopModal';
import { SettingsModal } from './components/SettingsModal';
import { GameOverModal } from './components/GameOverModal';
import { LevelCompleteModal } from './components/LevelCompleteModal';
import { MissionBriefingModal } from './components/MissionBriefingModal';
import { AdModal } from './components/AdModal';
import { AndroidExportModal } from './components/AndroidExportModal';
import { soundEngine } from './game/AudioSynthesizer';
import { admobService, AdType } from './services/admobBridge';
import { loadProgress, saveProgress } from './services/storage';
import { CHARACTERS } from './data/characters';
import { getLevel } from './data/levels';
import { Character, LevelDefinition, PlayerProgress, PowerUpActive, PowerUpType, RunStats, Screen } from './types/game';
import { Play, RotateCcw, Home, Sparkles } from 'lucide-react';

export default function App() {
  const canvasMountRef = useRef<HTMLDivElement>(null);
  const engineRef = useRef<GameEngine | null>(null);

  // Persistence State
  const [progress, setProgress] = useState<PlayerProgress>(() => loadProgress());

  // Screen State
  const [currentScreen, setCurrentScreen] = useState<Screen>('splash');
  const [splashProgress, setSplashProgress] = useState(0);

  // Gameplay State
  const [stats, setStats] = useState<RunStats>({
    score: 0,
    distance: 0,
    coins: 0,
    gems: 0,
    obstaclesDodged: 0,
    hasUsedRevive: false,
    isCompleted: false,
    suspectDistance: 28,
    recoveredItemsCount: 0,
    distractionKicksAvailable: 2,
    suspectCaptured: false,
    suspectEscaped: false,
  });
  const [currentSpeed, setCurrentSpeed] = useState(18);
  const [activePowerUps, setActivePowerUps] = useState<PowerUpActive[]>([]);
  const [activeLevel, setActiveLevel] = useState<LevelDefinition | null>(null);
  const [briefingLevel, setBriefingLevel] = useState<LevelDefinition | null>(null);
  const [isPaused, setIsPaused] = useState(false);

  // Modals & Overlays
  const [showGameOver, setShowGameOver] = useState(false);
  const [showLevelComplete, setShowLevelComplete] = useState(false);
  const [adModalData, setAdModalData] = useState<{
    type: AdType;
    title: string;
    reward: string;
    onComplete: (earned: boolean) => void;
  } | null>(null);

  // Touch Swipe tracking
  const touchStartPos = useRef<{ x: number; y: number } | null>(null);

  // Get active character
  const selectedCharacter = CHARACTERS.find((c) => c.id === progress.selectedCharacterId) || CHARACTERS[0];

  // Save progress helper
  const updateAndSaveProgress = useCallback((updater: (prev: PlayerProgress) => PlayerProgress) => {
    setProgress((prev) => {
      const next = updater(prev);
      saveProgress(next);
      return next;
    });
  }, []);

  // Update sound settings when progress changes
  useEffect(() => {
    soundEngine.updateSettings(
      progress.settings.musicEnabled,
      progress.settings.sfxEnabled,
      progress.settings.musicVolume,
      progress.settings.sfxVolume
    );
  }, [progress.settings]);

  // Splash screen progress simulation
  useEffect(() => {
    if (currentScreen === 'splash') {
      const timer = setInterval(() => {
        setSplashProgress((prev) => {
          if (prev >= 100) {
            clearInterval(timer);
            setTimeout(() => setCurrentScreen('main-menu'), 200);
            return 100;
          }
          return prev + 15;
        });
      }, 120);
      return () => clearInterval(timer);
    }
  }, [currentScreen]);

  // Register AdMob simulator UI
  useEffect(() => {
    admobService.registerSimulatorUI((modalData) => {
      setAdModalData(modalData);
    });
  }, []);

  // Initialize GameEngine once
  useEffect(() => {
    if (!canvasMountRef.current) return;

    const engine = new GameEngine(
      canvasMountRef.current,
      selectedCharacter,
      'modern-city'
    );
    engine.setQuality(progress.settings.graphicsQuality);

    engine.onStatsUpdate = (newStats, speed, powerUps) => {
      setStats({ ...newStats });
      setCurrentSpeed(speed);
      setActivePowerUps([...powerUps]);
    };

    engine.onGameOver = (finalStats) => {
      setStats({ ...finalStats });
      setShowGameOver(true);
    };

    engine.onLevelComplete = (finalStats) => {
      setStats({ ...finalStats });
      setShowLevelComplete(true);

      // Reward player, update story counters, and unlock next level
      updateAndSaveProgress((prev) => {
        const lvl = engine.currentLevel;
        const rewardCoins = lvl ? lvl.rewardCoins : 150;
        const rewardGems = lvl ? lvl.rewardGems : 1;
        const earnedCoins = finalStats.coins + rewardCoins;
        const earnedGems = finalStats.gems + rewardGems;

        let stars = 1;
        if (finalStats.recoveredItemsCount > 0 || (lvl && finalStats.coins >= lvl.coinObjective * 0.8)) stars = 2;
        if (lvl && finalStats.coins >= lvl.coinObjective && finalStats.recoveredItemsCount >= 1) stars = 3;

        const nextLvlNum = lvl ? lvl.levelNumber + 1 : prev.unlockedLevel;
        const isJewellery = lvl?.story.missionType === 'jewellery-heist';
        const isHandbag = lvl?.story.missionType === 'handbag-snatch';

        return {
          ...prev,
          coins: prev.coins + earnedCoins,
          gems: prev.gems + earnedGems,
          highScore: Math.max(prev.highScore, finalStats.score),
          totalDistanceRun: prev.totalDistanceRun + finalStats.distance,
          unlockedLevel: Math.max(prev.unlockedLevel, nextLvlNum),
          arrestedSuspects: prev.arrestedSuspects + 1,
          totalRecoveredItems: prev.totalRecoveredItems + finalStats.recoveredItemsCount + 1,
          recoveredJewellery: prev.recoveredJewellery + (isJewellery ? finalStats.recoveredItemsCount + 1 : 0),
          recoveredHandbags: prev.recoveredHandbags + (isHandbag ? 1 : 0),
          completedLevels: {
            ...prev.completedLevels,
            ...(lvl
              ? {
                  [lvl.levelNumber]: {
                    stars: Math.max(stars, prev.completedLevels[lvl.levelNumber]?.stars || 0),
                    highScore: Math.max(finalStats.score, prev.completedLevels[lvl.levelNumber]?.highScore || 0),
                    recovered: true,
                  },
                }
              : {}),
          },
        };
      });
    };

    engineRef.current = engine;

    // Android back button integration
    (window as unknown as { __onAndroidBackPressed?: () => void }).__onAndroidBackPressed = () => {
      if (engine.isRunning && !engine.isPaused) {
        engine.pause();
        setIsPaused(true);
      } else {
        setCurrentScreen('main-menu');
        setIsPaused(false);
      }
    };

    return () => {
      engine.dispose();
      engineRef.current = null;
    };
  }, []); // Run once

  // Sync selected character with engine
  useEffect(() => {
    if (engineRef.current) {
      engineRef.current.changeCharacter(selectedCharacter);
    }
  }, [selectedCharacter]);

  // Sync graphics quality with engine
  useEffect(() => {
    if (engineRef.current) {
      engineRef.current.setQuality(progress.settings.graphicsQuality);
    }
  }, [progress.settings.graphicsQuality]);

  // --- CONTROLS DISPATCH ---

  const handleMoveLeft = useCallback(() => {
    engineRef.current?.moveLaneLeft();
  }, []);

  const handleMoveRight = useCallback(() => {
    engineRef.current?.moveLaneRight();
  }, []);

  const handleJump = useCallback(() => {
    engineRef.current?.jump();
  }, []);

  const handleSlide = useCallback(() => {
    engineRef.current?.slide();
  }, []);

  const handleDistractionKick = useCallback(() => {
    engineRef.current?.kickDistraction();
  }, []);

  // Keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (currentScreen !== 'gameplay') return;

      if (e.key === 'ArrowLeft' || e.key === 'a' || e.key === 'A') {
        handleMoveLeft();
      } else if (e.key === 'ArrowRight' || e.key === 'd' || e.key === 'D') {
        handleMoveRight();
      } else if (e.key === 'ArrowUp' || e.key === 'w' || e.key === 'W' || e.key === ' ') {
        e.preventDefault();
        handleJump();
      } else if (e.key === 'ArrowDown' || e.key === 's' || e.key === 'S') {
        e.preventDefault();
        handleSlide();
      } else if (e.key === 'e' || e.key === 'E') {
        handleDistractionKick();
      } else if (e.key === 'Escape' || e.key === 'p' || e.key === 'P') {
        togglePause();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [currentScreen, handleMoveLeft, handleMoveRight, handleJump, handleSlide, handleDistractionKick]);

  // Touch Swipe navigation
  const handleTouchStart = (e: React.TouchEvent) => {
    if (currentScreen !== 'gameplay') return;
    const touch = e.touches[0];
    touchStartPos.current = { x: touch.clientX, y: touch.clientY };
  };

  const handleTouchEnd = (e: React.TouchEvent) => {
    if (!touchStartPos.current || currentScreen !== 'gameplay') return;
    const touch = e.changedTouches[0];
    const dx = touch.clientX - touchStartPos.current.x;
    const dy = touch.clientY - touchStartPos.current.y;
    const absX = Math.abs(dx);
    const absY = Math.abs(dy);
    const minSwipeDist = 28 / progress.settings.swipeSensitivity;

    if (Math.max(absX, absY) > minSwipeDist) {
      if (absX > absY) {
        if (dx > 0) handleMoveRight();
        else handleMoveLeft();
      } else {
        if (dy > 0) handleSlide();
        else handleJump();
      }
    }
    touchStartPos.current = null;
  };

  // --- GAMEPLAY FLOW TRIGGERS ---

  const openMissionBriefing = (level: LevelDefinition) => {
    setBriefingLevel(level);
  };

  const startLevelRun = (level: LevelDefinition) => {
    setActiveLevel(level);
    setShowGameOver(false);
    setShowLevelComplete(false);
    setIsPaused(false);
    setCurrentScreen('gameplay');

    if (engineRef.current) {
      engineRef.current.setEnvironment(level.environment);
      engineRef.current.startRun(level);
    }
  };

  const startEndlessRun = () => {
    setActiveLevel(null);
    setShowGameOver(false);
    setShowLevelComplete(false);
    setIsPaused(false);
    setCurrentScreen('gameplay');

    if (engineRef.current) {
      engineRef.current.setEnvironment('modern-city');
      engineRef.current.startRun();
    }
  };

  const togglePause = () => {
    if (!engineRef.current) return;
    if (isPaused) {
      engineRef.current.resume();
      setIsPaused(false);
    } else {
      engineRef.current.pause();
      setIsPaused(true);
    }
  };

  // Option A: Watch Ad Revive (1 per run)
  const handleWatchAdRevive = async () => {
    const result = await admobService.showRewardedRevive();
    if (result.rewardEarned) {
      setShowGameOver(false);
      engineRef.current?.revivePlayer();
    }
  };

  // Option B: End Run (Save eligible coins & high score)
  const handleEndRun = () => {
    updateAndSaveProgress((prev) => ({
      ...prev,
      coins: prev.coins + stats.coins,
      gems: prev.gems + stats.gems,
      highScore: Math.max(prev.highScore, stats.score),
      totalDistanceRun: prev.totalDistanceRun + stats.distance,
    }));
  };

  const handleRetry = () => {
    handleEndRun();
    setShowGameOver(false);
    if (activeLevel) {
      startLevelRun(activeLevel);
    } else {
      startEndlessRun();
    }
  };

  const handleReturnToMenu = () => {
    handleEndRun();
    setShowGameOver(false);
    setShowLevelComplete(false);
    setIsPaused(false);
    setCurrentScreen('main-menu');
    engineRef.current?.dispose();
    if (canvasMountRef.current) {
      engineRef.current = new GameEngine(
        canvasMountRef.current,
        selectedCharacter,
        'modern-city'
      );
    }
  };

  const handleNextLevel = () => {
    setShowLevelComplete(false);
    if (activeLevel) {
      const nextLvl = getLevel(activeLevel.levelNumber + 1);
      openMissionBriefing(nextLvl);
    } else {
      startEndlessRun();
    }
  };

  // Character unlock handler
  const handleUnlockCharacter = (char: Character) => {
    if (progress.coins >= char.costCoins && progress.gems >= char.costGems) {
      updateAndSaveProgress((prev) => ({
        ...prev,
        coins: prev.coins - char.costCoins,
        gems: prev.gems - char.costGems,
        unlockedCharacters: [...prev.unlockedCharacters, char.id],
        selectedCharacterId: char.id,
      }));
      soundEngine.playPowerUpCollect();
    }
  };

  // Power-Up upgrade handler
  const handleUpgradePowerUp = (type: PowerUpType) => {
    const key = type === 'double-coins' ? 'doubleCoins' : type;
    const currentTier = (progress.powerUpUpgrades as Record<string, number>)[key] || 1;
    const cost = currentTier * 750;

    if (progress.coins >= cost && currentTier < 5) {
      updateAndSaveProgress((prev) => ({
        ...prev,
        coins: prev.coins - cost,
        powerUpUpgrades: {
          ...prev.powerUpUpgrades,
          [key]: currentTier + 1,
        },
      }));
      soundEngine.playPowerUpCollect();
    }
  };

  // Watch Ad for Free Coins in Shop
  const handleWatchAdForCoins = async () => {
    const result = await admobService.showRewardedBonusCoins(250);
    if (result.rewardEarned) {
      updateAndSaveProgress((prev) => ({
        ...prev,
        coins: prev.coins + 250,
      }));
      soundEngine.playCoin();
    }
  };

  return (
    <div
      className="relative w-screen h-screen overflow-hidden bg-slate-950 font-['Plus_Jakarta_Sans',sans-serif] text-slate-100 select-none"
      onTouchStart={handleTouchStart}
      onTouchEnd={handleTouchEnd}
    >
      {/* Isolated Three.js Canvas Container */}
      <div ref={canvasMountRef} className="absolute inset-0 z-0 w-full h-full" />

      {/* Splash Screen */}
      {currentScreen === 'splash' && (
        <div className="absolute inset-0 z-50 flex flex-col items-center justify-center bg-slate-950 p-6 text-center animate-in fade-in duration-300">
          <div className="w-20 h-20 rounded-3xl bg-gradient-to-tr from-amber-500 to-yellow-400 flex items-center justify-center text-slate-950 shadow-2xl mb-4">
            <Sparkles className="w-10 h-10" />
          </div>
          <h1 className="text-6xl font-black font-['Teko'] text-white uppercase tracking-wider leading-none">
            STREET CHASE
          </h1>
          <h2 className="text-3xl font-extrabold font-['Teko'] text-amber-400 uppercase tracking-widest -mt-1">
            REAL ESCAPE
          </h2>
          <p className="text-xs text-slate-400 mt-2 max-w-xs">
            Loading 3D story chase engine, suspect kinematics and police dispatch...
          </p>

          <div className="w-56 h-2 bg-slate-800 rounded-full mt-6 overflow-hidden border border-slate-700/60">
            <div
              className="h-full bg-gradient-to-r from-amber-500 to-yellow-400 rounded-full transition-all duration-150"
              style={{ width: `${splashProgress}%` }}
            />
          </div>
          <span className="text-[11px] font-mono text-slate-500 mt-2">{splashProgress}%</span>
        </div>
      )}

      {/* Main Menu Screen */}
      {currentScreen === 'main-menu' && (
        <MainMenu
          progress={progress}
          selectedCharacter={selectedCharacter}
          onPlayLevel={() => openMissionBriefing(getLevel(progress.unlockedLevel))}
          onPlayEndless={startEndlessRun}
          onOpenLevelSelect={() => setCurrentScreen('level-select')}
          onOpenCharacterSelect={() => setCurrentScreen('character-select')}
          onOpenShop={() => setCurrentScreen('shop')}
          onOpenSettings={() => setCurrentScreen('settings')}
          onOpenAndroidExport={() => setCurrentScreen('android-info')}
        />
      )}

      {/* In-Game HUD */}
      {currentScreen === 'gameplay' && !showGameOver && !showLevelComplete && (
        <HUD
          stats={stats}
          speed={currentSpeed}
          powerUps={activePowerUps}
          currentLevel={activeLevel}
          isEndless={!activeLevel}
          onPause={togglePause}
          onLeft={handleMoveLeft}
          onRight={handleMoveRight}
          onJump={handleJump}
          onSlide={handleSlide}
          onDistractionKick={handleDistractionKick}
        />
      )}

      {/* In-Game Pause Overlay */}
      {currentScreen === 'gameplay' && isPaused && (
        <div className="fixed inset-0 z-40 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md">
          <div className="bg-slate-900 border border-slate-700/80 rounded-3xl p-6 w-full max-w-sm flex flex-col items-center gap-4 shadow-2xl text-center">
            <h3 className="text-3xl font-black font-['Teko'] text-white uppercase tracking-wider">
              PURSUIT PAUSED
            </h3>
            <p className="text-xs text-slate-400">
              Catch your breath. Suspect is {stats.suspectDistance}m ahead.
            </p>

            <div className="w-full space-y-2 pt-2">
              <button
                onClick={togglePause}
                className="w-full py-3 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-black text-sm uppercase tracking-wider flex items-center justify-center gap-2 cursor-pointer shadow-lg"
              >
                <Play className="w-4 h-4 fill-slate-950" /> Resume Pursuit
              </button>
              <button
                onClick={handleRetry}
                className="w-full py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-white font-bold text-xs uppercase tracking-wider flex items-center justify-center gap-1.5 cursor-pointer"
              >
                <RotateCcw className="w-3.5 h-3.5" /> Restart Mission
              </button>
              <button
                onClick={handleReturnToMenu}
                className="w-full py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-white font-bold text-xs uppercase tracking-wider flex items-center justify-center gap-1.5 cursor-pointer"
              >
                <Home className="w-3.5 h-3.5" /> Main Menu
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Mission Briefing Cutscene Modal */}
      {briefingLevel && (
        <MissionBriefingModal
          level={briefingLevel}
          onStartChase={() => {
            const lvl = briefingLevel;
            setBriefingLevel(null);
            startLevelRun(lvl);
          }}
          onCancel={() => setBriefingLevel(null)}
        />
      )}

      {/* Modals */}
      {currentScreen === 'level-select' && (
        <LevelSelectModal
          progress={progress}
          onSelectLevel={(lvl) => {
            setCurrentScreen('main-menu');
            openMissionBriefing(lvl);
          }}
          onClose={() => setCurrentScreen('main-menu')}
        />
      )}

      {currentScreen === 'character-select' && (
        <CharacterSelectModal
          progress={progress}
          onSelectCharacter={(id) => updateAndSaveProgress((p) => ({ ...p, selectedCharacterId: id }))}
          onUnlockCharacter={handleUnlockCharacter}
          onClose={() => setCurrentScreen('main-menu')}
        />
      )}

      {currentScreen === 'shop' && (
        <ShopModal
          progress={progress}
          onUpgradePowerUp={handleUpgradePowerUp}
          onWatchAdForCoins={handleWatchAdForCoins}
          onClose={() => setCurrentScreen('main-menu')}
        />
      )}

      {currentScreen === 'settings' && (
        <SettingsModal
          progress={progress}
          onUpdateSettings={(newSettings) => updateAndSaveProgress((p) => ({ ...p, settings: newSettings }))}
          onResetProgress={() => {
            localStorage.clear();
            setProgress(loadProgress());
          }}
          onClose={() => setCurrentScreen('main-menu')}
        />
      )}

      {currentScreen === 'android-info' && (
        <AndroidExportModal onClose={() => setCurrentScreen('main-menu')} />
      )}

      {/* Game Over Modal */}
      {showGameOver && (
        <GameOverModal
          stats={stats}
          highScore={progress.highScore}
          onWatchAdRevive={handleWatchAdRevive}
          onEndRun={handleEndRun}
          onRetry={handleRetry}
          onMainMenu={handleReturnToMenu}
        />
      )}

      {/* Level Complete & Police Handover Modal */}
      {showLevelComplete && activeLevel && (
        <LevelCompleteModal
          level={activeLevel}
          stats={stats}
          onNextLevel={handleNextLevel}
          onMainMenu={handleReturnToMenu}
        />
      )}

      {/* Interactive AdMob Simulator Modal */}
      {adModalData && (
        <AdModal
          type={adModalData.type}
          title={adModalData.title}
          reward={adModalData.reward}
          onComplete={adModalData.onComplete}
          onClose={() => setAdModalData(null)}
        />
      )}
    </div>
  );
}
