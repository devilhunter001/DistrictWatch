import { useState } from 'react';
import {
  AlertTriangle, Filter, Search, MapPin,
  ChevronDown, ChevronUp, Plus, X, Users, Zap,
  Waves, Construction, ShieldAlert,
} from 'lucide-react';
import { useStore } from '../../store/useStore';
import type { IncidentCategory, SeverityLevel } from '../../types';
import {
  getSeverityColor, getSeverityLabel,
  formatPopulation, formatTimeAgo, getStatusColor,
} from '../../utils/helpers';

const CATEGORIES: { value: IncidentCategory; icon: React.ReactNode }[] = [
  { value: 'NATURAL_DISASTER', icon: <Waves size={11} /> },
  { value: 'CIVIC_UTILITY', icon: <Zap size={11} /> },
  { value: 'INFRASTRUCTURE', icon: <Construction size={11} /> },
  { value: 'PUBLIC_SAFETY', icon: <ShieldAlert size={11} /> },
];

const SEVERITIES: { value: SeverityLevel; label: string; color: string }[] = [
  { value: 'CRITICAL_EMERGENCY', label: 'CRIT', color: '#EF4444' },
  { value: 'WARNING', label: 'WARN', color: '#F59E0B' },
  { value: 'WATCH', label: 'WATCH', color: '#8B5CF6' },
  { value: 'ADVISORY', label: 'ADV', color: '#06B6D4' },
];

export function LeftSidebar() {
  const {
    incidents, selectedIncidentId, selectIncident,
    filters, setFilterCategory, setFilterSeverity,
    viewMode, setNewIncidentModalOpen,
  } = useStore();

  const [searchQuery, setSearchQuery] = useState('');
  const [showFilters, setShowFilters] = useState(false);

  const filteredIncidents = incidents.filter((inc) => {
    if (!filters.showResolved && inc.status === 'RESOLVED') return false;
    if (filters.categories.length > 0 && !filters.categories.includes(inc.category)) return false;
    if (filters.severities.length > 0 && !filters.severities.includes(inc.severity)) return false;
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      return (
        inc.title.toLowerCase().includes(q) ||
        inc.location.wardOrDistrict?.toLowerCase().includes(q) ||
        inc.subType.toLowerCase().includes(q)
      );
    }
    return true;
  });

  return (
    <aside
      className="glass-panel animate-slide-in-left"
      style={{
        width: '280px', flexShrink: 0,
        display: 'flex', flexDirection: 'column',
        borderRadius: 0, borderTop: 'none', borderBottom: 'none', borderLeft: 'none',
        zIndex: 50, overflow: 'hidden',
      }}
    >
      {/* Header */}
      <div style={{
        padding: '8px 12px', borderBottom: '1px solid var(--border-subtle)',
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        flexShrink: 0,
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
          <AlertTriangle size={13} color="#EF4444" />
          <span style={{ fontWeight: 700, fontSize: '12px' }}>Incidents</span>
          <span style={{
            background: 'rgba(239,68,68,0.15)', color: '#EF4444',
            border: '1px solid rgba(239,68,68,0.3)',
            borderRadius: '8px', padding: '0 6px', fontSize: '10px', fontWeight: 700,
          }}>
            {filteredIncidents.length}
          </span>
        </div>
        <div style={{ display: 'flex', gap: '5px' }}>
          <button
            className="btn-ghost"
            style={{ padding: '3px 7px', fontSize: '10px', gap: '3px' }}
            onClick={() => setShowFilters(!showFilters)}
          >
            <Filter size={10} />
            {showFilters ? <ChevronUp size={10} /> : <ChevronDown size={10} />}
          </button>
          {viewMode === 'COMMAND' && (
            <button
              className="btn-primary"
              style={{ padding: '3px 7px', fontSize: '10px', gap: '3px' }}
              onClick={() => setNewIncidentModalOpen(true)}
            >
              <Plus size={10} /> NEW
            </button>
          )}
        </div>
      </div>

      {/* Search */}
      <div style={{ padding: '7px 10px', borderBottom: '1px solid var(--border-subtle)', flexShrink: 0 }}>
        <div style={{ position: 'relative' }}>
          <Search size={11} style={{ position: 'absolute', left: '8px', top: '50%', transform: 'translateY(-50%)', color: '#475569' }} />
          <input
            className="dw-input"
            style={{ paddingLeft: '26px', fontSize: '12px', padding: '5px 8px 5px 26px' }}
            placeholder="Search incidents, wards..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
          {searchQuery && (
            <button onClick={() => setSearchQuery('')} style={{ position: 'absolute', right: '7px', top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', color: '#475569', display: 'flex' }}>
              <X size={10} />
            </button>
          )}
        </div>
      </div>

      {/* Filters */}
      {showFilters && (
        <div style={{ padding: '8px 10px', borderBottom: '1px solid var(--border-subtle)', flexShrink: 0 }}>
          {/* Category chips */}
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '4px', marginBottom: '6px' }}>
            {CATEGORIES.map((cat) => {
              const active = filters.categories.includes(cat.value);
              return (
                <button
                  key={cat.value}
                  onClick={() => setFilterCategory(cat.value, !active)}
                  style={{
                    display: 'flex', alignItems: 'center', gap: '3px',
                    padding: '2px 7px', borderRadius: '4px',
                    background: active ? 'rgba(6,182,212,0.15)' : 'rgba(255,255,255,0.04)',
                    border: `1px solid ${active ? 'rgba(6,182,212,0.4)' : 'var(--border-subtle)'}`,
                    color: active ? '#06B6D4' : '#64748B',
                    cursor: 'pointer', fontSize: '10px',
                  }}
                >
                  {cat.icon}
                </button>
              );
            })}
          </div>
          {/* Severity chips */}
          <div style={{ display: 'flex', gap: '4px', flexWrap: 'wrap' }}>
            {SEVERITIES.map((sev) => {
              const active = filters.severities.includes(sev.value);
              return (
                <button
                  key={sev.value}
                  onClick={() => setFilterSeverity(sev.value, !active)}
                  style={{
                    padding: '2px 7px', borderRadius: '4px', fontSize: '9px', fontWeight: 700,
                    background: active ? `${sev.color}18` : 'rgba(255,255,255,0.04)',
                    border: `1px solid ${active ? `${sev.color}50` : 'var(--border-subtle)'}`,
                    color: active ? sev.color : '#475569',
                    cursor: 'pointer', fontFamily: 'var(--font-mono)',
                  }}
                >
                  {sev.label}
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* Incident List */}
      <div style={{ flex: 1, overflowY: 'auto', padding: '6px' }}>
        {filteredIncidents.length === 0 ? (
          <div style={{ padding: '24px 12px', textAlign: 'center', color: '#475569' }}>
            <AlertTriangle size={20} style={{ margin: '0 auto 6px', opacity: 0.3 }} />
            <div style={{ fontSize: '12px' }}>No incidents match filters</div>
          </div>
        ) : (
          filteredIncidents.map((inc) => {
            const sevColor = getSeverityColor(inc.severity);
            const isSelected = selectedIncidentId === inc.id;
            return (
              <div
                key={inc.id}
                className={`incident-card ${isSelected ? 'selected' : ''}`}
                style={{
                  padding: '8px 10px', marginBottom: '3px', borderRadius: '7px',
                  borderLeftColor: sevColor,
                  background: isSelected ? 'rgba(6,182,212,0.07)' : undefined,
                }}
                onClick={() => selectIncident(isSelected ? null : inc.id)}
              >
                {/* Title row */}
                <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: '6px', marginBottom: '4px' }}>
                  <span style={{ fontSize: '12px', fontWeight: 600, color: '#E2E8F0', lineHeight: 1.3, flex: 1 }}>
                    {inc.title}
                  </span>
                  <span style={{
                    fontSize: '9px', fontWeight: 700, padding: '1px 5px', borderRadius: '3px',
                    background: `${sevColor}20`, color: sevColor, border: `1px solid ${sevColor}40`,
                    flexShrink: 0, fontFamily: 'var(--font-mono)',
                  }}>
                    {getSeverityLabel(inc.severity)}
                  </span>
                </div>

                {/* Meta row */}
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '3px', color: '#475569', minWidth: 0 }}>
                    <MapPin size={9} style={{ flexShrink: 0 }} />
                    <span style={{ fontSize: '10px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                      {inc.location.wardOrDistrict}
                    </span>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '4px', flexShrink: 0, marginLeft: '6px' }}>
                    <div
                      className={inc.status === 'ACTIVE' ? 'led-blink' : ''}
                      style={{ width: '5px', height: '5px', borderRadius: '50%', background: getStatusColor(inc.status) }}
                    />
                    <span style={{ fontSize: '9px', color: '#475569', fontFamily: 'var(--font-mono)' }}>
                      {formatTimeAgo(inc.reportedAt)}
                    </span>
                  </div>
                </div>

                {/* Population */}
                <div style={{ display: 'flex', alignItems: 'center', gap: '3px', color: '#475569', marginTop: '3px' }}>
                  <Users size={9} />
                  <span style={{ fontSize: '10px' }}>{formatPopulation(inc.estimatedImpactedPopulation)} affected</span>
                </div>
              </div>
            );
          })
        )}
      </div>
    </aside>
  );
}
