import React from 'react';
import { X, Magnet, Shield, Zap, Coins, Sparkles, Video, ArrowUpCircle } from 'lucide-react';
import { PlayerProgress, PowerUpType } from '../types/game';

interface ShopModalProps {
  progress: PlayerProgress;
  onUpgradePowerUp: (type: PowerUpType) => void;
  onWatchAdForCoins: () => void;
  onClose: () => void;
}

export const ShopModal: React.FC<ShopModalProps> = ({
  progress,
  onUpgradePowerUp,
  onWatchAdForCoins,
  onClose,
}) => {
  const powerUpList: {
    type: PowerUpType;
    name: string;
    description: string;
    icon: React.ReactNode;
    color: string;
  }[] = [
    {
      type: 'magnet',
      name: 'Coin Magnet',
      description: 'Draws all nearby gold coins directly to your runner across all lanes.',
      icon: <Magnet className="w-5 h-5 text-amber-400" />,
      color: 'border-amber-500/40',
    },
    {
      type: 'shield',
      name: 'Kinetic Shield',
      description: 'Surrounds your runner in an energy barrier that absorbs 1 fatal vehicle or barrier collision.',
      icon: <Shield className="w-5 h-5 text-cyan-400" />,
      color: 'border-cyan-500/40',
    },
    {
      type: 'boost',
      name: 'Supersonic Boost',
      description: 'Rockets you forward at high speed while smashing through all small obstacles.',
      icon: <Zap className="w-5 h-5 text-pink-400" />,
      color: 'border-pink-500/40',
    },
    {
      type: 'double-coins',
      name: '2x Gold Multiplier',
      description: 'Doubles the value of every gold coin collected during the run.',
      icon: <Coins className="w-5 h-5 text-emerald-400" />,
      color: 'border-emerald-500/40',
    },
    {
      type: 'invincible',
      name: 'Ghost Invincibility',
      description: 'Phases through all road traffic, concrete barriers, and trenches unharmed.',
      icon: <Sparkles className="w-5 h-5 text-purple-400" />,
      color: 'border-purple-500/40',
    },
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/85 backdrop-blur-md">
      <div className="bg-slate-900 border border-slate-700/80 rounded-3xl w-full max-w-3xl max-h-[92vh] flex flex-col shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-800 flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-black font-['Teko'] text-white uppercase tracking-wider">
              Runner Shop & Upgrades
            </h2>
            <p className="text-xs text-slate-400">
              Upgrade tactical equipment and collect free rewards.
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

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-4">
          {/* AdMob Rewarded Bonus Banner */}
          <div className="bg-gradient-to-r from-amber-950/60 via-slate-900 to-slate-900 border border-amber-500/40 rounded-2xl p-4 flex flex-col sm:flex-row items-center justify-between gap-4 shadow-xl">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-2xl bg-amber-500/20 border border-amber-500/40 flex items-center justify-center text-amber-400 shrink-0">
                <Video className="w-6 h-6" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-400">
                    Google AdMob Rewarded Video
                  </span>
                </div>
                <h3 className="text-base font-bold text-white mt-1">Get +250 Free Gold Coins</h3>
                <p className="text-xs text-slate-400">Watch an official Google Mobile Ads test video to earn instant coins.</p>
              </div>
            </div>

            <button
              onClick={onWatchAdForCoins}
              className="w-full sm:w-auto px-5 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-extrabold text-xs uppercase tracking-wider flex items-center justify-center gap-2 transition active:scale-95 cursor-pointer shadow-lg shrink-0"
            >
              <Coins className="w-4 h-4" /> Watch Video (+250)
            </button>
          </div>

          <h3 className="text-sm font-extrabold text-slate-300 uppercase tracking-wider pt-2">
            Equipment Tier Upgrades (Max Tier 5)
          </h3>

          {/* Upgrades List */}
          <div className="grid grid-cols-1 gap-3">
            {powerUpList.map((item) => {
              const currentTier = (progress.powerUpUpgrades as Record<string, number>)[item.type === 'double-coins' ? 'doubleCoins' : item.type] || 1;
              const isMaxed = currentTier >= 5;
              const upgradeCost = currentTier * 750;
              const canAfford = progress.coins >= upgradeCost && !isMaxed;

              return (
                <div
                  key={item.type}
                  className="bg-slate-850 border border-slate-700/80 rounded-2xl p-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 shadow-md"
                >
                  <div className="flex items-start gap-3">
                    <div className="w-11 h-11 rounded-2xl bg-slate-800 border border-slate-700 flex items-center justify-center shrink-0">
                      {item.icon}
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <h4 className="text-base font-black font-['Teko'] text-white tracking-wide">
                          {item.name}
                        </h4>
                        <span className="text-xs font-bold text-amber-400">
                          Tier {currentTier} / 5
                        </span>
                      </div>
                      <p className="text-xs text-slate-400 max-w-md">{item.description}</p>

                      {/* Tier progress dots */}
                      <div className="flex items-center gap-1.5 mt-2">
                        {[1, 2, 3, 4, 5].map((lvl) => (
                          <div
                            key={lvl}
                            className={`h-1.5 w-6 rounded-full transition-all ${
                              lvl <= currentTier ? 'bg-amber-400' : 'bg-slate-800'
                            }`}
                          />
                        ))}
                      </div>
                    </div>
                  </div>

                  {/* Upgrade Button */}
                  <div className="w-full sm:w-auto shrink-0 self-end sm:self-center">
                    {isMaxed ? (
                      <span className="inline-block px-4 py-2 rounded-xl bg-slate-800 border border-slate-700 text-xs font-bold text-slate-500 uppercase">
                        Max Tier
                      </span>
                    ) : (
                      <button
                        disabled={!canAfford}
                        onClick={() => onUpgradePowerUp(item.type)}
                        className={`w-full sm:w-auto px-4 py-2 rounded-xl text-xs font-extrabold uppercase tracking-wider flex items-center justify-center gap-1.5 transition ${
                          canAfford
                            ? 'bg-amber-500 hover:bg-amber-400 text-slate-950 cursor-pointer shadow-md'
                            : 'bg-slate-800 text-slate-500 cursor-not-allowed'
                        }`}
                      >
                        <ArrowUpCircle className="w-3.5 h-3.5" />
                        <span>Upgrade ({upgradeCost.toLocaleString()} Coins)</span>
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
};
