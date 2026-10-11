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
  SimulationState,
} from '../types';
import {
  MOCK_INCIDENTS,
  MOCK_SHELTERS,
  MOCK_RESOURCES,
  INITIAL_TICKER_EVENTS,
  SIMULATION_SCENARIOS,
  getThreatIndex,
  getTotalPopulationAtRisk,
} from '../data/mockData';

interface FilterState {
  categories: IncidentCategory[];
  severities: SeverityLevel[];
  showResolved: boolean;
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
  loadScenario: (scenarioId: 'peaceful' | 'grid_cascade' | 'earthquake_cascade') => void;
  tickSimulation: () => void;
  rewindSimulation: () => void;

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
    currentPhaseIndex: 0,
    currentPhaseTitle: 'Baseline Nominal',
    statusMessage: 'District monitoring active. All sectors operating under normal baseline.',
    accuracyScore: null,
    probabilityScore: null,
    estimatedTimeWindow: null,
    reportsCount: 0,
  },
  setSimulationPlaying: (playing) =>
    set((state) => {
      // If user clicks play and no scenario is active, default to peaceful baseline
      if (playing && !state.simulation.activeScenarioId) {
        const peacefulScenario = SIMULATION_SCENARIOS.find((s) => s.id === 'peaceful');
        const phase0 = peacefulScenario?.phases[0];
        if (phase0) {
          return {
            simulation: {
              ...state.simulation,
              isPlaying: true,
              activeScenarioId: 'peaceful',
              elapsedSeconds: 0,
              currentPhaseIndex: 0,
              currentPhaseTitle: phase0.phaseTitle,
              statusMessage: phase0.statusMessage,
              accuracyScore: phase0.accuracyScore ?? null,
              probabilityScore: phase0.probabilityScore ?? null,
              estimatedTimeWindow: phase0.estimatedTime ?? null,
              reportsCount: phase0.reportsCount,
            },
            incidents: phase0.incidents,
            citizenReports: phase0.citizenReports,
            tickerEvents: [...phase0.tickerEvents, ...INITIAL_TICKER_EVENTS].slice(0, 50),
            threatIndex: phase0.threatIndex,
            totalPopulationAtRisk: getTotalPopulationAtRisk(phase0.incidents),
            activeOutageCount: phase0.incidents.filter(
              (i) => i.category === 'CIVIC_UTILITY' && (i.status === 'ACTIVE' || i.status === 'EVALUATING')
            ).length,
          };
        }
      }
      return { simulation: { ...state.simulation, isPlaying: playing } };
    }),
  setSimulationSpeed: (speed) =>
    set((state) => ({ simulation: { ...state.simulation, speed } })),
  loadScenario: (scenarioId) =>
    set((state) => {
      const scenario = SIMULATION_SCENARIOS.find((s) => s.id === scenarioId);
      if (!scenario) return state;
      const phase0 = scenario.phases[0];
      return {
        simulation: {
          isPlaying: true,
          speed: state.simulation.speed,
          activeScenarioId: scenarioId,
          elapsedSeconds: 0,
          currentPhaseIndex: 0,
          currentPhaseTitle: phase0.phaseTitle,
          statusMessage: phase0.statusMessage,
          accuracyScore: phase0.accuracyScore ?? null,
          probabilityScore: phase0.probabilityScore ?? null,
          estimatedTimeWindow: phase0.estimatedTime ?? null,
          reportsCount: phase0.reportsCount,
        },
        incidents: phase0.incidents,
        citizenReports: phase0.citizenReports,
        tickerEvents: [...phase0.tickerEvents, ...INITIAL_TICKER_EVENTS].slice(0, 50),
        threatIndex: phase0.threatIndex,
        totalPopulationAtRisk: getTotalPopulationAtRisk(phase0.incidents),
        activeOutageCount: phase0.incidents.filter(
          (i) => i.category === 'CIVIC_UTILITY' && (i.status === 'ACTIVE' || i.status === 'EVALUATING')
        ).length,
        selectedIncidentId: phase0.incidents[0]?.id || null,
      };
    }),
  rewindSimulation: () =>
    set((state) => {
      if (state.simulation.activeScenarioId) {
        const scenario = SIMULATION_SCENARIOS.find((s) => s.id === state.simulation.activeScenarioId);
        if (scenario) {
          const phase0 = scenario.phases[0];
          return {
            simulation: {
              ...state.simulation,
              isPlaying: false,
              elapsedSeconds: 0,
              currentPhaseIndex: 0,
              currentPhaseTitle: phase0.phaseTitle,
              statusMessage: phase0.statusMessage,
              accuracyScore: phase0.accuracyScore ?? null,
              probabilityScore: phase0.probabilityScore ?? null,
              estimatedTimeWindow: phase0.estimatedTime ?? null,
              reportsCount: phase0.reportsCount,
            },
            incidents: phase0.incidents,
            citizenReports: phase0.citizenReports,
            tickerEvents: [...phase0.tickerEvents, ...INITIAL_TICKER_EVENTS].slice(0, 50),
            threatIndex: phase0.threatIndex,
            totalPopulationAtRisk: getTotalPopulationAtRisk(phase0.incidents),
            activeOutageCount: phase0.incidents.filter(
              (i) => i.category === 'CIVIC_UTILITY' && (i.status === 'ACTIVE' || i.status === 'EVALUATING')
            ).length,
          };
        }
      }
      return {
        simulation: {
          ...state.simulation,
          isPlaying: false,
          elapsedSeconds: 0,
          currentPhaseIndex: 0,
          currentPhaseTitle: 'Baseline Nominal',
          statusMessage: 'District monitoring active. All sectors operating under normal baseline.',
          accuracyScore: null,
          probabilityScore: null,
          estimatedTimeWindow: null,
          reportsCount: 0,
          activeScenarioId: null,
        },
        incidents: MOCK_INCIDENTS,
        citizenReports: [],
        tickerEvents: INITIAL_TICKER_EVENTS,
        threatIndex: getThreatIndex(MOCK_INCIDENTS),
        totalPopulationAtRisk: getTotalPopulationAtRisk(MOCK_INCIDENTS),
        activeOutageCount: MOCK_INCIDENTS.filter(
          (i) => i.category === 'CIVIC_UTILITY' && (i.status === 'ACTIVE' || i.status === 'EVALUATING')
        ).length,
      };
    }),
  tickSimulation: () =>
    set((state) => {
      if (!state.simulation.isPlaying || !state.simulation.activeScenarioId) return state;
      const scenario = SIMULATION_SCENARIOS.find((s) => s.id === state.simulation.activeScenarioId);
      if (!scenario) return state;

      const nextElapsed = state.simulation.elapsedSeconds + state.simulation.speed;
      const eligiblePhases = scenario.phases.filter((p) => nextElapsed >= p.triggerSeconds);
      const targetPhase = eligiblePhases[eligiblePhases.length - 1] || scenario.phases[0];

      // New phase transition
      if (targetPhase.phaseIndex > state.simulation.currentPhaseIndex) {
        return {
          simulation: {
            ...state.simulation,
            elapsedSeconds: nextElapsed,
            currentPhaseIndex: targetPhase.phaseIndex,
            currentPhaseTitle: targetPhase.phaseTitle,
            statusMessage: targetPhase.statusMessage,
            accuracyScore: targetPhase.accuracyScore ?? null,
            probabilityScore: targetPhase.probabilityScore ?? null,
            estimatedTimeWindow: targetPhase.estimatedTime ?? null,
            reportsCount: targetPhase.reportsCount,
          },
          incidents: targetPhase.incidents,
          citizenReports: [...targetPhase.citizenReports, ...state.citizenReports].slice(0, 25),
          tickerEvents: [...targetPhase.tickerEvents, ...state.tickerEvents].slice(0, 50),
          threatIndex: targetPhase.threatIndex,
          totalPopulationAtRisk: getTotalPopulationAtRisk(targetPhase.incidents),
          activeOutageCount: targetPhase.incidents.filter(
            (i) => i.category === 'CIVIC_UTILITY' && (i.status === 'ACTIVE' || i.status === 'EVALUATING')
          ).length,
          selectedIncidentId: targetPhase.incidents[0]?.id || state.selectedIncidentId,
        };
      }

      // Intra-phase incremental telemetry
      const shouldBump = nextElapsed % 2 === 0;
      const bumpReports = shouldBump ? state.simulation.reportsCount + 1 : state.simulation.reportsCount;
      const bumpAccuracy =
        state.simulation.accuracyScore !== null && state.simulation.accuracyScore < 98
          ? Math.min(99.4, +(state.simulation.accuracyScore + (shouldBump ? 0.3 : 0)).toFixed(1))
          : state.simulation.accuracyScore;

      return {
        simulation: {
          ...state.simulation,
          elapsedSeconds: nextElapsed,
          reportsCount: bumpReports,
          accuracyScore: bumpAccuracy,
        },
      };
    }),

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
