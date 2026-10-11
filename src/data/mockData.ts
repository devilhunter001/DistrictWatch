import type {
  IncidentRecord,
  EmergencyShelter,
  ResourceUnit,
  LiveTickerEvent,
  SimulationScenario,
} from '../types';

// ─── Ghaziabad, UP — Geographic Center ───────────────────────────────────────
// City center coords: 28.6692° N, 77.4538° E

export const DISTRICT_CENTER: [number, number] = [28.6692, 77.4538];
export const DISTRICT_NAME = 'Ghaziabad Municipal Corporation';
export const DISTRICT_POPULATION = 2358525;

// ─── Mock Incidents ────────────────────────────────────────────────────────────
export const MOCK_INCIDENTS: IncidentRecord[] = [
  {
    id: 'INC-001',
    title: 'Hindon River Flash Flood Alert',
    category: 'NATURAL_DISASTER',
    subType: 'Flash Flood',
    severity: 'CRITICAL_EMERGENCY',
    status: 'ACTIVE',
    location: {
      lat: 28.6421,
      lng: 77.5023,
      address: 'Hindon River Bank, Near Mohan Nagar',
      wardOrDistrict: 'Ward 12 — Mohan Nagar',
    },
    radiusMeters: 2800,
    estimatedImpactedPopulation: 42500,
    reportedAt: '2026-10-11T07:15:00+05:30',
    updatedAt: '2026-10-11T13:10:00+05:30',
    description:
      'The Hindon River has breached danger level (90.5m) and is currently at 93.2m following heavy monsoon rainfall upstream. Low-lying areas within 2.8 km of the river bank are at severe inundation risk. Multiple road sections already waterlogged.',
    recommendedAction:
      'Immediate evacuation of Ward 12 low-lying zones. Proceed to Shastri Nagar Community Center (Shelter #2). Do NOT attempt to cross submerged roads.',
    officialSource: 'UP Flood Control Department & GMC Disaster Cell',
    assignedTeams: ['Flood Rescue Unit Alpha', 'SDRF Team 3', 'Ambulance Bay 4'],
    metrics: {
      waterLevelMeters: 93.2,
      affectedWards: ['Ward 12', 'Ward 13', 'Ward 14'],
    },
  },
  {
    id: 'INC-002',
    title: 'Major Power Grid Failure — Vasundhara Substation',
    category: 'CIVIC_UTILITY',
    subType: 'Power Outage',
    severity: 'WARNING',
    status: 'ACTIVE',
    location: {
      lat: 28.6398,
      lng: 77.3724,
      address: 'Vasundhara Substation, Sector 9',
      wardOrDistrict: 'Ward 5 — Vasundhara',
    },
    radiusMeters: 3500,
    estimatedImpactedPopulation: 78000,
    reportedAt: '2026-10-11T08:30:00+05:30',
    updatedAt: '2026-10-11T12:45:00+05:30',
    description:
      'A 132 KV feeder at Vasundhara Grid Substation has tripped due to lightning strike. Sectors 2, 4, 5, 9, and 10 of Vasundhara are currently experiencing complete power outage. Backup DG sets activated at hospitals. ETA for restoration: 4-6 hours.',
    recommendedAction:
      'Conserve UPS battery backup. Hospitals and critical facilities have been prioritized for restoration. Avoid using elevators.',
    officialSource: 'PVVNL — Paschimanchal Vidyut Vitran Nigam Ltd.',
    assignedTeams: ['PVVNL Grid Repair Team A', 'PVVNL Grid Repair Team B'],
    metrics: {
      powerOutageCustomers: 21500,
      affectedWards: ['Ward 5', 'Ward 6', 'Ward 7'],
    },
  },
  {
    id: 'INC-003',
    title: 'NH-9 Underpass Waterlogging & Road Closure',
    category: 'INFRASTRUCTURE',
    subType: 'Road Blockage',
    severity: 'WATCH',
    status: 'ACTIVE',
    location: {
      lat: 28.6812,
      lng: 77.4216,
      address: 'NH-9 Ghaziabad Underpass, Near Raj Nagar Extension',
      wardOrDistrict: 'Ward 8 — Raj Nagar',
    },
    radiusMeters: 600,
    estimatedImpactedPopulation: 15000,
    reportedAt: '2026-10-11T09:45:00+05:30',
    updatedAt: '2026-10-11T13:00:00+05:30',
    description:
      'NH-9 underpass near Raj Nagar Extension is flooded to approximately 1.2 m depth. Multiple vehicles stranded. Traffic diverted via Delhi-Meerut Expressway Service Road. NHAI and GMC teams deployed for water pumping.',
    recommendedAction:
      'Avoid NH-9 underpass entirely. Use alternate route: GT Road → Vijay Nagar → Kaushambi bypass. ETA for clearance: 3 hours.',
    officialSource: 'GMC Traffic Cell & NHAI',
    assignedTeams: ['Traffic Police Unit 7', 'NHAI Emergency Crew'],
    metrics: {
      roadClosureLengthKm: 0.8,
    },
  },
  {
    id: 'INC-004',
    title: 'Water Supply Disruption — Kavi Nagar Zone',
    category: 'CIVIC_UTILITY',
    subType: 'Water Outage',
    severity: 'WATCH',
    status: 'ACTIVE',
    location: {
      lat: 28.6584,
      lng: 77.4391,
      address: 'Kavi Nagar Water Pumping Station',
      wardOrDistrict: 'Ward 3 — Kavi Nagar',
    },
    radiusMeters: 2000,
    estimatedImpactedPopulation: 31000,
    reportedAt: '2026-10-11T06:00:00+05:30',
    updatedAt: '2026-10-11T11:30:00+05:30',
    description:
      'Water supply to Kavi Nagar, Gandhi Nagar, and surrounding areas has been disrupted due to a major pipeline burst on Lajpat Nagar Road. Water tankers deployed. Estimated restoration in 8-10 hours.',
    recommendedAction:
      'Water tankers deployed at 6 locations in Ward 3 and 4. Boil water advisory in effect for residual water from taps.',
    officialSource: 'Jal Nigam — UP Water Authority',
    assignedTeams: ['Water Repair Crew 2', 'Jal Tanker Fleet 3'],
    metrics: {
      affectedWards: ['Ward 3', 'Ward 4'],
    },
  },
  {
    id: 'INC-005',
    title: 'LPG Cylinder Godown Fire — Loni Industrial Area',
    category: 'PUBLIC_SAFETY',
    subType: 'Industrial Fire / Hazmat',
    severity: 'WARNING',
    status: 'EVALUATING',
    location: {
      lat: 28.7421,
      lng: 77.2891,
      address: 'Loni Industrial Estate, Plot 47-B',
      wardOrDistrict: 'Loni — Industrial Zone',
    },
    radiusMeters: 1500,
    estimatedImpactedPopulation: 8500,
    reportedAt: '2026-10-11T11:20:00+05:30',
    updatedAt: '2026-10-11T13:05:00+05:30',
    description:
      'An LPG cylinder storage godown at Loni Industrial Estate Plot 47-B caught fire at 11:20 AM. Risk of BLEVE (Boiling Liquid Expanding Vapor Explosion). 4 fire tenders and HazMat team on scene. Wind NW at 12 km/h.',
    recommendedAction:
      'Evacuate within 1.5 km radius immediately. Shut all gas connections. Stay upwind. Avoid open flames in surrounding areas.',
    officialSource: 'Ghaziabad Fire Department & SDRF',
    assignedTeams: ['Fire Tender 1', 'Fire Tender 2', 'HazMat Unit Alpha', 'SDRF Team 1'],
    metrics: {
      gasConcentrationPpm: 1800,
      windSpeedKmh: 12,
    },
  },
  {
    id: 'INC-006',
    title: 'Earthquake Tremors — Light Shaking Reported',
    category: 'NATURAL_DISASTER',
    subType: 'Earthquake',
    severity: 'ADVISORY',
    status: 'EVALUATING',
    location: {
      lat: 28.6892,
      lng: 77.4738,
      address: 'Indirapuram — Epicenter (Estimated)',
      wardOrDistrict: 'Indirapuram Township',
    },
    radiusMeters: 5000,
    estimatedImpactedPopulation: 185000,
    reportedAt: '2026-10-11T12:55:00+05:30',
    updatedAt: '2026-10-11T13:08:00+05:30',
    description:
      'Light tremors of magnitude 3.1 (ML) recorded at 12:55 PM IST. Epicenter estimated near Indirapuram township. No structural damage reported so far. IMD monitoring for aftershocks. Citizens in high-rise buildings advised caution.',
    recommendedAction:
      'Do not panic. Move to open spaces if shaking resumes. Stay away from glass, windows, and heavy furniture. Monitor official updates.',
    officialSource: 'IMD — India Meteorological Department / NCS',
    assignedTeams: ['NDRF Quick Response Team'],
    metrics: {},
  },
  {
    id: 'INC-007',
    title: 'Curfew Advisory — Sector 23 (Public Order)',
    category: 'PUBLIC_SAFETY',
    subType: 'Curfew / Section 144',
    severity: 'WARNING',
    status: 'ACTIVE',
    location: {
      lat: 28.6601,
      lng: 77.4055,
      address: 'Sector 23, Sanjay Nagar',
      wardOrDistrict: 'Ward 11 — Sanjay Nagar',
    },
    radiusMeters: 1200,
    estimatedImpactedPopulation: 22000,
    reportedAt: '2026-10-11T10:00:00+05:30',
    updatedAt: '2026-10-11T12:00:00+05:30',
    description:
      'Section 144 of CrPC imposed in Sector 23 and surrounding areas following unlawful assembly. All gatherings of more than 5 persons prohibited until further notice. Heavy police deployment active.',
    recommendedAction:
      'Remain indoors. Essential services (medical, groceries) permitted with valid ID. Avoid congregating near Sector 23 main market.',
    officialSource: 'District Magistrate, Ghaziabad — Order No. DM/GZB/2026/1847',
    assignedTeams: ['Police PAC Unit 12', 'Rapid Action Force'],
    metrics: {},
  },
];

// ─── Emergency Shelters ───────────────────────────────────────────────────────
export const MOCK_SHELTERS: EmergencyShelter[] = [
  {
    id: 'SHE-001',
    name: 'MMH College Relief Camp',
    location: {
      lat: 28.6671,
      lng: 77.4501,
      address: 'MMH College, Ghaziabad',
      wardOrDistrict: 'Ward 1 — City Centre',
    },
    capacityTotal: 2500,
    capacityOccupied: 1840,
    suppliesStatus: 'ADEQUATE',
    contactPhone: '0120-2820110',
    isOpen: true,
    type: 'SCHOOL',
  },
  {
    id: 'SHE-002',
    name: 'Shastri Nagar Community Center',
    location: {
      lat: 28.6512,
      lng: 77.4289,
      address: 'Shastri Nagar, Ward 2',
      wardOrDistrict: 'Ward 2 — Shastri Nagar',
    },
    capacityTotal: 800,
    capacityOccupied: 320,
    suppliesStatus: 'ADEQUATE',
    contactPhone: '0120-2828450',
    isOpen: true,
    type: 'COMMUNITY_CENTER',
  },
  {
    id: 'SHE-003',
    name: 'Sahibabad Indoor Stadium Camp',
    location: {
      lat: 28.6782,
      lng: 77.3512,
      address: 'Sahibabad Stadium, Sahibabad Industrial Area',
      wardOrDistrict: 'Sahibabad Zone',
    },
    capacityTotal: 4000,
    capacityOccupied: 2100,
    suppliesStatus: 'RESTOCKING',
    contactPhone: '0120-2779900',
    isOpen: true,
    type: 'STADIUM',
  },
  {
    id: 'SHE-004',
    name: 'GTB Hospital Trauma Centre',
    location: {
      lat: 28.6901,
      lng: 77.4678,
      address: 'GTB Hospital, Dilshad Garden',
      wardOrDistrict: 'Dilshad Garden',
    },
    capacityTotal: 350,
    capacityOccupied: 289,
    suppliesStatus: 'CRITICAL',
    contactPhone: '011-22591451',
    isOpen: true,
    type: 'HOSPITAL',
  },
];

// ─── Resource Units ───────────────────────────────────────────────────────────
export const MOCK_RESOURCES: ResourceUnit[] = [
  {
    id: 'RES-001',
    name: 'Flood Rescue Unit Alpha',
    type: 'FLOOD_RESCUE',
    status: 'DEPLOYED',
    location: { lat: 28.6390, lng: 77.5010, wardOrDistrict: 'Ward 12' },
    assignedIncidentId: 'INC-001',
  },
  {
    id: 'RES-002',
    name: 'Fire Tender 1',
    type: 'FIRE',
    status: 'DEPLOYED',
    location: { lat: 28.7415, lng: 77.2888, wardOrDistrict: 'Loni' },
    assignedIncidentId: 'INC-005',
  },
  {
    id: 'RES-003',
    name: 'PVVNL Grid Repair Team A',
    type: 'GRID_REPAIR',
    status: 'DEPLOYED',
    location: { lat: 28.6402, lng: 77.3730, wardOrDistrict: 'Ward 5' },
    assignedIncidentId: 'INC-002',
  },
  {
    id: 'RES-004',
    name: 'Ambulance Bay 4',
    type: 'AMBULANCE',
    status: 'EN_ROUTE',
    location: { lat: 28.6650, lng: 77.4600 },
    assignedIncidentId: 'INC-001',
  },
  {
    id: 'RES-005',
    name: 'Police PAC Unit 12',
    type: 'POLICE',
    status: 'DEPLOYED',
    location: { lat: 28.6605, lng: 77.4060, wardOrDistrict: 'Ward 11' },
    assignedIncidentId: 'INC-007',
  },
  {
    id: 'RES-006',
    name: 'Jal Tanker Fleet 3',
    type: 'WATER_TANKER',
    status: 'DEPLOYED',
    location: { lat: 28.6580, lng: 77.4400, wardOrDistrict: 'Ward 3' },
    assignedIncidentId: 'INC-004',
  },
  {
    id: 'RES-007',
    name: 'SDRF Team 3',
    type: 'FLOOD_RESCUE',
    status: 'AVAILABLE',
    location: { lat: 28.6700, lng: 77.4540 },
  },
  {
    id: 'RES-008',
    name: 'Ambulance Bay 7',
    type: 'AMBULANCE',
    status: 'AVAILABLE',
    location: { lat: 28.6720, lng: 77.4800 },
  },
];

// ─── Live Ticker Events ───────────────────────────────────────────────────────
export const INITIAL_TICKER_EVENTS: LiveTickerEvent[] = [
  {
    id: 'EVT-001',
    timestamp: '13:10',
    message: 'CRITICAL: Hindon River at 93.2m — exceeding danger mark by 2.7m. Evacuation in progress.',
    type: 'INCIDENT',
    severity: 'CRITICAL_EMERGENCY',
  },
  {
    id: 'EVT-002',
    timestamp: '13:08',
    message: 'Earthquake M3.1 reported near Indirapuram. NDRF Quick Response Team mobilized.',
    type: 'DISPATCH',
    severity: 'ADVISORY',
  },
  {
    id: 'EVT-003',
    timestamp: '13:05',
    message: 'LPG fire at Loni Estate — HazMat Unit Alpha on scene. 500m radius perimeter secured.',
    type: 'UPDATE',
    severity: 'WARNING',
  },
  {
    id: 'EVT-004',
    timestamp: '13:00',
    message: 'SMS alert dispatched to 42,500 residents in Ward 12-14 regarding flood evacuation.',
    type: 'ALERT',
    severity: 'CRITICAL_EMERGENCY',
  },
  {
    id: 'EVT-005',
    timestamp: '12:45',
    message: 'PVVNL: Power restoration ETA updated to 6 hours for Vasundhara Sectors 2, 4, 5.',
    type: 'UPDATE',
    severity: 'WARNING',
  },
  {
    id: 'EVT-006',
    timestamp: '12:15',
    message: 'Citizen report submitted: Waterlogging on Raj Nagar Main Road (Sector 7 crossing). Under review.',
    type: 'REPORT',
    severity: 'WATCH',
  },
  {
    id: 'EVT-007',
    timestamp: '11:30',
    message: 'Jal Tanker Fleet 3 deployed to 6 distribution points in Ward 3 & 4.',
    type: 'DISPATCH',
    severity: 'WATCH',
  },
  {
    id: 'EVT-008',
    timestamp: '10:00',
    message: 'Section 144 imposed in Sector 23. DM Order No. DM/GZB/2026/1847 in effect.',
    type: 'INCIDENT',
    severity: 'WARNING',
  },
];

// ─── Simulation Scenarios ─────────────────────────────────────────────────────
export const SIMULATION_SCENARIOS: SimulationScenario[] = [
  {
    id: 'SIM-001',
    name: 'Monsoon Inundation',
    description: 'Hindon river breaches → wards flood → roads close → mass evacuation triggered',
    icon: '🌊',
    incidentIds: ['INC-001', 'INC-003'],
    durationMinutes: 45,
  },
  {
    id: 'SIM-002',
    name: 'Grid & Pipeline Cascade',
    description: 'Storm strikes transformer → 4 wards go dark → pump stations fail → water outage',
    icon: '⚡',
    incidentIds: ['INC-002', 'INC-004'],
    durationMinutes: 30,
  },
  {
    id: 'SIM-003',
    name: 'Hazmat Emergency',
    description: 'LPG godown fire → BLEVE risk → evacuation radius calculated → sirens activated',
    icon: '☣️',
    incidentIds: ['INC-005'],
    durationMinutes: 20,
  },
];

// ─── Stats Aggregators ────────────────────────────────────────────────────────
export function getActiveIncidents(incidents: IncidentRecord[]) {
  return incidents.filter((i) => i.status === 'ACTIVE' || i.status === 'EVALUATING');
}

export function getTotalPopulationAtRisk(incidents: IncidentRecord[]) {
  return getActiveIncidents(incidents).reduce(
    (sum, i) => sum + i.estimatedImpactedPopulation,
    0
  );
}

export function getThreatIndex(incidents: IncidentRecord[]): number {
  const weights = { CRITICAL_EMERGENCY: 40, WARNING: 20, WATCH: 8, ADVISORY: 3 };
  const active = getActiveIncidents(incidents);
  const score = active.reduce((sum, i) => sum + (weights[i.severity] || 0), 0);
  return Math.min(100, score);
}
