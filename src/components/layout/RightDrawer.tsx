import {
  X, MapPin, Clock, Users, Radio,
  Zap, ChevronRight, Send, CheckCircle, Shield,
  Thermometer, Waves, Wind,
} from 'lucide-react';
import { useStore } from '../../store/useStore';
import {
  getSeverityColor, getSeverityLabel, getCategoryLabel,
  getCategoryIcon, formatPopulation, formatTimeAgo, getStatusColor,
} from '../../utils/helpers';

export function RightDrawer() {
  const {
    incidents, selectedIncidentId, selectIncident,
    updateIncidentStatus, setAlertModalOpen, viewMode,
  } = useStore();

  const incident = incidents.find((i) => i.id === selectedIncidentId);
  if (!incident) return null;

  const severityColor = getSeverityColor(incident.severity);

  return (
    <aside
      className="glass-panel animate-slide-in-right"
      style={{
        width: '360px', flexShrink: 0,
        display: 'flex', flexDirection: 'column',
        borderRadius: 0, borderTop: 'none', borderBottom: 'none', borderRight: 'none',
        overflowY: 'auto', zIndex: 50,
      }}
    >
      {/* Header */}
      <div
        style={{
          padding: '14px 16px', flexShrink: 0,
          borderBottom: '1px solid var(--border-subtle)',
          background: `linear-gradient(135deg, ${severityColor}15, transparent)`,
        }}
      >
        <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: '8px' }}>
          <div style={{ display: 'flex', alignItems: 'flex-start', gap: '10px', flex: 1 }}>
            <span style={{ fontSize: '24px' }}>{getCategoryIcon(incident.category)}</span>
            <div>
              <div style={{ fontWeight: 700, fontSize: '14px', lineHeight: 1.3, color: 'var(--color-text-primary)', fontFamily: 'var(--font-display)' }}>
                {incident.title}
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginTop: '5px', flexWrap: 'wrap' }}>
                <span
                  style={{
                    background: `${severityColor}20`, color: severityColor,
                    border: `1px solid ${severityColor}50`,
                    borderRadius: '4px', padding: '1px 7px',
                    fontSize: '10px', fontWeight: 700, fontFamily: 'var(--font-mono)',
                  }}
                >
                  {getSeverityLabel(incident.severity)}
                </span>
                <span style={{ fontSize: '10px', color: 'var(--color-text-muted)', background: 'rgba(255,255,255,0.05)', padding: '1px 6px', borderRadius: '4px' }}>
                  {getCategoryLabel(incident.category)}
                </span>
                <div style={{ display: 'flex', alignItems: 'center', gap: '3px' }}>
                  <div
                    className={incident.status === 'ACTIVE' ? 'led-blink' : ''}
                    style={{ width: '6px', height: '6px', borderRadius: '50%', background: getStatusColor(incident.status) }}
                  />
                  <span style={{ fontSize: '10px', color: getStatusColor(incident.status), fontWeight: 700, fontFamily: 'var(--font-mono)' }}>
                    {incident.status}
                  </span>
                </div>
              </div>
            </div>
          </div>
          <button
            onClick={() => selectIncident(null)}
            style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--color-text-muted)', padding: '2px', flexShrink: 0, display: 'flex' }}
          >
            <X size={16} />
          </button>
        </div>

        {/* ID Badge */}
        <div style={{ marginTop: '8px', fontSize: '10px', color: 'var(--color-text-muted)', fontFamily: 'var(--font-mono)' }}>
          ID: {incident.id} · {incident.subType}
        </div>
      </div>

      {/* Content */}
      <div style={{ flex: 1, overflowY: 'auto' }}>
        {/* Stats Row */}
        <div
          style={{
            display: 'grid', gridTemplateColumns: '1fr 1fr 1fr',
            gap: '1px', background: 'var(--border-subtle)',
            borderBottom: '1px solid var(--border-subtle)',
          }}
        >
          <StatCell icon={<Users size={12} />} label="Affected" value={formatPopulation(incident.estimatedImpactedPopulation)} />
          <StatCell icon={<Radio size={12} />} label="Radius" value={`${(incident.radiusMeters / 1000).toFixed(1)} km`} />
          <StatCell icon={<Clock size={12} />} label="Reported" value={formatTimeAgo(incident.reportedAt)} />
        </div>

        {/* Location */}
        <Section title="Location">
          <div style={{ display: 'flex', alignItems: 'flex-start', gap: '8px' }}>
            <MapPin size={13} color={severityColor} style={{ flexShrink: 0, marginTop: '1px' }} />
            <div>
              <div style={{ fontSize: '12px', color: 'var(--color-text-primary)', fontWeight: 500 }}>
                {incident.location.address}
              </div>
              <div style={{ fontSize: '11px', color: 'var(--color-text-muted)', marginTop: '2px' }}>
                {incident.location.wardOrDistrict}
              </div>
              <div style={{ fontSize: '10px', color: 'var(--color-text-muted)', fontFamily: 'var(--font-mono)', marginTop: '3px' }}>
                {incident.location.lat.toFixed(4)}°N, {incident.location.lng.toFixed(4)}°E
              </div>
            </div>
          </div>
        </Section>

        {/* Description */}
        <Section title="Situation Report">
          <p style={{ fontSize: '12px', color: 'var(--color-text-secondary)', lineHeight: 1.6 }}>
            {incident.description}
          </p>
        </Section>

        {/* Metrics */}
        {incident.metrics && Object.keys(incident.metrics).length > 0 && (
          <Section title="Live Telemetry">
            <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
              {incident.metrics.waterLevelMeters !== undefined && (
                <MetricRow icon={<Waves size={12} />} label="River Level" value={`${incident.metrics.waterLevelMeters}m`} color="#06B6D4" />
              )}
              {incident.metrics.powerOutageCustomers !== undefined && (
                <MetricRow icon={<Zap size={12} />} label="Disconnected" value={`${incident.metrics.powerOutageCustomers.toLocaleString()} homes`} color="#8B5CF6" />
              )}
              {incident.metrics.windSpeedKmh !== undefined && (
                <MetricRow icon={<Wind size={12} />} label="Wind Speed" value={`${incident.metrics.windSpeedKmh} km/h`} color="#F59E0B" />
              )}
              {incident.metrics.gasConcentrationPpm !== undefined && (
                <MetricRow icon={<Thermometer size={12} />} label="Gas Conc." value={`${incident.metrics.gasConcentrationPpm} PPM`} color="#EF4444" />
              )}
              {incident.metrics.affectedWards && (
                <MetricRow icon={<MapPin size={12} />} label="Affected Wards" value={incident.metrics.affectedWards.join(', ')} color="#10B981" />
              )}
              {incident.metrics.roadClosureLengthKm !== undefined && (
                <MetricRow icon={<ChevronRight size={12} />} label="Closure Length" value={`${incident.metrics.roadClosureLengthKm} km`} color="#F59E0B" />
              )}
            </div>
          </Section>
        )}

        {/* Recommended Action */}
        <Section title="Recommended Action">
          <div
            style={{
              background: 'rgba(16,185,129,0.08)', border: '1px solid rgba(16,185,129,0.25)',
              borderRadius: '8px', padding: '10px 12px',
              display: 'flex', gap: '8px', alignItems: 'flex-start',
            }}
          >
            <CheckCircle size={13} color="#10B981" style={{ flexShrink: 0, marginTop: '1px' }} />
            <p style={{ fontSize: '12px', color: '#A7F3D0', lineHeight: 1.6 }}>
              {incident.recommendedAction}
            </p>
          </div>
        </Section>

        {/* Assigned Teams */}
        {incident.assignedTeams && incident.assignedTeams.length > 0 && (
          <Section title="Deployed Units">
            <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
              {incident.assignedTeams.map((team, i) => (
                <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '12px', color: 'var(--color-text-secondary)' }}>
                  <div className="led-blink" style={{ width: '6px', height: '6px', borderRadius: '50%', background: '#10B981', flexShrink: 0 }} />
                  {team}
                </div>
              ))}
            </div>
          </Section>
        )}

        {/* Source */}
        <Section title="Official Source">
          <div style={{ display: 'flex', alignItems: 'flex-start', gap: '6px' }}>
            <Shield size={12} color="var(--color-advisory)" style={{ flexShrink: 0, marginTop: '1px' }} />
            <span style={{ fontSize: '11px', color: 'var(--color-text-muted)' }}>{incident.officialSource}</span>
          </div>
          <div style={{ fontSize: '10px', color: 'var(--color-text-muted)', marginTop: '5px', fontFamily: 'var(--font-mono)' }}>
            Last updated: {formatTimeAgo(incident.updatedAt)}
          </div>
        </Section>
      </div>

      {/* Action Footer */}
      {viewMode === 'COMMAND' && (
        <div
          style={{
            padding: '12px 16px', borderTop: '1px solid var(--border-subtle)',
            display: 'flex', gap: '8px', flexShrink: 0,
          }}
        >
          <button
            className="btn-danger"
            style={{ flex: 1, justifyContent: 'center', fontSize: '12px' }}
            onClick={() => setAlertModalOpen(true)}
          >
            <Send size={11} /> DISPATCH ALERT
          </button>
          {incident.status !== 'RESOLVED' && (
            <button
              className="btn-ghost"
              style={{ fontSize: '12px' }}
              onClick={() => updateIncidentStatus(incident.id, 'CONTAINED')}
            >
              <CheckCircle size={11} /> CONTAIN
            </button>
          )}
        </div>
      )}
    </aside>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div style={{ padding: '12px 16px', borderBottom: '1px solid var(--border-subtle)' }}>
      <div style={{ fontSize: '10px', color: 'var(--color-text-muted)', fontWeight: 700, fontFamily: 'var(--font-mono)', marginBottom: '8px', letterSpacing: '0.5px' }}>
        {title.toUpperCase()}
      </div>
      {children}
    </div>
  );
}

function StatCell({ icon, label, value }: { icon: React.ReactNode; label: string; value: string }) {
  return (
    <div style={{ padding: '10px 12px', background: 'var(--bg-surface)', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '3px' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '4px', color: 'var(--color-text-muted)', fontSize: '10px' }}>
        {icon} {label}
      </div>
      <div style={{ fontFamily: 'var(--font-mono)', fontWeight: 700, fontSize: '14px', color: 'var(--color-text-primary)' }}>
        {value}
      </div>
    </div>
  );
}

function MetricRow({ icon, label, value, color }: { icon: React.ReactNode; label: string; value: string; color: string }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '5px 8px', background: 'rgba(255,255,255,0.03)', borderRadius: '6px' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '5px', color: 'var(--color-text-muted)', fontSize: '11px' }}>
        <span style={{ color }}>{icon}</span>
        {label}
      </div>
      <span style={{ fontFamily: 'var(--font-mono)', fontSize: '12px', fontWeight: 700, color }}>{value}</span>
    </div>
  );
}
