import React from 'react';
import { Video, RotateCcw, Home, Coins, Sparkles, Trophy, ShieldAlert, Award } from 'lucide-react';
import { RunStats } from '../types/game';

interface GameOverModalProps {
  stats: RunStats;
  highScore: number;
  onWatchAdRevive: () => void;
  onEndRun: () => void;
  onRetry: () => void;
  onMainMenu: () => void;
}

export const GameOverModal: React.FC<GameOverModalProps> = ({
  stats,
  highScore,
  onWatchAdRevive,
  onEndRun,
  onRetry,
  onMainMenu,
}) => {
  const isNewHighScore = stats.score > highScore;
  const canRevive = !stats.hasUsedRevive;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/90 backdrop-blur-md">
      <div className="bg-slate-900 border border-slate-700/80 rounded-3xl w-full max-w-md flex flex-col shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        {/* Banner */}
        <div className="bg-gradient-to-b from-red-600/30 to-transparent p-6 pb-2 text-center">
          <div className="inline-flex p-3 rounded-2xl bg-red-500/20 text-red-400 border border-red-500/30 mb-2">
            <ShieldAlert className="w-8 h-8" />
          </div>
          <h2 className="text-4xl font-black font-['Teko'] text-white uppercase tracking-wider">
            {stats.suspectEscaped ? 'SUSPECT ESCAPED!' : 'CRASHED! RUN OVER'}
          </h2>
          <p className="text-xs text-slate-400">
            {stats.suspectEscaped
              ? 'The thief slipped too far ahead into the crowd. Choose your next move.'
              : 'You collided with a road obstacle during the pursuit. Choose your next move.'}
          </p>
        </div>

        {/* Stats Card */}
        <div className="p-6 space-y-4">
          <div className="bg-slate-850 border border-slate-800 rounded-2xl p-4 grid grid-cols-2 gap-3">
            <div>
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Distance</span>
              <div className="text-2xl font-black font-['Teko'] text-white">{stats.distance} m</div>
            </div>
            <div>
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Final Score</span>
              <div className="text-2xl font-black font-['Teko'] text-amber-400 flex items-center gap-1">
                {stats.score.toLocaleString()}
                {isNewHighScore && <Award className="w-4 h-4 text-yellow-400" />}
              </div>
            </div>
            <div className="pt-2 border-t border-slate-800 flex items-center gap-2">
              <Coins className="w-4 h-4 text-amber-400" />
              <span className="text-sm font-bold text-slate-200">+{stats.coins} Coins</span>
            </div>
            <div className="pt-2 border-t border-slate-800 flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-cyan-400" />
              <span className="text-sm font-bold text-slate-200">+{stats.gems} Gems</span>
            </div>
          </div>

          {isNewHighScore && (
            <div className="bg-amber-500/20 border border-amber-500/40 rounded-xl px-4 py-2 flex items-center justify-center gap-2 text-amber-300 text-xs font-bold uppercase tracking-wider">
              <Trophy className="w-4 h-4" /> New Personal Best Score!
            </div>
          )}

          {/* Decision Choices */}
          <div className="space-y-3 pt-2">
            {/* OPTION A: Watch Ad Revive (1 per run) */}
            {canRevive ? (
              <div className="bg-gradient-to-r from-amber-950/60 to-slate-850 border border-amber-500/50 rounded-2xl p-4 flex flex-col gap-2">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-black uppercase tracking-wider text-amber-400">
                    Option A (1 Use Per Run)
                  </span>
                  <span className="text-[10px] text-slate-400">3.5s Invincibility Shield</span>
                </div>
                <button
                  onClick={onWatchAdRevive}
                  className="w-full py-3.5 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-slate-950 font-black text-sm uppercase tracking-wider flex items-center justify-center gap-2 transition active:scale-95 cursor-pointer shadow-lg shadow-amber-500/20"
                >
                  <Video className="w-4 h-4" /> WATCH AD — REVIVE & RESUME
                </button>
                <p className="text-[10px] text-slate-400 text-center">
                  Completing the rewarded video resumes this run from a safe lane.
                </p>
              </div>
            ) : (
              <div className="bg-slate-850/60 border border-slate-800 rounded-2xl p-3 text-center text-xs text-slate-400">
                Rewarded revive already used in this run.
              </div>
            )}

            {/* OPTION B: End Run */}
            <div className="bg-slate-850 border border-slate-800 rounded-2xl p-3 flex flex-col gap-2">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-black uppercase tracking-wider text-slate-400">
                  Option B
                </span>
                <span className="text-[10px] text-slate-400">Bank all coins & score</span>
              </div>
              <div className="grid grid-cols-2 gap-2">
                <button
                  onClick={onRetry}
                  className="py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-white font-bold text-xs uppercase tracking-wider flex items-center justify-center gap-1.5 transition active:scale-95 cursor-pointer"
                >
                  <RotateCcw className="w-3.5 h-3.5" /> Retry
                </button>
                <button
                  onClick={onMainMenu}
                  className="py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-white font-bold text-xs uppercase tracking-wider flex items-center justify-center gap-1.5 transition active:scale-95 cursor-pointer"
                >
                  <Home className="w-3.5 h-3.5" /> Main Menu
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
