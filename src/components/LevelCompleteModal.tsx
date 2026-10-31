import React from 'react';
import { Star, ShieldCheck, Siren, ChevronRight, Home, Coins, Sparkles, UserCheck, Heart } from 'lucide-react';
import { LevelDefinition, RunStats } from '../types/game';

interface LevelCompleteModalProps {
  level: LevelDefinition;
  stats: RunStats;
  onNextLevel: () => void;
  onMainMenu: () => void;
}

export const LevelCompleteModal: React.FC<LevelCompleteModalProps> = ({
  level,
  stats,
  onNextLevel,
  onMainMenu,
}) => {
  const story = level.story;

  // Calculate stars earned:
  // 1 star: Caught suspect / completed mission
  // 2 stars: Recovered at least 1 dropped loot item
  // 3 stars: Reached coin objective & caught suspect
  let stars = 1;
  if (stats.recoveredItemsCount > 0 || stats.coins >= level.coinObjective * 0.8) stars = 2;
  if (stats.coins >= level.coinObjective && stats.recoveredItemsCount >= 1) stars = 3;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/95 backdrop-blur-md">
      <div className="bg-slate-900 border border-amber-500/60 rounded-3xl w-full max-w-lg flex flex-col shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        {/* Police Handover Header Banner */}
        <div className="bg-gradient-to-r from-blue-700 via-sky-600 to-blue-700 text-white p-5 text-center relative overflow-hidden">
          <div className="flex items-center justify-center gap-2 mb-1.5">
            <span className="w-3 h-3 rounded-full bg-red-500 animate-ping" />
            <Siren className="w-6 h-6 text-yellow-300" />
            <span className="text-xs uppercase font-mono font-bold tracking-widest text-sky-200">
              POLICE PRECINCT HANDOVER
            </span>
          </div>

          <h2 className="text-4xl font-black font-['Teko'] uppercase tracking-wider text-white">
            SUSPECT CAPTURED & ARRESTED!
          </h2>
          <p className="text-xs text-amber-300 font-semibold">
            {story.suspectName} stopped safely • Handed over to Metro Police
          </p>

          {/* 3 Stars */}
          <div className="flex items-center justify-center gap-2 mt-3">
            {[1, 2, 3].map((starIdx) => (
              <Star
                key={starIdx}
                className={`w-7 h-7 transition-transform ${
                  starIdx <= stars ? 'fill-amber-400 text-amber-400 scale-110 drop-shadow-md' : 'text-blue-900'
                }`}
              />
            ))}
          </div>
        </div>

        {/* Recovered Property & Victim Return Showcase */}
        <div className="p-6 space-y-4">
          <div className="bg-gradient-to-br from-emerald-950/60 to-slate-900 border border-emerald-500/40 rounded-2xl p-4 flex items-center gap-4 shadow-lg">
            <div className="w-16 h-16 rounded-2xl bg-emerald-500/20 border border-emerald-500/40 flex items-center justify-center text-3xl shrink-0 shadow-inner">
              {story.stolenItemIcon}
            </div>
            <div>
              <div className="flex items-center gap-1.5 text-emerald-400 text-[10px] font-extrabold uppercase tracking-wider">
                <ShieldCheck className="w-3.5 h-3.5" /> Property Safely Recovered
              </div>
              <h3 className="text-lg font-black font-['Teko'] text-white">
                {story.stolenItemName}
              </h3>
              <p className="text-xs text-slate-300">
                Returned intact to victim: <b className="text-white">{story.victimName}</b>
              </p>
            </div>
          </div>

          {/* Victim Dialogue */}
          <div className="bg-slate-850/80 border border-slate-700/80 rounded-2xl p-3.5 flex items-start gap-3">
            <div className="w-8 h-8 rounded-full bg-pink-500/20 text-pink-400 flex items-center justify-center shrink-0 mt-0.5">
              <Heart className="w-4 h-4 fill-pink-400" />
            </div>
            <div>
              <span className="text-[10px] uppercase font-bold text-slate-400">
                Victim Appreciation ({story.victimRole}):
              </span>
              <p className="text-xs text-slate-200 italic mt-0.5">
                "{story.victimDialogue}"
              </p>
            </div>
          </div>

          {/* Mission Rewards Breakdown */}
          <div className="bg-slate-950 border border-slate-800 rounded-2xl p-4 space-y-2">
            <div className="flex items-center justify-between text-xs text-slate-300">
              <span>Fleeing Distance Intercepted</span>
              <span className="font-bold text-white">{stats.distance}m</span>
            </div>
            <div className="flex items-center justify-between text-xs text-slate-300">
              <span>Dropped Stolen Belongings Collected</span>
              <span className="font-bold text-cyan-400">+{stats.recoveredItemsCount}</span>
            </div>
            <div className="flex items-center justify-between text-xs text-slate-300">
              <span>Mission Bounty Coins</span>
              <span className="font-bold text-amber-400">+{level.rewardCoins} Coins</span>
            </div>
            <div className="flex items-center justify-between text-xs text-slate-300">
              <span>Police Commendation Gems</span>
              <span className="font-bold text-cyan-400">+{level.rewardGems} Gems</span>
            </div>
            <div className="pt-2 border-t border-slate-800 flex items-center justify-between text-xs text-slate-400">
              <span>Total Score</span>
              <span className="font-black font-['Teko'] text-xl text-white">{stats.score.toLocaleString()}</span>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="grid grid-cols-2 gap-3 pt-2">
            <button
              onClick={onMainMenu}
              className="py-3 rounded-xl bg-slate-800 hover:bg-slate-700 text-white font-bold text-xs uppercase tracking-wider flex items-center justify-center gap-1.5 transition active:scale-95 cursor-pointer"
            >
              <Home className="w-3.5 h-3.5" /> Main Menu
            </button>
            <button
              onClick={onNextLevel}
              className="py-3 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-slate-950 font-black text-sm uppercase tracking-wider flex items-center justify-center gap-1.5 shadow-xl shadow-amber-500/25 active:scale-95 transition cursor-pointer"
            >
              <span>NEXT MISSION {level.levelNumber + 1}</span>
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
