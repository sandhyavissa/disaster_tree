import React, { useState, useMemo } from 'react';
import { Incident, Language } from '../types';
import { translations } from '../utils/translations';
import {
  Search,
  Filter,
  Maximize2,
  ZoomIn,
  ZoomOut,
  RotateCcw,
  AlertTriangle,
  Zap,
  CheckCircle2,
  Clock,
  Truck,
  Layers,
  MapPin,
  Flame,
  ArrowUpDown,
  ChevronRight,
  ShieldAlert,
} from 'lucide-react';

interface CommandMapDashboardProps {
  incidents: Incident[];
  lang: Language;
  onSelectIncident: (incident: Incident) => void;
  onOpenReportModal: () => void;
}

export const CommandMapDashboard: React.FC<CommandMapDashboardProps> = ({
  incidents,
  lang,
  onSelectIncident,
  onOpenReportModal,
}) => {
  const t = translations[lang];

  // Filters & Search
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [priorityFilter, setPriorityFilter] = useState<string>('all');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [routeFilter, setRouteFilter] = useState<string>('all');
  const [viewMode, setViewMode] = useState<'tactical' | 'satellite'>('tactical');
  const [highlightLifelines, setHighlightLifelines] = useState<boolean>(true);
  const [activeTab, setActiveTab] = useState<'map' | 'list'>('map');

  // Map Pan/Zoom state
  const [zoomLevel, setZoomLevel] = useState<number>(1);
  const [panOffset, setPanOffset] = useState<{ x: number; y: number }>({ x: 0, y: 0 });
  const [selectedPinId, setSelectedPinId] = useState<string | null>(null);

  // Visakhapatnam Geo-bounds for SVG projection
  // Lat approx: 17.65 (South/Gajuwaka) to 17.80 (North/Madhurawada)
  // Lng approx: 83.18 (West/Steel Plant) to 83.36 (East/Rushikonda)
  const MIN_LAT = 17.66;
  const MAX_LAT = 17.78;
  const MIN_LNG = 83.18;
  const MAX_LNG = 83.36;

  // Converts GPS coordinates to SVG coordinate system (width: 1000, height: 650)
  const projectGeoToSvg = (lat: number, lng: number) => {
    const x = ((lng - MIN_LNG) / (MAX_LNG - MIN_LNG)) * 820 + 90;
    // Latitude is inverted in SVG y-axis
    const y = ((MAX_LAT - lat) / (MAX_LAT - MIN_LAT)) * 520 + 65;
    return { x, y };
  };

  // Filtered and Ranked Incidents
  const filteredIncidents = useMemo(() => {
    return incidents
      .filter((inc) => {
        // Search query
        if (searchQuery.trim()) {
          const q = searchQuery.toLowerCase();
          const matchesTitle = inc.title.toLowerCase().includes(q);
          const matchesLocation = inc.locationName.toLowerCase().includes(q);
          const matchesNotes = inc.notes?.toLowerCase().includes(q);
          if (!matchesTitle && !matchesLocation && !matchesNotes) return false;
        }

        // Priority filter
        if (priorityFilter === 'critical' && inc.priority_score < 9.0) return false;
        if (
          priorityFilter === 'high' &&
          (inc.priority_score < 7.0 || inc.priority_score >= 9.0)
        )
          return false;
        if (
          priorityFilter === 'moderate' &&
          (inc.priority_score < 5.0 || inc.priority_score >= 7.0)
        )
          return false;
        if (priorityFilter === 'minor' && inc.priority_score >= 5.0) return false;

        // Status filter
        if (statusFilter !== 'all' && inc.status !== statusFilter) return false;

        // Route filter
        if (routeFilter !== 'all' && inc.routeType !== routeFilter) return false;

        return true;
      })
      .sort((a, b) => {
        // Highest priority score first
        return b.priority_score - a.priority_score;
      });
  }, [incidents, searchQuery, priorityFilter, statusFilter, routeFilter]);

  // Selected incident object
  const selectedIncident = useMemo(() => {
    if (!selectedPinId) return null;
    return incidents.find((i) => i.id === selectedPinId) || null;
  }, [incidents, selectedPinId]);

  // Helper for pin styling based on priority
  const getPinColor = (score: number) => {
    if (score >= 9.0) return { bg: '#dc2626', border: '#f87171', glow: 'rgba(239, 68, 68, 0.6)' };
    if (score >= 7.0) return { bg: '#ea580c', border: '#fb923c', glow: 'rgba(234, 88, 12, 0.5)' };
    if (score >= 5.0) return { bg: '#d97706', border: '#fbbf24', glow: 'rgba(217, 119, 6, 0.4)' };
    return { bg: '#16a34a', border: '#4ade80', glow: 'rgba(22, 163, 74, 0.3)' };
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-4">
      {/* Top Header & Toggles */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-xs font-bold text-blue-400 uppercase tracking-widest mb-0.5">
            <Layers className="w-4 h-4" />
            Command Map GIS Dashboard
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
            {t.dashboardTitle}
          </h1>
          <p className="text-xs sm:text-sm text-slate-300">{t.dashboardSubtitle}</p>
        </div>

        {/* View Switchers & Report CTA */}
        <div className="flex flex-wrap items-center gap-2">
          {/* Map vs List tabs */}
          <div className="bg-slate-800 p-1 rounded-xl border border-slate-700 flex items-center text-xs font-bold">
            <button
              type="button"
              onClick={() => setActiveTab('map')}
              className={`px-3 py-1.5 rounded-lg transition ${
                activeTab === 'map'
                  ? 'bg-blue-600 text-white shadow'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              Interactive Map
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('list')}
              className={`px-3 py-1.5 rounded-lg transition flex items-center gap-1.5 ${
                activeTab === 'list'
                  ? 'bg-blue-600 text-white shadow'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              Ranked Queue
              <span className="bg-amber-500 text-slate-950 px-1.5 py-0.2 rounded-full text-[10px]">
                {filteredIncidents.length}
              </span>
            </button>
          </div>

          {/* Upload Geo-tagged Photo Button (Main action requirement) */}
          <button
            type="button"
            onClick={onOpenReportModal}
            className="bg-amber-500 hover:bg-amber-400 active:bg-amber-600 text-slate-950 font-bold px-3.5 py-2 rounded-xl shadow-md flex items-center gap-2 text-xs sm:text-sm transition"
          >
            <Flame className="w-4 h-4 text-slate-950 fill-current" />
            <span>Upload Hazard Photo</span>
          </button>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-slate-800/90 border border-slate-700 rounded-2xl p-3 sm:p-4 shadow-lg">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
          {/* Search bar */}
          <div className="lg:col-span-2 relative">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder={t.searchPlaceholder}
              className="w-full bg-slate-900 border border-slate-700 rounded-xl pl-9 pr-3.5 py-2 text-xs sm:text-sm text-white placeholder-slate-500 focus:outline-none focus:border-blue-500"
            />
          </div>

          {/* Priority filter */}
          <div>
            <select
              value={priorityFilter}
              onChange={(e) => setPriorityFilter(e.target.value)}
              className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-xs sm:text-sm text-white focus:outline-none focus:border-blue-500"
            >
              <option value="all">{t.filterAll}</option>
              <option value="critical">{t.filterCritical}</option>
              <option value="high">{t.filterHigh}</option>
              <option value="moderate">{t.filterModerate}</option>
              <option value="minor">{t.filterMinor}</option>
            </select>
          </div>

          {/* Status filter */}
          <div>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-xs sm:text-sm text-white focus:outline-none focus:border-blue-500"
            >
              <option value="all">{t.filterStatusAll}</option>
              <option value="pending">{t.filterPending}</option>
              <option value="assigned">{t.filterAssigned}</option>
              <option value="in_progress">{t.filterInProgress}</option>
              <option value="cleared">{t.filterCleared}</option>
            </select>
          </div>

          {/* Route filter */}
          <div>
            <select
              value={routeFilter}
              onChange={(e) => setRouteFilter(e.target.value)}
              className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-xs sm:text-sm text-white focus:outline-none focus:border-blue-500"
            >
              <option value="all">All Corridors</option>
              <option value="Hospital Route">Hospital Route (Lifeline)</option>
              <option value="Emergency Shelter">Emergency Shelter</option>
              <option value="Major Artery">Major Artery</option>
              <option value="Transit Route">Transit Route</option>
              <option value="Industrial Lifeline">Industrial Lifeline</option>
              <option value="Residential">Residential</option>
              <option value="Commercial">Commercial</option>
            </select>
          </div>
        </div>

        {/* Quick Map Controls Row */}
        <div className="flex flex-wrap items-center justify-between gap-3 mt-3 pt-3 border-t border-slate-700/60 text-xs">
          <div className="flex items-center gap-3">
            <span className="text-slate-400 font-semibold">{t.priorityLegend}</span>
            <div className="flex items-center gap-1.5 text-[11px]">
              <span className="w-2.5 h-2.5 rounded-full bg-red-600 inline-block"></span>
              <span className="text-slate-300 font-bold">{t.criticalPriority}</span>
            </div>
            <div className="flex items-center gap-1.5 text-[11px]">
              <span className="w-2.5 h-2.5 rounded-full bg-orange-500 inline-block"></span>
              <span className="text-slate-300 font-bold">{t.highPriority}</span>
            </div>
            <div className="flex items-center gap-1.5 text-[11px]">
              <span className="w-2.5 h-2.5 rounded-full bg-amber-500 inline-block"></span>
              <span className="text-slate-300 font-bold">{t.moderatePriority}</span>
            </div>
            <div className="flex items-center gap-1.5 text-[11px]">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 inline-block"></span>
              <span className="text-slate-300 font-bold">{t.minorPriority}</span>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <label className="flex items-center gap-1.5 text-slate-300 cursor-pointer select-none">
              <input
                type="checkbox"
                checked={highlightLifelines}
                onChange={(e) => setHighlightLifelines(e.target.checked)}
                className="rounded border-slate-600 text-blue-600 focus:ring-0"
              />
              <span className="text-xs">{t.highlightLifelines}</span>
            </label>

            <button
              type="button"
              onClick={() => setViewMode(viewMode === 'tactical' ? 'satellite' : 'tactical')}
              className="bg-slate-700 hover:bg-slate-600 text-slate-200 px-2.5 py-1 rounded-lg border border-slate-600 text-[11px] font-semibold transition"
            >
              {viewMode === 'tactical' ? t.satelliteView : t.tacticalView}
            </button>
          </div>
        </div>
      </div>

      {/* MAIN VIEW CONTENT: MAP OR LIST */}
      {activeTab === 'map' ? (
        <div className="relative bg-slate-950 border border-slate-800 rounded-2xl overflow-hidden shadow-2xl">
          {/* Map floating controls */}
          <div className="absolute top-4 right-4 z-20 flex flex-col gap-1.5 bg-slate-900/90 backdrop-blur border border-slate-700 p-1 rounded-xl shadow-lg">
            <button
              type="button"
              onClick={() => setZoomLevel((z) => Math.min(z + 0.25, 2.5))}
              className="p-2 text-slate-300 hover:text-white hover:bg-slate-800 rounded-lg transition"
              title="Zoom In"
            >
              <ZoomIn className="w-4 h-4" />
            </button>
            <button
              type="button"
              onClick={() => setZoomLevel((z) => Math.max(z - 0.25, 0.75))}
              className="p-2 text-slate-300 hover:text-white hover:bg-slate-800 rounded-lg transition"
              title="Zoom Out"
            >
              <ZoomOut className="w-4 h-4" />
            </button>
            <button
              type="button"
              onClick={() => {
                setZoomLevel(1);
                setPanOffset({ x: 0, y: 0 });
              }}
              className="p-2 text-slate-300 hover:text-white hover:bg-slate-800 rounded-lg transition"
              title={t.resetMap}
            >
              <RotateCcw className="w-4 h-4" />
            </button>
          </div>

          {/* Interactive SVG GIS Map of Visakhapatnam */}
          <div className="w-full h-[540px] sm:h-[620px] overflow-hidden select-none cursor-grab active:cursor-grabbing bg-slate-950 relative">
            <svg
              viewBox="0 0 1000 650"
              className="w-full h-full"
              style={{
                transform: `scale(${zoomLevel}) translate(${panOffset.x}px, ${panOffset.y}px)`,
                transformOrigin: 'center center',
                transition: 'transform 0.2s ease-out',
              }}
            >
              <defs>
                {/* Coastal Bay of Bengal gradient */}
                <linearGradient id="oceanGrad" x1="0" y1="0" x2="1" y2="1">
                  <stop offset="0%" stop-color={viewMode === 'tactical' ? '#091c36' : '#04172e'} />
                  <stop offset="100%" stop-color={viewMode === 'tactical' ? '#020b17' : '#010c1a'} />
                </linearGradient>

                {/* Landmass gradient */}
                <linearGradient id="landGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stop-color={viewMode === 'tactical' ? '#1e293b' : '#14231b'} />
                  <stop offset="100%" stop-color={viewMode === 'tactical' ? '#0f172a' : '#0d1813'} />
                </linearGradient>

                {/* Hill terrain pattern */}
                <pattern id="hillHatch" width="20" height="20" patternUnits="userSpaceOnUse">
                  <path d="M 0 20 L 20 0" stroke={viewMode === 'tactical' ? '#334155' : '#2d4233'} strokeWidth="1" opacity="0.4" />
                </pattern>

                {/* Grid pattern */}
                <pattern id="gridPattern" width="50" height="50" patternUnits="userSpaceOnUse">
                  <path d="M 50 0 L 0 0 0 50" fill="none" stroke="#1e293b" strokeWidth="0.5" />
                </pattern>
              </defs>

              {/* Base Land Grid */}
              <rect width="1000" height="650" fill="url(#landGrad)" />
              <rect width="1000" height="650" fill="url(#gridPattern)" opacity="0.6" />

              {/* Bay of Bengal Sea Coastline (East & South-East of Visakhapatnam) */}
              <path
                d="M 680 0 Q 720 180 620 320 Q 560 410 490 480 Q 440 540 400 650 L 1000 650 L 1000 0 Z"
                fill="url(#oceanGrad)"
                stroke="#0284c7"
                strokeWidth="2.5"
                opacity="0.9"
              />

              {/* Coastline Surf & Sand Shore (RK Beach, Rushikonda, Lawsons Bay) */}
              <path
                d="M 680 0 Q 720 180 620 320 Q 560 410 490 480 Q 440 540 400 650"
                fill="none"
                stroke="#e2e8f0"
                strokeWidth="1.5"
                strokeDasharray="4,4"
                opacity="0.4"
              />

              {/* Bay of Bengal Watermark */}
              <text x="820" y="420" fill="#0284c7" fillOpacity="0.3" fontSize="24" fontWeight="bold" letterSpacing="4">
                BAY OF BENGAL
              </text>
              <text x="840" y="445" fill="#38bdf8" fillOpacity="0.25" fontSize="12" letterSpacing="2">
                COASTAL SURGE ZONE
              </text>

              {/* Visakhapatnam Port Harbor Basin */}
              <path
                d="M 440 500 Q 410 470 380 500 Q 360 520 380 550 Q 430 550 440 500 Z"
                fill="#07192f"
                stroke="#0369a1"
                strokeWidth="1.5"
              />
              <text x="390" y="530" fill="#94a3b8" fontSize="11" fontWeight="bold">
                Vizag Port
              </text>

              {/* Dolphin's Nose Headland / Lighthouse */}
              <path
                d="M 430 540 Q 480 560 460 610 Q 410 600 400 560 Z"
                fill="#334155"
                stroke="#475569"
                strokeWidth="1.5"
              />
              <text x="420" y="585" fill="#cbd5e1" fontSize="10" fontWeight="bold">
                Dolphin's Nose
              </text>

              {/* Kailasagiri Hills Range (North-East) */}
              <ellipse cx="640" cy="180" rx="90" ry="45" fill="url(#hillHatch)" stroke="#475569" strokeWidth="1" />
              <text x="640" y="185" fill="#94a3b8" fontSize="12" fontWeight="bold" textAnchor="middle">
                Kailasagiri Hills
              </text>

              {/* Simhachalam Hill Range (West / North-West) */}
              <ellipse cx="230" cy="150" rx="110" ry="55" fill="url(#hillHatch)" stroke="#475569" strokeWidth="1" />
              <text x="230" y="155" fill="#94a3b8" fontSize="12" fontWeight="bold" textAnchor="middle">
                Simhachalam Hills
              </text>

              {/* Major Highway Corridors (NH16 / Arterial grid) */}
              {/* NH16 Spine: Gajuwaka -> NAD -> Akkayyapalem -> Maddilapalem -> Madhurawada */}
              <path
                d="M 120 540 Q 240 440 310 330 T 480 230 T 700 80"
                fill="none"
                stroke="#475569"
                strokeWidth="8"
                opacity="0.8"
              />
              <path
                d="M 120 540 Q 240 440 310 330 T 480 230 T 700 80"
                fill="none"
                stroke="#f59e0b"
                strokeWidth="2"
                strokeDasharray="10,6"
              />
              <text x="140" y="520" fill="#fbbf24" fontSize="11" fontWeight="bold">
                NH-16 Corridor
              </text>

              {/* Beach Road Spine (RK Beach -> Rushikonda) */}
              <path
                d="M 430 460 Q 510 370 560 270 T 660 80"
                fill="none"
                stroke="#38bdf8"
                strokeWidth="4"
                opacity="0.7"
              />

              {/* Inner City Arteries (Siripuram - MVP Colony - Seethammadhara - Dwaraka Nagar) */}
              <line x1="380" y1="360" x2="480" y2="230" stroke="#64748b" strokeWidth="3" opacity="0.6" />
              <line x1="480" y1="230" x2="570" y2="200" stroke="#64748b" strokeWidth="3" opacity="0.6" />
              <line x1="380" y1="360" x2="470" y2="390" stroke="#64748b" strokeWidth="3" opacity="0.6" />
              <line x1="470" y1="390" x2="520" y2="350" stroke="#64748b" strokeWidth="3" opacity="0.6" />

              {/* Highlight Critical Lifeline Corridors in Red Neon if toggled */}
              {highlightLifelines && (
                <g className="animate-pulse">
                  {/* Maddilapalem Hospital corridor */}
                  <line x1="460" y1="220" x2="510" y2="250" stroke="#ef4444" strokeWidth="8" strokeLinecap="round" opacity="0.6" />
                  {/* Seethammadhara shelter route */}
                  <line x1="450" y1="180" x2="480" y2="210" stroke="#ef4444" strokeWidth="8" strokeLinecap="round" opacity="0.6" />
                  {/* Gajuwaka Lifeline */}
                  <line x1="160" y1="500" x2="210" y2="470" stroke="#ef4444" strokeWidth="8" strokeLinecap="round" opacity="0.6" />
                </g>
              )}

              {/* Zone / Landmark Civic Text Labels */}
              <text x="490" y="215" fill="#f8fafc" fontSize="12" fontWeight="bold">Maddilapalem</text>
              <text x="580" y="210" fill="#94a3b8" fontSize="11" fontWeight="semibold">MVP Colony</text>
              <text x="440" y="175" fill="#f8fafc" fontSize="11" fontWeight="bold">Seethammadhara</text>
              <text x="470" y="380" fill="#cbd5e1" fontSize="11" fontWeight="bold">Siripuram</text>
              <text x="535" y="365" fill="#38bdf8" fontSize="11" fontWeight="bold">RK Beach</text>
              <text x="350" y="350" fill="#94a3b8" fontSize="11" fontWeight="semibold">Dwaraka Nagar</text>
              <text x="310" y="315" fill="#cbd5e1" fontSize="11" fontWeight="semibold">Akkayyapalem</text>
              <text x="330" y="420" fill="#94a3b8" fontSize="11">DAB Gardens</text>
              <text x="140" y="560" fill="#f8fafc" fontSize="12" fontWeight="bold">Gajuwaka Industrial</text>

              {/* Render Incident Blockage Pins */}
              {filteredIncidents.map((incident) => {
                const { x, y } = projectGeoToSvg(incident.lat, incident.lng);
                const isSelected = selectedPinId === incident.id;
                const isCritical = incident.priority_score >= 9.0;
                const pin = getPinColor(incident.priority_score);
                const isCleared = incident.status === 'cleared';

                return (
                  <g
                    key={incident.id}
                    className="cursor-pointer transition-transform duration-150 hover:scale-125"
                    onClick={() => {
                      setSelectedPinId(incident.id);
                      onSelectIncident(incident);
                    }}
                    style={{ transformOrigin: `${x}px ${y}px` }}
                  >
                    {/* Pulsing ring for Critical Lifelines */}
                    {isCritical && !isCleared && (
                      <circle
                        cx={x}
                        cy={y}
                        r="24"
                        fill="none"
                        stroke="#ef4444"
                        strokeWidth="2.5"
                        className="animate-ping"
                        opacity="0.75"
                      />
                    )}

                    {/* Outer glow ring */}
                    <circle
                      cx={x}
                      cy={y}
                      r={isSelected ? 18 : 14}
                      fill={pin.bg}
                      opacity={isSelected ? 0.35 : 0.2}
                    />

                    {/* Main Pin Body */}
                    <circle
                      cx={x}
                      cy={y}
                      r={isSelected ? 12 : 9.5}
                      fill={pin.bg}
                      stroke={isSelected ? '#ffffff' : pin.border}
                      strokeWidth={isSelected ? 3 : 2}
                      filter="drop-shadow(0 2px 4px rgba(0,0,0,0.6))"
                    />

                    {/* Center Icon/Indicator */}
                    {isCleared ? (
                      <path
                        d={`M ${x - 4} ${y} L ${x - 1} ${y + 3} L ${x + 4} ${y - 3}`}
                        fill="none"
                        stroke="#ffffff"
                        strokeWidth="2"
                        strokeLinecap="round"
                      />
                    ) : incident.hazard === 'live_electrical_wire' ? (
                      <polygon
                        points={`${x},${y - 5} ${x + 3},${y - 1} ${x + 1},${y - 1} ${x + 4},${y + 4} ${x - 1},${y + 1} ${x + 1},${y + 1} ${x - 3},${y + 5}`}
                        fill="#fef08a"
                      />
                    ) : (
                      <text
                        x={x}
                        y={y + 3.5}
                        fill="#ffffff"
                        fontSize={isSelected ? 10 : 8.5}
                        fontWeight="900"
                        textAnchor="middle"
                      >
                        {Math.round(incident.priority_score)}
                      </text>
                    )}

                    {/* Pin Label Tag */}
                    <rect
                      x={x + 14}
                      y={y - 12}
                      width={incident.locationName.length * 6.5 + 40}
                      height="20"
                      rx="4"
                      fill="#0f172a"
                      fillOpacity="0.9"
                      stroke={pin.border}
                      strokeWidth="1"
                    />
                    <text
                      x={x + 18}
                      y={y + 2}
                      fill="#f8fafc"
                      fontSize="9.5"
                      fontWeight="bold"
                    >
                      {incident.locationName}
                    </text>
                    <text
                      x={x + incident.locationName.length * 6.5 + 26}
                      y={y + 2}
                      fill={pin.border}
                      fontSize="9"
                      fontWeight="900"
                    >
                      P{incident.priority_score}
                    </text>
                  </g>
                );
              })}
            </svg>
          </div>

          {/* Empty state overlay when no pins match search/filter */}
          {filteredIncidents.length === 0 && (
            <div className="absolute inset-0 bg-slate-950/80 backdrop-blur-sm flex flex-col items-center justify-center p-6 text-center z-10">
              <ShieldAlert className="w-12 h-12 text-slate-500 mb-3" />
              <p className="text-lg font-bold text-white">No Matching Blockage Reports Found</p>
              <p className="text-sm text-slate-400 max-w-md mt-1">
                Try adjusting your search criteria, clearing the priority filter, or submit a new
                post-storm hazard report.
              </p>
              <button
                type="button"
                onClick={() => {
                  setSearchQuery('');
                  setPriorityFilter('all');
                  setStatusFilter('all');
                  setRouteFilter('all');
                }}
                className="mt-4 bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs px-4 py-2 rounded-xl transition"
              >
                Reset All Filters
              </button>
            </div>
          )}

          {/* Floating Selected Pin Quick Card (Bottom of map) */}
          {selectedIncident && (
            <div className="absolute bottom-4 left-4 right-4 sm:left-auto sm:right-4 sm:max-w-md z-30 bg-slate-900/95 backdrop-blur-md border-2 border-blue-500 rounded-2xl p-4 shadow-2xl animate-in slide-in-from-bottom duration-200">
              <div className="flex items-start justify-between gap-2">
                <div>
                  <div className="flex items-center gap-2">
                    <span
                      className={`text-[10px] font-black px-2 py-0.5 rounded uppercase tracking-wider ${
                        selectedIncident.priority_score >= 9.0
                          ? 'bg-red-950 text-red-300 border border-red-700'
                          : selectedIncident.priority_score >= 7.0
                          ? 'bg-orange-950 text-orange-300 border border-orange-700'
                          : 'bg-blue-950 text-blue-300 border border-blue-700'
                      }`}
                    >
                      Priority {selectedIncident.priority_score} / 10.0
                    </span>
                    <span className="text-xs text-slate-400 capitalize bg-slate-800 px-2 py-0.5 rounded">
                      {selectedIncident.status}
                    </span>
                  </div>
                  <h3 className="text-base font-black text-white mt-1">
                    {selectedIncident.locationName}
                  </h3>
                  <p className="text-xs text-slate-300">
                    {selectedIncident.routeType} • {selectedIncident.obstruction.replace(/_/g, ' ')}
                  </p>
                </div>

                {selectedIncident.hazard === 'live_electrical_wire' && (
                  <div className="bg-amber-950/80 border border-amber-600 p-2 rounded-xl text-amber-400 flex flex-col items-center">
                    <Zap className="w-5 h-5 animate-pulse" />
                    <span className="text-[9px] font-bold mt-0.5">LIVE WIRE</span>
                  </div>
                )}
              </div>

              <p className="text-xs text-slate-300 mt-2 line-clamp-2 bg-slate-800/80 p-2 rounded-lg border border-slate-700">
                "{selectedIncident.recommendation}"
              </p>

              <div className="flex items-center justify-between mt-3 pt-2 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setSelectedPinId(null)}
                  className="text-xs text-slate-400 hover:text-white"
                >
                  Dismiss
                </button>
                <button
                  type="button"
                  onClick={() => onSelectIncident(selectedIncident)}
                  className="bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs px-3.5 py-1.5 rounded-lg flex items-center gap-1.5 shadow transition"
                >
                  <span>Open Triage Drawer</span>
                  <ChevronRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          )}
        </div>
      ) : (
        /* RANKED QUEUE LIST VIEW */
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 shadow-xl space-y-3">
          <div className="flex items-center justify-between border-b border-slate-800 pb-3">
            <div className="flex items-center gap-2 text-sm font-bold text-white">
              <ArrowUpDown className="w-4 h-4 text-blue-400" />
              <span>Ranked Post-Storm Emergency Clearance Queue</span>
            </div>
            <span className="text-xs text-slate-400">
              Sorted by Severity & Critical Infrastructure Lifelines
            </span>
          </div>

          <div className="divide-y divide-slate-800">
            {filteredIncidents.map((incident, idx) => {
              const isCritical = incident.priority_score >= 9.0;
              const isWire = incident.hazard === 'live_electrical_wire';

              return (
                <div
                  key={incident.id}
                  onClick={() => onSelectIncident(incident)}
                  className="py-3 px-2 sm:px-3 rounded-xl hover:bg-slate-800/60 cursor-pointer transition flex flex-col sm:flex-row sm:items-center justify-between gap-3 group"
                >
                  <div className="flex items-start gap-3">
                    {/* Rank Number */}
                    <div className="w-7 h-7 rounded-lg bg-slate-800 border border-slate-700 text-xs font-mono font-bold flex items-center justify-center text-slate-300 shrink-0 mt-0.5">
                      #{idx + 1}
                    </div>

                    {/* Thumbnail */}
                    <img
                      src={incident.photoUrl}
                      alt={incident.locationName}
                      className="w-16 h-12 rounded-lg object-cover border border-slate-700 shrink-0"
                    />

                    <div>
                      <div className="flex flex-wrap items-center gap-2 mb-0.5">
                        <h4 className="text-sm font-bold text-white group-hover:text-blue-400 transition">
                          {incident.locationName}
                        </h4>
                        {incident.isSample && (
                          <span className="text-[10px] bg-slate-800 text-slate-400 px-1.5 py-0.2 rounded border border-slate-700">
                            Sample
                          </span>
                        )}
                        <span className="text-[11px] bg-blue-950/80 text-blue-300 px-2 py-0.2 rounded font-medium border border-blue-800">
                          {incident.routeType}
                        </span>
                      </div>
                      <p className="text-xs text-slate-300 line-clamp-1">
                        {incident.notes || incident.recommendation}
                      </p>
                    </div>
                  </div>

                  {/* Badges & Scores */}
                  <div className="flex items-center gap-2 self-end sm:self-center shrink-0">
                    {isWire && (
                      <span className="bg-amber-950/80 text-amber-300 border border-amber-700 text-[11px] font-bold px-2 py-1 rounded-lg flex items-center gap-1">
                        <Zap className="w-3.5 h-3.5 text-amber-400" />
                        Live Wire
                      </span>
                    )}

                    <div
                      className={`text-xs font-black px-2.5 py-1 rounded-lg border ${
                        isCritical
                          ? 'bg-red-950/80 text-red-300 border-red-700'
                          : incident.priority_score >= 7.0
                          ? 'bg-orange-950/80 text-orange-300 border-orange-700'
                          : 'bg-slate-800 text-slate-300 border-slate-700'
                      }`}
                    >
                      P {incident.priority_score}
                    </div>

                    <span
                      className={`text-xs px-2.5 py-1 rounded-lg font-semibold capitalize ${
                        incident.status === 'cleared'
                          ? 'bg-emerald-950/80 text-emerald-300 border border-emerald-800'
                          : incident.status === 'assigned'
                          ? 'bg-blue-950/80 text-blue-300 border border-blue-800'
                          : 'bg-slate-800 text-slate-300'
                      }`}
                    >
                      {incident.status}
                    </span>

                    <ChevronRight className="w-4 h-4 text-slate-500 group-hover:text-white transition" />
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};
