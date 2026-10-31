import React, { useState, useEffect } from 'react';
import { Language } from '../types';
import { translations } from '../utils/translations';
import {
  getIngestionCount,
  getAverageAiLatencyMs,
  clearAllData,
  resetToSampleData,
} from '../utils/storage';
import {
  ShieldAlert,
  Clock,
  Zap,
  TrendingUp,
  Award,
  Trash2,
  RotateCcw,
  Building2,
  Users,
  Compass,
  CheckCircle2,
  Camera,
  AlertTriangle,
  Flame,
} from 'lucide-react';

interface AboutScreenProps {
  lang: Language;
  onDataReset: () => void;
  onOpenReportModal: () => void;
}

export const AboutScreen: React.FC<AboutScreenProps> = ({
  lang,
  onDataReset,
  onOpenReportModal,
}) => {
  const t = translations[lang];

  // Live performance stats
  const [ingestionCount, setIngestionCount] = useState<number>(getIngestionCount());
  const [latencyMs, setLatencyMs] = useState<number>(getAverageAiLatencyMs());
  const [sessionSeconds, setSessionSeconds] = useState<number>(0);
  const [showConfirmModal, setShowConfirmModal] = useState<boolean>(false);

  // Live session timer
  useEffect(() => {
    const timer = setInterval(() => {
      setSessionSeconds((s) => s + 1);
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const formatSessionTime = (totalSeconds: number) => {
    const mins = Math.floor(totalSeconds / 60);
    const secs = totalSeconds % 60;
    return `${mins.toString().padStart(2, '0')}m ${secs.toString().padStart(2, '0')}s`;
  };

  const handleClearData = () => {
    clearAllData();
    setIngestionCount(0);
    setShowConfirmModal(false);
    onDataReset();
  };

  const handleRestoreSample = () => {
    resetToSampleData();
    setIngestionCount(10);
    onDataReset();
  };

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* 1. Header Banner & Pitch */}
      <div className="bg-gradient-to-r from-blue-900 via-slate-900 to-slate-900 border-2 border-blue-600/50 rounded-3xl p-6 sm:p-8 shadow-2xl relative overflow-hidden">
        <div className="relative z-10 space-y-4">
          <div className="flex flex-wrap items-center gap-2">
            <span className="bg-blue-600 text-white font-extrabold text-xs px-3 py-1 rounded-full uppercase tracking-wider flex items-center gap-1.5 shadow">
              <ShieldAlert className="w-3.5 h-3.5" />
              CIVIC DISASTER RESPONSE PLATFORM
            </span>
            <span className="bg-slate-800 text-blue-300 border border-slate-700 text-xs px-3 py-1 rounded-full font-bold">
              Visakhapatnam, Andhra Pradesh, India
            </span>
          </div>

          <h1 className="text-2xl sm:text-4xl font-black text-white tracking-tight leading-tight">
            {t.appName}
          </h1>

          <p className="text-base sm:text-xl text-blue-100 font-medium leading-relaxed max-w-3xl">
            AI-powered road clearance coordination that turns chaotic post-storm reports into an
            instant, prioritized municipal command dashboard.
          </p>

          <p className="text-sm text-slate-300 leading-relaxed max-w-3xl pt-1">
            <strong>Our Pitch:</strong> DisasterTree transforms post-disaster road clearance by using
            AI and GIS mapping to turn chaotic public reports into an instant, prioritized municipal
            command dashboard.
          </p>

          {/* Primary Action Button */}
          <div className="pt-2">
            <button
              type="button"
              onClick={onOpenReportModal}
              className="bg-amber-500 hover:bg-amber-400 active:bg-amber-600 text-slate-950 font-black px-6 py-3 rounded-xl shadow-lg hover:shadow-amber-500/20 flex items-center gap-2 text-sm sm:text-base transition"
            >
              <Flame className="w-5 h-5 fill-current" />
              <span>{t.uploadAction}</span>
            </button>
          </div>
        </div>
      </div>

      {/* 2. STATS STRIP (Required by prompt: Ingestion count, AI latency <30s, Session engagement time) */}
      <section className="bg-slate-800/90 border border-slate-700 rounded-2xl p-5 shadow-lg">
        <div className="flex items-center justify-between mb-3 border-b border-slate-700 pb-2">
          <h2 className="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-2">
            <TrendingUp className="w-4 h-4 text-emerald-400" />
            {t.statsStripTitle}
          </h2>
          <span className="text-[11px] text-emerald-400 bg-emerald-950/80 border border-emerald-800 px-2 py-0.5 rounded font-mono">
            LIVE METRICS
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {/* Incident Ingestion Count */}
          <div className="bg-slate-900 p-4 rounded-xl border border-slate-700">
            <p className="text-xs text-slate-400 font-semibold uppercase">{t.ingestionCount}</p>
            <p className="text-3xl font-black text-white mt-1">{ingestionCount}</p>
            <p className="text-[11px] text-slate-400 mt-1">Geo-tagged reports processed</p>
          </div>

          {/* AI Processing Latency (<30s) */}
          <div className="bg-slate-900 p-4 rounded-xl border border-slate-700">
            <div className="flex items-center justify-between">
              <p className="text-xs text-slate-400 font-semibold uppercase">{t.processingLatency}</p>
              <span className="text-[10px] bg-blue-950 text-blue-300 font-bold px-1.5 py-0.5 rounded border border-blue-800">
                {t.latencyTarget}
              </span>
            </div>
            <p className="text-3xl font-black text-blue-400 mt-1">
              {(latencyMs / 1000).toFixed(2)}s
            </p>
            <p className="text-[11px] text-slate-400 mt-1">Average Gemini 3.8 Flash inference</p>
          </div>

          {/* Dispatcher Session Engagement Time */}
          <div className="bg-slate-900 p-4 rounded-xl border border-slate-700">
            <p className="text-xs text-slate-400 font-semibold uppercase">{t.sessionTime}</p>
            <p className="text-3xl font-black text-amber-400 font-mono mt-1">
              {formatSessionTime(sessionSeconds)}
            </p>
            <p className="text-[11px] text-slate-400 mt-1">Current command console session</p>
          </div>
        </div>
      </section>

      {/* 3. WHY IT MATTERS (2–3 Stat Cards on Home/About with exact cited sources) */}
      <section className="space-y-4">
        <div>
          <h2 className="text-xl sm:text-2xl font-black text-white">{t.whyMattersTitle}</h2>
          <p className="text-sm text-slate-400 mt-1">
            Empirical field data from coastal Bay of Bengal disaster events in Andhra Pradesh.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* Stat Card 1 */}
          <div className="bg-slate-800/90 border border-slate-700 rounded-2xl p-5 shadow-lg flex flex-col justify-between">
            <div className="space-y-2">
              <div className="w-10 h-10 rounded-xl bg-blue-500/10 border border-blue-500/30 flex items-center justify-center text-blue-400">
                <AlertTriangle className="w-5 h-5" />
              </div>
              <h3 className="text-base font-black text-white leading-snug">
                Widespread Tree Uprooting & Severe Road Disruptions
              </h3>
              <p className="text-xs text-slate-300 leading-relaxed">
                "Coastal storms in Visakhapatnam cause widespread tree uprooting and severe road
                disruptions."
              </p>
            </div>
            <div className="mt-4 pt-3 border-t border-slate-700/80">
              <span className="text-[11px] font-bold text-blue-400 uppercase tracking-wide">
                Source: Times of India
              </span>
            </div>
          </div>

          {/* Stat Card 2 */}
          <div className="bg-slate-800/90 border border-slate-700 rounded-2xl p-5 shadow-lg flex flex-col justify-between">
            <div className="space-y-2">
              <div className="w-10 h-10 rounded-xl bg-red-500/10 border border-red-500/30 flex items-center justify-center text-red-400">
                <Clock className="w-5 h-5" />
              </div>
              <h3 className="text-base font-black text-white leading-snug">
                Post-Disaster Logistics Crippled for Days
              </h3>
              <p className="text-xs text-slate-300 leading-relaxed">
                "Blocked roads cripple post-disaster transport and rescue logistics for days."
              </p>
            </div>
            <div className="mt-4 pt-3 border-t border-slate-700/80">
              <span className="text-[11px] font-bold text-red-400 uppercase tracking-wide">
                Source: NIDM Report
              </span>
            </div>
          </div>

          {/* Stat Card 3 */}
          <div className="bg-slate-800/90 border border-slate-700 rounded-2xl p-5 shadow-lg flex flex-col justify-between">
            <div className="space-y-2">
              <div className="w-10 h-10 rounded-xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400">
                <Compass className="w-5 h-5" />
              </div>
              <h3 className="text-base font-black text-white leading-snug">
                Absence of Micro-Level Crowdsourced Tools
              </h3>
              <p className="text-xs text-slate-300 leading-relaxed">
                "National emergency geo-portals lack micro-level civic crowdsourced workflow tools."
              </p>
            </div>
            <div className="mt-4 pt-3 border-t border-slate-700/80">
              <span className="text-[11px] font-bold text-amber-400 uppercase tracking-wide">
                Source: NDEM
              </span>
            </div>
          </div>
        </div>
      </section>

      {/* 4. THE PROBLEM, OUR SOLUTION & WHAT MAKES US DIFFERENT */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Problem */}
        <div className="bg-slate-800/90 border border-slate-700 rounded-2xl p-6 shadow-lg space-y-3">
          <div className="w-10 h-10 rounded-xl bg-red-950 border border-red-800 text-red-400 flex items-center justify-center font-bold">
            !
          </div>
          <h3 className="text-lg font-bold text-white">{t.problemTitle}</h3>
          <p className="text-sm text-slate-300 leading-relaxed">
            Municipal disaster authorities lose critical hours discovering and prioritizing post-storm
            road blockages because current reporting relies on fragmented manual communication.
          </p>
          <ul className="text-xs text-slate-400 space-y-1.5 list-disc pl-4 pt-2">
            <li>Unstructured citizen calls to emergency helplines clog communication lines</li>
            <li>Lack of visual hazard verification leads to unequipped crews arriving at sites</li>
            <li>Zero automated correlation between fallen trees and live 11kV/33kV power lines</li>
          </ul>
        </div>

        {/* Solution */}
        <div className="bg-slate-800/90 border border-slate-700 rounded-2xl p-6 shadow-lg space-y-3">
          <div className="w-10 h-10 rounded-xl bg-blue-950 border border-blue-800 text-blue-400 flex items-center justify-center">
            <CheckCircle2 className="w-5 h-5" />
          </div>
          <h3 className="text-lg font-bold text-white">{t.solutionTitle}</h3>
          <p className="text-sm text-slate-300 leading-relaxed">
            For municipal disaster commanders who struggle with uncoordinated road blockages after
            storms, DisasterTree is an AI-assisted coordination platform that automatically maps,
            parses, and prioritizes fallen tree incidents. Unlike manual phone logs and scattered
            WhatsApp reports, we connect instant visual detection with a real-time municipal
            command dashboard.
          </p>
        </div>
      </div>

      {/* 5. WHAT MAKES US DIFFERENT & USERS */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-slate-800/90 border border-slate-700 rounded-2xl p-6 shadow-lg space-y-3">
          <h3 className="text-base font-bold text-white flex items-center gap-2">
            <Award className="w-5 h-5 text-amber-400" />
            {t.diffTitle}
          </h3>
          <p className="text-sm text-slate-300 leading-relaxed">
            None of the existing tools combine lightweight AI image parsing of blockages with
            rule-based municipal emergency prioritization in a fast-deployment web dashboard.
          </p>
        </div>

        <div className="bg-slate-800/90 border border-slate-700 rounded-2xl p-6 shadow-lg space-y-3">
          <h3 className="text-base font-bold text-white flex items-center gap-2">
            <Users className="w-5 h-5 text-blue-400" />
            {t.usersTitle}
          </h3>
          <p className="text-sm text-slate-300 leading-relaxed">
            Municipal Command and Control Officers / Disaster Management Directors across Greater
            Visakhapatnam Municipal Corporation (GVMC) and coastal district emergency operations
            centers.
          </p>
        </div>
      </div>

      {/* 6. TEAM & COMMERCIAL SAAS PRICING */}
      <div className="bg-slate-800/90 border border-slate-700 rounded-2xl p-6 shadow-lg space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-700 pb-3">
          <div>
            <h3 className="text-lg font-black text-white">{t.teamTitle}</h3>
            <p className="text-xs text-slate-400">
              Civic Disaster Tech Specialists • Visakhapatnam, Andhra Pradesh, India
            </p>
          </div>
          <span className="text-xs bg-blue-950 text-blue-300 border border-blue-800 px-3 py-1 rounded-full font-bold">
            Team: Webuzz
          </span>
        </div>

        <div className="bg-slate-900 p-4 rounded-xl border border-slate-700 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="space-y-1">
            <span className="text-xs uppercase font-bold text-blue-400">{t.pricingTitle}</span>
            <p className="text-sm font-semibold text-slate-200">{t.pricingDetail}</p>
          </div>
          <div className="text-right sm:border-l sm:border-slate-800 sm:pl-4 shrink-0">
            <span className="text-xs text-slate-400">Subscription Fee</span>
            <p className="text-xl font-black text-emerald-400">₹5,00,000</p>
            <span className="text-[11px] text-slate-400">per city corporation / year</span>
          </div>
        </div>
      </div>

      {/* 7. DATA MANAGEMENT & RESET (Clear my data button) */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-lg flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h4 className="text-sm font-bold text-white">Local Incident Cache & Storage</h4>
          <p className="text-xs text-slate-400 mt-0.5">
            Reset local browser entries or restore the standard 10 Visakhapatnam storm records.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={handleRestoreSample}
            className="bg-slate-800 hover:bg-slate-700 text-slate-300 font-semibold text-xs px-3.5 py-2 rounded-xl border border-slate-700 flex items-center gap-1.5 transition"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            {t.restoreSampleBtn}
          </button>

          <button
            type="button"
            onClick={() => setShowConfirmModal(true)}
            className="bg-red-950/80 hover:bg-red-900 text-red-300 font-semibold text-xs px-3.5 py-2 rounded-xl border border-red-800 flex items-center gap-1.5 transition"
          >
            <Trash2 className="w-3.5 h-3.5" />
            {t.clearDataBtn}
          </button>
        </div>
      </div>

      {/* Confirmation Modal */}
      {showConfirmModal && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-700 rounded-2xl max-w-sm w-full p-5 space-y-4 shadow-2xl animate-in zoom-in-95 duration-150">
            <div className="w-10 h-10 rounded-xl bg-red-950 text-red-400 border border-red-800 flex items-center justify-center">
              <Trash2 className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-white">Clear All Local Data?</h3>
              <p className="text-xs text-slate-400 mt-1">{t.confirmClearPrompt}</p>
            </div>
            <div className="flex items-center justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setShowConfirmModal(false)}
                className="bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold px-3 py-2 rounded-lg"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleClearData}
                className="bg-red-600 hover:bg-red-500 text-white text-xs font-bold px-3 py-2 rounded-lg"
              >
                Yes, Clear Data
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
