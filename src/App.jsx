import { useState } from 'react';
import './index.css';
import { useAuth } from './context/AuthContext';
import LoginPage from './components/LoginPage';
import Sidebar from './components/Sidebar';
import Feed from './components/Feed';
import WellbeingMetric from './components/WellbeingMetric';
import Companion from './components/Companion';
import RightPanel from './components/RightPanel';

export default function App() {
  const { isConfigured, sessionReady, userId } = useAuth();
  const [activePage, setActivePage] = useState('feed');
  const [reachCount, setReachCount] = useState(3);

  const needsLogin = isConfigured && (!sessionReady || !userId);

  if (needsLogin) {
    return <LoginPage />;
  }

  return (
    <div style={{
      display: 'flex', minHeight: '100vh',
      background: 'var(--warm)', position: 'relative',
    }}>
      {/* Left Sidebar */}
      <Sidebar
        activePage={activePage}
        setActivePage={setActivePage}
        reachCount={reachCount}
        setReachCount={setReachCount}
      />

      {/* Main Content */}
      <main style={{
        flex: 1,
        marginLeft: 'var(--sidebar-w)',
        marginRight: 'var(--right-w)',
        minHeight: '100vh',
        borderLeft: '1px solid var(--warm-mid)',
        borderRight: '1px solid var(--warm-mid)',
        background: 'var(--white)',
      }}>
        {activePage === 'feed' && <Feed />}
        {activePage === 'wellbeing' && (
          <div style={{ padding: '28px 28px 80px' }}>
            <div style={{ marginBottom: 24 }}>
              <h2 style={{ fontSize: 24, marginBottom: 6 }}>Your Wellbeing</h2>
              <p style={{ fontSize: 14, color: 'var(--ink-soft)' }}>
                Private — only you can see this.
              </p>
            </div>
            <WellbeingMetric />
          </div>
        )}
        {activePage === 'companion' && (
          <div style={{ padding: '28px 28px 80px' }}>
            <div style={{ marginBottom: 24 }}>
              <h2 style={{ fontSize: 24, marginBottom: 6 }}>Talk to Someone</h2>
              <p style={{ fontSize: 14, color: 'var(--ink-soft)' }}>
                A gentle AI companion. A first step, not a replacement for care.
              </p>
            </div>
            <div style={{
              background: 'var(--warm)', borderRadius: 'var(--radius-xl)',
              padding: 24, border: '1px solid var(--warm-mid)',
            }}>
              <Companion />
            </div>
          </div>
        )}
      </main>

      {/* Right Panel */}
      <RightPanel
        onOpenCompanion={() => { setActivePage('companion'); }}
        reachCount={reachCount}
      />

      {/* Mobile bottom nav */}
      <nav style={{
        position: 'fixed', bottom: 0, left: 0, right: 0,
        background: 'rgba(255,255,255,0.95)',
        backdropFilter: 'blur(12px)',
        borderTop: '1px solid var(--warm-mid)',
        display: 'none', padding: '10px 0 16px',
        zIndex: 200,
      }} className="mobile-nav">
        {[
          { id: 'feed',      label: 'Feed',      symbol: '◎' },
          { id: 'wellbeing', label: 'Wellbeing', symbol: '◑' },
          { id: 'companion', label: 'Talk',      symbol: '♡' },
        ].map(n => (
          <button key={n.id} onClick={() => setActivePage(n.id)} style={{
            flex: 1, display: 'flex', flexDirection: 'column',
            alignItems: 'center', gap: 3, background: 'none',
            color: activePage === n.id ? 'var(--sage)' : 'var(--ink-soft)',
            fontSize: 10, fontWeight: activePage === n.id ? 600 : 400,
            letterSpacing: '0.05em',
          }}>
            <span style={{ fontSize: 18 }}>{n.symbol}</span>
            {n.label.toUpperCase()}
          </button>
        ))}
      </nav>

      <style>{`
        @media (max-width: 900px) {
          main { margin-right: 0 !important; }
        }
        @media (max-width: 640px) {
          main { margin-left: 0 !important; border: none !important; }
          .mobile-nav { display: flex !important; }
        }
      `}</style>
    </div>
  );
}
