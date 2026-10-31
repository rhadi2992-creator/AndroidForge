import React, { useState } from 'react';
import { X, Lock, Star, ChevronRight, Coins, Target } from 'lucide-react';
import { LevelDefinition, PlayerProgress } from '../types/game';
import { LEVELS } from '../data/levels';
import { ENVIRONMENTS } from '../data/environments';

interface LevelSelectModalProps {
  progress: PlayerProgress;
  onSelectLevel: (level: LevelDefinition) => void;
  onClose: () => void;
}

export const LevelSelectModal: React.FC<LevelSelectModalProps> = ({
  progress,
  onSelectLevel,
  onClose,
}) => {
  const [selectedTier, setSelectedTier] = useState<LevelDefinition['tier']>('beginner');

  const tiers: { id: LevelDefinition['tier']; label: string; range: string; color: string }[] = [
    { id: 'beginner', label: 'Beginner', range: '1 - 20', color: 'from-emerald-600 to-emerald-800' },
    { id: 'easy-medium', label: 'Easy / Med', range: '21 - 40', color: 'from-sky-600 to-sky-800' },
    { id: 'medium', label: 'Medium', range: '41 - 60', color: 'from-amber-600 to-amber-800' },
    { id: 'hard', label: 'Hard', range: '61 - 80', color: 'from-orange-600 to-orange-800' },
    { id: 'expert', label: 'Expert', range: '81 - 100', color: 'from-rose-600 to-rose-800' },
  ];

  const filteredLevels = LEVELS.filter((l) => l.tier === selectedTier);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/85 backdrop-blur-md">
      <div className="bg-slate-900 border border-slate-700/80 rounded-3xl w-full max-w-3xl max-h-[90vh] flex flex-col shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-800 flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-black font-['Teko'] text-white uppercase tracking-wider">
              Level Select (100 Levels)
            </h2>
            <p className="text-xs text-slate-400">
              Completed: {Object.keys(progress.completedLevels).length} / 100 • Unlocked up to Level {progress.unlockedLevel}
            </p>
          </div>
          <button
            onClick={onClose}
            className="w-9 h-9 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white flex items-center justify-center transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tier Tabs */}
        <div className="flex border-b border-slate-800 p-2 gap-1.5 overflow-x-auto bg-slate-950/50">
          {tiers.map((t) => {
            const isActive = selectedTier === t.id;
            return (
              <button
                key={t.id}
                onClick={() => setSelectedTier(t.id)}
                className={`flex-1 min-w-[105px] py-2 px-3 rounded-xl text-center transition flex flex-col items-center cursor-pointer ${
                  isActive
                    ? 'bg-amber-500 text-slate-950 font-bold shadow-md'
                    : 'bg-slate-800/60 hover:bg-slate-800 text-slate-400 font-medium'
                }`}
              >
                <span className="text-xs uppercase font-extrabold tracking-wide">{t.label}</span>
                <span className={`text-[10px] ${isActive ? 'text-slate-900 font-semibold' : 'text-slate-500'}`}>
                  Lvl {t.range}
                </span>
              </button>
            );
          })}
        </div>

        {/* Level Cards Grid */}
        <div className="flex-1 overflow-y-auto p-4 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
          {filteredLevels.map((lvl) => {
            const isUnlocked = lvl.levelNumber <= progress.unlockedLevel;
            const completion = progress.completedLevels[lvl.levelNumber];
            const stars = completion ? completion.stars : 0;
            const envData = ENVIRONMENTS[lvl.environment];

            return (
              <div
                key={lvl.levelNumber}
                className={`rounded-2xl border p-3.5 flex flex-col justify-between transition relative overflow-hidden ${
                  isUnlocked
                    ? 'bg-slate-850 border-slate-700/70 hover:border-amber-500/50 shadow-lg'
                    : 'bg-slate-950/60 border-slate-800/80 opacity-60'
                }`}
              >
                {/* Level Title & Status */}
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-2">
                    <div
                      className={`w-9 h-9 rounded-xl flex items-center justify-center font-['Teko'] text-xl font-bold ${
                        isUnlocked
                          ? 'bg-amber-500/20 text-amber-400 border border-amber-500/30'
                          : 'bg-slate-800 text-slate-500'
                      }`}
                    >
                      {lvl.levelNumber}
                    </div>
                    <div>
                      <h4 className="text-sm font-bold text-white flex items-center gap-1.5">
                        <span>{lvl.story.stolenItemIcon}</span>
                        <span className="truncate max-w-[150px]">{lvl.story.storyTitle}</span>
                      </h4>
                      <span className="text-[10px] text-amber-400/90 font-medium capitalize">
                        Victim: {lvl.story.victimName}
                      </span>
                    </div>
                  </div>

                  {isUnlocked ? (
                    <div className="flex items-center gap-0.5">
                      {[1, 2, 3].map((starIdx) => (
                        <Star
                          key={starIdx}
                          className={`w-3.5 h-3.5 ${
                            starIdx <= stars ? 'fill-amber-400 text-amber-400' : 'text-slate-700'
                          }`}
                        />
                      ))}
                    </div>
                  ) : (
                    <Lock className="w-4 h-4 text-slate-600" />
                  )}
                </div>

                {/* Objectives Info */}
                <div className="my-2.5 pt-2 border-t border-slate-800/80 flex items-center justify-between text-xs text-slate-300">
                  <div className="flex items-center gap-1.5">
                    <Target className="w-3.5 h-3.5 text-amber-400" />
                    <span>{lvl.distanceObjective}m Chase</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <Coins className="w-3.5 h-3.5 text-amber-400" />
                    <span>+{lvl.rewardCoins}</span>
                  </div>
                </div>

                {/* Action button */}
                <button
                  disabled={!isUnlocked}
                  onClick={() => {
                    if (isUnlocked) onSelectLevel(lvl);
                  }}
                  className={`w-full py-2 rounded-xl text-xs font-bold uppercase tracking-wider flex items-center justify-center gap-1 transition ${
                    isUnlocked
                      ? 'bg-amber-500 hover:bg-amber-400 text-slate-950 cursor-pointer font-extrabold shadow-md'
                      : 'bg-slate-800 text-slate-500 cursor-not-allowed'
                  }`}
                >
                  {isUnlocked ? (
                    <>
                      <span>Play Now</span>
                      <ChevronRight className="w-3.5 h-3.5" />
                    </>
                  ) : (
                    <span>Locked</span>
                  )}
                </button>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
