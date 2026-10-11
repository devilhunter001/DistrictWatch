import { create } from 'zustand';
import type {
  IncidentRecord,
  EmergencyShelter,
  ResourceUnit,
  ViewMode,
  SeverityLevel,
  IncidentCategory,
  LiveTickerEvent,
  CitizenReport,
} from '../types';
import {
  MOCK_INCIDENTS,
  MOCK_SHELTERS,
  MOCK_RESOURCES,
  INITIAL_TICKER_EVENTS,
  getThreatIndex,
  getTotalPopulationAtRisk,
} from '../data/mockData';

interface FilterState {
  categories: IncidentCategory[];
  severities: SeverityLevel[];
  showResolved: boolean;
}

interface SimulationState {
  isPlaying: boolean;
  speed: 1 | 2 | 5;
  activeScenarioId: string | null;
  elapsedSeconds: number;
}

interface DistrictWatchStore {
  // View
  viewMode: ViewMode;
  setViewMode: (mode: ViewMode) => void;

  // Incidents
  incidents: IncidentRecord[];
  selectedIncidentId: string | null;
  selectIncident: (id: string | null) => void;
  addIncident: (incident: IncidentRecord) => void;
  updateIncidentStatus: (id: string, status: IncidentRecord['status']) => void;

  // Shelters & Resources
  shelters: EmergencyShelter[];
  resources: ResourceUnit[];

  // Filters
  filters: FilterState;
  setFilterCategory: (cat: IncidentCategory, active: boolean) => void;
  setFilterSeverity: (sev: SeverityLevel, active: boolean) => void;
  toggleShowResolved: () => void;

  // Ticker
  tickerEvents: LiveTickerEvent[];
  addTickerEvent: (event: LiveTickerEvent) => void;

  // Citizen reports
  citizenReports: CitizenReport[];
  addCitizenReport: (report: CitizenReport) => void;

  // Simulation
  simulation: SimulationState;
  setSimulationPlaying: (playing: boolean) => void;
  setSimulationSpeed: (speed: 1 | 2 | 5) => void;
  loadScenario: (scenarioId: string) => void;

  // Derived
  threatIndex: number;
  totalPopulationAtRisk: number;
  activeOutageCount: number;

  // UI state
  isAlertModalOpen: boolean;
  setAlertModalOpen: (open: boolean) => void;
  isNewIncidentModalOpen: boolean;
  setNewIncidentModalOpen: (open: boolean) => void;
  isCitizenReportModalOpen: boolean;
  setCitizenReportModalOpen: (open: boolean) => void;
  isSidebarOpen: boolean;
  setSidebarOpen: (open: boolean) => void;
}

export const useStore = create<DistrictWatchStore>((set) => ({
  viewMode: 'COMMAND',
  setViewMode: (mode) => set({ viewMode: mode }),

  incidents: MOCK_INCIDENTS,
  selectedIncidentId: null,
  selectIncident: (id) => set({ selectedIncidentId: id }),
  addIncident: (incident) =>
    set((state) => {
      const newIncidents = [incident, ...state.incidents];
      return {
        incidents: newIncidents,
        threatIndex: getThreatIndex(newIncidents),
        totalPopulationAtRisk: getTotalPopulationAtRisk(newIncidents),
      };
    }),
  updateIncidentStatus: (id, status) =>
    set((state) => {
      const newIncidents = state.incidents.map((i) =>
        i.id === id ? { ...i, status, updatedAt: new Date().toISOString() } : i
      );
      return {
        incidents: newIncidents,
        threatIndex: getThreatIndex(newIncidents),
        totalPopulationAtRisk: getTotalPopulationAtRisk(newIncidents),
      };
    }),

  shelters: MOCK_SHELTERS,
  resources: MOCK_RESOURCES,

  filters: {
    categories: [],
    severities: [],
    showResolved: false,
  },
  setFilterCategory: (cat, active) =>
    set((state) => ({
      filters: {
        ...state.filters,
        categories: active
          ? [...state.filters.categories, cat]
          : state.filters.categories.filter((c) => c !== cat),
      },
    })),
  setFilterSeverity: (sev, active) =>
    set((state) => ({
      filters: {
        ...state.filters,
        severities: active
          ? [...state.filters.severities, sev]
          : state.filters.severities.filter((s) => s !== sev),
      },
    })),
  toggleShowResolved: () =>
    set((state) => ({
      filters: { ...state.filters, showResolved: !state.filters.showResolved },
    })),

  tickerEvents: INITIAL_TICKER_EVENTS,
  addTickerEvent: (event) =>
    set((state) => ({ tickerEvents: [event, ...state.tickerEvents].slice(0, 50) })),

  citizenReports: [],
  addCitizenReport: (report) =>
    set((state) => ({ citizenReports: [report, ...state.citizenReports] })),

  simulation: {
    isPlaying: false,
    speed: 1,
    activeScenarioId: null,
    elapsedSeconds: 0,
  },
  setSimulationPlaying: (playing) =>
    set((state) => ({ simulation: { ...state.simulation, isPlaying: playing } })),
  setSimulationSpeed: (speed) =>
    set((state) => ({ simulation: { ...state.simulation, speed } })),
  loadScenario: (scenarioId) =>
    set((state) => ({
      simulation: { ...state.simulation, activeScenarioId: scenarioId, isPlaying: true, elapsedSeconds: 0 },
    })),

  threatIndex: getThreatIndex(MOCK_INCIDENTS),
  totalPopulationAtRisk: getTotalPopulationAtRisk(MOCK_INCIDENTS),
  activeOutageCount: MOCK_INCIDENTS.filter(
    (i) => i.category === 'CIVIC_UTILITY' && (i.status === 'ACTIVE' || i.status === 'EVALUATING')
  ).length,

  isAlertModalOpen: false,
  setAlertModalOpen: (open) => set({ isAlertModalOpen: open }),
  isNewIncidentModalOpen: false,
  setNewIncidentModalOpen: (open) => set({ isNewIncidentModalOpen: open }),
  isCitizenReportModalOpen: false,
  setCitizenReportModalOpen: (open) => set({ isCitizenReportModalOpen: open }),
  isSidebarOpen: true,
  setSidebarOpen: (open) => set({ isSidebarOpen: open }),
}));
