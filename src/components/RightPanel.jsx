import { Heart } from 'lucide-react';

const SUPPORTERS = [
  { initial: 'S', color: '#5C8C60' },
  { initial: 'R', color: '#9B8EC4' },
  { initial: 'M', color: '#E8A87C' },
];

export default function RightPanel({ onOpenCompanion, reachCount }) {
  return (
    <aside style={{
      position: 'fixed', right: 0, top: 0, bottom: 0,
      width: 'var(--right-w)',
      background: 'var(--white)',
      borderLeft: '1px solid var(--warm-mid)',
      padding: '24px 20px',
      display: 'flex', flexDirection: 'column', gap: 24,
      overflowY: 'auto',
      zIndex: 100,
    }}>

      {/* AI Companion CTA */}
      <div>
        <p style={{
          fontSize: 10, fontWeight: 600, letterSpacing: '0.08em',
          color: 'var(--ink-soft)', marginBottom: 12,
          textTransform: 'uppercase',
        }}>
          AI Companion
        </p>
        <div style={{
          background: 'var(--sage-pale)',
          borderRadius: 'var(--radius-lg)',
          padding: 16,
          border: '1px solid var(--sage-mid)',
        }}>
          <div style={{
            display: 'flex', alignItems: 'center', gap: 8, marginBottom: 10,
          }}>
            <div style={{
              width: 28, height: 28, borderRadius: '50%',
              background: 'var(--sage)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              flexShrink: 0,
            }}>
              <div style={{
                width: 11, height: 11, borderRadius: '50%',
                border: '2px solid white',
              }} />
            </div>
            <span style={{ fontSize: 13, fontWeight: 500, color: 'var(--ink)' }}>
              Companion
            </span>
          </div>
          <p style={{
            fontSize: 13, color: 'var(--ink-mid)', lineHeight: 1.6, marginBottom: 12,
          }}>
            Hey, how are you feeling today? You don't have to have the words — just check in.
          </p>
          <button
            onClick={onOpenCompanion}
            style={{
              width: '100%', padding: '9px 0',
              background: 'var(--sage)', color: 'white',
              borderRadius: 50, fontSize: 13, fontWeight: 500,
              display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6,
              transition: 'opacity 0.2s',
            }}
          >
            <Heart size={13} />
            Talk now
          </button>
        </div>
      </div>

      {/* Peer Supporters Online */}
      <div>
        <p style={{
          fontSize: 10, fontWeight: 600, letterSpacing: '0.08em',
          color: 'var(--ink-soft)', marginBottom: 12,
          textTransform: 'uppercase',
        }}>
          Peer Supporters Online
        </p>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          {SUPPORTERS.map((s, i) => (
            <div key={i} style={{
              display: 'flex', alignItems: 'center', gap: 10,
              padding: '10px 12px',
              background: 'var(--warm)',
              borderRadius: 'var(--radius-md)',
              animation: `slideIn 0.3s ease ${i * 0.1}s both`,
            }}>
              <div style={{
                width: 32, height: 32, borderRadius: '50%',
                background: s.color + '22',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontSize: 12, fontWeight: 600, color: s.color,
                flexShrink: 0,
              }}>
                {s.initial}
              </div>
              <div style={{ flex: 1 }}>
                <p style={{ fontSize: 13, fontWeight: 500, color: 'var(--ink)' }}>Anonymous</p>
                <p style={{ fontSize: 11, color: 'var(--ink-soft)' }}>Verified supporter</p>
              </div>
              <div style={{
                width: 8, height: 8, borderRadius: '50%',
                background: '#4CAF50',
                boxShadow: '0 0 0 2px rgba(76,175,80,0.2)',
              }} />
            </div>
          ))}
        </div>
      </div>

      {/* Community stats */}
      <div style={{
        background: 'var(--warm)', borderRadius: 'var(--radius-lg)',
        padding: '14px 16px',
      }}>
        <p style={{
          fontSize: 10, fontWeight: 600, letterSpacing: '0.08em',
          color: 'var(--ink-soft)', marginBottom: 12,
          textTransform: 'uppercase',
        }}>
          Right Now
        </p>
        {[
          { label: 'In the circle', value: reachCount + 47 },
          { label: 'Posts today',   value: 23 },
          { label: 'Replies given', value: 91 },
        ].map(s => (
          <div key={s.label} style={{
            display: 'flex', justifyContent: 'space-between',
            alignItems: 'center', marginBottom: 8,
          }}>
            <span style={{ fontSize: 12, color: 'var(--ink-mid)' }}>{s.label}</span>
            <span style={{
              fontSize: 13, fontWeight: 600, color: 'var(--sage)',
              fontFamily: 'DM Serif Display, serif',
            }}>{s.value}</span>
          </div>
        ))}
      </div>

    </aside>
  );
}
