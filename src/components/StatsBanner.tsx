import React from 'react';
import { Incident, Language } from '../types';
import { translations } from '../utils/translations';
import { AlertTriangle, Zap, Truck, CheckCircle2, Navigation } from 'lucide-react';

interface StatsBannerProps {
  incidents: Incident[];
  lang: Language;
}

export const StatsBanner: React.FC<StatsBannerProps> = ({ incidents, lang }) => {
  const t = translations[lang];

  const activeCount = incidents.filter((i) => i.status !== 'cleared').length;
  const criticalCount = incidents.filter(
    (i) => i.status !== 'cleared' && i.priority_score >= 9.0
  ).length;
  const liveWireCount = incidents.filter(
    (i) => i.status !== 'cleared' && i.hazard === 'live_electrical_wire'
  ).length;
  const crewsDispatchedCount = incidents.filter(
    (i) => i.status === 'assigned' || i.status === 'in_progress'
  ).length;
  const clearedCount = incidents.filter((i) => i.status === 'cleared').length;

  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3 mb-6">
      {/* 1. Active Blockages */}
      <div className="bg-slate-800/90 border border-slate-700/80 rounded-xl p-3.5 shadow-sm flex items-center justify-between">
        <div>
          <p className="text-xs font-medium text-slate-400 uppercase tracking-wider">
            {t.statActive}
          </p>
          <p className="text-2xl font-black text-white mt-0.5">{activeCount}</p>
        </div>
        <div className="w-10 h-10 rounded-lg bg-blue-500/10 border border-blue-500/20 flex items-center justify-center text-blue-400">
          <Navigation className="w-5 h-5" />
        </div>
      </div>

      {/* 2. Critical Lifelines */}
      <div className="bg-red-950/40 border border-red-800/60 rounded-xl p-3.5 shadow-sm flex items-center justify-between">
        <div>
          <p className="text-xs font-semibold text-red-300 uppercase tracking-wider">
            {t.statCritical}
          </p>
          <div className="flex items-center gap-1.5 mt-0.5">
            <p className="text-2xl font-black text-red-400">{criticalCount}</p>
            {criticalCount > 0 && (
              <span className="text-[10px] bg-red-900/60 text-red-300 font-bold px-1.5 py-0.5 rounded border border-red-700">
                P1 URGENT
              </span>
            )}
          </div>
        </div>
        <div className="w-10 h-10 rounded-lg bg-red-500/10 border border-red-500/30 flex items-center justify-center text-red-400 animate-pulse">
          <AlertTriangle className="w-5 h-5" />
        </div>
      </div>

      {/* 3. Live Wires */}
      <div className="bg-amber-950/40 border border-amber-800/60 rounded-xl p-3.5 shadow-sm flex items-center justify-between">
        <div>
          <p className="text-xs font-semibold text-amber-300 uppercase tracking-wider">
            {t.statLiveWires}
          </p>
          <div className="flex items-center gap-1.5 mt-0.5">
            <p className="text-2xl font-black text-amber-400">{liveWireCount}</p>
            {liveWireCount > 0 && (
              <span className="text-[10px] bg-amber-900/60 text-amber-300 font-bold px-1.5 py-0.5 rounded border border-amber-700">
                APEPDCL
              </span>
            )}
          </div>
        </div>
        <div className="w-10 h-10 rounded-lg bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400">
          <Zap className="w-5 h-5" />
        </div>
      </div>

      {/* 4. Crews Dispatched */}
      <div className="bg-slate-800/90 border border-slate-700/80 rounded-xl p-3.5 shadow-sm flex items-center justify-between">
        <div>
          <p className="text-xs font-medium text-slate-400 uppercase tracking-wider">
            {t.statDispatched}
          </p>
          <p className="text-2xl font-black text-blue-300 mt-0.5">{crewsDispatchedCount}</p>
        </div>
        <div className="w-10 h-10 rounded-lg bg-blue-500/10 border border-blue-500/20 flex items-center justify-center text-blue-400">
          <Truck className="w-5 h-5" />
        </div>
      </div>

      {/* 5. Corridors Cleared */}
      <div className="col-span-2 sm:col-span-1 bg-emerald-950/30 border border-emerald-800/50 rounded-xl p-3.5 shadow-sm flex items-center justify-between">
        <div>
          <p className="text-xs font-semibold text-emerald-300 uppercase tracking-wider">
            {t.statCleared}
          </p>
          <p className="text-2xl font-black text-emerald-400 mt-0.5">{clearedCount}</p>
        </div>
        <div className="w-10 h-10 rounded-lg bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400">
          <CheckCircle2 className="w-5 h-5" />
        </div>
      </div>
    </div>
  );
};
