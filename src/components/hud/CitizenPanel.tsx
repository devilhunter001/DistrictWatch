import { useState } from 'react';
import {
  Shield, Phone,
  CheckCircle, Navigation, Flag
} from 'lucide-react';
import { useStore } from '../../store/useStore';
import { MOCK_SHELTERS, DISTRICT_CENTER } from '../../data/mockData';
import { getSeverityColor } from '../../utils/helpers';

function haversineKm(lat1: number, lng1: number, lat2: number, lng2: number): number {
  const R = 6371;
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLng = ((lng2 - lng1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos((lat1 * Math.PI) / 180) * Math.cos((lat2 * Math.PI) / 180) * Math.sin(dLng / 2) ** 2;
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

export function CitizenPanel() {
  const { incidents, setCitizenReportModalOpen } = useStore();
  const userLat = DISTRICT_CENTER[0];
  const userLng = DISTRICT_CENTER[1];
  const [address, setAddress] = useState('Ghaziabad City Centre');

  const activeIncidents = incidents.filter(
    (i) => i.status === 'ACTIVE' || i.status === 'EVALUATING'
  );

  // Find nearest incident and determine safety status
  const nearbyThreats = activeIncidents
    .map((inc) => {
      const distKm = haversineKm(userLat, userLng, inc.location.lat, inc.location.lng);
      const dangerRadiusKm = inc.radiusMeters / 1000;
      return { ...inc, distKm, isInZone: distKm <= dangerRadiusKm };
    })
    .sort((a, b) => a.distKm - b.distKm)
    .slice(0, 4);

  const criticalThreats = nearbyThreats.filter(
    (t) => t.isInZone && (t.severity === 'CRITICAL_EMERGENCY' || t.severity === 'WARNING')
  );

  const safetyStatus =
    criticalThreats.length > 0
      ? { label: 'EVACUATE', color: '#EF4444', bg: 'rgba(239,68,68,0.1)', border: 'rgba(239,68,68,0.3)', icon: '🚨' }
      : nearbyThreats.some((t) => t.isInZone)
        ? { label: 'MONITOR', color: '#F59E0B', bg: 'rgba(245,158,11,0.1)', border: 'rgba(245,158,11,0.3)', icon: '⚠️' }
        : { label: 'NORMAL', color: '#10B981', bg: 'rgba(16,185,129,0.1)', border: 'rgba(16,185,129,0.3)', icon: '✅' };

  const nearestShelters = MOCK_SHELTERS
    .filter((s) => s.isOpen)
    .map((s) => ({ ...s, distKm: haversineKm(userLat, userLng, s.location.lat, s.location.lng) }))
    .sort((a, b) => a.distKm - b.distKm)
    .slice(0, 3);

  return (
    <div
      style={{
        position: 'absolute',
        top: '12px', right: '12px',
        width: '320px',
        display: 'flex', flexDirection: 'column', gap: '10px',
        zIndex: 500,
        maxHeight: 'calc(100% - 24px)',
        overflowY: 'auto',
        pointerEvents: 'auto',
      }}
    >
      {/* Status Card */}
      <div
        className="glass-panel animate-fade-in-up"
        style={{ borderRadius: '12px', overflow: 'hidden' }}
      >
        <div
          style={{
            background: safetyStatus.bg,
            border: `1px solid ${safetyStatus.border}`,
            borderRadius: '12px 12px 0 0',
            padding: '14px 16px',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '10px' }}>
            <div style={{ width: '36px', height: '36px', borderRadius: '50%', background: safetyStatus.bg, border: `2px solid ${safetyStatus.color}`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '18px' }}>
              {safetyStatus.icon}
            </div>
            <div>
              <div style={{ fontSize: '10px', color: 'var(--color-text-muted)', fontFamily: 'var(--font-mono)' }}>YOUR STATUS</div>
              <div style={{ fontFamily: 'var(--font-mono)', fontWeight: 800, fontSize: '20px', color: safetyStatus.color }}>
                {safetyStatus.label}
              </div>
            </div>
          </div>

          {/* Quick location input */}
          <div style={{ display: 'flex', gap: '6px' }}>
            <input
              className="dw-input"
              style={{ flex: 1, fontSize: '12px', padding: '6px 10px' }}
              placeholder="Enter your locality..."
              value={address}
              onChange={(e) => setAddress(e.target.value)}
            />
            <button
              className="btn-primary"
              style={{ padding: '6px 10px', fontSize: '11px' }}
              onClick={() => {/* simulate geolocation change */}}
            >
              <Navigation size={11} />
            </button>
          </div>
        </div>

        {/* Nearby Threats */}
        <div style={{ padding: '10px 14px' }}>
          <div style={{ fontSize: '10px', fontWeight: 700, color: 'var(--color-text-muted)', fontFamily: 'var(--font-mono)', marginBottom: '8px' }}>NEARBY INCIDENTS</div>
          {nearbyThreats.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '12px', color: 'var(--color-text-muted)', fontSize: '12px' }}>
              <CheckCircle size={16} color="#10B981" style={{ margin: '0 auto 4px' }} />
              No active incidents in your area
            </div>
          ) : (
            nearbyThreats.map((threat) => (
              <div
                key={threat.id}
                style={{
                  display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                  padding: '7px 8px', marginBottom: '4px',
                  background: threat.isInZone ? `${getSeverityColor(threat.severity)}10` : 'rgba(255,255,255,0.02)',
                  border: `1px solid ${threat.isInZone ? `${getSeverityColor(threat.severity)}30` : 'var(--border-subtle)'}`,
                  borderRadius: '6px',
                }}
              >
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontSize: '11px', fontWeight: 600, color: 'var(--color-text-primary)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                    {threat.title}
                  </div>
                  <div style={{ fontSize: '10px', color: 'var(--color-text-muted)', marginTop: '2px' }}>
                    {threat.distKm.toFixed(1)} km away
                    {threat.isInZone && <span style={{ color: getSeverityColor(threat.severity), marginLeft: '4px', fontWeight: 700 }}>· IN ZONE</span>}
                  </div>
                </div>
                <div
                  style={{
                    fontSize: '9px', fontWeight: 700, padding: '2px 6px', borderRadius: '3px',
                    background: `${getSeverityColor(threat.severity)}20`,
                    color: getSeverityColor(threat.severity),
                    border: `1px solid ${getSeverityColor(threat.severity)}40`,
                    flexShrink: 0, marginLeft: '6px', fontFamily: 'var(--font-mono)',
                  }}
                >
                  {threat.severity === 'CRITICAL_EMERGENCY' ? 'CRIT' : threat.severity}
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Emergency Shelters */}
      <div className="glass-panel animate-fade-in-up" style={{ borderRadius: '12px', padding: '12px 14px' }}>
        <div style={{ fontSize: '10px', fontWeight: 700, color: 'var(--color-text-muted)', fontFamily: 'var(--font-mono)', marginBottom: '8px', display: 'flex', alignItems: 'center', gap: '5px' }}>
          <Shield size={11} color="#10B981" /> NEAREST SHELTERS
        </div>
        {nearestShelters.map((shelter) => {
          const pct = shelter.capacityOccupied / shelter.capacityTotal;
          const capacityColor = pct > 0.85 ? '#EF4444' : pct > 0.6 ? '#F59E0B' : '#10B981';
          return (
            <div
              key={shelter.id}
              style={{
                padding: '8px', marginBottom: '6px', borderRadius: '7px',
                background: 'rgba(255,255,255,0.03)',
                border: '1px solid var(--border-subtle)',
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '5px' }}>
                <div style={{ fontSize: '12px', fontWeight: 600, color: 'var(--color-text-primary)' }}>{shelter.name}</div>
                <span style={{ fontSize: '10px', color: '#10B981', fontFamily: 'var(--font-mono)', fontWeight: 700 }}>
                  {shelter.distKm.toFixed(1)}km
                </span>
              </div>
              <div style={{ marginBottom: '4px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '3px' }}>
                  <span style={{ fontSize: '10px', color: 'var(--color-text-muted)' }}>Capacity</span>
                  <span style={{ fontSize: '10px', color: capacityColor, fontFamily: 'var(--font-mono)', fontWeight: 600 }}>
                    {shelter.capacityOccupied}/{shelter.capacityTotal}
                  </span>
                </div>
                <div className="progress-bar">
                  <div className="progress-bar-fill" style={{ width: `${pct * 100}%`, background: capacityColor }} />
                </div>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '5px', fontSize: '10px', color: 'var(--color-text-muted)' }}>
                <Phone size={9} /> {shelter.contactPhone}
              </div>
            </div>
          );
        })}
      </div>

      {/* Emergency Helplines */}
      <div className="glass-panel animate-fade-in-up" style={{ borderRadius: '12px', padding: '12px 14px' }}>
        <div style={{ fontSize: '10px', fontWeight: 700, color: 'var(--color-text-muted)', fontFamily: 'var(--font-mono)', marginBottom: '8px', display: 'flex', alignItems: 'center', gap: '5px' }}>
          <Phone size={11} color="#06B6D4" /> EMERGENCY HELPLINES
        </div>
        {[
          { name: 'Police Control Room', number: '100', color: '#06B6D4' },
          { name: 'Fire & Rescue', number: '101', color: '#EF4444' },
          { name: 'Ambulance (CATS)', number: '102', color: '#10B981' },
          { name: 'Disaster Mgmt (SDRF)', number: '1077', color: '#F59E0B' },
          { name: 'GMC Control Room', number: '0120-2820123', color: '#8B5CF6' },
        ].map((line) => (
          <div key={line.name} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '5px' }}>
            <span style={{ fontSize: '11px', color: 'var(--color-text-secondary)' }}>{line.name}</span>
            <span style={{ fontFamily: 'var(--font-mono)', fontWeight: 700, fontSize: '12px', color: line.color }}>{line.number}</span>
          </div>
        ))}
      </div>

      {/* Report Button */}
      <button
        className="btn-ghost"
        style={{ width: '100%', justifyContent: 'center', background: 'rgba(8,12,20,0.8)', backdropFilter: 'blur(12px)' }}
        onClick={() => setCitizenReportModalOpen(true)}
      >
        <Flag size={13} color="#F59E0B" />
        <span style={{ color: '#F59E0B', fontWeight: 600 }}>Report a Hazard</span>
      </button>
    </div>
  );
}
