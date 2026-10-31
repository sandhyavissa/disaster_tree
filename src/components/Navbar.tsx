import React from 'react';
import { ActiveScreen, Language } from '../types';
import { translations } from '../utils/translations';
import {
  ShieldAlert,
  MapPin,
  Camera,
  Layers,
  Info,
  Radio,
  FileCheck2,
} from 'lucide-react';

interface NavbarProps {
  activeScreen: ActiveScreen;
  setActiveScreen: (screen: ActiveScreen) => void;
  lang: Language;
  setLang: (lang: Language) => void;
  activeIncidentsCount: number;
  criticalCount: number;
  onOpenReportModal: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  activeScreen,
  setActiveScreen,
  lang,
  setLang,
  activeIncidentsCount,
  criticalCount,
  onOpenReportModal,
}) => {
  const t = translations[lang];

  return (
    <header className="sticky top-0 z-50 bg-slate-900 border-b border-slate-700 shadow-md">
      {/* Top emergency status ticker */}
      <div className="bg-blue-950/80 px-4 py-1.5 border-b border-blue-900/50 flex flex-wrap items-center justify-between text-xs text-blue-200">
        <div className="flex items-center gap-2">
          <span className="relative flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2 w-2 bg-red-500"></span>
          </span>
          <span className="font-semibold tracking-wide text-white uppercase flex items-center gap-1">
            <Radio className="w-3 h-3 text-red-400 animate-pulse" />
            {t.liveCommandActive}
          </span>
          <span className="text-blue-400">|</span>
          <span className="flex items-center gap-1 text-slate-300">
            <MapPin className="w-3 h-3 text-blue-400" />
            Visakhapatnam (GVMC), AP
          </span>
        </div>

        <div className="flex items-center gap-3">
          <span className="bg-red-950/80 text-red-300 border border-red-800/80 px-2 py-0.5 rounded text-[11px] font-medium">
            {criticalCount} Critical Lifelines Blocked
          </span>
          <span className="bg-slate-800 text-slate-300 px-2 py-0.5 rounded text-[11px]">
            {activeIncidentsCount} Active Blockages
          </span>
          {/* Language Toggle */}
          <div className="flex items-center bg-slate-800 rounded border border-slate-700 p-0.5 text-[11px] font-medium">
            <button
              type="button"
              onClick={() => setLang('en')}
              className={`px-2 py-0.5 rounded transition ${
                lang === 'en'
                  ? 'bg-blue-600 text-white font-bold'
                  : 'text-slate-400 hover:text-white'
              }`}
              title="English"
            >
              EN
            </button>
            <button
              type="button"
              onClick={() => setLang('te')}
              className={`px-2 py-0.5 rounded transition ${
                lang === 'te'
                  ? 'bg-blue-600 text-white font-bold'
                  : 'text-slate-400 hover:text-white'
              }`}
              title="Telugu (తెలుగు)"
            >
              తెలుగు
            </button>
          </div>
        </div>
      </div>

      {/* Main navigation row */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo / Title */}
          <div
            onClick={() => setActiveScreen('dashboard')}
            className="flex items-center gap-3 cursor-pointer select-none group"
          >
            <div className="w-10 h-10 rounded-lg bg-blue-600 flex items-center justify-center text-white shadow-lg shadow-blue-500/20 group-hover:bg-blue-500 transition">
              <ShieldAlert className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xl font-black tracking-tight text-white">
                  Disaster<span className="text-blue-400">Tree</span>
                </span>
                <span className="hidden sm:inline-block bg-blue-900/60 text-blue-300 text-[10px] font-semibold px-2 py-0.5 rounded border border-blue-700/50">
                  VIZAG COMMAND
                </span>
              </div>
              <p className="text-xs text-slate-400 hidden md:block">
                {t.tagline}
              </p>
            </div>
          </div>

          {/* Navigation Links */}
          <nav className="flex items-center gap-1 sm:gap-2">
            <button
              type="button"
              onClick={() => setActiveScreen('dashboard')}
              className={`flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm font-semibold transition ${
                activeScreen === 'dashboard'
                  ? 'bg-blue-600 text-white shadow-sm'
                  : 'text-slate-300 hover:text-white hover:bg-slate-800'
              }`}
            >
              <Layers className="w-4 h-4" />
              <span className="hidden sm:inline">{t.navDashboard}</span>
            </button>

            <button
              type="button"
              onClick={() => setActiveScreen('portal')}
              className={`flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm font-semibold transition ${
                activeScreen === 'portal'
                  ? 'bg-blue-600 text-white shadow-sm'
                  : 'text-slate-300 hover:text-white hover:bg-slate-800'
              }`}
            >
              <Camera className="w-4 h-4" />
              <span className="hidden sm:inline">{t.navPortal}</span>
            </button>

            <button
              type="button"
              onClick={() => setActiveScreen('triage')}
              className={`flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm font-semibold transition ${
                activeScreen === 'triage'
                  ? 'bg-blue-600 text-white shadow-sm'
                  : 'text-slate-300 hover:text-white hover:bg-slate-800'
              }`}
            >
              <FileCheck2 className="w-4 h-4" />
              <span className="hidden sm:inline">{t.navTriage}</span>
              {activeIncidentsCount > 0 && (
                <span className="ml-0.5 bg-amber-500 text-slate-950 text-xs font-bold px-1.5 py-0.2 rounded-full">
                  {activeIncidentsCount}
                </span>
              )}
            </button>

            <button
              type="button"
              onClick={() => setActiveScreen('about')}
              className={`flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm font-semibold transition ${
                activeScreen === 'about'
                  ? 'bg-blue-600 text-white shadow-sm'
                  : 'text-slate-300 hover:text-white hover:bg-slate-800'
              }`}
            >
              <Info className="w-4 h-4" />
              <span className="hidden sm:inline">{t.navAbout}</span>
            </button>
          </nav>

          {/* Main Action Big Button (Every screen requirement) */}
          <div className="flex items-center">
            <button
              type="button"
              onClick={onOpenReportModal}
              className="bg-amber-500 hover:bg-amber-400 active:bg-amber-600 text-slate-950 font-bold px-3.5 py-2 rounded-lg shadow-md hover:shadow-amber-500/20 transition flex items-center gap-2 text-sm"
              title={t.uploadAction}
            >
              <Camera className="w-4 h-4 text-slate-950" />
              <span className="hidden md:inline">{t.uploadAction}</span>
              <span className="md:hidden">{t.quickReport}</span>
            </button>
          </div>
        </div>
      </div>
    </header>
  );
};
