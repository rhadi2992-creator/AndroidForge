import React, { useState } from 'react';
import { Play, MapPin, Users, ShoppingBag, Settings, Smartphone, Coins, Sparkles, Trophy, Download, Loader2 } from 'lucide-react';
import { Character, PlayerProgress } from '../types/game';
import { downloadProjectZip } from '../services/zipExporter';

interface MainMenuProps {
  progress: PlayerProgress;
  selectedCharacter: Character;
  onPlayLevel: () => void;
  onPlayEndless: () => void;
  onOpenLevelSelect: () => void;
  onOpenCharacterSelect: () => void;
  onOpenShop: () => void;
  onOpenSettings: () => void;
  onOpenAndroidExport: () => void;
}

export const MainMenu: React.FC<MainMenuProps> = ({
  progress,
  selectedCharacter,
  onPlayLevel,
  onPlayEndless,
  onOpenLevelSelect,
  onOpenCharacterSelect,
  onOpenShop,
  onOpenSettings,
  onOpenAndroidExport,
}) => {
  const [isDownloading, setIsDownloading] = useState(false);

  const handleDownloadZip = async () => {
    setIsDownloading(true);
    try {
      await downloadProjectZip();
    } catch (e) {
      console.error('Failed to download project zip', e);
    } finally {
      setTimeout(() => setIsDownloading(false), 1000);
    }
  };
  return (
    <div className="absolute inset-0 z-30 flex flex-col justify-between p-6 pointer-events-none select-none">
      {/* Top Bar: Currencies & High Score */}
      <div className="flex items-center justify-between w-full pointer-events-auto">
        {/* High Score Badge */}
        <div className="bg-slate-900/85 backdrop-blur-md border border-slate-700/60 rounded-2xl px-4 py-2 flex items-center gap-2.5 shadow-xl">
          <Trophy className="w-4 h-4 text-amber-400" />
          <div className="flex flex-col">
            <span className="text-[9px] font-bold uppercase tracking-wider text-slate-400">Best Score</span>
            <span className="text-xl font-black font-['Teko'] text-white">
              {progress.highScore.toLocaleString()}
            </span>
          </div>
        </div>

        {/* Currency Pill & Arrest Counter */}
        <div className="flex items-center gap-3">
          {/* Police Arrest Badge */}
          <div className="bg-slate-900/85 backdrop-blur-md border border-sky-500/40 rounded-2xl px-3.5 py-1.5 flex items-center gap-2 shadow-xl">
            <span className="text-base">🚔</span>
            <div className="flex flex-col">
              <span className="text-[8px] font-bold uppercase tracking-wider text-sky-400">Arrests</span>
              <span className="text-lg font-bold font-['Teko'] text-sky-300 leading-none">
                {progress.arrestedSuspects}
              </span>
            </div>
          </div>

          <div className="bg-slate-900/85 backdrop-blur-md border border-amber-500/40 rounded-2xl px-3.5 py-1.5 flex items-center gap-2 shadow-xl">
            <div className="w-5 h-5 rounded-full bg-amber-500/20 flex items-center justify-center text-amber-400">
              <Coins className="w-3.5 h-3.5" />
            </div>
            <span className="text-xl font-bold font-['Teko'] text-amber-400">{progress.coins.toLocaleString()}</span>
          </div>

          <div className="bg-slate-900/85 backdrop-blur-md border border-cyan-500/40 rounded-2xl px-3.5 py-1.5 flex items-center gap-2 shadow-xl">
            <div className="w-5 h-5 rounded-full bg-cyan-500/20 flex items-center justify-center text-cyan-400">
              <Sparkles className="w-3.5 h-3.5" />
            </div>
            <span className="text-xl font-bold font-['Teko'] text-cyan-400">{progress.gems}</span>
          </div>
        </div>
      </div>

      {/* Center Branding & Hero Title */}
      <div className="flex flex-col items-center text-center my-auto">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-500/20 border border-amber-500/30 text-amber-400 text-xs font-bold uppercase tracking-widest mb-3 backdrop-blur-sm">
          <span>Realistic 3D Story Chase & Property Recovery</span>
        </div>
        <h1 className="text-5xl sm:text-7xl font-black tracking-tight text-white uppercase font-['Teko'] drop-shadow-2xl leading-none">
          STREET CHASE
        </h1>
        <h2 className="text-2xl sm:text-3xl font-extrabold tracking-widest text-amber-400 uppercase font-['Teko'] drop-shadow-lg -mt-1">
          REAL ESCAPE
        </h2>
        <p className="text-xs sm:text-sm text-slate-300 max-w-md mt-2 font-medium drop-shadow">
          Chase fleeing bank robbers, handbag snatchers, and jewellery thieves through busy urban streets. Recover stolen belongings and safely hand suspects over to police!
        </p>

        {/* Selected Runner Tag */}
        <div className="mt-4 flex items-center gap-2.5 bg-slate-900/80 px-4 py-1.5 rounded-full border border-slate-700/60 pointer-events-auto">
          <div className="w-2.5 h-2.5 rounded-full bg-emerald-400" />
          <span className="text-xs text-slate-300">
            Active Hero: <b className="text-white font-bold">{selectedCharacter.name}</b>
          </span>
          <button
            onClick={onOpenCharacterSelect}
            className="text-xs font-bold text-amber-400 hover:text-amber-300 underline ml-1 cursor-pointer"
          >
            Change
          </button>
        </div>
      </div>

      {/* Bottom Action Bar: Play & Menus */}
      <div className="flex flex-col items-center gap-4 w-full max-w-lg mx-auto pointer-events-auto pb-2">
        {/* Main Action Buttons */}
        <div className="grid grid-cols-2 gap-3 w-full">
          <button
            onClick={onPlayLevel}
            className="h-14 rounded-2xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-slate-950 font-black tracking-wider text-xl font-['Teko'] flex items-center justify-center gap-2 shadow-2xl shadow-amber-500/30 active:scale-95 transition-all cursor-pointer border border-amber-300/40"
          >
            <Play className="w-5 h-5 fill-slate-950" />
            STORY MISSION {progress.unlockedLevel}
          </button>

          <button
            onClick={onPlayEndless}
            className="h-14 rounded-2xl bg-gradient-to-r from-sky-600 to-blue-700 hover:from-sky-700 hover:to-blue-800 text-white font-black tracking-wider text-xl font-['Teko'] flex items-center justify-center gap-2 shadow-2xl shadow-sky-500/30 active:scale-95 transition-all cursor-pointer border border-sky-400/40"
          >
            <Play className="w-5 h-5 fill-white" />
            ENDLESS PATROL
          </button>
        </div>

        {/* Secondary Navigation Row */}
        <div className="grid grid-cols-3 sm:grid-cols-6 gap-2 w-full">
          <button
            onClick={onOpenLevelSelect}
            className="flex flex-col items-center justify-center py-2.5 rounded-xl bg-slate-900/85 hover:bg-slate-800 border border-slate-700/60 text-slate-300 hover:text-white transition active:scale-95 cursor-pointer shadow-lg"
          >
            <MapPin className="w-5 h-5 text-amber-400 mb-1" />
            <span className="text-[10px] font-bold uppercase tracking-wider">Levels</span>
          </button>

          <button
            onClick={onOpenCharacterSelect}
            className="flex flex-col items-center justify-center py-2.5 rounded-xl bg-slate-900/85 hover:bg-slate-800 border border-slate-700/60 text-slate-300 hover:text-white transition active:scale-95 cursor-pointer shadow-lg"
          >
            <Users className="w-5 h-5 text-sky-400 mb-1" />
            <span className="text-[10px] font-bold uppercase tracking-wider">Runners</span>
          </button>

          <button
            onClick={onOpenShop}
            className="flex flex-col items-center justify-center py-2.5 rounded-xl bg-slate-900/85 hover:bg-slate-800 border border-slate-700/60 text-slate-300 hover:text-white transition active:scale-95 cursor-pointer shadow-lg"
          >
            <ShoppingBag className="w-5 h-5 text-emerald-400 mb-1" />
            <span className="text-[10px] font-bold uppercase tracking-wider">Shop</span>
          </button>

          <button
            onClick={onOpenSettings}
            className="flex flex-col items-center justify-center py-2.5 rounded-xl bg-slate-900/85 hover:bg-slate-800 border border-slate-700/60 text-slate-300 hover:text-white transition active:scale-95 cursor-pointer shadow-lg"
          >
            <Settings className="w-5 h-5 text-slate-400 mb-1" />
            <span className="text-[10px] font-bold uppercase tracking-wider">Options</span>
          </button>

          <button
            onClick={onOpenAndroidExport}
            className="flex flex-col items-center justify-center py-2.5 rounded-xl bg-slate-900/85 hover:bg-slate-800 border border-slate-700/60 text-slate-300 hover:text-white transition active:scale-95 cursor-pointer shadow-lg"
          >
            <Smartphone className="w-5 h-5 text-pink-400 mb-1" />
            <span className="text-[10px] font-bold uppercase tracking-wider">Android</span>
          </button>

          <button
            onClick={handleDownloadZip}
            disabled={isDownloading}
            className="flex flex-col items-center justify-center py-2.5 rounded-xl bg-gradient-to-b from-emerald-950/60 to-slate-900 hover:bg-slate-800 border border-emerald-500/60 text-slate-300 hover:text-white transition active:scale-95 cursor-pointer shadow-lg"
            title="Download full project zip"
          >
            {isDownloading ? (
              <Loader2 className="w-5 h-5 text-emerald-400 mb-1 animate-spin" />
            ) : (
              <Download className="w-5 h-5 text-emerald-400 mb-1" />
            )}
            <span className="text-[10px] font-black uppercase tracking-wider text-emerald-300">
              {isDownloading ? 'Zipping' : 'Download ZIP'}
            </span>
          </button>
        </div>
      </div>
    </div>
  );
};
