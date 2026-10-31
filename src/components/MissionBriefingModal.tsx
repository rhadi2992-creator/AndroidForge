import React from 'react';
import { Siren, Shield, Target, Play, UserX, AlertTriangle, Coins } from 'lucide-react';
import { LevelDefinition } from '../types/game';

interface MissionBriefingModalProps {
  level: LevelDefinition;
  onStartChase: () => void;
  onCancel: () => void;
}

export const MissionBriefingModal: React.FC<MissionBriefingModalProps> = ({
  level,
  onStartChase,
  onCancel,
}) => {
  const story = level.story;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/90 backdrop-blur-md">
      <div className="bg-slate-900 border border-amber-500/60 rounded-3xl w-full max-w-lg flex flex-col shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        {/* Crime Alert Banner */}
        <div className="bg-gradient-to-r from-red-600 via-amber-600 to-red-600 text-white px-5 py-2.5 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Siren className="w-5 h-5 animate-bounce" />
            <span className="font-['Teko'] text-xl uppercase tracking-wider font-black">
              POLICE DISPATCH: LEVEL {level.levelNumber}
            </span>
          </div>
          <span className="text-[11px] font-mono font-bold bg-black/40 px-2 py-0.5 rounded-full uppercase">
            {story.missionType.replace('-', ' ')}
          </span>
        </div>

        {/* Content */}
        <div className="p-6 space-y-4">
          {/* Headline & Stolen Property Showcase */}
          <div className="flex items-center gap-4 bg-slate-850 border border-slate-700/80 rounded-2xl p-4">
            <div className="w-16 h-16 rounded-2xl bg-amber-500/20 border border-amber-500/40 flex items-center justify-center text-3xl shadow-inner shrink-0">
              {story.stolenItemIcon}
            </div>
            <div>
              <span className="text-[10px] font-bold uppercase tracking-wider text-amber-400">
                Stolen Belonging
              </span>
              <h3 className="text-xl font-black font-['Teko'] text-white tracking-wide">
                {story.stolenItemName}
              </h3>
              <p className="text-xs text-slate-300 mt-0.5 line-clamp-2">
                Victim: <b className="text-white">{story.victimName}</b> ({story.victimRole})
              </p>
            </div>
          </div>

          {/* Story Narrative */}
          <div className="bg-slate-950/60 border border-slate-800 rounded-2xl p-3.5 space-y-1.5 text-xs text-slate-300">
            <div className="flex items-center gap-1.5 text-amber-400 font-bold uppercase text-[11px]">
              <AlertTriangle className="w-3.5 h-3.5" /> Incident Report
            </div>
            <p className="leading-relaxed">{story.storyIntro}</p>
          </div>

          {/* Suspect Profile */}
          <div className="bg-slate-850/80 border border-slate-800 rounded-2xl p-3 flex items-center justify-between text-xs">
            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-xl bg-red-950/60 border border-red-500/40 flex items-center justify-center text-red-400">
                <UserX className="w-5 h-5" />
              </div>
              <div>
                <span className="text-[10px] text-slate-400 uppercase font-semibold">Fleeing Suspect</span>
                <div className="font-bold text-white text-sm">{story.suspectName}</div>
              </div>
            </div>
            <span className="text-[11px] font-mono text-red-400 bg-red-950/40 px-2 py-1 rounded-lg border border-red-500/30">
              {story.suspectTitle}
            </span>
          </div>

          {/* Objectives Checklist */}
          <div className="space-y-1.5">
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1">
              <Target className="w-3.5 h-3.5 text-amber-400" /> Mission Objectives
            </span>
            <div className="bg-slate-950 border border-slate-800/90 rounded-2xl p-3 space-y-1.5 text-xs">
              <div className="flex items-center gap-2 text-slate-200">
                <div className="w-1.5 h-1.5 rounded-full bg-amber-400" />
                <span>Chase & close the gap on the suspect within {level.distanceObjective}m</span>
              </div>
              <div className="flex items-center gap-2 text-slate-200">
                <div className="w-1.5 h-1.5 rounded-full bg-cyan-400" />
                <span>Recover dropped stolen property & collect at least {level.coinObjective} coins</span>
              </div>
              <div className="flex items-center gap-2 text-slate-200">
                <div className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                <span>Safely intercept suspect for police custody</span>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="grid grid-cols-2 gap-3 pt-2">
            <button
              onClick={onCancel}
              className="py-3 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold text-xs uppercase tracking-wider transition cursor-pointer"
            >
              Back to Map
            </button>
            <button
              onClick={onStartChase}
              className="py-3 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-slate-950 font-black text-sm uppercase tracking-wider flex items-center justify-center gap-2 shadow-xl shadow-amber-500/25 active:scale-95 transition cursor-pointer"
            >
              <Play className="w-4 h-4 fill-slate-950" /> START PURSUIT
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
