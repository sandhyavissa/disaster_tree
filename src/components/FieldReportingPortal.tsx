import React, { useState, useRef } from 'react';
import { Incident, Language, RouteType, AIAnalysis } from '../types';
import { translations } from '../utils/translations';
import { recordAiLatency } from '../utils/storage';
import {
  Camera,
  Upload,
  MapPin,
  Compass,
  AlertTriangle,
  Zap,
  Sparkles,
  CheckCircle,
  AlertCircle,
  RotateCcw,
  Send,
  ShieldCheck,
  ChevronRight,
  Flame,
} from 'lucide-react';

interface FieldReportingPortalProps {
  lang: Language;
  onIncidentCreated: (incident: Incident) => void;
  onNavigateToDashboard: () => void;
}

// Preset realistic storm field scenarios in Visakhapatnam for rapid demo verification
const PRESET_SCENARIOS = [
  {
    id: 'banyan-maddilapalem',
    title: 'Maddilapalem Highway Banyan + Sagging 11kV Line',
    locationName: 'Maddilapalem Junction, NH16 Corridor',
    landmark: 'Near Apollo Clinic & RTC Complex',
    routeType: 'Hospital Route' as RouteType,
    lat: 17.7384,
    lng: 83.3174,
    description:
      'Massive uprooted banyan tree completely blocking two lanes on Maddilapalem highway with visible sagging electrical line and sparking near transformer pole.',
    badge: 'Critical Lifeline',
    sampleImage:
      'data:image/svg+xml;utf8,' +
      encodeURIComponent(`
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 600 400" width="600" height="400">
        <rect width="600" height="240" fill="#1e293b"/>
        <rect y="240" width="600" height="160" fill="#0f172a"/>
        <line x1="0" y1="320" x2="600" y2="320" stroke="#f59e0b" stroke-width="5" stroke-dasharray="20,15"/>
        <rect x="80" y="90" width="12" height="150" fill="#64748b"/>
        <rect x="520" y="90" width="12" height="150" fill="#64748b"/>
        <path d="M80 110 Q 300 280 520 110" fill="none" stroke="#ef4444" stroke-width="6" stroke-dasharray="8,4"/>
        <path d="M120 350 L 480 270 L 510 290 L 150 375 Z" fill="#713f12"/>
        <circle cx="140" cy="340" r="50" fill="#14532d"/>
        <circle cx="200" cy="310" r="45" fill="#166534"/>
        <circle cx="270" cy="285" r="40" fill="#15803d"/>
        <polygon points="300,270 320,250 312,275 335,275 308,300 314,283 295,283" fill="#facc15" stroke="#ef4444" stroke-width="1.5"/>
        <text x="30" y="45" fill="#f8fafc" font-family="sans-serif" font-size="16" font-weight="bold">FIELD CAPTURE: Maddilapalem Highway (Active Hazard)</text>
      </svg>`),
  },
  {
    id: 'shelter-seethammadhara',
    title: 'Seethammadhara North Shelter Access Blocked',
    locationName: 'Seethammadhara North Relief Road',
    landmark: 'Behind GVMC Community Hall',
    routeType: 'Emergency Shelter' as RouteType,
    lat: 17.7478,
    lng: 83.315,
    description:
      'Heavy rain tree flattened across municipal road right outside community relief shelter, tangled with street lighting cable.',
    badge: 'Shelter Route',
    sampleImage:
      'data:image/svg+xml;utf8,' +
      encodeURIComponent(`
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 600 400" width="600" height="400">
        <rect width="600" height="230" fill="#334155"/>
        <rect y="230" width="600" height="170" fill="#1e293b"/>
        <line x1="0" y1="315" x2="600" y2="315" stroke="#f59e0b" stroke-width="4" stroke-dasharray="15,10"/>
        <path d="M100 340 L 500 280 L 510 300 L 120 365 Z" fill="#854d0e"/>
        <circle cx="150" cy="330" r="55" fill="#166534"/>
        <circle cx="230" cy="310" r="45" fill="#15803d"/>
        <circle cx="310" cy="295" r="40" fill="#166534"/>
        <text x="30" y="45" fill="#f8fafc" font-family="sans-serif" font-size="16" font-weight="bold">FIELD CAPTURE: Seethammadhara Shelter Access</text>
      </svg>`),
  },
  {
    id: 'beachroad-pelto',
    title: 'Beach Road (RK Beach) Single Lane Obstruction',
    locationName: 'Beach Road, RK Beach Promenade',
    landmark: 'Adjacent to INS Kursura Submarine Museum',
    routeType: 'Residential' as RouteType,
    lat: 17.7126,
    lng: 83.3243,
    description:
      'Large peltophorum tree limb snapped on coastal promenade, partially blocking seaside lane. No electrical cables involved.',
    badge: 'Single Lane',
    sampleImage:
      'data:image/svg+xml;utf8,' +
      encodeURIComponent(`
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 600 400" width="600" height="400">
        <rect width="600" height="200" fill="#1e3a8a"/>
        <rect y="200" width="600" height="200" fill="#334155"/>
        <line x1="0" y1="300" x2="600" y2="300" stroke="#f8fafc" stroke-width="4" stroke-dasharray="25,15"/>
        <path d="M350 320 L 560 260 L 580 275 L 370 340 Z" fill="#854d0e"/>
        <circle cx="480" cy="270" r="40" fill="#166534"/>
        <text x="30" y="45" fill="#f8fafc" font-family="sans-serif" font-size="16" font-weight="bold">FIELD CAPTURE: RK Beach Promenade</text>
      </svg>`),
  },
  {
    id: 'gajuwaka-industrial',
    title: 'Gajuwaka Steel Plant Trunk with Power Line',
    locationName: 'Gajuwaka Steel Plant Expressway',
    landmark: 'Near Industrial Feeder Gate 3',
    routeType: 'Industrial Lifeline' as RouteType,
    lat: 17.691,
    lng: 83.214,
    description:
      'Huge eucalyptus tree uprooted on industrial 4-lane spine, high-tension distribution lines snapped and grounded on wet asphalt.',
    badge: 'Industrial Spine',
    sampleImage:
      'data:image/svg+xml;utf8,' +
      encodeURIComponent(`
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 600 400" width="600" height="400">
        <rect width="600" height="230" fill="#0f172a"/>
        <rect y="230" width="600" height="170" fill="#1e293b"/>
        <path d="M60 120 Q 300 310 540 120" fill="none" stroke="#ef4444" stroke-width="6"/>
        <polygon points="310,290 330,270 322,295 345,295 318,320 324,303 305,303" fill="#facc15" stroke="#ef4444" stroke-width="1.5"/>
        <path d="M80 340 L 520 260 L 540 280 L 100 365 Z" fill="#581c87"/>
        <circle cx="160" cy="330" r="50" fill="#15803d"/>
        <text x="30" y="45" fill="#f8fafc" font-family="sans-serif" font-size="16" font-weight="bold">FIELD CAPTURE: Gajuwaka Steel Expressway</text>
      </svg>`),
  },
];

const VIZAG_LANDMARKS = [
  { name: 'Maddilapalem Junction', lat: 17.7384, lng: 83.3174, defaultRoute: 'Hospital Route' },
  { name: 'Siripuram Circle', lat: 17.7251, lng: 83.3178, defaultRoute: 'Major Artery' },
  { name: 'Seethammadhara North', lat: 17.7478, lng: 83.315, defaultRoute: 'Emergency Shelter' },
  { name: 'Beach Road, RK Beach', lat: 17.7126, lng: 83.3243, defaultRoute: 'Residential' },
  { name: 'MVP Colony Sector 4', lat: 17.7412, lng: 83.3371, defaultRoute: 'Standard Road' },
  { name: 'Gajuwaka Steel Plant Rd', lat: 17.691, lng: 83.214, defaultRoute: 'Industrial Lifeline' },
  { name: 'Akkayyapalem 100ft Rd', lat: 17.7335, lng: 83.3032, defaultRoute: 'Transit Route' },
  { name: 'DAB Gardens Main Road', lat: 17.718, lng: 83.3015, defaultRoute: 'Commercial' },
  { name: 'Waltair Uplands', lat: 17.7265, lng: 83.3292, defaultRoute: 'Residential' },
  { name: 'Jagadamba Junction', lat: 17.7145, lng: 83.3035, defaultRoute: 'Major Artery' },
];

export const FieldReportingPortal: React.FC<FieldReportingPortalProps> = ({
  lang,
  onIncidentCreated,
  onNavigateToDashboard,
}) => {
  const t = translations[lang];
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Form states
  const [photoPreview, setPhotoPreview] = useState<string>(PRESET_SCENARIOS[0].sampleImage);
  const [locationName, setLocationName] = useState<string>(PRESET_SCENARIOS[0].locationName);
  const [landmarkDetails, setLandmarkDetails] = useState<string>(PRESET_SCENARIOS[0].landmark);
  const [lat, setLat] = useState<number>(PRESET_SCENARIOS[0].lat);
  const [lng, setLng] = useState<number>(PRESET_SCENARIOS[0].lng);
  const [routeType, setRouteType] = useState<RouteType>('Hospital Route');
  const [notes, setNotes] = useState<string>(PRESET_SCENARIOS[0].description);

  // AI & Submission states
  const [isAnalyzing, setIsAnalyzing] = useState<boolean>(false);
  const [analysisResult, setAnalysisResult] = useState<AIAnalysis | null>(null);
  const [analysisLatency, setAnalysisLatency] = useState<number | null>(null);
  const [analysisError, setAnalysisError] = useState<string | null>(null);
  const [isSubmitted, setIsSubmitted] = useState<boolean>(false);
  const [gpsAcquiring, setGpsAcquiring] = useState<boolean>(false);
  const [gpsMessage, setGpsMessage] = useState<string | null>(null);

  // Handle Photo selection from camera or file
  const handlePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = () => {
        if (typeof reader.result === 'string') {
          setPhotoPreview(reader.result);
          setAnalysisResult(null);
          setIsSubmitted(false);
          setAnalysisError(null);
        }
      };
      reader.readAsDataURL(file);
    }
  };

  // Preset selector
  const handleSelectPreset = (scenario: typeof PRESET_SCENARIOS[0]) => {
    setPhotoPreview(scenario.sampleImage);
    setLocationName(scenario.locationName);
    setLandmarkDetails(scenario.landmark);
    setLat(scenario.lat);
    setLng(scenario.lng);
    setRouteType(scenario.routeType);
    setNotes(scenario.description);
    setAnalysisResult(null);
    setIsSubmitted(false);
    setAnalysisError(null);
  };

  // Real browser GPS detection
  const handleAcquireGPS = () => {
    setGpsAcquiring(true);
    setGpsMessage(null);
    if ('geolocation' in navigator) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const userLat = Math.round(position.coords.latitude * 10000) / 10000;
          const userLng = Math.round(position.coords.longitude * 10000) / 10000;
          setLat(userLat);
          setLng(userLng);
          setGpsAcquiring(false);
          setGpsMessage(`GPS Telemetry Locked: ${userLat}° N, ${userLng}° E`);
        },
        (error) => {
          console.warn('Geolocation error or blocked, defaulting to Vizag coordinates:', error);
          // Default to central Vizag (Maddilapalem) if blocked/in sandbox
          setLat(17.7384);
          setLng(83.3174);
          setGpsAcquiring(false);
          setGpsMessage('Location assigned to Central Visakhapatnam (17.7384° N, 83.3174° E)');
        },
        { enableHighAccuracy: true, timeout: 5000 }
      );
    } else {
      setLat(17.7384);
      setLng(83.3174);
      setGpsAcquiring(false);
      setGpsMessage('Location assigned to Visakhapatnam (17.7384° N, 83.3174° E)');
    }
  };

  // Run Gemini AI Analysis
  const handleRunAIAnalysis = async () => {
    if (!photoPreview) {
      setAnalysisError('Please capture or select a hazard photo before running AI analysis.');
      return;
    }

    setIsAnalyzing(true);
    setAnalysisError(null);
    setAnalysisResult(null);
    setIsSubmitted(false);

    const startTime = performance.now();

    try {
      const response = await fetch('/api/analyze-blockage', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          description: notes,
          locationName,
          routeType,
          imageBase64: photoPreview.startsWith('data:') ? photoPreview : undefined,
          imageMimeType: photoPreview.startsWith('data:image/svg') ? 'image/svg+xml' : 'image/jpeg',
        }),
      });

      const data = await response.json();
      const elapsed = Math.round(performance.now() - startTime);

      if (!response.ok || !data.success) {
        throw new Error(data.error || 'Failed to complete AI road blockage analysis.');
      }

      setAnalysisResult(data.analysis);
      setAnalysisLatency(data.latencyMs || elapsed);
      recordAiLatency(data.latencyMs || elapsed);
    } catch (err: any) {
      console.error('AI Analysis failed:', err);
      setAnalysisError(
        err.message || 'Network error communicating with the AI service. Please try again.'
      );
    } finally {
      setIsAnalyzing(false);
    }
  };

  // Publish to Live Municipal Map Queue
  const handleSubmitToQueue = () => {
    if (!analysisResult) return;

    const newIncident: Incident = {
      id: `vizag-${Date.now()}`,
      title: `${locationName} Road Blockage`,
      locationName,
      landmarkDetails,
      lat,
      lng,
      routeType,
      obstruction: analysisResult.obstruction,
      hazard: analysisResult.hazard,
      priority_score: analysisResult.priority_score,
      recommendation: analysisResult.recommendation,
      status: 'pending',
      reportedAt: 'Just now',
      photoUrl: photoPreview,
      isSample: false,
      notes,
      source: 'gemini_3.8_flash',
    };

    onIncidentCreated(newIncident);
    setIsSubmitted(true);
  };

  return (
    <div className="max-w-4xl mx-auto px-4 py-6 sm:py-8">
      {/* Page Title & Subtitle */}
      <div className="mb-6">
        <div className="flex items-center gap-2 text-xs font-bold text-blue-400 uppercase tracking-widest mb-1">
          <Camera className="w-4 h-4" />
          Field Reporting Portal
        </div>
        <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
          {t.portalTitle}
        </h1>
        <p className="text-base text-slate-300 mt-1">{t.portalSubtitle}</p>
      </div>

      <div className="space-y-6">
        {/* STEP 1: PHOTO CAPTURE & PRESETS */}
        <section className="bg-slate-800/90 border border-slate-700 rounded-2xl p-4 sm:p-6 shadow-lg">
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-lg font-bold text-white flex items-center gap-2">
              <span className="w-6 h-6 rounded-full bg-blue-600 text-white text-xs flex items-center justify-center font-bold">
                1
              </span>
              {t.takeOrUploadPhoto}
            </h2>
            <span className="text-xs text-amber-400 font-medium">Required for AI Triage</span>
          </div>

          {/* Photo Preview / Capture Area */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 items-center">
            <div className="relative aspect-video sm:aspect-4/3 rounded-xl overflow-hidden border-2 border-slate-600 bg-slate-900 group shadow-inner">
              {photoPreview ? (
                <img
                  src={photoPreview}
                  alt="Field hazard capture"
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full flex flex-col items-center justify-center text-slate-400 p-4 text-center">
                  <Camera className="w-12 h-12 mb-2 text-slate-500" />
                  <p className="text-sm font-medium">{t.tapToSnap}</p>
                </div>
              )}

              {/* Overlay button */}
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="absolute bottom-3 right-3 bg-slate-900/90 hover:bg-blue-600 text-white text-xs font-bold px-3 py-1.5 rounded-lg border border-slate-700 shadow-md flex items-center gap-1.5 transition"
              >
                <Camera className="w-4 h-4" />
                Change / Retake
              </button>
            </div>

            <div className="space-y-3">
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                capture="environment"
                onChange={handlePhotoUpload}
                className="hidden"
                id="camera-file-input"
              />

              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="w-full py-3.5 px-4 rounded-xl border-2 border-dashed border-blue-500/50 hover:border-blue-400 bg-blue-950/20 hover:bg-blue-900/30 text-blue-200 font-semibold text-sm flex items-center justify-center gap-2 transition"
              >
                <Upload className="w-5 h-5 text-blue-400" />
                {t.tapToSnap}
              </button>

              <div>
                <p className="text-xs font-semibold text-slate-400 mb-2 uppercase tracking-wide">
                  {t.orPreset}
                </p>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {PRESET_SCENARIOS.map((scenario) => (
                    <button
                      key={scenario.id}
                      type="button"
                      onClick={() => handleSelectPreset(scenario)}
                      className={`text-left p-2.5 rounded-lg border text-xs transition ${
                        locationName === scenario.locationName
                          ? 'bg-blue-600/30 border-blue-500 text-white'
                          : 'bg-slate-900/60 border-slate-700 text-slate-300 hover:border-slate-500'
                      }`}
                    >
                      <div className="flex items-center justify-between mb-1">
                        <span className="font-bold truncate text-white">{scenario.title.split(' ')[0]}</span>
                        <span className="text-[10px] bg-slate-800 text-amber-300 px-1.5 py-0.2 rounded border border-slate-700">
                          {scenario.badge}
                        </span>
                      </div>
                      <p className="text-[11px] text-slate-400 truncate">{scenario.locationName}</p>
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* STEP 2: GPS & ROAD CORRIDOR CLASSIFICATION */}
        <section className="bg-slate-800/90 border border-slate-700 rounded-2xl p-4 sm:p-6 shadow-lg">
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-lg font-bold text-white flex items-center gap-2">
              <span className="w-6 h-6 rounded-full bg-blue-600 text-white text-xs flex items-center justify-center font-bold">
                2
              </span>
              {t.locationHeading}
            </h2>
            <span className="text-xs text-blue-400 font-mono">
              {lat.toFixed(4)}° N, {lng.toFixed(4)}° E
            </span>
          </div>

          <div className="space-y-4">
            {/* GPS Trigger & Landmark Selector */}
            <div className="flex flex-wrap items-center gap-2">
              <button
                type="button"
                onClick={handleAcquireGPS}
                disabled={gpsAcquiring}
                className="bg-slate-700 hover:bg-slate-600 text-white font-semibold text-xs px-3.5 py-2 rounded-lg border border-slate-600 flex items-center gap-1.5 transition disabled:opacity-50"
              >
                <Compass className={`w-4 h-4 text-amber-400 ${gpsAcquiring ? 'animate-spin' : ''}`} />
                {gpsAcquiring ? 'Acquiring GPS...' : t.detectGPS}
              </button>

              <span className="text-xs text-slate-400">or pick quick landmark:</span>

              <div className="flex flex-wrap gap-1.5">
                {VIZAG_LANDMARKS.slice(0, 5).map((lm) => (
                  <button
                    key={lm.name}
                    type="button"
                    onClick={() => {
                      setLocationName(lm.name);
                      setLat(lm.lat);
                      setLng(lm.lng);
                      setRouteType(lm.defaultRoute as RouteType);
                    }}
                    className={`text-[11px] px-2.5 py-1 rounded-md border transition ${
                      locationName === lm.name
                        ? 'bg-blue-600 border-blue-400 text-white font-bold'
                        : 'bg-slate-900 border-slate-700 text-slate-300 hover:border-slate-500'
                    }`}
                  >
                    {lm.name}
                  </button>
                ))}
              </div>
            </div>

            {gpsMessage && (
              <div className="bg-blue-950/60 border border-blue-800/80 rounded-lg px-3 py-1.5 text-xs text-blue-300 flex items-center gap-1.5">
                <CheckCircle className="w-3.5 h-3.5 text-emerald-400" />
                {gpsMessage}
              </div>
            )}

            {/* Inputs: Location name & Road classification */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Location / Road Name *
                </label>
                <input
                  type="text"
                  value={locationName}
                  onChange={(e) => setLocationName(e.target.value)}
                  placeholder="e.g. Maddilapalem Junction, Siripuram..."
                  className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3.5 py-2.5 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-blue-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  {t.roadClassification} *
                </label>
                <select
                  value={routeType}
                  onChange={(e) => setRouteType(e.target.value as RouteType)}
                  className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3.5 py-2.5 text-sm text-white focus:outline-none focus:border-blue-500"
                >
                  <option value="Hospital Route">Hospital Route (Lifeline Corridor - Max Priority)</option>
                  <option value="Emergency Shelter">Emergency Shelter Access (High Priority)</option>
                  <option value="Major Artery">Major Artery (Siripuram, NH16 Arterials)</option>
                  <option value="Transit Route">Transit Route (Bus / Rail Connector)</option>
                  <option value="Industrial Lifeline">Industrial Lifeline (Gajuwaka / Port)</option>
                  <option value="Commercial">Commercial (Market Corridors)</option>
                  <option value="Residential">Residential (Colony Roads)</option>
                  <option value="Standard Road">Standard Road</option>
                </select>
              </div>
            </div>

            {/* Field Notes */}
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                {t.fieldNotes}
              </label>
              <textarea
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                rows={2}
                placeholder={t.fieldNotesPlaceholder}
                className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3.5 py-2 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-blue-500"
              />
            </div>
          </div>
        </section>

        {/* STEP 3: RUN GEMINI AI ANALYSIS & UPLOAD */}
        <section className="bg-slate-800/90 border border-slate-700 rounded-2xl p-4 sm:p-6 shadow-lg space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-bold text-white flex items-center gap-2">
              <span className="w-6 h-6 rounded-full bg-blue-600 text-white text-xs flex items-center justify-center font-bold">
                3
              </span>
              {t.runAiAnalysis}
            </h2>
            <div className="flex items-center gap-1.5 text-xs text-blue-400 bg-blue-950/60 border border-blue-800/60 px-2 py-0.5 rounded-full">
              <Sparkles className="w-3.5 h-3.5 text-amber-400" />
              Gemini 3.8 Flash
            </div>
          </div>

          {/* Action Button: Run AI */}
          <button
            type="button"
            onClick={handleRunAIAnalysis}
            disabled={isAnalyzing}
            className="w-full bg-blue-600 hover:bg-blue-500 active:bg-blue-700 disabled:opacity-50 text-white font-bold py-3.5 px-6 rounded-xl shadow-lg shadow-blue-600/30 flex items-center justify-center gap-2 text-base transition"
          >
            {isAnalyzing ? (
              <>
                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                <span>{t.analyzingWithGemini}</span>
              </>
            ) : (
              <>
                <Sparkles className="w-5 h-5 text-amber-300" />
                <span>{t.runAiAnalysis}</span>
              </>
            )}
          </button>

          {/* Error State with Try Again Button */}
          {analysisError && (
            <div className="bg-red-950/60 border border-red-800 rounded-xl p-4 text-red-200 text-sm flex items-start justify-between gap-3">
              <div className="flex items-start gap-2.5">
                <AlertCircle className="w-5 h-5 text-red-400 shrink-0 mt-0.5" />
                <div>
                  <p className="font-bold text-red-300">Analysis Error</p>
                  <p className="text-xs text-red-200 mt-0.5">{analysisError}</p>
                </div>
              </div>
              <button
                type="button"
                onClick={handleRunAIAnalysis}
                className="bg-red-900/80 hover:bg-red-800 text-white text-xs font-semibold px-3 py-1.5 rounded-lg border border-red-700 shrink-0 flex items-center gap-1 transition"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                Try again
              </button>
            </div>
          )}

          {/* AI Structured Results Card (Matching exact user requested shape) */}
          {analysisResult && (
            <div className="bg-slate-900/95 border-2 border-blue-500/80 rounded-xl p-4 sm:p-5 space-y-4 shadow-xl animate-in fade-in duration-300">
              <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                <div className="flex items-center gap-2">
                  <ShieldCheck className="w-5 h-5 text-emerald-400" />
                  <span className="font-bold text-white text-sm">
                    {t.aiResultsHeading}
                  </span>
                </div>
                {analysisLatency && (
                  <span className="text-[11px] text-slate-400 font-mono bg-slate-800 px-2 py-0.5 rounded">
                    Latency: {(analysisLatency / 1000).toFixed(2)}s
                  </span>
                )}
              </div>

              {/* Grid of structured output keys */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                {/* 1. Obstruction */}
                <div className="bg-slate-800/80 border border-slate-700 rounded-lg p-3">
                  <p className="text-xs text-slate-400 uppercase font-semibold">obstruction</p>
                  <p className="text-base font-black text-white capitalize mt-0.5">
                    {analysisResult.obstruction.replace(/_/g, ' ')}
                  </p>
                </div>

                {/* 2. Hazard */}
                <div
                  className={`rounded-lg p-3 border ${
                    analysisResult.hazard === 'live_electrical_wire'
                      ? 'bg-amber-950/40 border-amber-600 text-amber-300'
                      : 'bg-slate-800/80 border-slate-700 text-white'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <p className="text-xs uppercase font-semibold text-slate-400">hazard</p>
                    {analysisResult.hazard === 'live_electrical_wire' && (
                      <Zap className="w-4 h-4 text-amber-400 animate-bounce" />
                    )}
                  </div>
                  <p className="text-base font-black capitalize mt-0.5">
                    {analysisResult.hazard.replace(/_/g, ' ')}
                  </p>
                </div>

                {/* 3. Priority Score */}
                <div
                  className={`rounded-lg p-3 border ${
                    analysisResult.priority_score >= 9.0
                      ? 'bg-red-950/40 border-red-600 text-red-300'
                      : analysisResult.priority_score >= 7.0
                      ? 'bg-orange-950/40 border-orange-600 text-orange-300'
                      : 'bg-blue-950/40 border-blue-700 text-blue-300'
                  }`}
                >
                  <p className="text-xs uppercase font-semibold text-slate-400">priority_score</p>
                  <div className="flex items-baseline gap-1 mt-0.5">
                    <span className="text-2xl font-black">{analysisResult.priority_score}</span>
                    <span className="text-xs text-slate-400">/ 10.0</span>
                    {analysisResult.priority_score >= 9.0 && (
                      <span className="ml-auto text-[10px] bg-red-900 text-red-200 px-1.5 py-0.5 rounded font-bold">
                        P1 CRITICAL
                      </span>
                    )}
                  </div>
                </div>
              </div>

              {/* 4. Recommendation */}
              <div className="bg-slate-800/90 border border-slate-700 rounded-lg p-3.5">
                <p className="text-xs uppercase font-semibold text-blue-400 mb-1">
                  recommendation
                </p>
                <p className="text-sm font-medium text-slate-200">
                  "{analysisResult.recommendation}"
                </p>
              </div>

              {/* Publish to Queue Action */}
              {!isSubmitted ? (
                <button
                  type="button"
                  onClick={handleSubmitToQueue}
                  className="w-full bg-emerald-600 hover:bg-emerald-500 active:bg-emerald-700 text-white font-bold py-3 px-4 rounded-xl shadow-md flex items-center justify-center gap-2 text-sm transition"
                >
                  <Send className="w-4 h-4" />
                  {t.submitToCommand}
                </button>
              ) : (
                <div className="space-y-3">
                  <div className="bg-emerald-950/60 border border-emerald-700 rounded-xl p-3.5 text-center text-emerald-200 text-sm font-semibold flex items-center justify-center gap-2">
                    <CheckCircle className="w-5 h-5 text-emerald-400" />
                    {t.reportSuccess}
                  </div>
                  <button
                    type="button"
                    onClick={onNavigateToDashboard}
                    className="w-full bg-blue-600 hover:bg-blue-500 text-white font-bold py-3 px-4 rounded-xl flex items-center justify-center gap-2 text-sm transition"
                  >
                    <span>View on Live Command Map</span>
                    <ChevronRight className="w-4 h-4" />
                  </button>
                </div>
              )}
            </div>
          )}
        </section>
      </div>
    </div>
  );
};
