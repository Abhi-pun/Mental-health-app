import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { supabase, isSupabaseConfigured } from '../lib/supabaseClient';
import {
  isSyntheticLoginEmail,
  loginIdErrorMessage,
  parseLoginIdentifier,
  syntheticEmailToLoginId,
  userIdToSyntheticEmail,
} from '../lib/loginUserId';

const AuthContext = createContext(null);

function friendlyAuthError(err) {
  const msg = err?.message || String(err);
  if (/JSON\.parse|unexpected end of data|Unexpected end of JSON/i.test(msg)) {
    return [
      'Supabase returned an empty or invalid response (often a bad Project URL or API key).',
      'Fix: use Project URL exactly like https://xxxx.supabase.co (no trailing slash), paste the full anon key, save .env, then restart npm run dev.',
    ].join(' ');
  }
  if (/anonymous.*disabled|Anonymous sign/i.test(msg)) {
    return [
      msg,
      'In Supabase: Authentication → Providers → Anonymous → ON (optional), for “Continue anonymously”.',
    ].join(' ');
  }
  if (/rate limit|too many emails|email rate/i.test(msg)) {
    return [
      'Supabase is limiting how many emails it sends (often from sign-up confirmation).',
      'In the dashboard: Authentication → Providers → Email → turn off “Confirm email”.',
      'Wait a few minutes before trying again, or use a higher Auth email quota on your plan.',
    ].join(' ');
  }
  return msg;
}

function sessionUserMeta(session) {
  const u = session?.user;
  if (!u) {
    return { userId: null, loginUserId: null, isAnonymousUser: false };
  }
  const email = (typeof u.email === 'string' && u.email.trim()) ? u.email.trim() : null;
  const metaLogin = typeof u.user_metadata?.login_id === 'string'
    ? u.user_metadata.login_id.trim().toLowerCase()
    : null;
  const loginUserId = metaLogin || (email && isSyntheticLoginEmail(email)
    ? syntheticEmailToLoginId(email)
    : null);
  return {
    userId: u.id,
    loginUserId,
    isAnonymousUser: Boolean(u.is_anonymous),
  };
}

export function AuthProvider({ children }) {
  const [userId, setUserId] = useState(null);
  const [loginUserId, setLoginUserId] = useState(null);
  const [isAnonymousUser, setIsAnonymousUser] = useState(false);
  const [sessionReady, setSessionReady] = useState(() => !isSupabaseConfigured || !supabase);
  const [loading, setLoading] = useState(() => Boolean(isSupabaseConfigured && supabase));
  const [error, setError] = useState(null);

  const applySession = useCallback((session) => {
    const m = sessionUserMeta(session);
    setUserId(m.userId);
    setLoginUserId(m.loginUserId);
    setIsAnonymousUser(m.isAnonymousUser);
  }, []);

  useEffect(() => {
    if (!isSupabaseConfigured || !supabase) {
      return;
    }

    let cancelled = false;

    (async () => {
      setError(null);
      try {
        const { data: { session }, error: sessionErr } = await supabase.auth.getSession();
        if (cancelled) return;
        if (sessionErr) {
          setError(friendlyAuthError(sessionErr));
        } else {
          applySession(session);
        }
      } catch (e) {
        if (!cancelled) setError(friendlyAuthError(e));
      } finally {
        if (!cancelled) {
          setSessionReady(true);
          setLoading(false);
        }
      }
    })();

    const { data: sub } = supabase.auth.onAuthStateChange((_event, session) => {
      applySession(session);
      if (session) setError(null);
    });

    return () => {
      cancelled = true;
      sub.subscription.unsubscribe();
    };
  }, [applySession]);

  const clearError = useCallback(() => setError(null), []);

  const signInWithLoginId = useCallback(async (rawIdentifier, password) => {
    if (!supabase) return { error: new Error('Not configured') };
    const parsed = parseLoginIdentifier(rawIdentifier);
    if (parsed.error) {
      const msg = loginIdErrorMessage(parsed.error);
      setError(msg);
      return { error: new Error(msg) };
    }
    const authEmail = userIdToSyntheticEmail(parsed.value);
    setLoading(true);
    setError(null);
    try {
      const { data, error: signErr } = await supabase.auth.signInWithPassword({
        email: authEmail,
        password,
      });
      if (signErr) {
        setError(friendlyAuthError(signErr));
        return { error: signErr };
      }
      applySession(data.session);
      return { error: null };
    } catch (e) {
      const fe = friendlyAuthError(e);
      setError(fe);
      return { error: e };
    } finally {
      setLoading(false);
    }
  }, [applySession]);

  const signUpWithLoginId = useCallback(async (rawUserId, password) => {
    if (!supabase) return { error: new Error('Not configured'), needsEmailConfirm: false };
    const parsed = parseLoginIdentifier(rawUserId);
    if (parsed.error) {
      const msg = loginIdErrorMessage(parsed.error);
      setError(msg);
      return { error: new Error(msg), needsEmailConfirm: false };
    }
    const authEmail = userIdToSyntheticEmail(parsed.value);
    setLoading(true);
    setError(null);
    try {
      const { data, error: signErr } = await supabase.auth.signUp({
        email: authEmail,
        password,
        options: {
          data: { login_id: parsed.value },
        },
      });
      if (signErr) {
        setError(friendlyAuthError(signErr));
        return { error: signErr, needsEmailConfirm: false };
      }
      if (data.session) {
        applySession(data.session);
        return { error: null, needsEmailConfirm: false };
      }
      return { error: null, needsEmailConfirm: true };
    } catch (e) {
      const fe = friendlyAuthError(e);
      setError(fe);
      return { error: e, needsEmailConfirm: false };
    } finally {
      setLoading(false);
    }
  }, [applySession]);

  const signInAnonymous = useCallback(async () => {
    if (!supabase) return;
    setLoading(true);
    setError(null);
    try {
      const { error: signErr } = await supabase.auth.signInAnonymously();
      if (signErr) {
        setError(friendlyAuthError(signErr));
        setUserId(null);
        setLoginUserId(null);
        setIsAnonymousUser(false);
        return;
      }
      const { data: { session } } = await supabase.auth.getSession();
      applySession(session);
    } catch (e) {
      setError(friendlyAuthError(e));
      setUserId(null);
      setLoginUserId(null);
      setIsAnonymousUser(false);
    } finally {
      setLoading(false);
    }
  }, [applySession]);

  const signOut = useCallback(async () => {
    if (!supabase) return;
    setError(null);
    await supabase.auth.signOut();
    setUserId(null);
    setLoginUserId(null);
    setIsAnonymousUser(false);
  }, []);

  const value = useMemo(() => {
    if (!isSupabaseConfigured || !supabase) {
      return {
        userId: null,
        loginUserId: null,
        isAnonymousUser: false,
        sessionReady: true,
        loading: false,
        error: null,
        isConfigured: false,
        signInWithLoginId: async () => ({ error: null }),
        signUpWithLoginId: async () => ({ error: null, needsEmailConfirm: false }),
        signInAnonymous: async () => {},
        retrySignIn: async () => {},
        signOut: async () => {},
        clearError: () => {},
        userIdSuffix: null,
      };
    }
    return {
      userId,
      loginUserId,
      isAnonymousUser,
      sessionReady,
      loading,
      error,
      isConfigured: true,
      signInWithLoginId,
      signUpWithLoginId,
      signInAnonymous,
      retrySignIn: signInAnonymous,
      signOut,
      clearError,
      userIdSuffix: userId ? userId.slice(-4) : null,
    };
  }, [
    userId,
    loginUserId,
    isAnonymousUser,
    sessionReady,
    loading,
    error,
    signInWithLoginId,
    signUpWithLoginId,
    signInAnonymous,
    signOut,
    clearError,
  ]);

  return (
    <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
  );
}

// eslint-disable-next-line react-refresh/only-export-components -- hook paired with AuthProvider
export function useAuth() {
  const ctx = useContext(AuthContext);
  if (ctx == null) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return ctx;
}
