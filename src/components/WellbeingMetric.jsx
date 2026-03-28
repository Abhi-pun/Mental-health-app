import { useState } from 'react';
import { TrendingDown, TrendingUp, Minus } from 'lucide-react';

const MOOD_DATA = [
  { day: 'Mon', score: 62 },
  { day: 'Tue', score: 55 },
  { day: 'Wed', score: 48 },
  { day: 'Thu', score: 51 },
  { day: 'Fri', score: 44 },
  { day: 'Sat', score: 57 },
  { day: 'Sun', score: 60 },
];

const CHECKINS = [
  { emoji: '😔', label: 'Low', value: 1 },
  { emoji: '😐', label: 'Okay', value: 2 },
  { emoji: '🙂', label: 'Good', value: 3 },
  { emoji: '😊', label: 'Great', value: 4 },
];

function MiniLineChart({ data }) {
  const max = Math.max(...data.map(d => d.score));
  const min = Math.min(...data.map(d => d.score));
  const range = max - min || 1;
  const W = 300, H = 80, PAD = 10;

  const points = data.map((d, i) => ({
    x: PAD + (i / (data.length - 1)) * (W - PAD * 2),
    y: PAD + ((max - d.score) / range) * (H - PAD * 2),
  }));

  const pathD = points.map((p, i) => `${i === 0 ? 'M' : 'L'} ${p.x} ${p.y}`).join(' ');
  const fillD = `${pathD} L ${points[points.length-1].x} ${H} L ${points[0].x} ${H} Z`;

  return (
    <svg width="100%" viewBox={`0 0 ${W} ${H}`} style={{ overflow: 'visible' }}>
      <defs>
        <linearGradient id="chartGrad" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#7A9E7E" stopOpacity="0.25" />
          <stop offset="100%" stopColor="#7A9E7E" stopOpacity="0" />
        </linearGradient>
      </defs>
      <path d={fillD} fill="url(#chartGrad)" />
      <path d={pathD} fill="none" stroke="#7A9E7E" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
      {points.map((p, i) => (
        <circle key={i} cx={p.x} cy={p.y} r="4" fill="white" stroke="#7A9E7E" strokeWidth="2" />
      ))}
      {data.map((d, i) => (
        <text key={i} x={points[i].x} y={H - 1} textAnchor="middle"
          style={{ fontSize: 9, fill: '#8A8A8A', fontFamily: 'DM Sans, sans-serif' }}>
          {d.day}
        </text>
      ))}
    </svg>
  );
}

function ScoreRing({ score }) {
  const r = 52, circ = 2 * Math.PI * r;
  const dash = (score / 100) * circ;
  const color = score >= 60 ? '#7A9E7E' : score >= 40 ? '#C4A16A' : '#C4856A';

  return (
    <div style={{ position: 'relative', width: 140, height: 140 }}>
      <svg width="140" height="140" viewBox="0 0 140 140">
        <circle cx="70" cy="70" r={r} fill="none" stroke="var(--warm-mid)" strokeWidth="10" />
        <circle
          cx="70" cy="70" r={r} fill="none"
          stroke={color} strokeWidth="10"
          strokeDasharray={`${dash} ${circ - dash}`}
          strokeDashoffset={circ / 4}
          strokeLinecap="round"
          style={{ transition: 'stroke-dasharray 1s cubic-bezier(0.4,0,0.2,1)' }}
        />
      </svg>
      <div style={{
        position: 'absolute', inset: 0,
        display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
      }}>
        <span style={{ fontFamily: 'DM Serif Display, serif', fontSize: 30, color: 'var(--ink)', lineHeight: 1 }}>
          {score}
        </span>
        <span style={{ fontSize: 11, color: 'var(--ink-soft)', marginTop: 2 }}>/ 100</span>
      </div>
    </div>
  );
}

export default function WellbeingMetric() {
  const [score, setScore] = useState(57);
  const [checked, setChecked] = useState(null);
  const [data, setData] = useState(MOOD_DATA);
  const [showPrompt, setShowPrompt] = useState(false);

  const trend = data[data.length - 1].score - data[data.length - 2].score;

  const handleCheckin = (v) => {
    setChecked(v);
    const newScore = Math.min(100, Math.max(0, score + (v - 2.5) * 10));
    setScore(Math.round(newScore));
    setData(d => {
      const updated = [...d];
      updated[updated.length - 1] = { ...updated[updated.length - 1], score: Math.round(newScore) };
      return updated;
    });
    if (v === 1) setShowPrompt(true);
  };

  const scoreLabel = score >= 70 ? 'Doing well' : score >= 50 ? 'Getting by' : score >= 30 ? 'Struggling a little' : 'Needs support';
  const scoreColor = score >= 60 ? 'var(--sage)' : score >= 40 ? '#C4A16A' : 'var(--clay)';

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>

      {/* Score card */}
      <div style={{
        background: 'var(--white)', borderRadius: 20, padding: 24,
        boxShadow: 'var(--shadow-soft)',
        display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 12,
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, alignSelf: 'flex-start' }}>
          <h3 style={{ fontSize: 16 }}>Your Wellbeing Score</h3>
          <span style={{
            fontSize: 11, padding: '2px 8px', borderRadius: 50,
            background: 'var(--sage-pale)', color: 'var(--sage)',
          }}>Private — only you see this</span>
        </div>

        <ScoreRing score={score} />

        <div style={{ textAlign: 'center' }}>
          <p style={{ fontSize: 18, fontFamily: 'DM Serif Display, serif', color: scoreColor }}>
            {scoreLabel}
          </p>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 5, marginTop: 4 }}>
            {trend > 0
              ? <><TrendingUp size={14} color="var(--sage)" /><span style={{ fontSize: 12, color: 'var(--sage)' }}>Up from yesterday</span></>
              : trend < 0
              ? <><TrendingDown size={14} color="var(--clay)" /><span style={{ fontSize: 12, color: 'var(--clay)' }}>Lower than yesterday</span></>
              : <><Minus size={14} color="var(--ink-soft)" /><span style={{ fontSize: 12, color: 'var(--ink-soft)' }}>Stable</span></>
            }
          </div>
        </div>
      </div>

      {/* Trend chart */}
      <div style={{ background: 'var(--white)', borderRadius: 20, padding: 22, boxShadow: 'var(--shadow-soft)' }}>
        <h3 style={{ fontSize: 15, marginBottom: 16 }}>This Week</h3>
        <MiniLineChart data={data} />
        <p style={{ fontSize: 12, color: 'var(--ink-soft)', marginTop: 12, fontStyle: 'italic' }}>
          Based on your posts and check-ins. Not a clinical assessment.
        </p>
      </div>

      {/* Daily check-in */}
      <div style={{ background: 'var(--white)', borderRadius: 20, padding: 22, boxShadow: 'var(--shadow-soft)' }}>
        <h3 style={{ fontSize: 15, marginBottom: 6 }}>How are you feeling today?</h3>
        <p style={{ fontSize: 13, color: 'var(--ink-soft)', marginBottom: 16 }}>
          A quick check-in helps track your mood over time.
        </p>
        <div style={{ display: 'flex', gap: 10, justifyContent: 'center' }}>
          {CHECKINS.map(c => (
            <button key={c.value} onClick={() => handleCheckin(c.value)} style={{
              display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 5,
              padding: '12px 16px', borderRadius: 14,
              background: checked === c.value ? 'var(--sage-pale)' : 'var(--warm)',
              border: checked === c.value ? '2px solid var(--sage-light)' : '2px solid transparent',
              transition: 'all 0.2s ease',
              flex: 1,
            }}>
              <span style={{ fontSize: 24 }}>{c.emoji}</span>
              <span style={{ fontSize: 11, color: 'var(--ink-mid)', fontWeight: checked === c.value ? 600 : 400 }}>
                {c.label}
              </span>
            </button>
          ))}
        </div>
        {checked && (
          <p style={{
            marginTop: 14, fontSize: 13, color: 'var(--sage)',
            textAlign: 'center', animation: 'fadeUp 0.3s ease',
          }}>
            {checked <= 1
              ? "Thank you for checking in. Would you like to talk to someone in the circle?"
              : checked === 2
              ? "Getting by takes strength. The circle is here if you need it."
              : "Glad to hear it. 💚 Keep going."}
          </p>
        )}
      </div>

      {/* Crisis resources - shown when score drops low */}
      {score < 35 && (
        <div style={{
          background: 'rgba(196,133,106,0.08)', borderRadius: 18, padding: 20,
          border: '1px solid var(--clay-light)',
          animation: 'fadeUp 0.4s ease',
        }}>
          <p style={{ fontSize: 14, fontWeight: 600, color: 'var(--clay)', marginBottom: 8 }}>
            Your score has been low lately. You don't have to go through this alone.
          </p>
          <p style={{ fontSize: 13, color: 'var(--ink-mid)', marginBottom: 12 }}>
            Here are some real resources that can help:
          </p>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            {[
              { name: 'iCall Nepal', detail: '9152987821 · Free counselling' },
              { name: 'Crisis Text Line', detail: 'Text HOME to 741741' },
              { name: 'NIMHANS Helpline', detail: '080-46110007' },
            ].map(r => (
              <div key={r.name} style={{
                padding: '10px 14px', background: 'white', borderRadius: 10,
                fontSize: 13,
              }}>
                <span style={{ fontWeight: 600, color: 'var(--ink)' }}>{r.name}</span>
                <span style={{ color: 'var(--ink-soft)', marginLeft: 8 }}>{r.detail}</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
