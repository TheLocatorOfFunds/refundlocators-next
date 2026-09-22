// Server-issued visitor credential for lauren-chat rate limiting (DoS
// hardening, deal-command-center 3b36fdc + lauren-chat platform v70).
//
// The function mints "uuid.YYYY-MM-DD.hmac" after a request passes the rate
// gate and returns it as response.visitor_credential; we store it and echo
// it as body.visitor_credential on every later call. Once DCC flips
// LAUREN_ANON_CLAMP, uncredentialed traffic shares one global hourly bucket,
// which kills visitor_id-rotation abuse. Losing the credential (private
// mode, cleared storage) is harmless — the next reply re-mints one.

const KEY = 'lauren_visitor_credential';

export function getLaurenCredential(): string | null {
  try {
    return localStorage.getItem(KEY);
  } catch {
    return null; // private mode — proceed uncredentialed
  }
}

export function storeLaurenCredential(credential: unknown): void {
  if (typeof credential !== 'string' || credential.length === 0 || credential.length > 200) return;
  try {
    localStorage.setItem(KEY, credential);
  } catch { /* private mode — nothing to do */ }
}
