import { useState, useEffect } from 'react';
import {
  Shield, AlertTriangle, Zap, Users,
  Play, Pause, Bell, ChevronDown, Eye, Radio,
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
    setAlertModalOpen,
  } = useStore();

  const [time, setTime] = useState(new Date());
  const [showScenarios, setShowScenarios] = useState(false);

  useEffect(() => {
    const t = setInterval(() => setTime(new Date()), 1000);
    return () => clearInterval(t);
  }, []);

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
        position: 'relative', zIndex: 100,
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

      <div style={{ flex: 1 }} />

      {/* Simulation bar — compact */}
      <div style={{
        display: 'flex', alignItems: 'center', gap: '6px',
        background: 'rgba(255,255,255,0.03)',
        border: '1px solid var(--border-subtle)',
        borderRadius: '7px', padding: '3px 8px',
      }}>
        <button
          onClick={() => setSimulationPlaying(!simulation.isPlaying)}
          style={{
            background: 'none', border: 'none', cursor: 'pointer',
            color: simulation.isPlaying ? '#10B981' : 'var(--color-text-muted)',
            display: 'flex', alignItems: 'center', gap: '4px',
            fontSize: '11px', fontFamily: 'var(--font-mono)', fontWeight: 600,
            padding: '2px 4px',
          }}
        >
          {simulation.isPlaying ? <Pause size={11} /> : <Play size={11} />}
          {simulation.isPlaying ? 'PAUSE' : 'PLAY'}
        </button>
        <div style={{ width: '1px', height: '14px', background: 'var(--border-subtle)' }} />
        {([1, 2, 5] as const).map((s) => (
          <button
            key={s}
            onClick={() => setSimulationSpeed(s)}
            style={{
              background: simulation.speed === s ? 'rgba(6,182,212,0.2)' : 'transparent',
              border: `1px solid ${simulation.speed === s ? '#06B6D4' : 'transparent'}`,
              color: simulation.speed === s ? '#06B6D4' : '#475569',
              borderRadius: '4px', padding: '1px 5px',
              fontSize: '10px', fontFamily: 'var(--font-mono)',
              cursor: 'pointer',
            }}
          >
            {s}x
          </button>
        ))}
        <div style={{ width: '1px', height: '14px', background: 'var(--border-subtle)' }} />
        <div style={{ position: 'relative' }}>
          <button
            onClick={() => setShowScenarios(!showScenarios)}
            style={{
              background: 'none', border: 'none', cursor: 'pointer',
              color: 'var(--color-text-muted)', fontSize: '11px',
              fontFamily: 'var(--font-mono)', fontWeight: 600,
              display: 'flex', alignItems: 'center', gap: '3px', padding: '2px 2px',
            }}
          >
            SCENARIOS <ChevronDown size={10} />
          </button>
          {showScenarios && (
            <div style={{
              position: 'absolute', top: 'calc(100% + 8px)', right: 0,
              background: 'var(--bg-panel)', border: '1px solid var(--border-subtle)',
              borderRadius: '10px', width: '220px',
              boxShadow: '0 12px 40px rgba(0,0,0,0.6)', zIndex: 200, overflow: 'hidden',
            }}>
              {SIMULATION_SCENARIOS.map((sc) => (
                <button
                  key={sc.id}
                  onClick={() => { loadScenario(sc.id); setShowScenarios(false); }}
                  style={{
                    display: 'flex', alignItems: 'flex-start', gap: '8px',
                    width: '100%', padding: '9px 12px',
                    background: simulation.activeScenarioId === sc.id ? 'rgba(6,182,212,0.1)' : 'transparent',
                    border: 'none', borderBottom: '1px solid var(--border-subtle)',
                    cursor: 'pointer', textAlign: 'left', color: 'var(--color-text-primary)',
                  }}
                  onMouseEnter={(e) => (e.currentTarget.style.background = 'rgba(255,255,255,0.04)')}
                  onMouseLeave={(e) => (e.currentTarget.style.background = simulation.activeScenarioId === sc.id ? 'rgba(6,182,212,0.1)' : 'transparent')}
                >
                  <span style={{ fontSize: '16px', flexShrink: 0 }}>{sc.icon}</span>
                  <div>
                    <div style={{ fontSize: '12px', fontWeight: 600 }}>{sc.name}</div>
                    <div style={{ fontSize: '10px', color: 'var(--color-text-muted)', marginTop: '2px', lineHeight: 1.4 }}>{sc.description}</div>
                  </div>
                </button>
              ))}
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
