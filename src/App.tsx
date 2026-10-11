import { TopBar } from './components/layout/TopBar';
import { LeftSidebar } from './components/layout/LeftSidebar';
import { RightDrawer } from './components/layout/RightDrawer';
import { MapEngine } from './components/map/MapEngine';
import { LiveTicker } from './components/hud/LiveTicker';
import { CitizenPanel } from './components/hud/CitizenPanel';
import { AlertBroadcastModal } from './components/modals/AlertBroadcastModal';
import { NewIncidentModal } from './components/modals/NewIncidentModal';
import { useStore } from './store/useStore';

function App() {
  const { viewMode, selectedIncidentId, isSidebarOpen, setSidebarOpen } = useStore();

  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        height: '100vh',
        width: '100vw',
        background: 'var(--bg-base)',
        overflow: 'hidden',
      }}
    >
      {/* Top Bar */}
      <TopBar />

      {/* Main Content Area */}
      <div style={{ flex: 1, display: 'flex', overflow: 'hidden', position: 'relative' }}>
        {/* Left Sidebar — Incident Feed */}
        {viewMode === 'COMMAND' && isSidebarOpen && <LeftSidebar />}

        {/* Sidebar Toggle Button */}
        {viewMode === 'COMMAND' && (
          <button
            onClick={() => setSidebarOpen(!isSidebarOpen)}
            style={{
              position: 'absolute',
              left: isSidebarOpen ? '280px' : '0px',
              top: '50%',
              transform: 'translateY(-50%)',
              zIndex: 200,
              transition: 'left 0.2s ease',
              background: 'var(--bg-panel)',
              border: '1px solid var(--border-subtle)',
              borderLeft: isSidebarOpen ? 'none' : '1px solid var(--border-subtle)',
              borderRadius: '0 6px 6px 0',
              padding: '12px 4px',
              cursor: 'pointer',
              color: 'var(--color-text-muted)',
              display: 'flex',
              alignItems: 'center',
            }}
            title={isSidebarOpen ? 'Hide sidebar' : 'Show sidebar'}
          >
            <span style={{ fontSize: '10px', writingMode: 'vertical-rl', transform: 'rotate(180deg)', letterSpacing: '2px', fontFamily: 'var(--font-mono)' }}>
              {isSidebarOpen ? '◀' : '▶'}
            </span>
          </button>
        )}

        {/* Map — fills remaining space, position:relative so absolute-inset child fills it */}
        <div style={{ flex: 1, minWidth: 0, position: 'relative' }}>
          <MapEngine />

          {/* Citizen Panel overlay on top of map */}
          {viewMode === 'CITIZEN' && <CitizenPanel />}
        </div>

        {/* Right Drawer — Incident Detail */}
        {viewMode === 'COMMAND' && selectedIncidentId && <RightDrawer />}
      </div>

      {/* Bottom Ticker */}
      <LiveTicker />

      {/* Modals */}
      <AlertBroadcastModal />
      <NewIncidentModal />
    </div>
  );
}

export default App;
