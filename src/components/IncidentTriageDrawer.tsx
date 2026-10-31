import React, { useState } from 'react';
import { Incident, Language, IncidentStatus } from '../types';
import { translations } from '../utils/translations';
import {
  FileCheck2,
  AlertTriangle,
  Zap,
  Truck,
  CheckCircle2,
  Clock,
  MapPin,
  ChevronLeft,
  ChevronRight,
  ShieldAlert,
  Flame,
  Radio,
  ExternalLink,
  Hammer,
} from 'lucide-react';

interface IncidentTriageDrawerProps {
  incidents: Incident[];
  selectedIncident: Incident | null;
  onSelectIncident: (incident: Incident | null) => void;
  onUpdateStatus: (id: string, status: IncidentStatus, assignedCrew?: string) => void;
  lang: Language;
  onOpenReportModal: () => void;
}

export const IncidentTriageDrawer: React.FC<IncidentTriageDrawerProps> = ({
  incidents,
  selectedIncident,
  onSelectIncident,
  onUpdateStatus,
  lang,
  onOpenReportModal,
}) => {
  const t = translations[lang];
  const [notification, setNotification] = useState<string | null>(null);

  // If no incident selected, show empty selection state or default to top critical
  const currentIncident = selectedIncident || (incidents.length > 0 ? incidents[0] : null);

  // Queue navigation index
  const currentIndex = currentIncident
    ? incidents.findIndex((i) => i.id === currentIncident.id)
    : -1;

  const handleNext = () => {
    if (currentIndex >= 0 && currentIndex < incidents.length - 1) {
      onSelectIncident(incidents[currentIndex + 1]);
    }
  };

  const handlePrev = () => {
    if (currentIndex > 0) {
      onSelectIncident(incidents[currentIndex - 1]);
    }
  };

  const triggerDispatch = (crewName: string) => {
    if (!currentIncident) return;
    onUpdateStatus(currentIncident.id, 'assigned', crewName);
    setNotification(`Dispatched: ${crewName} to ${currentIncident.locationName}`);
    setTimeout(() => setNotification(null), 4000);
  };

  const handleStatusChange = (newStatus: IncidentStatus) => {
    if (!currentIncident) return;
    onUpdateStatus(currentIncident.id, newStatus);
    setNotification(`Status updated to ${newStatus.toUpperCase()}`);
    setTimeout(() => setNotification(null), 3000);
  };

  if (!currentIncident) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-16 text-center">
        <div className="w-16 h-16 rounded-2xl bg-slate-800 border border-slate-700 flex items-center justify-center mx-auto mb-4 text-slate-400">
          <FileCheck2 className="w-8 h-8" />
        </div>
        <h2 className="text-xl font-bold text-white mb-2">{t.triageTitle}</h2>
        <p className="text-sm text-slate-400 max-w-md mx-auto mb-6">
          {t.selectIncidentPrompt}
        </p>
        <button
          type="button"
          onClick={onOpenReportModal}
          className="bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold px-5 py-2.5 rounded-xl text-sm inline-flex items-center gap-2 shadow"
        >
          <Flame className="w-4 h-4 fill-current" />
          <span>Upload New Hazard Photo</span>
        </button>
      </div>
    );
  }

  const isCritical = currentIncident.priority_score >= 9.0;
  const isWire = currentIncident.hazard === 'live_electrical_wire';

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
      {/* Toast Notification */}
      {notification && (
        <div className="fixed top-20 right-4 z-50 bg-emerald-600 text-white font-bold px-4 py-3 rounded-xl shadow-2xl flex items-center gap-2 animate-in slide-in-from-top text-sm">
          <CheckCircle2 className="w-5 h-5" />
          <span>{notification}</span>
        </div>
      )}

      {/* Top Header & Queue Pager */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-slate-800/90 border border-slate-700 p-4 rounded-2xl shadow-lg">
        <div>
          <div className="flex items-center gap-2 text-xs font-bold text-blue-400 uppercase tracking-widest mb-0.5">
            <FileCheck2 className="w-4 h-4" />
            {t.triageTitle}
          </div>
          <h1 className="text-xl sm:text-2xl font-black text-white">
            {currentIncident.locationName}
          </h1>
          <p className="text-xs text-slate-300">
            {currentIncident.landmarkDetails || 'Visakhapatnam Municipal Road'}
          </p>
        </div>

        {/* Pager and Quick Action */}
        <div className="flex items-center gap-2 self-start sm:self-center">
          <div className="flex items-center bg-slate-900 border border-slate-700 rounded-xl p-1 text-xs">
            <button
              type="button"
              onClick={handlePrev}
              disabled={currentIndex <= 0}
              className="p-1.5 text-slate-300 hover:text-white disabled:opacity-30 rounded-lg"
              title="Previous Incident"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <span className="px-2 font-mono font-bold text-slate-300">
              {currentIndex + 1} / {incidents.length}
            </span>
            <button
              type="button"
              onClick={handleNext}
              disabled={currentIndex >= incidents.length - 1}
              className="p-1.5 text-slate-300 hover:text-white disabled:opacity-30 rounded-lg"
              title="Next Incident"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>

          <button
            type="button"
            onClick={onOpenReportModal}
            className="bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold px-3 py-2 rounded-xl text-xs flex items-center gap-1.5 transition"
          >
            <Flame className="w-3.5 h-3.5 fill-current" />
            <span className="hidden sm:inline">Upload Hazard</span>
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column (5 cols): Photo & GPS Metadata */}
        <div className="lg:col-span-5 space-y-4">
          {/* Photo */}
          <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden shadow-lg group relative">
            <img
              src={currentIncident.photoUrl}
              alt={currentIncident.locationName}
              className="w-full aspect-4/3 object-cover"
            />
            {currentIncident.isSample && (
              <span className="absolute top-3 left-3 bg-slate-900/90 text-slate-300 border border-slate-700 text-xs px-2.5 py-0.5 rounded-full font-bold">
                Sample Incident Record
              </span>
            )}
            <div className="p-3 bg-slate-950/80 border-t border-slate-800 flex items-center justify-between text-xs text-slate-400">
              <span className="flex items-center gap-1">
                <Clock className="w-3.5 h-3.5 text-slate-500" />
                Reported {currentIncident.reportedAt}
              </span>
              <span className="font-mono text-blue-400">
                {currentIncident.lat.toFixed(4)}°N, {currentIncident.lng.toFixed(4)}°E
              </span>
            </div>
          </div>

          {/* Location & Lifeline Corridor Card */}
          <div className="bg-slate-800/90 border border-slate-700 rounded-2xl p-4 space-y-2 text-xs">
            <h3 className="font-bold text-white text-sm flex items-center gap-1.5">
              <MapPin className="w-4 h-4 text-blue-400" />
              Corridor Telemetry
            </h3>
            <div className="grid grid-cols-2 gap-2 pt-1">
              <div className="bg-slate-900 p-2 rounded-lg border border-slate-700">
                <span className="text-slate-400 block text-[10px] uppercase font-bold">Route Type</span>
                <span className="font-bold text-blue-300 text-xs">{currentIncident.routeType}</span>
              </div>
              <div className="bg-slate-900 p-2 rounded-lg border border-slate-700">
                <span className="text-slate-400 block text-[10px] uppercase font-bold">Current Status</span>
                <span className="font-bold text-white text-xs capitalize">{currentIncident.status}</span>
              </div>
            </div>
            {currentIncident.notes && (
              <div className="bg-slate-900 p-2.5 rounded-lg border border-slate-700 mt-2">
                <span className="text-slate-400 block text-[10px] uppercase font-bold mb-0.5">
                  Field Observer Log
                </span>
                <p className="text-slate-300 text-xs leading-relaxed">{currentIncident.notes}</p>
              </div>
            )}
          </div>
        </div>

        {/* Right Column (7 cols): AI Analysis & Dispatch Actions */}
        <div className="lg:col-span-7 space-y-5">
          {/* AI OBSTRUCTION & HAZARD ANALYSIS CARD */}
          <div className="bg-slate-800/90 border border-slate-700 rounded-2xl p-5 shadow-lg space-y-4">
            <div className="flex items-center justify-between border-b border-slate-700 pb-3">
              <h2 className="text-base font-bold text-white flex items-center gap-2">
                <ShieldAlert className="w-5 h-5 text-blue-400" />
                {t.aiObstructionAnalysis}
              </h2>
              <span className="text-[11px] bg-blue-950 text-blue-300 border border-blue-800 px-2.5 py-0.5 rounded-full font-bold">
                Automated Rule & Vision Engine
              </span>
            </div>

            {/* AI Indicators */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              {/* Obstruction */}
              <div className="bg-slate-900 p-3 rounded-xl border border-slate-700">
                <span className="text-[10px] uppercase font-bold text-slate-400 block">
                  {t.obstructionLevel}
                </span>
                <span className="text-sm font-black text-white capitalize mt-0.5 block">
                  {currentIncident.obstruction.replace(/_/g, ' ')}
                </span>
              </div>

              {/* Hazard Warning */}
              <div
                className={`p-3 rounded-xl border ${
                  isWire
                    ? 'bg-amber-950/60 border-amber-500 text-amber-200'
                    : 'bg-slate-900 border-slate-700 text-slate-200'
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className="text-[10px] uppercase font-bold text-slate-400">
                    {t.hazardDetected}
                  </span>
                  {isWire && <Zap className="w-4 h-4 text-amber-400 animate-pulse" />}
                </div>
                <span className="text-sm font-black capitalize mt-0.5 block">
                  {currentIncident.hazard.replace(/_/g, ' ')}
                </span>
              </div>

              {/* Priority Score */}
              <div
                className={`p-3 rounded-xl border ${
                  isCritical
                    ? 'bg-red-950/60 border-red-500 text-red-200'
                    : currentIncident.priority_score >= 7.0
                    ? 'bg-orange-950/60 border-orange-500 text-orange-200'
                    : 'bg-blue-950/60 border-blue-600 text-blue-200'
                }`}
              >
                <span className="text-[10px] uppercase font-bold text-slate-400 block">
                  {t.priorityScore}
                </span>
                <div className="flex items-baseline gap-1 mt-0.5">
                  <span className="text-xl font-black">{currentIncident.priority_score}</span>
                  <span className="text-xs text-slate-400">/ 10.0</span>
                  {isCritical && (
                    <span className="ml-auto text-[9px] bg-red-900 text-white font-bold px-1.5 py-0.2 rounded">
                      P1
                    </span>
                  )}
                </div>
              </div>
            </div>

            {/* High-visibility Live Wire Alert Banner */}
            {isWire && (
              <div className="bg-red-950/70 border-2 border-red-600 p-3.5 rounded-xl flex items-start gap-3 text-red-200">
                <AlertTriangle className="w-6 h-6 text-red-400 shrink-0 mt-0.5 animate-bounce" />
                <div>
                  <h4 className="font-black text-white text-sm">
                    HAZARD ALERT: Snapped / Sagging Live Electrical Lines
                  </h4>
                  <p className="text-xs text-red-200 mt-0.5">
                    Immediate risk of electrocution on wet post-cyclone asphalt. APEPDCL Eastern
                    Power Distribution must execute 11kV/33kV substation feeder isolations before
                    tree removal teams enter the zone.
                  </p>
                </div>
              </div>
            )}

            {/* AI Recommendation */}
            <div className="bg-slate-900/90 border border-slate-700 p-3.5 rounded-xl">
              <span className="text-xs uppercase font-bold text-blue-400 block mb-1">
                {t.aiRecommendation}
              </span>
              <p className="text-sm font-semibold text-white">
                "{currentIncident.recommendation}"
              </p>
            </div>
          </div>

          {/* CREW DISPATCH ACTIONS */}
          <div className="bg-slate-800/90 border border-slate-700 rounded-2xl p-5 shadow-lg space-y-4">
            <div className="flex items-center justify-between border-b border-slate-700 pb-3">
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <Truck className="w-5 h-5 text-blue-400" />
                {t.crewDispatch}
              </h3>
              {currentIncident.assignedCrew && (
                <span className="text-xs bg-emerald-950 text-emerald-300 border border-emerald-700 px-2.5 py-0.5 rounded-full font-bold flex items-center gap-1">
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  Assigned: {currentIncident.assignedCrew}
                </span>
              )}
            </div>

            {/* Crew Trigger Buttons */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
              {/* PWD Heavy Unit */}
              <button
                type="button"
                onClick={() => triggerDispatch('PWD Heavy Unit (Chainsaws & Winch Crane)')}
                className="text-left p-3 rounded-xl bg-slate-900 hover:bg-blue-600/20 border border-slate-700 hover:border-blue-500 text-slate-200 transition group"
              >
                <div className="flex items-center gap-2 font-bold text-xs text-white group-hover:text-blue-300">
                  <Hammer className="w-4 h-4 text-blue-400" />
                  {t.dispatchPwd}
                </div>
                <p className="text-[11px] text-slate-400 mt-1">
                  High-capacity motorized saws & industrial hydraulic winches.
                </p>
              </button>

              {/* APEPDCL Electricity Board */}
              <button
                type="button"
                onClick={() => triggerDispatch('APEPDCL Line Isolation Unit')}
                className={`text-left p-3 rounded-xl border transition group ${
                  isWire
                    ? 'bg-amber-950/40 border-amber-600 hover:bg-amber-900/40 text-amber-200'
                    : 'bg-slate-900 border-slate-700 hover:border-slate-500 text-slate-200'
                }`}
              >
                <div className="flex items-center gap-2 font-bold text-xs text-amber-300">
                  <Zap className="w-4 h-4 text-amber-400" />
                  {t.dispatchApepdcl}
                </div>
                <p className="text-[11px] text-slate-400 mt-1">
                  Immediate 11kV line cut-off, wire ground anchoring & clearing.
                </p>
              </button>

              {/* GVMC Tree Squad */}
              <button
                type="button"
                onClick={() => triggerDispatch('GVMC Rapid Tree Pruning Squad')}
                className="text-left p-3 rounded-xl bg-slate-900 hover:bg-blue-600/20 border border-slate-700 hover:border-blue-500 text-slate-200 transition group"
              >
                <div className="flex items-center gap-2 font-bold text-xs text-white group-hover:text-blue-300">
                  <Truck className="w-4 h-4 text-emerald-400" />
                  {t.dispatchGvmc}
                </div>
                <p className="text-[11px] text-slate-400 mt-1">
                  Local municipal ward crew for limb removal and chipping.
                </p>
              </button>

              {/* NDRF / SDRF Tactical */}
              <button
                type="button"
                onClick={() => triggerDispatch('NDRF / SDRF Disaster Response Battalion')}
                className="text-left p-3 rounded-xl bg-slate-900 hover:bg-blue-600/20 border border-slate-700 hover:border-blue-500 text-slate-200 transition group"
              >
                <div className="flex items-center gap-2 font-bold text-xs text-white group-hover:text-blue-300">
                  <Radio className="w-4 h-4 text-red-400" />
                  {t.dispatchNdrf}
                </div>
                <p className="text-[11px] text-slate-400 mt-1">
                  Tactical heavy debris clearance for critical hospital lifelines.
                </p>
              </button>
            </div>

            {/* Status Update Switcher */}
            <div className="pt-3 border-t border-slate-700 flex flex-wrap items-center justify-between gap-2">
              <span className="text-xs font-bold text-slate-400 uppercase tracking-wide">
                {t.statusUpdate}:
              </span>
              <div className="flex items-center gap-1.5">
                {(['pending', 'assigned', 'in_progress', 'cleared'] as IncidentStatus[]).map(
                  (st) => (
                    <button
                      key={st}
                      type="button"
                      onClick={() => handleStatusChange(st)}
                      className={`text-xs px-2.5 py-1 rounded-lg font-bold capitalize transition ${
                        currentIncident.status === st
                          ? st === 'cleared'
                            ? 'bg-emerald-600 text-white'
                            : 'bg-blue-600 text-white'
                          : 'bg-slate-900 text-slate-400 hover:text-white border border-slate-700'
                      }`}
                    >
                      {st.replace('_', ' ')}
                    </button>
                  )
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
