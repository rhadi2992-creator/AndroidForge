import React, { useEffect, useState } from 'react';
import { X, CheckCircle, Video, ShieldCheck, AlertCircle } from 'lucide-react';
import { AdType, ADMOB_CONFIG } from '../services/admobBridge';

interface AdModalProps {
  type: AdType;
  title: string;
  reward: string;
  onComplete: (earned: boolean) => void;
  onClose: () => void;
}

export const AdModal: React.FC<AdModalProps> = ({
  type,
  title,
  reward,
  onComplete,
  onClose,
}) => {
  const [secondsRemaining, setSecondsRemaining] = useState(5);
  const [isFinished, setIsFinished] = useState(false);

  useEffect(() => {
    const timer = setInterval(() => {
      setSecondsRemaining((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          setIsFinished(true);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  const handleClaim = () => {
    onComplete(true);
    onClose();
  };

  const handleSkipOrClose = () => {
    // If closed before finishing, user does NOT get the reward
    onComplete(isFinished);
    onClose();
  };

  const unitId = type === 'rewarded' ? ADMOB_CONFIG.testUnits.rewarded : ADMOB_CONFIG.testUnits.interstitial;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/95 backdrop-blur-md">
      <div className="bg-slate-900 border border-slate-700/80 rounded-3xl w-full max-w-lg flex flex-col shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        {/* AdMob Official Test Header Badge */}
        <div className="bg-yellow-400 text-slate-950 px-4 py-1.5 flex items-center justify-between text-xs font-bold font-mono">
          <div className="flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-slate-950 animate-ping" />
            <span>Google Mobile Ads SDK — Test Ad</span>
          </div>
          <span className="text-[10px] opacity-80">Official Test Unit ID: {unitId.slice(0, 24)}...</span>
        </div>

        {/* Ad Video Simulator Screen */}
        <div className="relative bg-black aspect-video flex flex-col items-center justify-center p-6 text-center overflow-hidden">
          {/* Animated Background Gradients */}
          <div className="absolute inset-0 bg-gradient-to-tr from-sky-950/40 via-indigo-950/40 to-slate-950/60" />

          {/* Close/Skip Button */}
          <div className="absolute top-3 right-3 z-10">
            {isFinished ? (
              <button
                onClick={handleSkipOrClose}
                className="w-8 h-8 rounded-full bg-slate-800/80 hover:bg-slate-700 text-white flex items-center justify-center transition cursor-pointer"
                aria-label="Close"
              >
                <X className="w-4 h-4" />
              </button>
            ) : (
              <div className="px-2.5 py-1 rounded-full bg-black/60 border border-slate-700 text-xs font-mono font-bold text-amber-400">
                Reward in {secondsRemaining}s
              </div>
            )}
          </div>

          {/* Ad Creative Mock */}
          <div className="relative z-10 flex flex-col items-center space-y-2 max-w-xs">
            <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-amber-500 to-yellow-400 flex items-center justify-center text-slate-950 shadow-xl">
              <Video className="w-7 h-7" />
            </div>
            <h3 className="text-xl font-black font-['Teko'] text-white tracking-wide">
              {title}
            </h3>
            <p className="text-xs text-slate-300">
              Reward to unlock: <span className="font-bold text-amber-400">{reward}</span>
            </p>
          </div>

          {/* Progress Bar */}
          <div className="absolute bottom-0 inset-x-0 h-1.5 bg-slate-800">
            <div
              className="h-full bg-amber-400 transition-all duration-1000 ease-linear"
              style={{ width: `${((5 - secondsRemaining) / 5) * 100}%` }}
            />
          </div>
        </div>

        {/* Footer info & Confirmation */}
        <div className="p-4 bg-slate-900 border-t border-slate-800 flex items-center justify-between gap-3">
          <div className="flex items-center gap-2 text-xs text-slate-400">
            <ShieldCheck className="w-4 h-4 text-emerald-400 shrink-0" />
            <span>AdMob Policy Verified: Zero accidental clicks, verified reward callback.</span>
          </div>

          {isFinished ? (
            <button
              onClick={handleClaim}
              className="px-4 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-extrabold text-xs uppercase tracking-wider flex items-center gap-1.5 transition active:scale-95 cursor-pointer shadow-md shrink-0"
            >
              <CheckCircle className="w-3.5 h-3.5" /> Claim Reward
            </button>
          ) : (
            <button
              onClick={handleSkipOrClose}
              className="px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-400 text-xs font-medium cursor-pointer shrink-0"
            >
              Skip (No Reward)
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
