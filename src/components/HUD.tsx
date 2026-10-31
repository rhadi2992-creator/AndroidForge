import React from 'react';
import { Pause, Zap, Shield, Magnet, Coins, Sparkles, ChevronLeft, ChevronRight, ArrowUp, ArrowDown, Siren, Target } from 'lucide-react';
import { LevelDefinition, PowerUpActive, RunStats } from '../types/game';

interface HUDProps {
  stats: RunStats;
  speed: number;
  powerUps: PowerUpActive[];
  currentLevel: LevelDefinition | null;
  isEndless: boolean;
  onPause: () => void;
  onLeft: () => void;
  onRight: () => void;
  onJump: () => void;
  onSlide: () => void;
  onDistractionKick: () => void;
}

export const HUD: React.FC<HUDProps> = ({
  stats,
  speed,
  powerUps,
  currentLevel,
  isEndless,
  onPause,
  onLeft,
  onRight,
  onJump,
  onSlide,
  onDistractionKick,
}) => {
  const targetDistance = currentLevel?.distanceObjective || 1000;
  const progressPercent = isEndless ? 100 : Math.min(100, Math.floor((stats.distance / targetDistance) * 100));

  // Catch proximity meter (from 40m down to 2m)
  const suspectDist = stats.suspectDistance;
  const catchProximity = Math.max(0, Math.min(100, Math.round(((40 - suspectDist) / 38) * 100)));
  const isSuspectEscaping = suspectDist > 45;

  return (
    <div className="absolute inset-0 pointer-events-none flex flex-col justify-between p-4 z-20 select-none">
      {/* Top Bar: Mission Target, Suspect Tracker & Currency Counters */}
      <div className="flex items-start justify-between gap-3">
        {/* Left: Distance & Mission Status */}
        <div className="flex flex-col gap-1.5 pointer-events-auto">
          <div className="bg-slate-900/90 backdrop-blur-md border border-slate-700/70 rounded-2xl px-3.5 py-2 shadow-xl flex items-center gap-3">
            <div className="flex flex-col">
              <span className="text-[10px] font-bold uppercase tracking-wider text-amber-400 flex items-center gap-1">
                <Siren className="w-3.5 h-3.5 animate-pulse text-amber-400" />
                {isEndless ? 'Endless Patrol' : currentLevel?.story.storyTitle || `Level ${currentLevel?.levelNumber}`}
              </span>
              <div className="flex items-baseline gap-1.5">
                <span className="text-2xl font-black font-['Teko'] tracking-wider text-white">
                  {stats.distance}
                </span>
                <span className="text-xs font-semibold text-slate-400">
                  {isEndless ? 'm' : `/ ${targetDistance}m`}
                </span>
              </div>
            </div>

            {/* Speedometer */}
            <div className="pl-3 border-l border-slate-700/80 flex flex-col items-center">
              <span className="text-[9px] uppercase tracking-wider text-slate-400 font-bold">Speed</span>
              <span className="text-lg font-black font-['Teko'] text-emerald-400">
                {Math.round(speed * 3.6)} <span className="text-[10px] font-medium text-slate-400">km/h</span>
              </span>
            </div>
          </div>

          {/* Suspect Chase Distance Gauge */}
          <div className="bg-slate-900/90 border border-slate-700/70 rounded-xl px-3 py-1.5 flex items-center justify-between gap-3 shadow-lg w-56">
            <div className="flex flex-col flex-1">
              <div className="flex justify-between items-center text-[10px] font-bold uppercase tracking-wider">
                <span className={isSuspectEscaping ? 'text-red-400 animate-pulse' : 'text-amber-400'}>
                  {isSuspectEscaping ? '⚠️ ESCAPING!' : 'Target Gap:'}
                </span>
                <span className="font-mono text-white text-xs">{suspectDist}m ahead</span>
              </div>
              <div className="w-full bg-slate-950 rounded-full h-1.5 mt-1 overflow-hidden">
                <div
                  className={`h-full rounded-full transition-all duration-150 ${
                    catchProximity > 70 ? 'bg-emerald-400' : catchProximity > 35 ? 'bg-amber-400' : 'bg-red-500'
                  }`}
                  style={{ width: `${catchProximity}%` }}
                />
              </div>
            </div>
          </div>
        </div>

        {/* Center: Recovered Items & Score */}
        <div className="flex flex-col items-center gap-1 pointer-events-auto">
          <div className="bg-slate-900/90 backdrop-blur-md border border-slate-700/70 rounded-2xl px-4 py-1 shadow-xl flex items-center gap-3">
            <div className="flex flex-col items-center">
              <span className="text-[9px] font-bold uppercase tracking-wider text-slate-400">Score</span>
              <span className="text-xl font-black font-['Teko'] tracking-wider text-white">
                {stats.score.toLocaleString()}
              </span>
            </div>

            {/* Stolen Belongings Recovered Counter */}
            {currentLevel && (
              <div className="pl-3 border-l border-slate-700/80 flex flex-col items-center">
                <span className="text-[9px] font-bold uppercase tracking-wider text-cyan-400">Recovered</span>
                <span className="text-xl font-black font-['Teko'] text-cyan-300 flex items-center gap-1">
                  {currentLevel.story.stolenItemIcon} {stats.recoveredItemsCount}
                </span>
              </div>
            )}
          </div>
        </div>

        {/* Right: Currency Counters & Pause */}
        <div className="flex items-center gap-2 pointer-events-auto">
          {/* Gold Coins */}
          <div className="bg-slate-900/85 backdrop-blur-md border border-amber-500/40 rounded-xl px-3 py-1.5 flex items-center gap-1.5 shadow-lg">
            <Coins className="w-4 h-4 text-amber-400" />
            <span className="text-lg font-bold font-['Teko'] text-amber-400">{stats.coins}</span>
          </div>

          {/* Gems */}
          <div className="bg-slate-900/85 backdrop-blur-md border border-cyan-500/40 rounded-xl px-3 py-1.5 flex items-center gap-1.5 shadow-lg">
            <Sparkles className="w-4 h-4 text-cyan-400" />
            <span className="text-lg font-bold font-['Teko'] text-cyan-400">{stats.gems}</span>
          </div>

          {/* Pause Button */}
          <button
            onClick={onPause}
            className="w-10 h-10 rounded-xl bg-slate-800/90 hover:bg-slate-700 text-white flex items-center justify-center border border-slate-600/70 shadow-lg active:scale-95 transition-transform cursor-pointer"
            aria-label="Pause"
          >
            <Pause className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* Middle Left: Floating Power-Up Indicators */}
      <div className="flex flex-col gap-2 self-start pointer-events-auto">
        {powerUps.map((pu) => {
          const ratio = Math.max(0, Math.min(1, pu.remainingTime / pu.duration));
          return (
            <div
              key={pu.type}
              className="bg-slate-900/90 border border-slate-700/80 rounded-xl p-2 flex items-center gap-2.5 shadow-xl min-w-[130px]"
            >
              <div className="w-7 h-7 rounded-lg bg-amber-500/20 flex items-center justify-center text-amber-400">
                {pu.type === 'shield' && <Shield className="w-4 h-4 text-cyan-400" />}
                {pu.type === 'magnet' && <Magnet className="w-4 h-4 text-amber-400" />}
                {pu.type === 'boost' && <Zap className="w-4 h-4 text-pink-400" />}
                {pu.type === 'double-coins' && <Coins className="w-4 h-4 text-emerald-400" />}
                {pu.type === 'invincible' && <Sparkles className="w-4 h-4 text-purple-400" />}
              </div>
              <div className="flex flex-col flex-1">
                <span className="text-[10px] font-bold uppercase text-slate-300 capitalize">{pu.type}</span>
                <div className="w-full bg-slate-950 rounded-full h-1.5 mt-1 overflow-hidden">
                  <div
                    className="h-full bg-gradient-to-r from-cyan-400 to-amber-400 rounded-full transition-all"
                    style={{ width: `${ratio * 100}%` }}
                  />
                </div>
              </div>
              <span className="text-xs font-mono font-bold text-slate-400">{Math.ceil(pu.remainingTime)}s</span>
            </div>
          );
        })}
      </div>

      {/* Bottom Virtual Touch Controls + Distraction Kick Button */}
      <div className="flex justify-between items-end w-full pointer-events-auto pb-2">
        {/* Left Side: Left/Right Lane Switchers */}
        <div className="flex items-center gap-3">
          <button
            onClick={onLeft}
            className="w-16 h-16 rounded-2xl bg-slate-900/75 active:bg-amber-500/50 border border-slate-700/60 active:scale-95 transition flex items-center justify-center text-white shadow-xl cursor-pointer"
            aria-label="Move Left"
          >
            <ChevronLeft className="w-9 h-9" />
          </button>
          <button
            onClick={onRight}
            className="w-16 h-16 rounded-2xl bg-slate-900/75 active:bg-amber-500/50 border border-slate-700/60 active:scale-95 transition flex items-center justify-center text-white shadow-xl cursor-pointer"
            aria-label="Move Right"
          >
            <ChevronRight className="w-9 h-9" />
          </button>
        </div>

        {/* Center: Distraction Kick Ability Button */}
        <div className="flex flex-col items-center gap-1">
          <button
            onClick={onDistractionKick}
            disabled={stats.distractionKicksAvailable <= 0}
            className={`px-5 py-3 rounded-2xl border flex items-center gap-2 shadow-2xl transition active:scale-95 cursor-pointer ${
              stats.distractionKicksAvailable > 0
                ? 'bg-gradient-to-r from-cyan-600 to-blue-600 border-cyan-400/60 text-white hover:from-cyan-500 hover:to-blue-500 shadow-cyan-500/25'
                : 'bg-slate-800/80 border-slate-700 text-slate-500 cursor-not-allowed'
            }`}
          >
            <Zap className="w-5 h-5 text-amber-300" />
            <div className="flex flex-col items-start">
              <span className="text-xs font-black uppercase tracking-wider font-['Teko'] text-base leading-none">
                Distraction Kick
              </span>
              <span className="text-[10px] font-bold text-cyan-200">
                {stats.distractionKicksAvailable > 0 ? `${stats.distractionKicksAvailable} Left (Slows Thief)` : 'Kick road bottle/ball!'}
              </span>
            </div>
          </button>
        </div>

        {/* Right Side: Jump & Slide Buttons */}
        <div className="flex items-center gap-3">
          <button
            onClick={onSlide}
            className="w-16 h-16 rounded-2xl bg-slate-900/75 active:bg-cyan-500/50 border border-slate-700/60 active:scale-95 transition flex flex-col items-center justify-center text-white shadow-xl cursor-pointer"
            aria-label="Slide"
          >
            <ArrowDown className="w-6 h-6" />
            <span className="text-[10px] font-black uppercase tracking-wider text-cyan-300">Slide</span>
          </button>
          <button
            onClick={onJump}
            className="w-16 h-16 rounded-2xl bg-gradient-to-t from-amber-600 to-amber-500 active:from-amber-700 active:to-amber-600 border border-amber-400/50 active:scale-95 transition flex flex-col items-center justify-center text-white shadow-xl cursor-pointer"
            aria-label="Jump"
          >
            <ArrowUp className="w-7 h-7" />
            <span className="text-[10px] font-black uppercase tracking-wider text-white">Jump</span>
          </button>
        </div>
      </div>
    </div>
  );
};
