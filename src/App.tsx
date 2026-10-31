/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { Incident, ActiveScreen, Language, IncidentStatus } from './types';
import {
  getStoredIncidents,
  saveStoredIncidents,
  addIncident,
  updateIncidentStatus,
} from './utils/storage';
import { Navbar } from './components/Navbar';
import { StatsBanner } from './components/StatsBanner';
import { CommandMapDashboard } from './components/CommandMapDashboard';
import { FieldReportingPortal } from './components/FieldReportingPortal';
import { IncidentTriageDrawer } from './components/IncidentTriageDrawer';
import { AboutScreen } from './components/AboutScreen';

export default function App() {
  const [incidents, setIncidents] = useState<Incident[]>([]);
  const [activeScreen, setActiveScreen] = useState<ActiveScreen>('dashboard');
  const [selectedIncident, setSelectedIncident] = useState<Incident | null>(null);
  const [lang, setLang] = useState<Language>('en');
  const [isLoaded, setIsLoaded] = useState<boolean>(false);

  // Initialize data on mount
  useEffect(() => {
    const data = getStoredIncidents();
    setIncidents(data);
    if (data.length > 0) {
      // Default selected incident to first critical or first item
      const topPriority = [...data].sort((a, b) => b.priority_score - a.priority_score)[0];
      setSelectedIncident(topPriority);
    }
    setIsLoaded(true);
  }, []);

  // Handle new incident submitted from Field Reporting Portal
  const handleIncidentCreated = (newIncident: Incident) => {
    const updated = addIncident(newIncident);
    setIncidents(updated);
    setSelectedIncident(newIncident);
  };

  // Handle crew dispatch or status changes
  const handleUpdateStatus = (
    id: string,
    status: IncidentStatus,
    assignedCrew?: string
  ) => {
    const updated = updateIncidentStatus(id, status, assignedCrew);
    setIncidents(updated);
    if (selectedIncident && selectedIncident.id === id) {
      setSelectedIncident({
        ...selectedIncident,
        status,
        ...(assignedCrew ? { assignedCrew, dispatchTime: 'Just now' } : {}),
      });
    }
  };

  // Handle Data reset / re-seed
  const handleDataReset = () => {
    const fresh = getStoredIncidents();
    setIncidents(fresh);
    if (fresh.length > 0) {
      setSelectedIncident(fresh[0]);
    } else {
      setSelectedIncident(null);
    }
  };

  // Active incidents & critical count calculations
  const activeCount = incidents.filter((i) => i.status !== 'cleared').length;
  const criticalCount = incidents.filter(
    (i) => i.status !== 'cleared' && i.priority_score >= 9.0
  ).length;

  if (!isLoaded) {
    return (
      <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center p-4">
        <div className="w-10 h-10 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
        <p className="text-sm font-semibold text-slate-300 mt-4">
          Initializing Visakhapatnam DisasterTree Command...
        </p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col antialiased selection:bg-blue-600 selection:text-white">
      {/* Top Navigation */}
      <Navbar
        activeScreen={activeScreen}
        setActiveScreen={setActiveScreen}
        lang={lang}
        setLang={setLang}
        activeIncidentsCount={activeCount}
        criticalCount={criticalCount}
        onOpenReportModal={() => {
          setActiveScreen('portal');
          window.scrollTo({ top: 0, behavior: 'smooth' });
        }}
      />

      {/* Main Container */}
      <main className="flex-1 pb-16">
        {/* Banner with real-time stats across all screens */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-4">
          <StatsBanner incidents={incidents} lang={lang} />
        </div>

        {/* View Routing */}
        {activeScreen === 'dashboard' && (
          <CommandMapDashboard
            incidents={incidents}
            lang={lang}
            onSelectIncident={(incident) => {
              setSelectedIncident(incident);
              setActiveScreen('triage');
            }}
            onOpenReportModal={() => {
              setActiveScreen('portal');
              window.scrollTo({ top: 0, behavior: 'smooth' });
            }}
          />
        )}

        {activeScreen === 'portal' && (
          <FieldReportingPortal
            lang={lang}
            onIncidentCreated={handleIncidentCreated}
            onNavigateToDashboard={() => setActiveScreen('dashboard')}
          />
        )}

        {activeScreen === 'triage' && (
          <IncidentTriageDrawer
            incidents={incidents}
            selectedIncident={selectedIncident}
            onSelectIncident={setSelectedIncident}
            onUpdateStatus={handleUpdateStatus}
            lang={lang}
            onOpenReportModal={() => {
              setActiveScreen('portal');
              window.scrollTo({ top: 0, behavior: 'smooth' });
            }}
          />
        )}

        {activeScreen === 'about' && (
          <AboutScreen
            lang={lang}
            onDataReset={handleDataReset}
            onOpenReportModal={() => {
              setActiveScreen('portal');
              window.scrollTo({ top: 0, behavior: 'smooth' });
            }}
          />
        )}
      </main>

      {/* Footer */}
      <footer className="bg-slate-900 border-t border-slate-800 py-6 text-center text-xs text-slate-400">
        <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-3">
          <p>
            DisasterTree © 2026 • Visakhapatnam Municipal Corporation (GVMC) • Built by Team Webuzz
          </p>
          <p className="text-slate-500">
            Emergency Lifeline Coordination Platform • High-Visibility Utilitarian Mode
          </p>
        </div>
      </footer>
    </div>
  );
}
