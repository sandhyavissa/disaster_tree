export type ObstructionLevel = 'complete_block' | 'single_lane' | 'partial_block';
export type HazardType = 'live_electrical_wire' | 'waterlogging' | 'structural_damage' | 'none';
export type IncidentStatus = 'pending' | 'assigned' | 'in_progress' | 'cleared';

export type RouteType =
  | 'Hospital Route'
  | 'Emergency Shelter'
  | 'Major Artery'
  | 'Transit Route'
  | 'Industrial Lifeline'
  | 'Commercial'
  | 'Residential'
  | 'Standard Road';

export interface AIAnalysis {
  obstruction: ObstructionLevel | string;
  hazard: HazardType | string;
  priority_score: number;
  recommendation: string;
}

export interface Incident {
  id: string;
  title: string;
  locationName: string;
  landmarkDetails?: string;
  lat: number;
  lng: number;
  routeType: RouteType;
  obstruction: ObstructionLevel | string;
  hazard: HazardType | string;
  priority_score: number;
  recommendation: string;
  status: IncidentStatus;
  reportedAt: string;
  photoUrl: string;
  isSample: boolean;
  notes?: string;
  assignedCrew?: string;
  dispatchTime?: string;
  source?: 'gemini_3.8_flash' | 'rule_based_fallback' | 'sample';
}

export type Language = 'en' | 'te';

export type ActiveScreen = 'portal' | 'dashboard' | 'triage' | 'about';
