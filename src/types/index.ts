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

export interface SimulationScenario {
  id: string;
  name: string;
  description: string;
  icon: string;
  incidentIds: string[];
  durationMinutes: number;
}

export interface LiveTickerEvent {
  id: string;
  timestamp: string;
  message: string;
  type: 'INCIDENT' | 'ALERT' | 'UPDATE' | 'DISPATCH' | 'REPORT';
  severity?: SeverityLevel;
}
