import { useEffect, useState } from 'react';
import { Leaf } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { checkSupabaseAuthReachable, supabaseProjectUrl } from '../lib/supabaseClient';

export default function LoginPage() {
  const {
    sessionReady,
    loading,
    error,
    signInWithLoginId,
    signUpWithLoginId,
    signInAnonymous,
    clearError,
  } = useAuth();

  const [mode, setMode] = useState('signin');
  const [loginId, setLoginId] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [signupSent, setSignupSent] = useState(false);
  const [formError, setFormError] = useState('');
  const [connectionHint, setConnectionHint] = useState(null);

  useEffect(() => {
    if (!supabaseProjectUrl) return;
    let cancelled = false;
    checkSupabaseAuthReachable(supabaseProjectUrl).then((r) => {
      if (!cancelled && !r.ok && r.hint) setConnectionHint(r.hint);
    });
    return () => { cancelled = true; };
  }, []);

  const switchMode = (m) => {
    setMode(m);
    setSignupSent(false);
    setFormError('');
    clearError();
  };

  const checking = !sessionReady;
  const busy = loading;

  const handleSubmit = async (e) => {
    e.preventDefault();
    clearError();
    setFormError('');
    setSignupSent(false);
    if (!loginId.trim() || !password) {
      setFormError('Enter your User ID and password.');
      return;
    }
    if (mode === 'signup') {
      if (password.length < 6) {
        setFormError('Password must be at least 6 characters.');
        return;
      }
      if (password !== confirmPassword) {
        setFormError('Passwords do not match.');
        return;
      }
      const { needsEmailConfirm } = await signUpWithLoginId(loginId, password);
      if (needsEmailConfirm) setSignupSent(true);
    } else {
      await signInWithLoginId(loginId, password);
    }
  };

  const signInDisabled = checking || busy || !loginId.trim() || !password;
  const signUpDisabled =
    signInDisabled ||
    password.length < 6 ||
    password !== confirmPassword;

  return (
    <div style={{
      minHeight: '100vh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: 24,
      background: 'var(--warm)',
    }}>
      <div style={{
        width: '100%',
        maxWidth: 420,
        background: 'var(--white)',
        borderRadius: 'var(--radius-xl)',
        border: '1px solid var(--warm-mid)',
        boxShadow: '0 24px 48px rgba(62,58,53,0.08)',
        padding: '40px 36px',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 24 }}>
          <div style={{
            width: 48,
            height: 48,
            borderRadius: '50%',
            background: 'var(--sage)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}>
            <Leaf size={24} color="white" strokeWidth={2} />
          </div>
          <div>
            <h1 style={{
              fontFamily: 'DM Serif Display, serif',
              fontSize: 26,
              color: 'var(--ink)',
              margin: 0,
              lineHeight: 1.15,
            }}>
              SafeCircle
            </h1>
            <p style={{ fontSize: 12, color: 'var(--ink-soft)', margin: '4px 0 0' }}>
              Sign in with User ID and password
            </p>
          </div>
        </div>

        <p style={{ fontSize: 14, color: 'var(--ink-mid)', lineHeight: 1.6, marginBottom: 20 }}>
          Choose a User ID (letters, numbers, underscores) and a password so you can log back in on this or another device.
          Your posts in the feed stay anonymous to others; only your account ID is stored with them.
        </p>

        <div style={{ display: 'flex', gap: 8, marginBottom: 20 }}>
          {['signin', 'signup'].map((m) => (
            <button
              key={m}
              type="button"
              onClick={() => switchMode(m)}
              style={{
                flex: 1,
                padding: '10px 12px',
                borderRadius: 50,
                border: `1px solid ${mode === m ? 'var(--sage)' : 'var(--warm-mid)'}`,
                background: mode === m ? 'var(--sage-pale)' : 'white',
                color: mode === m ? 'var(--sage)' : 'var(--ink-mid)',
                fontSize: 13,
                fontWeight: mode === m ? 600 : 400,
                cursor: 'pointer',
              }}
            >
              {m === 'signin' ? 'Sign in' : 'Create account'}
            </button>
          ))}
        </div>

        {checking && (
          <p style={{ fontSize: 14, color: 'var(--ink-soft)', textAlign: 'center', marginBottom: 16 }}>
            Checking your session…
          </p>
        )}

        {import.meta.env.DEV && (
          <p style={{ fontSize: 11, color: 'var(--ink-soft)', marginBottom: 12, lineHeight: 1.5 }}>
            Dev: Supabase is proxied through Vite. Restart <code style={{ fontSize: 10 }}>npm run dev</code> after changing <code style={{ fontSize: 10 }}>.env</code>.
          </p>
        )}

        {connectionHint && (
          <div style={{
            padding: '12px 14px',
            marginBottom: 12,
            borderRadius: 'var(--radius-md)',
            background: '#F5F0E8',
            border: '1px solid #D8C8A8',
            fontSize: 12,
            color: 'var(--ink-mid)',
            lineHeight: 1.55,
          }}>
            <strong style={{ display: 'block', marginBottom: 6, color: 'var(--ink)' }}>Connection check</strong>
            {connectionHint}
          </div>
        )}

        {signupSent && (
          <div style={{
            padding: '12px 14px',
            marginBottom: 16,
            borderRadius: 'var(--radius-md)',
            background: 'var(--sage-pale)',
            border: '1px solid var(--sage-mid)',
            fontSize: 13,
            color: 'var(--ink-mid)',
            lineHeight: 1.5,
          }}>
            Supabase did not return a session—usually because <strong>Confirm email</strong> is still on. User ID sign-up does not use a real inbox. In the Supabase dashboard: Authentication → Providers → Email → turn <strong>Confirm email</strong> off, then create your account again or sign in.
          </div>
        )}

        {formError && (
          <div style={{
            padding: '12px 14px',
            marginBottom: 16,
            borderRadius: 'var(--radius-md)',
            background: '#FDF6F0',
            border: '1px solid #E8C4B3',
            fontSize: 13,
            color: 'var(--ink-mid)',
          }}>
            {formError}
          </div>
        )}

        {error && (
          <div style={{
            padding: '12px 14px',
            marginBottom: 16,
            borderRadius: 'var(--radius-md)',
            background: '#FDF6F0',
            border: '1px solid #E8C4B3',
            fontSize: 13,
            color: 'var(--ink-mid)',
            lineHeight: 1.5,
          }}>
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <label style={{ display: 'block', fontSize: 12, fontWeight: 600, color: 'var(--ink-mid)', marginBottom: 6 }}>
            User ID
          </label>
          <input
            type="text"
            autoComplete="username"
            value={loginId}
            onChange={(e) => setLoginId(e.target.value)}
            disabled={checking || busy}
            placeholder="e.g. river_owl_12"
            style={{
              width: '100%',
              padding: '12px 14px',
              marginBottom: 6,
              borderRadius: 'var(--radius-md)',
              border: '1px solid var(--warm-mid)',
              fontSize: 15,
              boxSizing: 'border-box',
            }}
          />
          <p style={{ fontSize: 11, color: 'var(--ink-soft)', lineHeight: 1.45, marginBottom: 14 }}>
            3–32 characters: lowercase letters, numbers, and underscores only (no email addresses).
          </p>
          <label style={{ display: 'block', fontSize: 12, fontWeight: 600, color: 'var(--ink-mid)', marginBottom: 6 }}>
            Password
          </label>
          <input
            type="password"
            autoComplete={mode === 'signup' ? 'new-password' : 'current-password'}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            disabled={checking || busy}
            placeholder={mode === 'signup' ? 'At least 6 characters' : '••••••••'}
            style={{
              width: '100%',
              padding: '12px 14px',
              marginBottom: mode === 'signup' ? 14 : 18,
              borderRadius: 'var(--radius-md)',
              border: '1px solid var(--warm-mid)',
              fontSize: 15,
              boxSizing: 'border-box',
            }}
          />
          {mode === 'signup' && (
            <>
              <label style={{ display: 'block', fontSize: 12, fontWeight: 600, color: 'var(--ink-mid)', marginBottom: 6 }}>
                Confirm password
              </label>
              <input
                type="password"
                autoComplete="new-password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                disabled={checking || busy}
                placeholder="Repeat password"
                style={{
                  width: '100%',
                  padding: '12px 14px',
                  marginBottom: 18,
                  borderRadius: 'var(--radius-md)',
                  border: '1px solid var(--warm-mid)',
                  fontSize: 15,
                  boxSizing: 'border-box',
                }}
              />
            </>
          )}
          <button
            type="submit"
            disabled={mode === 'signup' ? signUpDisabled : signInDisabled}
            style={{
              width: '100%',
              padding: '14px 20px',
              borderRadius: 50,
              border: 'none',
              background: (mode === 'signup' ? signUpDisabled : signInDisabled) ? 'var(--warm-mid)' : 'var(--sage)',
              color: 'white',
              fontSize: 15,
              fontWeight: 600,
              cursor: (mode === 'signup' ? signUpDisabled : signInDisabled) ? 'not-allowed' : 'pointer',
              boxShadow: (mode === 'signup' ? signUpDisabled : signInDisabled) ? 'none' : '0 4px 20px rgba(92,140,96,0.35)',
            }}
          >
            {busy ? 'Please wait…' : mode === 'signup' ? 'Create account' : 'Sign in'}
          </button>
        </form>

        <div style={{
          marginTop: 24,
          paddingTop: 20,
          borderTop: '1px solid var(--warm-mid)',
        }}>
          <p style={{ fontSize: 12, color: 'var(--ink-soft)', marginBottom: 10, textAlign: 'center' }}>
            Prefer a one-time session?
          </p>
          <button
            type="button"
            disabled={checking || busy}
            onClick={() => signInAnonymous()}
            style={{
              width: '100%',
              padding: '12px 16px',
              borderRadius: 50,
              border: '1px solid var(--warm-mid)',
              background: 'white',
              color: 'var(--ink-mid)',
              fontSize: 13,
              fontWeight: 500,
              cursor: checking || busy ? 'not-allowed' : 'pointer',
            }}
          >
            Continue anonymously (new session each time you log out)
          </button>
        </div>

        <p style={{
          fontSize: 11,
          color: 'var(--ink-soft)',
          textAlign: 'center',
          marginTop: 20,
          lineHeight: 1.5,
        }}>
          Not therapy or crisis care. If you are in danger, contact local emergency services.
        </p>
      </div>
    </div>
  );
}
