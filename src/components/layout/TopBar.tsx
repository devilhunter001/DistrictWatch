import { useState, useEffect } from 'react';
import {
  Shield, AlertTriangle, Zap, Users,
  Play, Pause, Bell, ChevronDown, Eye, Radio, RotateCcw,
  CheckCircle2,
} from 'lucide-react';
import { useStore } from '../../store/useStore';
import { getThreatLevelLabel, formatPopulation } from '../../utils/helpers';
import { SIMULATION_SCENARIOS } from '../../data/mockData';

export function TopBar() {
  const {
    viewMode, setViewMode,
    threatIndex, totalPopulationAtRisk, activeOutageCount,
    incidents, simulation,
    setSimulationPlaying, setSimulationSpeed, loadScenario,
    tickSimulation, rewindSimulation,
    setAlertModalOpen,
  } = useStore();

  const [time, setTime] = useState(new Date());
  const [showScenarios, setShowScenarios] = useState(false);

  useEffect(() => {
    const t = setInterval(() => setTime(new Date()), 1000);
    return () => clearInterval(t);
  }, []);

  // Ticker loop while simulation is running
  useEffect(() => {
    if (!simulation.isPlaying) return;
    const interval = setInterval(() => {
      tickSimulation();
    }, 1000);
    return () => clearInterval(interval);
  }, [simulation.isPlaying, tickSimulation]);

  const threatLevel = getThreatLevelLabel(threatIndex);
  const activeCount = incidents.filter(
    (i) => i.status === 'ACTIVE' || i.status === 'EVALUATING'
  ).length;

  return (
    <header
      className="glass-panel"
      style={{
        height: '48px', flexShrink: 0,
        borderRadius: 0,
        borderTop: 'none', borderLeft: 'none', borderRight: 'none',
        borderBottom: '1px solid rgba(51,65,85,0.6)',
        display: 'flex', alignItems: 'center',
        padding: '0 14px', gap: '8px',
        position: 'relative', zIndex: 1200,
      }}
    >
      {/* Logo */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '7px', minWidth: '160px' }}>
        <div style={{
          width: '28px', height: '28px',
          background: 'linear-gradient(135deg, #0EA5E9, #06B6D4)',
          borderRadius: '7px', display: 'flex', alignItems: 'center', justifyContent: 'center',
          boxShadow: '0 0 12px rgba(6,182,212,0.4)',
          flexShrink: 0,
        }}>
          <Shield size={15} color="white" strokeWidth={2.5} />
        </div>
        <div>
          <div style={{ fontFamily: 'var(--font-display)', fontWeight: 800, fontSize: '14px', color: '#F1F5F9', letterSpacing: '-0.3px', lineHeight: 1 }}>
            DistrictWatch
          </div>
          <div style={{ fontSize: '9px', color: '#475569', fontFamily: 'var(--font-mono)', marginTop: '1px' }}>
            GZB DISTRICT
          </div>
        </div>
      </div>

      <Sep />

      {/* Threat Index — compact pill */}
      <div style={{
        display: 'flex', alignItems: 'center', gap: '6px',
        background: `${threatLevel.color}14`,
        border: `1px solid ${threatLevel.color}40`,
        borderRadius: '6px', padding: '3px 10px',
      }}>
        <AlertTriangle size={12} color={threatLevel.color} />
        <span style={{ fontFamily: 'var(--font-mono)', fontWeight: 800, fontSize: '16px', color: threatLevel.color }}>
          {threatIndex}
        </span>
        <span style={{ fontSize: '10px', color: threatLevel.color, fontWeight: 700 }}>{threatLevel.label}</span>
      </div>

      {/* Quick Stats */}
      <div style={{ display: 'flex', gap: '14px', alignItems: 'center', marginLeft: '4px' }}>
        <MiniStat icon={<AlertTriangle size={11} />} value={`${activeCount} active`} color="#EF4444" />
        <MiniStat icon={<Users size={11} />} value={`${formatPopulation(totalPopulationAtRisk)} at risk`} color="#F59E0B" />
        <MiniStat icon={<Zap size={11} />} value={`${activeOutageCount} outages`} color="#8B5CF6" />
        <MiniStat icon={<Radio size={11} className="led-blink" />} value="8 units" color="#10B981" />
      </div>

      {/* Dynamic Telemetry Pill when simulation is active */}
      {simulation.activeScenarioId && (
        <div style={{
          display: 'flex', alignItems: 'center', gap: '8px',
          background: simulation.activeScenarioId === 'earthquake_cascade'
            ? 'rgba(239,68,68,0.12)'
            : simulation.activeScenarioId === 'grid_cascade'
            ? 'rgba(245,158,11,0.12)'
            : 'rgba(16,185,129,0.12)',
          border: `1px solid ${
            simulation.activeScenarioId === 'earthquake_cascade'
              ? 'rgba(239,68,68,0.35)'
              : simulation.activeScenarioId === 'grid_cascade'
              ? 'rgba(245,158,11,0.35)'
              : 'rgba(16,185,129,0.35)'
          }`,
          borderRadius: '6px', padding: '3px 9px', marginLeft: '6px',
        }}>
          <span style={{ fontSize: '11px' }}>
            {simulation.activeScenarioId === 'earthquake_cascade' ? '🌋' : simulation.activeScenarioId === 'grid_cascade' ? '⚡' : '🟢'}
          </span>
          <span style={{
            fontSize: '10px', fontFamily: 'var(--font-mono)', fontWeight: 700,
            color: simulation.activeScenarioId === 'earthquake_cascade' ? '#EF4444' : simulation.activeScenarioId === 'grid_cascade' ? '#F59E0B' : '#10B981',
          }}>
            {simulation.activeScenarioId === 'earthquake_cascade' && (
              <>P(M6.2+): {simulation.probabilityScore}% • ETA: {simulation.estimatedTimeWindow || '~5m'} • {simulation.reportsCount} Reports</>
            )}
            {simulation.activeScenarioId === 'grid_cascade' && (
              <>AI ACCURACY: {simulation.accuracyScore}% • {simulation.reportsCount} Reports • Triangulating Fault</>
            )}
            {simulation.activeScenarioId === 'peaceful' && (
              <>CALM BASELINE • Normal Ops • All Grids Stable</>
            )}
          </span>
          {simulation.isPlaying && (
            <span style={{ width: '6px', height: '6px', borderRadius: '50%', background: '#10B981', boxShadow: '0 0 6px #10B981' }} className="led-blink" />
          )}
        </div>
      )}

      <div style={{ flex: 1 }} />

      {/* Simulation Control Bar */}
      <div style={{
        display: 'flex', alignItems: 'center', gap: '5px',
        background: 'rgba(255,255,255,0.03)',
        border: '1px solid var(--border-subtle)',
        borderRadius: '7px', padding: '3px 8px',
      }}>
        {/* Play / Pause button */}
        <button
          onClick={() => setSimulationPlaying(!simulation.isPlaying)}
          style={{
            background: simulation.isPlaying ? 'rgba(16,185,129,0.15)' : 'none',
            border: `1px solid ${simulation.isPlaying ? 'rgba(16,185,129,0.4)' : 'transparent'}`,
            borderRadius: '4px',
            cursor: 'pointer',
            color: simulation.isPlaying ? '#10B981' : 'var(--color-text-muted)',
            display: 'flex', alignItems: 'center', gap: '4px',
            fontSize: '11px', fontFamily: 'var(--font-mono)', fontWeight: 700,
            padding: '2px 6px',
            transition: 'all 0.15s ease',
          }}
          title={simulation.isPlaying ? 'Pause simulation at current state' : 'Play simulation'}
        >
          {simulation.isPlaying ? <Pause size={11} /> : <Play size={11} />}
          {simulation.isPlaying ? 'PAUSE' : 'PLAY'}
        </button>

        {/* Rewind / Reset button */}
        <button
          onClick={rewindSimulation}
          style={{
            background: 'none', border: 'none', cursor: 'pointer',
            color: '#94A3B8',
            display: 'flex', alignItems: 'center', gap: '3px',
            fontSize: '11px', fontFamily: 'var(--font-mono)', fontWeight: 600,
            padding: '2px 5px',
            borderRadius: '4px',
            transition: 'color 0.15s',
          }}
          title="Rewind / Reset simulation to start"
        >
          <RotateCcw size={11} />
          REWIND
        </button>

        <div style={{ width: '1px', height: '14px', background: 'var(--border-subtle)' }} />

        {/* Speed Controls */}
        {([1, 2, 5] as const).map((s) => (
          <button
            key={s}
            onClick={() => setSimulationSpeed(s)}
            style={{
              background: simulation.speed === s ? 'rgba(6,182,212,0.2)' : 'transparent',
              border: `1px solid ${simulation.speed === s ? '#06B6D4' : 'transparent'}`,
              color: simulation.speed === s ? '#06B6D4' : '#475569',
              borderRadius: '4px', padding: '1px 5px',
              fontSize: '10px', fontFamily: 'var(--font-mono)', fontWeight: 600,
              cursor: 'pointer',
            }}
          >
            {s}x
          </button>
        ))}

        <div style={{ width: '1px', height: '14px', background: 'var(--border-subtle)' }} />

        {/* Simulations Dropdown Button & Menu */}
        <div style={{ position: 'relative' }}>
          <button
            onClick={() => setShowScenarios(!showScenarios)}
            style={{
              background: showScenarios ? 'rgba(6,182,212,0.15)' : 'none',
              border: `1px solid ${showScenarios ? 'rgba(6,182,212,0.4)' : 'transparent'}`,
              borderRadius: '4px',
              cursor: 'pointer',
              color: simulation.activeScenarioId ? '#38BDF8' : 'var(--color-text-muted)',
              fontSize: '11px',
              fontFamily: 'var(--font-mono)', fontWeight: 700,
              display: 'flex', alignItems: 'center', gap: '4px', padding: '2px 6px',
            }}
          >
            SIMULATIONS <ChevronDown size={10} style={{ transform: showScenarios ? 'rotate(180deg)' : 'none', transition: 'transform 0.2s' }} />
          </button>

          {/* Full-screen backdrop to ensure click-outside closes dropdown */}
          {showScenarios && (
            <div
              onClick={() => setShowScenarios(false)}
              style={{
                position: 'fixed',
                inset: 0,
                zIndex: 2999,
                cursor: 'default',
              }}
            />
          )}

          {/* Dropdown Menu — high z-index (3000) prevents being covered by map */}
          {showScenarios && (
            <div style={{
              position: 'absolute', top: 'calc(100% + 8px)', right: 0,
              background: 'rgba(11, 17, 29, 0.98)',
              backdropFilter: 'blur(24px)',
              border: '1px solid rgba(56, 189, 248, 0.3)',
              borderRadius: '12px', width: '380px',
              boxShadow: '0 20px 50px rgba(0,0,0,0.85), 0 0 25px rgba(6, 182, 212, 0.2)',
              zIndex: 3000, overflow: 'hidden',
            }}>
              {/* Dropdown Header */}
              <div style={{ padding: '10px 14px', borderBottom: '1px solid rgba(51,65,85,0.6)', background: 'rgba(255,255,255,0.02)' }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <div style={{ fontSize: '11px', fontWeight: 800, color: '#38BDF8', fontFamily: 'var(--font-mono)', letterSpacing: '0.5px' }}>
                    DISTRICT SIMULATION ENGINE
                  </div>
                  <span style={{ fontSize: '10px', color: '#64748B', fontFamily: 'var(--font-mono)' }}>
                    3 SCENARIOS
                  </span>
                </div>
                <div style={{ fontSize: '10px', color: '#64748B', marginTop: '2px', lineHeight: 1.3 }}>
                  Select an operational scenario to preview real-time district response, report clustering & probabilistic models
                </div>
              </div>

              {/* Scenarios List */}
              <div style={{ maxHeight: '380px', overflowY: 'auto' }}>
                {SIMULATION_SCENARIOS.map((sc) => {
                  const isActive = simulation.activeScenarioId === sc.id;
                  const badgeColor =
                    sc.severity === 'CALM'
                      ? '#10B981'
                      : sc.severity === 'MODERATE'
                      ? '#F59E0B'
                      : '#EF4444';

                  return (
                    <button
                      key={sc.id}
                      onClick={() => {
                        loadScenario(sc.id);
                        setShowScenarios(false);
                      }}
                      style={{
                        display: 'flex', alignItems: 'flex-start', gap: '10px',
                        width: '100%', padding: '12px 14px',
                        background: isActive ? 'rgba(6,182,212,0.12)' : 'transparent',
                        border: 'none',
                        borderBottom: '1px solid rgba(51,65,85,0.4)',
                        borderLeft: isActive ? `3px solid ${badgeColor}` : '3px solid transparent',
                        cursor: 'pointer', textAlign: 'left', color: 'var(--color-text-primary)',
                        transition: 'background 0.15s ease',
                      }}
                      onMouseEnter={(e) => {
                        if (!isActive) e.currentTarget.style.background = 'rgba(255,255,255,0.05)';
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.background = isActive ? 'rgba(6,182,212,0.12)' : 'transparent';
                      }}
                    >
                      <span style={{ fontSize: '20px', flexShrink: 0, marginTop: '2px' }}>{sc.icon}</span>
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '6px' }}>
                          <span style={{ fontSize: '12px', fontWeight: 700, color: '#F1F5F9' }}>
                            {sc.name}
                          </span>
                          <span style={{
                            fontSize: '9px', fontWeight: 700, fontFamily: 'var(--font-mono)',
                            color: badgeColor, background: `${badgeColor}18`,
                            border: `1px solid ${badgeColor}40`,
                            padding: '1px 6px', borderRadius: '4px', flexShrink: 0,
                          }}>
                            {sc.badge}
                          </span>
                        </div>
                        <div style={{ fontSize: '11px', color: '#94A3B8', marginTop: '3px', fontWeight: 500 }}>
                          {sc.tagline}
                        </div>
                        <div style={{ fontSize: '10px', color: '#64748B', marginTop: '4px', lineHeight: 1.4 }}>
                          {sc.description}
                        </div>
                        {isActive && (
                          <div style={{
                            display: 'inline-flex', alignItems: 'center', gap: '4px',
                            marginTop: '6px', fontSize: '10px', color: '#38BDF8',
                            fontFamily: 'var(--font-mono)', fontWeight: 700,
                          }}>
                            <CheckCircle2 size={11} /> ACTIVE NOW • {simulation.isPlaying ? 'RUNNING' : 'PAUSED'}
                          </div>
                        )}
                      </div>
                    </button>
                  );
                })}
              </div>

              {/* Dropdown Footer */}
              <div style={{
                padding: '8px 14px', background: 'rgba(0,0,0,0.4)',
                borderTop: '1px solid rgba(51,65,85,0.4)',
                display: 'flex', alignItems: 'center', justifyContent: 'space-between',
              }}>
                <span style={{ fontSize: '10px', color: '#475569', fontFamily: 'var(--font-mono)' }}>
                  Use PLAY / PAUSE / REWIND at any time
                </span>
                {simulation.activeScenarioId && (
                  <button
                    onClick={() => { rewindSimulation(); setShowScenarios(false); }}
                    style={{
                      background: 'none', border: 'none', color: '#EF4444',
                      fontSize: '10px', fontFamily: 'var(--font-mono)', cursor: 'pointer',
                      fontWeight: 600, padding: 0,
                    }}
                  >
                    Reset Baseline
                  </button>
                )}
              </div>
            </div>
          )}
        </div>
      </div>

      <Sep />

      {/* View Toggle */}
      <div style={{
        display: 'flex', background: 'rgba(255,255,255,0.04)',
        border: '1px solid var(--border-subtle)', borderRadius: '7px', padding: '2px', gap: '2px',
      }}>
        <ViewBtn active={viewMode === 'COMMAND'} onClick={() => setViewMode('COMMAND')} label="COMMAND" />
        <ViewBtn active={viewMode === 'CITIZEN'} onClick={() => setViewMode('CITIZEN')} label="CITIZEN" />
      </div>

      {/* Alert */}
      {viewMode === 'COMMAND' && (
        <button
          className="btn-danger"
          style={{ padding: '5px 11px', fontSize: '12px' }}
          onClick={() => setAlertModalOpen(true)}
        >
          <Bell size={11} /> ALERT
        </button>
      )}

      <Sep />

      {/* Clock */}
      <div style={{ textAlign: 'right', minWidth: '72px' }}>
        <div style={{ fontFamily: 'var(--font-mono)', fontSize: '13px', fontWeight: 700, color: '#06B6D4', lineHeight: 1 }}>
          {time.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: false })}
        </div>
        <div style={{ fontFamily: 'var(--font-mono)', fontSize: '9px', color: '#475569', marginTop: '2px' }}>
          IST
        </div>
      </div>
    </header>
  );
}

function Sep() {
  return <div style={{ width: '1px', height: '24px', background: 'rgba(51,65,85,0.7)', flexShrink: 0 }} />;
}

function MiniStat({ icon, value, color }: { icon: React.ReactNode; value: string; color: string }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
      <span style={{ color }}>{icon}</span>
      <span style={{ fontSize: '11px', color: '#94A3B8', fontFamily: 'var(--font-mono)' }}>{value}</span>
    </div>
  );
}

function ViewBtn({ active, onClick, label }: { active: boolean; onClick: () => void; label: string }) {
  return (
    <button
      onClick={onClick}
      style={{
        display: 'flex', alignItems: 'center', gap: '4px', padding: '3px 10px',
        background: active ? 'rgba(6,182,212,0.2)' : 'transparent',
        border: `1px solid ${active ? 'rgba(6,182,212,0.5)' : 'transparent'}`,
        borderRadius: '5px', cursor: 'pointer',
        color: active ? '#06B6D4' : '#475569',
        fontSize: '11px', fontWeight: 600, fontFamily: 'var(--font-mono)',
      }}
    >
      <Eye size={10} /> {label}
    </button>
  );
}
