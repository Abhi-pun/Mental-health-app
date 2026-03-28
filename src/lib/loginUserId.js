/**
 * Supabase Auth sign-in uses an "email" field. We map a chosen User ID to a
 * stable synthetic address so users never see or type an email.
 * Domain is reserved for documentation / testing (.invalid per RFC 2606).
 */
export const SYNTHETIC_EMAIL_DOMAIN = 'safecircle-user.invalid';

export function userIdToSyntheticEmail(loginUserId) {
  return `${loginUserId}@${SYNTHETIC_EMAIL_DOMAIN}`;
}

export function isSyntheticLoginEmail(email) {
  if (!email || typeof email !== 'string') return false;
  return email.toLowerCase().endsWith(`@${SYNTHETIC_EMAIL_DOMAIN}`);
}

export function syntheticEmailToLoginId(email) {
  if (!isSyntheticLoginEmail(email)) return null;
  const suffix = `@${SYNTHETIC_EMAIL_DOMAIN}`;
  return email.slice(0, -suffix.length);
}

/**
 * @returns {{ type: 'userid', value: string } | { error: string }}
 */
export function parseLoginIdentifier(raw) {
  const s = (raw || '').trim();
  if (!s) return { error: 'empty' };

  if (s.includes('@')) {
    return { error: 'no_email' };
  }

  const lower = s.toLowerCase();
  if (lower.length < 3) return { error: 'userid_short' };
  if (lower.length > 32) return { error: 'userid_long' };
  if (!/^[a-z0-9_]+$/.test(lower)) {
    return { error: 'userid_format' };
  }
  return { type: 'userid', value: lower };
}

export function loginIdErrorMessage(code) {
  switch (code) {
    case 'empty':
      return 'Enter your User ID and password.';
    case 'userid_short':
      return 'User ID must be at least 3 characters.';
    case 'userid_long':
      return 'User ID must be 32 characters or fewer.';
    case 'userid_format':
      return 'User ID can only use lowercase letters, numbers, and underscores.';
    case 'no_email':
      return 'Use your User ID only (no @). This app does not sign in with email addresses.';
    default:
      return 'Invalid User ID.';
  }
}
