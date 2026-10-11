import { useState } from 'react';
import { X, Send, Radio, Mail, Bell, Volume2, CheckCircle, AlertTriangle, Users } from 'lucide-react';
import { useStore } from '../../store/useStore';
import { formatPopulation } from '../../utils/helpers';

const WARDS = [
  'Ward 1 — City Centre', 'Ward 2 — Shastri Nagar', 'Ward 3 — Kavi Nagar',
  'Ward 4 — Gandhi Nagar', 'Ward 5 — Vasundhara', 'Ward 6 — Sector 7',
  'Ward 7 — Sector 10', 'Ward 8 — Raj Nagar', 'Ward 9 — Vijay Nagar',
  'Ward 10 — Lohia Nagar', 'Ward 11 — Sanjay Nagar', 'Ward 12 — Mohan Nagar',
  'Ward 13 — Hindon River Zone', 'Ward 14 — Kaushambi', 'Sahibabad Zone',
  'Loni Industrial Zone', 'Indirapuram Township',
];

export function AlertBroadcastModal() {
  const { isAlertModalOpen, setAlertModalOpen, incidents, selectedIncidentId, addTickerEvent } = useStore();
  const incident = incidents.find((i) => i.id === selectedIncidentId);

  const [headline, setHeadline] = useState(incident ? `⚠️ ALERT: ${incident.title}` : '');
  const [bodyText, setBodyText] = useState(incident?.recommendedAction || '');
  const [selectedWards, setSelectedWards] = useState<string[]>(
    incident?.metrics?.affectedWards || []
  );
  const [channels, setChannels] = useState({ SMS: true, EMAIL: true, PUSH: true, SIREN: false });
  const [isSending, setIsSending] = useState(false);
  const [sent, setSent] = useState(false);
  const [deliveryCount, setDeliveryCount] = useState(0);

  if (!isAlertModalOpen) return null;

  const estimatedRecipients = selectedWards.length * 12500;

  const handleSend = () => {
    setIsSending(true);
    let count = 0;
    const interval = setInterval(() => {
      count += Math.floor(Math.random() * 3000) + 1000;
      setDeliveryCount(Math.min(count, estimatedRecipients));
      if (count >= estimatedRecipients) {
        clearInterval(interval);
        setIsSending(false);
        setSent(true);
        addTickerEvent({
          id: `EVT-ALERT-${Date.now()}`,
          timestamp: new Date().toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit', hour12: false }),
          message: `BROADCAST SENT: "${headline}" — ${formatPopulation(estimatedRecipients)} recipients across ${selectedWards.length} wards.`,
          type: 'ALERT',
          severity: 'CRITICAL_EMERGENCY',
        });
      }
    }, 400);
  };

  const toggleWard = (ward: string) => {
    setSelectedWards((prev) =>
      prev.includes(ward) ? prev.filter((w) => w !== ward) : [...prev, ward]
    );
  };

  return (
    <div className="modal-overlay" onClick={() => { if (!isSending) setAlertModalOpen(false); }}>
      <div className="modal-container" onClick={(e) => e.stopPropagation()}>
        {/* Header */}
        <div
          style={{
            padding: '16px 20px',
            borderBottom: '1px solid var(--border-subtle)',
            display: 'flex', alignItems: 'center', justifyContent: 'space-between',
            background: 'rgba(239,68,68,0.06)',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <div style={{ width: '32px', height: '32px', borderRadius: '8px', background: 'rgba(239,68,68,0.2)', border: '1px solid rgba(239,68,68,0.4)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Send size={14} color="#EF4444" />
            </div>
            <div>
              <div style={{ fontWeight: 700, fontSize: '15px', fontFamily: 'var(--font-display)' }}>Dispatch Emergency Alert</div>
              <div style={{ fontSize: '11px', color: 'var(--color-text-muted)' }}>Broadcast to selected wards via multiple channels</div>
            </div>
          </div>
          {!isSending && (
            <button onClick={() => setAlertModalOpen(false)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--color-text-muted)', display: 'flex' }}>
              <X size={18} />
            </button>
          )}
        </div>

        {sent ? (
          /* Success State */
          <div style={{ padding: '40px 20px', textAlign: 'center' }}>
            <div style={{ width: '64px', height: '64px', margin: '0 auto 16px', background: 'rgba(16,185,129,0.15)', border: '2px solid #10B981', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <CheckCircle size={32} color="#10B981" />
            </div>
            <div style={{ fontWeight: 700, fontSize: '18px', fontFamily: 'var(--font-display)', marginBottom: '8px', color: '#10B981' }}>Alert Dispatched!</div>
            <div style={{ fontSize: '13px', color: 'var(--color-text-muted)', marginBottom: '24px' }}>
              {formatPopulation(deliveryCount)} recipients reached across {selectedWards.length} wards.
            </div>
            <div style={{ display: 'flex', gap: '8px', justifyContent: 'center', flexWrap: 'wrap', marginBottom: '24px' }}>
              {Object.entries(channels).filter(([, v]) => v).map(([ch]) => (
                <span key={ch} style={{ background: 'rgba(16,185,129,0.15)', color: '#10B981', border: '1px solid rgba(16,185,129,0.3)', padding: '3px 10px', borderRadius: '20px', fontSize: '11px', fontWeight: 600 }}>
                  ✓ {ch}
                </span>
              ))}
            </div>
            <button className="btn-primary" style={{ margin: '0 auto' }} onClick={() => { setSent(false); setAlertModalOpen(false); }}>
              Close
            </button>
          </div>
        ) : (
          <div style={{ padding: '20px' }}>
            {/* Alert Content */}
            <div style={{ marginBottom: '16px' }}>
              <label style={{ fontSize: '11px', fontWeight: 700, color: 'var(--color-text-muted)', fontFamily: 'var(--font-mono)', display: 'block', marginBottom: '6px' }}>
                ALERT HEADLINE
              </label>
              <input
                className="dw-input"
                value={headline}
                onChange={(e) => setHeadline(e.target.value)}
                placeholder="Emergency alert headline..."
              />
            </div>
            <div style={{ marginBottom: '16px' }}>
              <label style={{ fontSize: '11px', fontWeight: 700, color: 'var(--color-text-muted)', fontFamily: 'var(--font-mono)', display: 'block', marginBottom: '6px' }}>
                MESSAGE BODY
              </label>
              <textarea
                className="dw-input"
                style={{ height: '80px', resize: 'none', lineHeight: 1.5 }}
                value={bodyText}
                onChange={(e) => setBodyText(e.target.value)}
                placeholder="Instructions for residents..."
              />
            </div>

            {/* Channels */}
            <div style={{ marginBottom: '16px' }}>
              <label style={{ fontSize: '11px', fontWeight: 700, color: 'var(--color-text-muted)', fontFamily: 'var(--font-mono)', display: 'block', marginBottom: '8px' }}>
                BROADCAST CHANNELS
              </label>
              <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                {([
                  { key: 'SMS', icon: <Radio size={12} />, label: 'SMS' },
                  { key: 'EMAIL', icon: <Mail size={12} />, label: 'Email' },
                  { key: 'PUSH', icon: <Bell size={12} />, label: 'Push Notif.' },
                  { key: 'SIREN', icon: <Volume2 size={12} />, label: 'Sirens' },
                ] as const).map(({ key, icon, label }) => (
                  <button
                    key={key}
                    onClick={() => setChannels((c) => ({ ...c, [key]: !c[key] }))}
                    style={{
                      display: 'flex', alignItems: 'center', gap: '5px',
                      padding: '5px 12px', borderRadius: '6px',
                      background: channels[key] ? (key === 'SIREN' ? 'rgba(245,158,11,0.2)' : 'rgba(6,182,212,0.15)') : 'rgba(255,255,255,0.04)',
                      border: `1px solid ${channels[key] ? (key === 'SIREN' ? 'rgba(245,158,11,0.5)' : 'rgba(6,182,212,0.4)') : 'var(--border-subtle)'}`,
                      color: channels[key] ? (key === 'SIREN' ? '#F59E0B' : '#06B6D4') : 'var(--color-text-muted)',
                      cursor: 'pointer', fontSize: '12px', fontWeight: 600,
                    }}
                  >
                    {icon} {label}
                  </button>
                ))}
              </div>
            </div>

            {/* Ward Selection */}
            <div style={{ marginBottom: '16px' }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '8px' }}>
                <label style={{ fontSize: '11px', fontWeight: 700, color: 'var(--color-text-muted)', fontFamily: 'var(--font-mono)' }}>
                  TARGET WARDS ({selectedWards.length} selected)
                </label>
                <button
                  onClick={() => setSelectedWards(selectedWards.length === WARDS.length ? [] : [...WARDS])}
                  style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: '11px', color: '#06B6D4' }}
                >
                  {selectedWards.length === WARDS.length ? 'Deselect All' : 'Select All'}
                </button>
              </div>
              <div
                style={{
                  maxHeight: '120px', overflowY: 'auto',
                  border: '1px solid var(--border-subtle)', borderRadius: '8px',
                  padding: '6px',
                  display: 'flex', flexWrap: 'wrap', gap: '5px',
                }}
              >
                {WARDS.map((ward) => (
                  <button
                    key={ward}
                    onClick={() => toggleWard(ward)}
                    style={{
                      padding: '2px 8px', borderRadius: '4px', cursor: 'pointer', fontSize: '11px',
                      background: selectedWards.includes(ward) ? 'rgba(239,68,68,0.15)' : 'rgba(255,255,255,0.04)',
                      border: `1px solid ${selectedWards.includes(ward) ? 'rgba(239,68,68,0.4)' : 'var(--border-subtle)'}`,
                      color: selectedWards.includes(ward) ? '#EF4444' : 'var(--color-text-muted)',
                    }}
                  >
                    {ward}
                  </button>
                ))}
              </div>
            </div>

            {/* Estimate */}
            {selectedWards.length > 0 && (
              <div
                style={{
                  background: 'rgba(245,158,11,0.08)', border: '1px solid rgba(245,158,11,0.25)',
                  borderRadius: '8px', padding: '10px 14px', marginBottom: '16px',
                  display: 'flex', alignItems: 'center', gap: '8px',
                }}
              >
                <AlertTriangle size={13} color="#F59E0B" />
                <span style={{ fontSize: '12px', color: '#FCD34D' }}>
                  Estimated reach: <strong>~{formatPopulation(estimatedRecipients)} residents</strong> across {selectedWards.length} wards
                </span>
              </div>
            )}

            {/* Send Button */}
            <button
              className="btn-danger"
              style={{ width: '100%', justifyContent: 'center', padding: '10px', fontSize: '14px', opacity: (selectedWards.length === 0 || !headline) ? 0.5 : 1 }}
              disabled={selectedWards.length === 0 || !headline || isSending}
              onClick={handleSend}
            >
              {isSending ? (
                <>
                  <div style={{ width: '14px', height: '14px', border: '2px solid rgba(255,255,255,0.3)', borderTopColor: 'white', borderRadius: '50%', animation: 'radar-sweep 0.8s linear infinite' }} />
                  Dispatching... {formatPopulation(deliveryCount)} sent
                </>
              ) : (
                <>
                  <Send size={14} />
                  DISPATCH TO {formatPopulation(estimatedRecipients)} RESIDENTS
                </>
              )}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
