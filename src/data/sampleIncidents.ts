import { Incident } from '../types';

// Helper to generate visual SVG thumbnails representing actual storm aftermath
function generateTreeSvg(type: 'wires' | 'blocked' | 'single' | 'cleared', label: string): string {
  const isWire = type === 'wires';
  const isCleared = type === 'cleared';
  const wireColor = isWire ? '#ef4444' : '#64748b';
  const trunkColor = isCleared ? '#15803d' : '#854d0e';
  const foliageColor = isCleared ? '#22c55e' : '#166534';

  const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 600 400" width="600" height="400">
    <defs>
      <linearGradient id="sky" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0%" stop-color="#334155" />
        <stop offset="100%" stop-color="#1e293b" />
      </linearGradient>
      <linearGradient id="road" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0%" stop-color="#0f172a" />
        <stop offset="100%" stop-color="#1e293b" />
      </linearGradient>
    </defs>
    <!-- Background / Stormy Sky -->
    <rect width="600" height="240" fill="url(#sky)" />
    <!-- Distant rain streaks -->
    <line x1="50" y1="20" x2="30" y2="180" stroke="#475569" stroke-width="2" stroke-dasharray="6,8" opacity="0.4"/>
    <line x1="180" y1="10" x2="160" y2="190" stroke="#475569" stroke-width="2" stroke-dasharray="6,8" opacity="0.4"/>
    <line x1="320" y1="30" x2="300" y2="190" stroke="#475569" stroke-width="2" stroke-dasharray="6,8" opacity="0.4"/>
    <line x1="480" y1="15" x2="460" y2="200" stroke="#475569" stroke-width="2" stroke-dasharray="6,8" opacity="0.4"/>
    
    <!-- Road Surface -->
    <rect y="230" width="600" height="170" fill="url(#road)" />
    <line x1="0" y1="315" x2="600" y2="315" stroke="#f59e0b" stroke-width="6" stroke-dasharray="30,20" />
    <line x1="0" y1="230" x2="600" y2="230" stroke="#64748b" stroke-width="4" />

    <!-- Road Curbs / Sidewalk -->
    <rect y="220" width="600" height="12" fill="#475569" />

    <!-- Utility Poles -->
    <rect x="70" y="80" width="12" height="150" fill="#64748b" rx="2" />
    <line x1="45" y1="105" x2="105" y2="105" stroke="#94a3b8" stroke-width="6" />
    <rect x="520" y="80" width="12" height="150" fill="#64748b" rx="2" />
    <line x1="495" y1="105" x2="555" y2="105" stroke="#94a3b8" stroke-width="6" />

    <!-- Electric Cables -->
    ${
      isWire
        ? `<!-- Sagging/Snapped live wire -->
           <path d="M50 105 Q 280 270 520 105" fill="none" stroke="${wireColor}" stroke-width="5" stroke-dasharray="8,4" />
           <path d="M80 105 Q 260 300 340 310" fill="none" stroke="#facc15" stroke-width="4" />
           <!-- Electric arc warning spark -->
           <polygon points="330,300 350,290 342,310 365,310 338,335 344,318 325,318" fill="#facc15" stroke="#ef4444" stroke-width="1.5" />
           <circle cx="342" cy="312" r="14" fill="#facc15" opacity="0.3" />`
        : `<!-- Intact utility wires -->
           <path d="M50 105 Q 300 135 520 105" fill="none" stroke="${wireColor}" stroke-width="3" />`
    }

    <!-- Fallen Tree Trunk and Foliage -->
    ${
      isCleared
        ? `<!-- Cleared debris off to the side -->
           <rect x="20" y="240" width="120" height="30" rx="6" fill="#15803d" opacity="0.8" />
           <text x="300" y="325" fill="#22c55e" font-family="system-ui, sans-serif" font-size="28" font-weight="bold" text-anchor="middle">✓ ROAD CLEAR - ALL LANES OPEN</text>`
        : `<!-- Fallen massive trunk across lanes -->
           <path d="M120 340 L 480 260 L 510 280 L 150 365 Z" fill="${trunkColor}" />
           <ellipse cx="495" cy="270" rx="15" ry="12" fill="#713f12" />
           <!-- Dense uprooted foliage ball -->
           <circle cx="130" cy="330" r="50" fill="${foliageColor}" opacity="0.9" />
           <circle cx="170" cy="310" r="45" fill="${foliageColor}" opacity="0.85" />
           <circle cx="210" cy="290" r="40" fill="${foliageColor}" opacity="0.8" />
           <circle cx="280" cy="275" r="38" fill="${foliageColor}" opacity="0.8" />
           <circle cx="370" cy="255" r="32" fill="${foliageColor}" opacity="0.85" />
           <circle cx="430" cy="245" r="28" fill="${foliageColor}" opacity="0.85" />
           <!-- Exposed root ball -->
           <path d="M90 320 Q 50 360 80 390 Q 110 370 120 350 Z" fill="#451a03" stroke="#292524" stroke-width="3" />`
    }

    <!-- Civic Location Tag Watermark -->
    <rect x="20" y="20" width="360" height="42" rx="8" fill="#0f172a" fill-opacity="0.85" stroke="#334155" stroke-width="1.5" />
    <text x="35" y="47" fill="#f8fafc" font-family="system-ui, sans-serif" font-size="16" font-weight="bold">${label}</text>
  </svg>`;

  return `data:image/svg+xml;utf8,${encodeURIComponent(svg)}`;
}

export const SAMPLE_INCIDENTS: Incident[] = [
  {
    id: 'vizag-inc-01',
    title: 'Maddilapalem Junction Blockage',
    locationName: 'Maddilapalem Junction',
    landmarkDetails: 'Opposite RTC Bus Depot & Apollo Clinic corridor',
    lat: 17.7384,
    lng: 83.3174,
    routeType: 'Hospital Route',
    obstruction: 'complete_block',
    hazard: 'live_electrical_wire',
    priority_score: 9.8,
    recommendation: 'Dispatch PWD heavy unit + APEPDCL Electricity Board immediately.',
    status: 'pending',
    reportedAt: '12 mins ago',
    photoUrl: generateTreeSvg('wires', 'Maddilapalem Junction [Critical Lifeline]'),
    isSample: true,
    notes: 'Massive 50-year-old banyan uprooted across both dual carriageway lanes with snapping 11kV distribution line.',
    source: 'sample',
  },
  {
    id: 'vizag-inc-02',
    title: 'RK Beach Promenade Debris',
    locationName: 'Beach Road, RK Beach',
    landmarkDetails: 'Near Submarine Museum Promenade',
    lat: 17.7126,
    lng: 83.3243,
    routeType: 'Residential',
    obstruction: 'single_lane',
    hazard: 'none',
    priority_score: 4.2,
    recommendation: 'Municipal tree pruning squad with front loader cleared the carriageway.',
    status: 'cleared',
    reportedAt: '2 hours ago',
    photoUrl: generateTreeSvg('cleared', 'Beach Road, RK Beach [Cleared]'),
    isSample: true,
    notes: 'Windborne peltophorum branch cleared from south lane; pedestrian footpath swept clean.',
    assignedCrew: 'Zone-3 Fast Response Tree Squad',
    dispatchTime: '01:45 PM',
    source: 'sample',
  },
  {
    id: 'vizag-inc-03',
    title: 'MVP Colony Sector 4 Blockage',
    locationName: 'MVP Colony Sector 4',
    landmarkDetails: 'Double Road near Shivaji Park circle',
    lat: 17.7412,
    lng: 83.3371,
    routeType: 'Standard Road',
    obstruction: 'complete_block',
    hazard: 'none',
    priority_score: 6.5,
    recommendation: 'Dispatch Municipal Tree Pruning Squad with 2 mobile chainsaws.',
    status: 'assigned',
    reportedAt: '35 mins ago',
    photoUrl: generateTreeSvg('blocked', 'MVP Colony Sector 4 [Standard Road]'),
    isSample: true,
    notes: 'Uprooted gulmohar blocking internal colony connector road. Telecom cables down but no power lines.',
    assignedCrew: 'GVMC Zone-2 Maintenance Squad',
    dispatchTime: '02:15 PM',
    source: 'sample',
  },
  {
    id: 'vizag-inc-04',
    title: 'Seethammadhara North Relief Corridor',
    locationName: 'Seethammadhara North',
    landmarkDetails: 'Access route to Municipal Community Emergency Shelter',
    lat: 17.7478,
    lng: 83.315,
    routeType: 'Emergency Shelter',
    obstruction: 'complete_block',
    hazard: 'live_electrical_wire',
    priority_score: 9.5,
    recommendation: 'Priority 1: APEPDCL shutoff requested. Dispatch PWD heavy crane + tree cutter unit.',
    status: 'pending',
    reportedAt: '18 mins ago',
    photoUrl: generateTreeSvg('wires', 'Seethammadhara North [Shelter Route]'),
    isSample: true,
    notes: 'Two uprooted rain trees blocking primary entry for relief trucks and displaced residents.',
    source: 'sample',
  },
  {
    id: 'vizag-inc-05',
    title: 'DAB Gardens Main Commercial Lane',
    locationName: 'DAB Gardens Main Road',
    landmarkDetails: 'Near Central Park & Commercial Complex',
    lat: 17.718,
    lng: 83.3015,
    routeType: 'Commercial',
    obstruction: 'single_lane',
    hazard: 'none',
    priority_score: 3.1,
    recommendation: 'Branch cut and hauled to municipal collection yard. Road fully functional.',
    status: 'cleared',
    reportedAt: '3 hours ago',
    photoUrl: generateTreeSvg('cleared', 'DAB Gardens Main Road [Cleared]'),
    isSample: true,
    notes: 'Fallen bough cleared by merchant association and GVMC sanitation crew.',
    assignedCrew: 'Zone-1 Rapid Sanitation Unit',
    dispatchTime: '11:20 AM',
    source: 'sample',
  },
  {
    id: 'vizag-inc-06',
    title: 'Siripuram Circle Critical Artery',
    locationName: 'Siripuram Circle',
    landmarkDetails: 'Connecting AU Campus to Dutt Island',
    lat: 17.7251,
    lng: 83.3178,
    routeType: 'Major Artery',
    obstruction: 'complete_block',
    hazard: 'none',
    priority_score: 8.9,
    recommendation: 'Dispatch heavy winch tractor and multi-crew motorized chainsaw team.',
    status: 'assigned',
    reportedAt: '25 mins ago',
    photoUrl: generateTreeSvg('blocked', 'Siripuram Circle [Major Artery]'),
    isSample: true,
    notes: 'Dense trunk blocking 3 traffic lanes. Police traffic diversion established via VIP Road.',
    assignedCrew: 'District Disaster Emergency Response Unit',
    dispatchTime: '02:30 PM',
    source: 'sample',
  },
  {
    id: 'vizag-inc-07',
    title: 'Waltair Uplands Residential Lane',
    locationName: 'Waltair Uplands',
    landmarkDetails: 'Near Siripuram ridge road',
    lat: 17.7265,
    lng: 83.3292,
    routeType: 'Residential',
    obstruction: 'single_lane',
    hazard: 'none',
    priority_score: 5.0,
    recommendation: 'Dispatch light pruning vehicle with wood chipper.',
    status: 'pending',
    reportedAt: '45 mins ago',
    photoUrl: generateTreeSvg('single', 'Waltair Uplands [Residential]'),
    isSample: true,
    notes: 'Large limb snapped and resting on perimeter wall, partially obstructing one vehicle lane.',
    source: 'sample',
  },
  {
    id: 'vizag-inc-08',
    title: 'Gajuwaka Steel Plant Lifeline Artery',
    locationName: 'Gajuwaka Steel Plant Rd',
    landmarkDetails: 'Major freight & shift transport highway corridor',
    lat: 17.691,
    lng: 83.214,
    routeType: 'Industrial Lifeline',
    obstruction: 'complete_block',
    hazard: 'live_electrical_wire',
    priority_score: 9.2,
    recommendation: 'Urgent coordination: APEPDCL industrial feeder disconnect + Heavy Crane recovery.',
    status: 'pending',
    reportedAt: '8 mins ago',
    photoUrl: generateTreeSvg('wires', 'Gajuwaka Steel Plant Rd [Lifeline]'),
    isSample: true,
    notes: 'Three heavy eucalyptus trees flattened across four-lane industrial spine with high-tension line down.',
    source: 'sample',
  },
  {
    id: 'vizag-inc-09',
    title: 'Akkayyapalem 100ft Transit Axis',
    locationName: 'Akkayyapalem 100ft Rd',
    landmarkDetails: 'Main transit route linking Highway 16 to Railway Station',
    lat: 17.7335,
    lng: 83.3032,
    routeType: 'Transit Route',
    obstruction: 'complete_block',
    hazard: 'none',
    priority_score: 7.8,
    recommendation: 'Dispatch 2 PWD front-loader bulldozers and heavy wood haulers.',
    status: 'assigned',
    reportedAt: '50 mins ago',
    photoUrl: generateTreeSvg('blocked', 'Akkayyapalem 100ft Rd [Transit Route]'),
    isSample: true,
    notes: 'Uprooted tamarind tree spanning full width. City buses re-routed via Gurudwara junction.',
    assignedCrew: 'PWD Central Division Team B',
    dispatchTime: '01:50 PM',
    source: 'sample',
  },
  {
    id: 'vizag-inc-10',
    title: 'Dwaraka Nagar 4th Lane',
    locationName: 'Dwaraka Nagar 4th Lane',
    landmarkDetails: 'Commercial lane near Diamond Park',
    lat: 17.724,
    lng: 83.308,
    routeType: 'Commercial',
    obstruction: 'single_lane',
    hazard: 'none',
    priority_score: 4.0,
    recommendation: 'Section cleared and traffic flow restored to normal.',
    status: 'cleared',
    reportedAt: '4 hours ago',
    photoUrl: generateTreeSvg('cleared', 'Dwaraka Nagar 4th Lane [Cleared]'),
    isSample: true,
    notes: 'Small neem tree trunk sliced into logs and stacked neatly on sidewalk.',
    assignedCrew: 'GVMC Zone-1 Quick Clear Squad',
    dispatchTime: '10:40 AM',
    source: 'sample',
  },
];
