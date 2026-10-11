import { useState } from 'react';
import { X, Plus, MapPin } from 'lucide-react';
import { useStore } from '../../store/useStore';
import { DISTRICT_CENTER } from '../../data/mockData';
import type { IncidentCategory, SeverityLevel } from '../../types';

export function NewIncidentModal() {
  const { isNewIncidentModalOpen, setNewIncidentModalOpen, addIncident, addTickerEvent } = useStore();

  const [title, setTitle] = useState('');
  const [category, setCategory] = useState<IncidentCategory>('NATURAL_DISASTER');
  const [subType, setSubType] = useState('');
  const [severity, setSeverity] = useState<SeverityLevel>('WATCH');
  const [description, setDescription] = useState('');
  const [action, setAction] = useState('');
  const [ward, setWard] = useState('');
  const [lat, setLat] = useState(DISTRICT_CENTER[0].toString());
  const [lng, setLng] = useState(DISTRICT_CENTER[1].toString());
  const [radius, setRadius] = useState('1000');
  const [population, setPopulation] = useState('5000');

  if (!isNewIncidentModalOpen) return null;

  const handleSubmit = () => {
    if (!title || !subType || !description || !action || !ward) return;
    const id = `INC-${String(Date.now()).slice(-4)}`;
    const now = new Date().toISOString();
    addIncident({
      id,
      title,
      category,
      subType,
      severity,
      status: 'EVALUATING',
      location: { lat: parseFloat(lat), lng: parseFloat(lng), wardOrDistrict: ward },
      radiusMeters: parseInt(radius),
      estimatedImpactedPopulation: parseInt(population),
      reportedAt: now,
      updatedAt: now,
      description,
      recommendedAction: action,
      officialSource: 'GMC Disaster Cell — Manual Entry',
      assignedTeams: [],
    });
    addTickerEvent({
      id: `EVT-${Date.now()}`,
      timestamp: new Date().toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit', hour12: false }),
      message: `NEW INCIDENT logged: "${title}" in ${ward} — Severity: ${severity}`,
      type: 'INCIDENT',
      severity,
    });
    setNewIncidentModalOpen(false);
    setTitle(''); setSubType(''); setDescription(''); setAction(''); setWard('');
  };

  return (
    <div className="modal-overlay" onClick={() => setNewIncidentModalOpen(false)}>
      <div className="modal-container" onClick={(e) => e.stopPropagation()}>
        {/* Header */}
        <div style={{ padding: '16px 20px', borderBottom: '1px solid var(--border-subtle)', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <div style={{ width: '32px', height: '32px', borderRadius: '8px', background: 'rgba(6,182,212,0.15)', border: '1px solid rgba(6,182,212,0.3)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Plus size={14} color="#06B6D4" />
            </div>
            <div>
              <div style={{ fontWeight: 700, fontSize: '15px', fontFamily: 'var(--font-display)' }}>Log New Incident</div>
              <div style={{ fontSize: '11px', color: 'var(--color-text-muted)' }}>Add incident to the live feed and map</div>
            </div>
          </div>
          <button onClick={() => setNewIncidentModalOpen(false)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--color-text-muted)', display: 'flex' }}>
            <X size={18} />
          </button>
        </div>

        <div style={{ padding: '20px', display: 'flex', flexDirection: 'column', gap: '14px' }}>
          {/* Row: Category & Severity */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
            <div>
              <label style={labelStyle}>CATEGORY</label>
              <select className="dw-input" value={category} onChange={(e) => setCategory(e.target.value as IncidentCategory)}>
                <option value="NATURAL_DISASTER">🌊 Natural Disaster</option>
                <option value="CIVIC_UTILITY">⚡ Civic Utility</option>
                <option value="INFRASTRUCTURE">🚧 Infrastructure</option>
                <option value="PUBLIC_SAFETY">🚨 Public Safety</option>
              </select>
            </div>
            <div>
              <label style={labelStyle}>SEVERITY</label>
              <select className="dw-input" value={severity} onChange={(e) => setSeverity(e.target.value as SeverityLevel)}>
                <option value="ADVISORY">Advisory</option>
                <option value="WATCH">Watch</option>
                <option value="WARNING">Warning</option>
                <option value="CRITICAL_EMERGENCY">Critical Emergency</option>
              </select>
            </div>
          </div>

          {/* Title & SubType */}
          <div>
            <label style={labelStyle}>INCIDENT TITLE</label>
            <input className="dw-input" value={title} onChange={(e) => setTitle(e.target.value)} placeholder="e.g., Kaushambi Waterlogging" />
          </div>
          <div>
            <label style={labelStyle}>INCIDENT SUB-TYPE</label>
            <input className="dw-input" value={subType} onChange={(e) => setSubType(e.target.value)} placeholder="e.g., Flash Flood, Power Outage, Road Cave-in" />
          </div>

          {/* Location */}
          <div>
            <label style={labelStyle}>WARD / DISTRICT</label>
            <input className="dw-input" value={ward} onChange={(e) => setWard(e.target.value)} placeholder="e.g., Ward 14 — Kaushambi" />
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '10px' }}>
            <div>
              <label style={labelStyle}>LATITUDE</label>
              <input className="dw-input" value={lat} onChange={(e) => setLat(e.target.value)} />
            </div>
            <div>
              <label style={labelStyle}>LONGITUDE</label>
              <input className="dw-input" value={lng} onChange={(e) => setLng(e.target.value)} />
            </div>
            <div>
              <label style={labelStyle}>RADIUS (m)</label>
              <input className="dw-input" type="number" value={radius} onChange={(e) => setRadius(e.target.value)} />
            </div>
          </div>

          {/* Description */}
          <div>
            <label style={labelStyle}>SITUATION REPORT</label>
            <textarea className="dw-input" style={{ height: '70px', resize: 'none', lineHeight: 1.5 }} value={description} onChange={(e) => setDescription(e.target.value)} placeholder="Describe the incident in detail..." />
          </div>
          <div>
            <label style={labelStyle}>RECOMMENDED ACTION</label>
            <textarea className="dw-input" style={{ height: '55px', resize: 'none', lineHeight: 1.5 }} value={action} onChange={(e) => setAction(e.target.value)} placeholder="Instructions for citizens and responders..." />
          </div>
          <div>
            <label style={labelStyle}>EST. AFFECTED POPULATION</label>
            <input className="dw-input" type="number" value={population} onChange={(e) => setPopulation(e.target.value)} />
          </div>

          <button
            className="btn-primary"
            style={{ justifyContent: 'center', padding: '10px', fontSize: '14px', opacity: (!title || !subType || !description || !action || !ward) ? 0.5 : 1 }}
            disabled={!title || !subType || !description || !action || !ward}
            onClick={handleSubmit}
          >
            <Plus size={14} /> LOG INCIDENT TO LIVE FEED
          </button>
        </div>
      </div>
    </div>
  );
}

const labelStyle: React.CSSProperties = {
  fontSize: '10px', fontWeight: 700, color: 'var(--color-text-muted)',
  fontFamily: 'var(--font-mono)', display: 'block', marginBottom: '5px',
};
