import React from 'react';
import { X, Volume2, VolumeX, Music, Smartphone, Monitor, Sliders, RefreshCw } from 'lucide-react';
import { GraphicsQuality, PlayerProgress } from '../types/game';

interface SettingsModalProps {
  progress: PlayerProgress;
  onUpdateSettings: (newSettings: PlayerProgress['settings']) => void;
  onResetProgress: () => void;
  onClose: () => void;
}

export const SettingsModal: React.FC<SettingsModalProps> = ({
  progress,
  onUpdateSettings,
  onResetProgress,
  onClose,
}) => {
  const settings = progress.settings;

  const handleToggleMusic = () => {
    onUpdateSettings({ ...settings, musicEnabled: !settings.musicEnabled });
  };

  const handleToggleSfx = () => {
    onUpdateSettings({ ...settings, sfxEnabled: !settings.sfxEnabled });
  };

  const handleToggleVibration = () => {
    onUpdateSettings({ ...settings, vibrationEnabled: !settings.vibrationEnabled });
  };

  const handleQualityChange = (q: GraphicsQuality) => {
    onUpdateSettings({ ...settings, graphicsQuality: q });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/85 backdrop-blur-md">
      <div className="bg-slate-900 border border-slate-700/80 rounded-3xl w-full max-w-lg max-h-[90vh] flex flex-col shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-800 flex items-center justify-between">
          <h2 className="text-2xl font-black font-['Teko'] text-white uppercase tracking-wider">
            Game Settings
          </h2>
          <button
            onClick={onClose}
            className="w-9 h-9 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white flex items-center justify-center transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Settings Body */}
        <div className="flex-1 overflow-y-auto p-6 space-y-5">
          {/* Audio Section */}
          <div className="space-y-3">
            <h3 className="text-xs font-bold text-amber-400 uppercase tracking-widest flex items-center gap-1.5">
              <Volume2 className="w-4 h-4" /> Audio & Soundtracks
            </h3>

            {/* Background Music */}
            <div className="bg-slate-850 border border-slate-800 rounded-2xl p-3.5 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Music className="w-5 h-5 text-slate-400" />
                <span className="text-sm font-semibold text-white">Dynamic Music</span>
              </div>
              <button
                onClick={handleToggleMusic}
                className={`w-12 h-7 rounded-full p-1 transition-colors ${
                  settings.musicEnabled ? 'bg-amber-500' : 'bg-slate-700'
                }`}
              >
                <div
                  className={`w-5 h-5 rounded-full bg-white transition-transform ${
                    settings.musicEnabled ? 'translate-x-5' : 'translate-x-0'
                  }`}
                />
              </button>
            </div>

            {/* Sound FX */}
            <div className="bg-slate-850 border border-slate-800 rounded-2xl p-3.5 flex items-center justify-between">
              <div className="flex items-center gap-3">
                {settings.sfxEnabled ? <Volume2 className="w-5 h-5 text-slate-400" /> : <VolumeX className="w-5 h-5 text-slate-500" />}
                <span className="text-sm font-semibold text-white">Sound Effects (SFX)</span>
              </div>
              <button
                onClick={handleToggleSfx}
                className={`w-12 h-7 rounded-full p-1 transition-colors ${
                  settings.sfxEnabled ? 'bg-amber-500' : 'bg-slate-700'
                }`}
              >
                <div
                  className={`w-5 h-5 rounded-full bg-white transition-transform ${
                    settings.sfxEnabled ? 'translate-x-5' : 'translate-x-0'
                  }`}
                />
              </button>
            </div>
          </div>

          {/* Graphics Quality */}
          <div className="space-y-3 pt-2 border-t border-slate-800">
            <h3 className="text-xs font-bold text-amber-400 uppercase tracking-widest flex items-center gap-1.5">
              <Monitor className="w-4 h-4" /> Graphics Performance
            </h3>

            <div className="grid grid-cols-3 gap-2">
              {(['low', 'medium', 'high'] as GraphicsQuality[]).map((q) => (
                <button
                  key={q}
                  onClick={() => handleQualityChange(q)}
                  className={`py-2.5 rounded-xl text-xs font-bold uppercase tracking-wider transition ${
                    settings.graphicsQuality === q
                      ? 'bg-amber-500 text-slate-950 shadow-md font-extrabold'
                      : 'bg-slate-850 hover:bg-slate-800 text-slate-400 border border-slate-800'
                  }`}
                >
                  {q}
                </button>
              ))}
            </div>
            <p className="text-[11px] text-slate-400">
              {settings.graphicsQuality === 'low' && 'Low: Optimized for entry-level mobile devices (low shadow overhead, 1x pixel scale).'}
              {settings.graphicsQuality === 'medium' && 'Medium: Balanced performance for mid-range phones.'}
              {settings.graphicsQuality === 'high' && 'High: Maximum visual realism with soft shadows, reflections, and high-res textures.'}
            </p>
          </div>

          {/* Controls & Haptics */}
          <div className="space-y-3 pt-2 border-t border-slate-800">
            <h3 className="text-xs font-bold text-amber-400 uppercase tracking-widest flex items-center gap-1.5">
              <Smartphone className="w-4 h-4" /> Controls & Haptics
            </h3>

            {/* Vibration */}
            <div className="bg-slate-850 border border-slate-800 rounded-2xl p-3.5 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Smartphone className="w-5 h-5 text-slate-400" />
                <span className="text-sm font-semibold text-white">Haptic Vibration</span>
              </div>
              <button
                onClick={handleToggleVibration}
                className={`w-12 h-7 rounded-full p-1 transition-colors ${
                  settings.vibrationEnabled ? 'bg-amber-500' : 'bg-slate-700'
                }`}
              >
                <div
                  className={`w-5 h-5 rounded-full bg-white transition-transform ${
                    settings.vibrationEnabled ? 'translate-x-5' : 'translate-x-0'
                  }`}
                />
              </button>
            </div>
          </div>

          {/* Reset Save Data */}
          <div className="pt-2 border-t border-slate-800">
            <button
              onClick={() => {
                if (window.confirm('Are you sure you want to reset all game progress and character unlocks?')) {
                  onResetProgress();
                }
              }}
              className="w-full py-2.5 rounded-xl bg-red-950/40 hover:bg-red-900/60 border border-red-500/30 text-red-400 text-xs font-bold uppercase tracking-wider flex items-center justify-center gap-2 transition cursor-pointer"
            >
              <RefreshCw className="w-3.5 h-3.5" /> Reset Local Save Data
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
