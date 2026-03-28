import { useState, useEffect } from 'react';

const REACH_MESSAGES = [
  "Someone nearby just reached out. You're not alone.",
  "A new Reach signal was received. The circle holds you.",
  "Someone is struggling quietly. The circle sees them.",
];

function ReachResponses() {
  const [responses, setResponses] = useState([]);
  const pool = [
    "I see you. I've been there too. 💚",
    "You're not alone right now.",
    "Sending you warmth from across the circle.",
    "We're here. Take your time.",
    "I hear you. The circle holds you.",
  ];
  useEffect(() => {
    const t1 = setTimeout(() => setResponses(r => [...r, { text: pool[0], id: 1 }]), 1800);
    const t2 = setTimeout(() => setResponses(r => [...r, { text: pool[2], id: 2 }]), 4200);
    const t3 = setTimeout(() => setResponses(r => [...r, { text: pool[4], id: 3 }]), 7500);
    return () => { clearTimeout(t1); clearTimeout(t2); clearTimeout(t3); };
  }, []);

  if (responses.length === 0) return (
    <p style={{ fontSize: 13, color: 'var(--ink-soft)', fontStyle: 'italic', animation: 'fadeUp 0.5s ease', textAlign:'center' }}>
      Waiting for the circle to respond…
    </p>
  );
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 10, width: '100%', maxWidth: 360 }}>
      {responses.map(r => (
        <div key={r.id} style={{
          padding: '12px 16px',
          background: 'var(--sage-pale)',
          borderRadius: 14,
          fontSize: 14, color: 'var(--ink-mid)',
          animation: 'fadeUp 0.5s ease',
          borderLeft: '3px solid var(--sage-light)',
        }}>
          {r.text}
        </div>
      ))}
    </div>
  );
}

export default function ReachButton({ onReach, reachCount, setReachCount }) {
  const [active, setActive] = useState(false);
  const [rippling, setRippling] = useState(false);
  const [notice, setNotice] = useState(null);
  const [noticeVisible, setNoticeVisible] = useState(false);

  useEffect(() => {
    const interval = setInterval(() => {
      if (Math.random() < 0.4) {
        const msg = REACH_MESSAGES[Math.floor(Math.random() * REACH_MESSAGES.length)];
        setNotice(msg);
        setNoticeVisible(true);
        setReachCount(c => c + 1);
        setTimeout(() => setNoticeVisible(false), 4500);
      }
    }, 14000);
    return () => clearInterval(interval);
  }, [setReachCount]);

  const handleReach = () => {
    if (active) { setActive(false); return; }
    setRippling(true);
    setActive(true);
    setReachCount(c => c + 1);
    onReach && onReach();
    setTimeout(() => setRippling(false), 800);
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 20 }}>
      <div style={{
        height: 36, opacity: noticeVisible ? 1 : 0,
        transform: noticeVisible ? 'translateY(0)' : 'translateY(-8px)',
        transition: 'opacity 0.5s ease, transform 0.5s ease',
        fontSize: 13, color: 'var(--sage)', textAlign: 'center',
        display: 'flex', alignItems: 'center', gap: 7,
      }}>
        <div style={{ width: 7, height: 7, borderRadius: '50%', background: 'var(--sage)', flexShrink: 0 }} />
        {notice}
      </div>

      <div style={{ position: 'relative', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <div style={{
          position: 'absolute', width: 140, height: 140, borderRadius: '50%',
          background: active ? 'radial-gradient(circle, rgba(122,158,126,0.18) 0%, transparent 70%)' : 'transparent',
          transition: 'background 1s ease',
          animation: active ? 'pulse-reach 2.5s ease-in-out infinite' : 'none',
        }} />
        {rippling && (
          <div style={{
            position: 'absolute', width: 90, height: 90, borderRadius: '50%',
            background: 'var(--sage)', animation: 'ripple 0.8s ease-out forwards', pointerEvents: 'none',
          }} />
        )}
        <button
          onClick={handleReach}
          style={{
            width: 90, height: 90, borderRadius: '50%',
            background: active ? 'var(--sage)' : 'white',
            border: `2.5px solid ${active ? 'transparent' : 'var(--warm-mid)'}`,
            boxShadow: active ? '0 0 0 6px rgba(122,158,126,0.18), var(--shadow-card)' : 'var(--shadow-soft)',
            display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 4,
            transition: 'all 0.4s cubic-bezier(0.4,0,0.2,1)',
            transform: active ? 'scale(1.04)' : 'scale(1)',
            position: 'relative', zIndex: 1,
          }}
        >
          <div style={{
            width: active ? 28 : 24, height: active ? 28 : 24, borderRadius: '50%',
            border: `2.5px solid ${active ? 'rgba(255,255,255,0.8)' : 'var(--sage)'}`,
            transition: 'all 0.4s ease',
          }} />
          <span style={{
            fontSize: 10, fontWeight: 600,
            color: active ? 'rgba(255,255,255,0.9)' : 'var(--sage)',
            letterSpacing: '0.06em', transition: 'color 0.4s ease',
          }}>
            {active ? 'SENT' : 'REACH'}
          </span>
        </button>
      </div>

      <div style={{ textAlign: 'center' }}>
        {active ? (
          <>
            <p style={{ fontSize: 15, color: 'var(--sage)', fontWeight: 500 }}>Your circle knows you're here</p>
            <p style={{ fontSize: 13, color: 'var(--ink-soft)', marginTop: 4 }}>You don't have to say anything. Just be here.</p>
          </>
        ) : (
          <>
            <p style={{ fontSize: 15, color: 'var(--ink-mid)' }}>Struggling but not ready to speak?</p>
            <p style={{ fontSize: 13, color: 'var(--ink-soft)', marginTop: 4 }}>Tap Reach — silent, anonymous, seen.</p>
          </>
        )}
      </div>

      {active && <ReachResponses />}
    </div>
  );
}
