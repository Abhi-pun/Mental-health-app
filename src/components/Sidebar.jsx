import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';

function ReachButton({ setReachCount }) {
  const [active, setActive] = useState(false);
  const [rippling, setRippling] = useState(false);
  const [notice, setNotice] = useState(null);
  const [noticeVisible, setNoticeVisible] = useState(false);

  const MESSAGES = [
    "Someone nearby just reached out.",
    "A new Reach signal received.",
    "Someone is struggling quietly.",
  ];

  useEffect(() => {
    const interval = setInterval(() => {
      if (Math.random() < 0.45) {
        setNotice(MESSAGES[Math.floor(Math.random() * MESSAGES.length)]);
        setNoticeVisible(true);
        setReachCount(c => c + 1);
        setTimeout(() => setNoticeVisible(false), 4000);
      }
    }, 15000);
    return () => clearInterval(interval);
  }, []);

  const handleReach = () => {
    if (active) { setActive(false); return; }
    setRippling(true);
    setActive(true);
    setReachCount(c => c + 1);
    setTimeout(() => setRippling(false), 700);
  };

  return (
    <div style={{
      margin: '8px 12px 0',
      borderRadius: 'var(--radius-lg)',
      border: active ? '1.5px solid var(--sage-light)' : '1.5px solid var(--warm-mid)',
      background: active ? 'var(--sage-pale)' : 'var(--warm)',
      padding: '14px 16px',
      transition: 'all 0.3s ease',
      cursor: 'pointer',
    }} onClick={handleReach}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
        {/* Button circle */}
        <div style={{ position: 'relative', flexShrink: 0 }}>
          {rippling && (
            <div style={{
              position: 'absolute', inset: 0, borderRadius: '50%',
              background: 'var(--sage)',
              animation: 'ripple 0.7s ease-out forwards',
            }} />
          )}
          <div style={{
            width: 38, height: 38, borderRadius: '50%',
            background: active ? 'var(--sage)' : 'white',
            border: `2px solid ${active ? 'transparent' : 'var(--warm-dark)'}`,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            boxShadow: active ? '0 0 0 4px rgba(92,140,96,0.15)' : 'var(--shadow-soft)',
            transition: 'all 0.3s ease',
            animation: active ? 'pulse-reach 2.5s ease-in-out infinite' : 'none',
            position: 'relative', zIndex: 1,
          }}>
            <div style={{
              width: 14, height: 14, borderRadius: '50%',
              border: `2px solid ${active ? 'rgba(255,255,255,0.85)' : 'var(--sage)'}`,
              transition: 'border-color 0.3s ease',
            }} />
          </div>
        </div>
        <div>
          <p style={{
            fontSize: 13, fontWeight: 600,
            color: active ? 'var(--sage)' : 'var(--ink)',
            marginBottom: 1,
          }}>
            {active ? 'Circle notified' : 'Reach'}
          </p>
          <p style={{ fontSize: 11, color: 'var(--ink-soft)', lineHeight: 1.4 }}>
            {active ? "You don't have to say anything." : 'signal quietly for support'}
          </p>
        </div>
      </div>

      {noticeVisible && (
        <div style={{
          marginTop: 10, paddingTop: 10,
          borderTop: '1px solid var(--warm-mid)',
          fontSize: 11, color: 'var(--sage)',
          display: 'flex', alignItems: 'center', gap: 6,
          animation: 'fadeIn 0.4s ease',
        }}>
          <div style={{
            width: 6, height: 6, borderRadius: '50%',
            background: 'var(--sage)', flexShrink: 0,
            animation: 'breathe 1.5s ease-in-out infinite',
          }} />
          {notice}
        </div>
      )}
    </div>
  );
}

export default function Sidebar({ activePage, setActivePage, reachCount, setReachCount }) {
  const {
    isConfigured: authConfigured,
    loading: authLoading,
    error: authError,
    userId,
    userIdSuffix,
    signOut,
    clearError,
    loginUserId,
    isAnonymousUser,
  } = useAuth();

  const navItems = [
    { id: 'feed',      label: 'Feed',       dot: '#5C8C60' },
    { id: 'myposts',   label: 'My posts',   dot: '#9B8EC4' },
    { id: 'wellbeing', label: 'Wellbeing',  dot: '#8AB88E' },
    { id: 'supporters',label: 'Supporters', dot: '#E8A87C' },
    { id: 'settings',  label: 'Settings',   dot: '#D4C4B0' },
  ];

  return (
    <aside style={{
      position: 'fixed', left: 0, top: 0, bottom: 0,
      width: 'var(--sidebar-w)',
      background: 'var(--white)',
      borderRight: '1px solid var(--warm-mid)',
      display: 'flex', flexDirection: 'column',
      zIndex: 100,
      overflowY: 'auto',
    }}>
      {/* Logo */}
      <div style={{ padding: '22px 20px 16px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 9, marginBottom: 4 }}>
          <div style={{
            width: 28, height: 28, borderRadius: '50%',
            background: 'var(--sage)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}>
            <div style={{
              width: 12, height: 12, borderRadius: '50%',
              border: '2.5px solid white',
            }} />
          </div>
          <span style={{
            fontFamily: 'DM Serif Display, serif',
            fontSize: 18, color: 'var(--ink)',
          }}>
            SafeCircle
          </span>
        </div>
        <p style={{ fontSize: 11, color: 'var(--ink-soft)', paddingLeft: 37 }}>
          anonymous • safe • real
        </p>
      </div>

      {/* Nav */}
      <nav style={{ padding: '4px 12px', flex: 1 }}>
        {navItems.map(item => (
          <button
            key={item.id}
            onClick={() => setActivePage(item.id)}
            style={{
              width: '100%', display: 'flex', alignItems: 'center', gap: 10,
              padding: '10px 12px', borderRadius: 'var(--radius-md)',
              background: activePage === item.id ? 'var(--sage-pale)' : 'transparent',
              color: activePage === item.id ? 'var(--sage)' : 'var(--ink-mid)',
              fontSize: 14, fontWeight: activePage === item.id ? 500 : 400,
              marginBottom: 2, transition: 'var(--transition)',
              textAlign: 'left',
            }}
          >
            <div style={{
              width: 8, height: 8, borderRadius: '50%',
              background: activePage === item.id ? item.dot : 'var(--warm-mid)',
              flexShrink: 0, transition: 'background 0.2s',
            }} />
            {item.label}
          </button>
        ))}
      </nav>

      {authConfigured && (
        <div style={{
          margin: '0 12px 12px',
          padding: '12px 14px',
          borderRadius: 'var(--radius-md)',
          background: 'var(--warm)',
          border: '1px solid var(--warm-mid)',
        }}>
          <p style={{ fontSize: 11, fontWeight: 600, color: 'var(--ink)', marginBottom: 4 }}>
            Your account
          </p>
          {authLoading && (
            <p style={{ fontSize: 11, color: 'var(--ink-soft)', lineHeight: 1.45 }}>
              Loading…
            </p>
          )}
          {!authLoading && authError && (
            <>
              <p style={{ fontSize: 11, color: 'var(--clay)', lineHeight: 1.45, marginBottom: 8 }}>
                {authError}
              </p>
              <button
                type="button"
                onClick={() => clearError()}
                style={{
                  padding: '6px 12px',
                  borderRadius: 50,
                  background: 'var(--sage)',
                  color: 'white',
                  fontSize: 11,
                  fontWeight: 500,
                  border: 'none',
                  cursor: 'pointer',
                }}
              >
                Dismiss
              </button>
            </>
          )}
          {!authLoading && userId && (
            <>
              <p style={{ fontSize: 11, color: 'var(--ink-soft)', lineHeight: 1.5 }}>
                {loginUserId ? (
                  <>
                    Signed in as <strong style={{ color: 'var(--ink-mid)' }}>{loginUserId}</strong>
                    <span style={{ display: 'block', marginTop: 6 }}>
                      You can log out and sign back in anytime; your posts stay tied to this account.
                    </span>
                  </>
                ) : !isAnonymousUser ? (
                  <>
                    Signed in with your account.
                    {userIdSuffix && (
                      <span style={{ display: 'block', marginTop: 6, fontFamily: 'monospace', color: 'var(--ink-mid)' }}>
                        Ref ·•••{userIdSuffix}
                      </span>
                    )}
                  </>
                ) : (
                  <>
                    Anonymous session.
                    {userIdSuffix && (
                      <span style={{ display: 'block', marginTop: 6, fontFamily: 'monospace', color: 'var(--ink-mid)' }}>
                        Session ·•••{userIdSuffix}
                      </span>
                    )}
                  </>
                )}
              </p>
              <button
                type="button"
                onClick={() => signOut()}
                style={{
                  marginTop: 10,
                  width: '100%',
                  padding: '8px 12px',
                  borderRadius: 50,
                  background: 'white',
                  border: '1px solid var(--warm-mid)',
                  color: 'var(--ink-mid)',
                  fontSize: 11,
                  fontWeight: 500,
                  cursor: 'pointer',
                }}
              >
                Log out
              </button>
            </>
          )}
        </div>
      )}

      {/* Reach Button */}
      <div style={{ paddingBottom: 20 }}>
        {reachCount > 0 && (
          <p style={{
            fontSize: 11, color: 'var(--ink-soft)',
            textAlign: 'center', marginBottom: 6,
          }}>
            {reachCount} in the circle right now
          </p>
        )}
        <ReachButton reachCount={reachCount} setReachCount={setReachCount} />
      </div>
    </aside>
  );
}
