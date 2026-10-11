// DistrictWatch — Core Data Contracts

export type IncidentCategory =
  | 'NATURAL_DISASTER'
  | 'CIVIC_UTILITY'
  | 'INFRASTRUCTURE'
  | 'PUBLIC_SAFETY';

export type SeverityLevel = 'ADVISORY' | 'WATCH' | 'WARNING' | 'CRITICAL_EMERGENCY';

export type IncidentStatus = 'ACTIVE' | 'CONTAINED' | 'EVALUATING' | 'RESOLVED';

export type ViewMode = 'COMMAND' | 'CITIZEN';

export interface GeoLocation {
  lat: number;
  lng: number;
  address?: string;
  wardOrDistrict?: string;
}

export interface IncidentRecord {
  id: string;
  title: string;
  category: IncidentCategory;
  subType: string;
  severity: SeverityLevel;
  status: IncidentStatus;
  location: GeoLocation;
  radiusMeters: number;
  polygonCoordinates?: [number, number][];
  estimatedImpactedPopulation: number;
  reportedAt: string;
  updatedAt: string;
  description: string;
  recommendedAction: string;
  officialSource: string;
  assignedTeams?: string[];
  metrics?: {
    waterLevelMeters?: number;
    powerOutageCustomers?: number;
    windSpeedKmh?: number;
    roadClosureLengthKm?: number;
    gasConcentrationPpm?: number;
    affectedWards?: string[];
    [key: string]: any;
  };
}

export interface EmergencyShelter {
  id: string;
  name: string;
  location: GeoLocation;
  capacityTotal: number;
  capacityOccupied: number;
  suppliesStatus: 'ADEQUATE' | 'CRITICAL' | 'RESTOCKING';
  contactPhone: string;
  isOpen: boolean;
  type: 'SCHOOL' | 'STADIUM' | 'COMMUNITY_CENTER' | 'HOSPITAL';
}

export interface BroadcastAlert {
  id: string;
  incidentId: string;
  timestamp: string;
  targetWards: string[];
  channels: ('SMS' | 'EMAIL' | 'PUSH' | 'SIREN')[];
  headline: string;
  bodyText: string;
  stats: {
    recipientsCount: number;
    deliveryRatePercent: number;
    sirensTriggeredCount: number;
  };
}

export interface ResourceUnit {
  id: string;
  name: string;
  type: 'FIRE' | 'AMBULANCE' | 'POLICE' | 'FLOOD_RESCUE' | 'GRID_REPAIR' | 'WATER_TANKER';
  status: 'AVAILABLE' | 'DEPLOYED' | 'EN_ROUTE' | 'OFFLINE';
  location: GeoLocation;
  assignedIncidentId?: string;
}

export interface CitizenReport {
  id: string;
  title: string;
  description: string;
  category: IncidentCategory;
  location: GeoLocation;
  reportedAt: string;
  status: 'PENDING' | 'VERIFIED' | 'DISMISSED';
  reportedBy: string;
}

export interface SimulationPhase {
  phaseIndex: number;
  phaseTitle: string;
  triggerSeconds: number;
  threatIndex: number;
  accuracyScore?: number;
  probabilityScore?: number;
  estimatedTime?: string;
  statusMessage: string;
  reportsCount: number;
  incidents: IncidentRecord[];
  citizenReports: CitizenReport[];
  tickerEvents: LiveTickerEvent[];
}

export interface SimulationScenario {
  id: 'peaceful' | 'grid_cascade' | 'earthquake_cascade';
  name: string;
  badge: string;
  tagline: string;
  description: string;
  icon: string;
  severity: 'CALM' | 'MODERATE' | 'CRITICAL';
  durationSeconds: number;
  phases: SimulationPhase[];
}

export interface SimulationState {
  isPlaying: boolean;
  speed: 1 | 2 | 5;
  activeScenarioId: 'peaceful' | 'grid_cascade' | 'earthquake_cascade' | null;
  elapsedSeconds: number;
  currentPhaseIndex: number;
  currentPhaseTitle: string;
  statusMessage: string;
  accuracyScore: number | null;
  probabilityScore: number | null;
  estimatedTimeWindow: string | null;
  reportsCount: number;
}

export interface LiveTickerEvent {
  id: string;
  timestamp: string;
  message: string;
  type: 'INCIDENT' | 'ALERT' | 'UPDATE' | 'DISPATCH' | 'REPORT';
  severity?: SeverityLevel;
}
