import { useRef } from 'react';
import { Radio } from 'lucide-react';
import { useStore } from '../../store/useStore';

const TYPE_COLORS: Record<string, string> = {
  INCIDENT: '#EF4444',
  ALERT: '#F59E0B',
  UPDATE: '#8B5CF6',
  DISPATCH: '#10B981',
  REPORT: '#06B6D4',
};

export function LiveTicker() {
  const { tickerEvents } = useStore();
  const tickerRef = useRef<HTMLDivElement>(null);

  return (
    <div
      style={{
        height: '32px', flexShrink: 0,
        background: 'rgba(8,12,20,0.95)',
        borderTop: '1px solid rgba(51,65,85,0.6)',
        display: 'flex', alignItems: 'center',
        overflow: 'hidden', position: 'relative', zIndex: 50,
      }}
    >
      {/* Label */}
      <div
        style={{
          display: 'flex', alignItems: 'center', gap: '6px',
          padding: '0 12px',
          background: 'rgba(239,68,68,0.15)',
          borderRight: '1px solid rgba(239,68,68,0.3)',
          height: '100%', flexShrink: 0,
        }}
      >
        <Radio size={11} color="#EF4444" />
        <span style={{ fontSize: '10px', fontWeight: 700, color: '#EF4444', fontFamily: 'var(--font-mono)', letterSpacing: '0.5px' }}>
          LIVE
        </span>
      </div>

      {/* Scrolling content */}
      <div style={{ flex: 1, overflow: 'hidden', position: 'relative' }}>
        <div
          ref={tickerRef}
          style={{
            display: 'flex', alignItems: 'center', gap: '0',
            animation: 'ticker-scroll 60s linear infinite',
            whiteSpace: 'nowrap',
            willChange: 'transform',
          }}
        >
          {[...tickerEvents, ...tickerEvents].map((evt, i) => (
            <span key={`${evt.id}-${i}`} style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', padding: '0 24px' }}>
              <span
                style={{
                  fontSize: '9px', fontWeight: 700,
                  color: TYPE_COLORS[evt.type] || '#94A3B8',
                  fontFamily: 'var(--font-mono)',
                  background: `${TYPE_COLORS[evt.type] || '#94A3B8'}18`,
                  padding: '1px 5px', borderRadius: '3px',
                }}
              >
                {evt.type}
              </span>
              <span style={{ fontFamily: 'var(--font-mono)', fontSize: '10px', color: '#64748B' }}>
                [{evt.timestamp}]
              </span>
              <span style={{ fontSize: '11px', color: '#94A3B8' }}>{evt.message}</span>
              <span style={{ color: 'rgba(51,65,85,0.8)', padding: '0 8px' }}>◆</span>
            </span>
          ))}
        </div>
      </div>
    </div>
  );
}
