import React from 'react';
import { X, Check, Lock, Coins, Sparkles, Zap, Shield, Magnet, Gauge } from 'lucide-react';
import { Character, PlayerProgress } from '../types/game';
import { CHARACTERS } from '../data/characters';

interface CharacterSelectModalProps {
  progress: PlayerProgress;
  onSelectCharacter: (charId: string) => void;
  onUnlockCharacter: (char: Character) => void;
  onClose: () => void;
}

export const CharacterSelectModal: React.FC<CharacterSelectModalProps> = ({
  progress,
  onSelectCharacter,
  onUnlockCharacter,
  onClose,
}) => {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/85 backdrop-blur-md">
      <div className="bg-slate-900 border border-slate-700/80 rounded-3xl w-full max-w-4xl max-h-[92vh] flex flex-col shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-800 flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-black font-['Teko'] text-white uppercase tracking-wider">
              Playable Runners (5 Characters)
            </h2>
            <p className="text-xs text-slate-400">
              Each runner has unique athletic stats, agility, and tactical abilities.
            </p>
          </div>

          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold text-amber-400 flex items-center gap-1">
                <Coins className="w-3.5 h-3.5" /> {progress.coins.toLocaleString()}
              </span>
              <span className="text-xs font-bold text-cyan-400 flex items-center gap-1">
                <Sparkles className="w-3.5 h-3.5" /> {progress.gems}
              </span>
            </div>
            <button
              onClick={onClose}
              className="w-9 h-9 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white flex items-center justify-center transition"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Character Cards List */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {CHARACTERS.map((char) => {
            const isUnlocked = progress.unlockedCharacters.includes(char.id);
            const isSelected = progress.selectedCharacterId === char.id;
            const canAfford = progress.coins >= char.costCoins && progress.gems >= char.costGems;

            return (
              <div
                key={char.id}
                className={`rounded-2xl border p-4 flex flex-col justify-between transition-all relative overflow-hidden ${
                  isSelected
                    ? 'bg-slate-850 border-amber-500 shadow-xl shadow-amber-500/10 ring-2 ring-amber-500/30'
                    : isUnlocked
                    ? 'bg-slate-850/80 border-slate-700/80 hover:border-slate-600'
                    : 'bg-slate-950/70 border-slate-800 opacity-90'
                }`}
              >
                {/* Top: Name & Tag */}
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-[10px] font-extrabold uppercase tracking-wider text-amber-400">
                      {char.title}
                    </span>
                    {isSelected && (
                      <span className="px-2 py-0.5 rounded-full bg-amber-500 text-slate-950 text-[10px] font-black uppercase tracking-wider">
                        Active
                      </span>
                    )}
                  </div>
                  <h3 className="text-xl font-black font-['Teko'] text-white tracking-wide">
                    {char.name}
                  </h3>
                  <p className="text-xs text-slate-400 mt-1 line-clamp-2">
                    {char.description}
                  </p>
                </div>

                {/* Character Color Swatches Visualizer */}
                <div className="my-3.5 p-2.5 rounded-xl bg-slate-900/90 border border-slate-800 flex items-center gap-3">
                  <div className="flex flex-col items-center">
                    <div
                      className="w-6 h-6 rounded-full border border-white/20 shadow-inner"
                      style={{ backgroundColor: char.appearance.jacketColor }}
                      title="Jacket color"
                    />
                    <span className="text-[9px] text-slate-400 mt-1">Jacket</span>
                  </div>
                  <div className="flex flex-col items-center">
                    <div
                      className="w-6 h-6 rounded-full border border-white/20 shadow-inner"
                      style={{ backgroundColor: char.appearance.pantsColor }}
                      title="Pants color"
                    />
                    <span className="text-[9px] text-slate-400 mt-1">Pants</span>
                  </div>
                  <div className="flex flex-col items-center">
                    <div
                      className="w-6 h-6 rounded-full border border-white/20 shadow-inner"
                      style={{ backgroundColor: char.appearance.accentColor }}
                      title="Accent trim"
                    />
                    <span className="text-[9px] text-slate-400 mt-1">Trim</span>
                  </div>
                  <div className="flex-1 flex flex-col justify-center pl-2 border-l border-slate-800 text-[10px] text-slate-400">
                    <span>{char.appearance.hasVisor ? '• Cyber Visor' : '• Clear Optics'}</span>
                    <span>{char.appearance.hasBackpack ? '• Gear Pack' : '• Slim Rig'}</span>
                  </div>
                </div>

                {/* Stats Breakdown */}
                <div className="space-y-1.5 mb-4 text-xs">
                  {/* Speed */}
                  <div className="flex items-center justify-between text-slate-300">
                    <span className="flex items-center gap-1.5 text-[11px] text-slate-400">
                      <Gauge className="w-3.5 h-3.5 text-amber-400" /> Speed Bonus
                    </span>
                    <span className="font-bold text-amber-400">+{Math.round(char.stats.speedBonus * 100)}%</span>
                  </div>
                  <div className="w-full bg-slate-800 rounded-full h-1.5">
                    <div
                      className="bg-amber-400 h-full rounded-full"
                      style={{ width: `${(char.stats.speedBonus / 0.4) * 100}%` }}
                    />
                  </div>

                  {/* Agility */}
                  <div className="flex items-center justify-between text-slate-300 pt-1">
                    <span className="flex items-center gap-1.5 text-[11px] text-slate-400">
                      <Zap className="w-3.5 h-3.5 text-sky-400" /> Lane Agility
                    </span>
                    <span className="font-bold text-sky-400">{char.stats.agility}x</span>
                  </div>
                  <div className="w-full bg-slate-800 rounded-full h-1.5">
                    <div
                      className="bg-sky-400 h-full rounded-full"
                      style={{ width: `${((char.stats.agility - 0.8) / 0.6) * 100}%` }}
                    />
                  </div>

                  {/* Magnet Duration */}
                  <div className="flex items-center justify-between text-slate-300 pt-1">
                    <span className="flex items-center gap-1.5 text-[11px] text-slate-400">
                      <Magnet className="w-3.5 h-3.5 text-yellow-400" /> Magnet Duration
                    </span>
                    <span className="font-bold text-yellow-400">{char.stats.magnetBonus}x</span>
                  </div>
                  <div className="w-full bg-slate-800 rounded-full h-1.5">
                    <div
                      className="bg-yellow-400 h-full rounded-full"
                      style={{ width: `${(char.stats.magnetBonus / 2.0) * 100}%` }}
                    />
                  </div>
                </div>

                {/* Bottom Action Button */}
                {isSelected ? (
                  <button
                    disabled
                    className="w-full py-2.5 rounded-xl bg-slate-800 text-amber-400 font-extrabold text-xs uppercase tracking-wider flex items-center justify-center gap-1.5 border border-amber-500/40"
                  >
                    <Check className="w-4 h-4" /> Selected
                  </button>
                ) : isUnlocked ? (
                  <button
                    onClick={() => onSelectCharacter(char.id)}
                    className="w-full py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-extrabold text-xs uppercase tracking-wider flex items-center justify-center gap-1.5 transition active:scale-95 cursor-pointer shadow-md"
                  >
                    Select Runner
                  </button>
                ) : (
                  <button
                    disabled={!canAfford}
                    onClick={() => onUnlockCharacter(char)}
                    className={`w-full py-2.5 rounded-xl font-extrabold text-xs uppercase tracking-wider flex items-center justify-center gap-2 transition ${
                      canAfford
                        ? 'bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-slate-950 cursor-pointer shadow-lg'
                        : 'bg-slate-800 text-slate-500 cursor-not-allowed'
                    }`}
                  >
                    <Lock className="w-3.5 h-3.5" />
                    <span>Unlock ({char.costCoins.toLocaleString()} Coins {char.costGems > 0 ? `+ ${char.costGems} Gems` : ''})</span>
                  </button>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
