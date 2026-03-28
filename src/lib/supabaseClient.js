import { createClient } from '@supabase/supabase-js';

function normalizeEnv(value) {
  if (value == null || typeof value !== 'string') return '';
  let s = value.trim();
  if (s.charCodeAt(0) === 0xfeff) s = s.slice(1);
  s = s.trim().replace(/^["']|["']$/g, '');
  if (/^bearer\s+/i.test(s)) s = s.replace(/^bearer\s+/i, '').trim();
  return s;
}

/** Remove trailing slashes — a trailing `/` can break auth REST paths and yield empty responses. */
function normalizeSupabaseUrl(raw) {
  const s = normalizeEnv(raw);
  if (!s) return '';
  let u = s.replace(/\/+$/, '');
  if (!/^https?:\/\//i.test(u)) u = `https://${u}`;
  return u;
}

/** In dev, use same-origin `/__supabase` (Vite proxy) so the browser never calls supabase.co directly. */
function devProxySupabaseBase() {
  if (!import.meta.env.DEV) return null;
  if (import.meta.env.VITE_SUPABASE_NO_PROXY === 'true') return null;
  if (typeof globalThis === 'undefined' || !globalThis.location) return null;
  const { protocol, hostname } = globalThis.location;
  if (protocol !== 'http:' && protocol !== 'https:') return null;
  if (!hostname) return null;
  return `${globalThis.location.origin}/__supabase`;
}

const realSupabaseUrl = normalizeSupabaseUrl(import.meta.env.VITE_SUPABASE_URL);
const key = normalizeEnv(import.meta.env.VITE_SUPABASE_ANON_KEY).replace(/\s+/g, '');

const proxyBase = devProxySupabaseBase();
const clientUrl = proxyBase || realSupabaseUrl;

/** @type {import('@supabase/supabase-js').SupabaseClient | null} */
export const supabase = realSupabaseUrl && key ? createClient(clientUrl, key) : null;

export const isSupabaseConfigured = Boolean(supabase);

/** Base URL the Supabase client uses (proxy path in dev, real URL in production). */
export const supabaseProjectUrl = clientUrl;

/** Real project URL from .env (for troubleshooting text only). */
export const supabaseDirectUrl = realSupabaseUrl;

/**
 * Quick check that auth health responds (uses same base URL as the client).
 * @param {string} baseUrl
 */
export async function checkSupabaseAuthReachable(baseUrl) {
  const u = baseUrl.replace(/\/+$/, '');
  try {
    const res = await fetch(`${u}/auth/v1/health`, { method: 'GET' });
    const text = await res.text();
    if (!text?.trim()) {
      return {
        ok: false,
        hint: `No response body from ${u}/auth/v1/health. Check VITE_SUPABASE_URL in .env and restart npm run dev.`,
      };
    }
    try {
      JSON.parse(text);
    } catch {
      return {
        ok: false,
        hint: `Host responded but not with JSON (status ${res.status}). Confirm your Supabase Project URL.`,
      };
    }
    // Some Supabase regions return 401 on /auth/v1/health without a session; JSON still means the host is reachable.
    if (!res.ok && res.status >= 500) {
      return { ok: false, hint: `Auth returned HTTP ${res.status}. The project may be paused — check the Supabase dashboard.` };
    }
    return { ok: true };
  } catch (e) {
    const extra = import.meta.env.DEV
      ? ' If this persists, set VITE_SUPABASE_NO_PROXY=true in .env to call Supabase directly (then fix VPN/ad-block if needed).'
      : '';
    return {
      ok: false,
      hint: `Network error: ${e.message}.${extra}`,
    };
  }
}
