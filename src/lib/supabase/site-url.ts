/**
 * Origin used for Supabase `redirectTo` / `emailRedirectTo` (must match URLs allowed in
 * Supabase Dashboard → Authentication → URL Configuration → Redirect URLs).
 *
 * - On localhost we always use the current tab origin so PKCE cookies match the callback.
 * - In production, set NEXT_PUBLIC_SITE_URL to your canonical public URL (e.g. https://app.example.com)
 *   if it differs from what the browser sees (rare); otherwise the current origin is used.
 */
export function getPublicSiteOrigin(): string {
  // Browser auth flows (OAuth/email links) must come back to the same origin
  // where the user initiated login; otherwise localhost can bounce to production.
  if (typeof globalThis !== "undefined" && "window" in globalThis) {
    return (globalThis as { window?: { location?: { origin?: string } } }).window?.location
      ?.origin ?? "";
  }

  const fromEnv =
    process.env.NEXT_PUBLIC_SITE_URL?.trim() ||
    process.env.NEXT_PUBLIC_APP_URL?.trim();
  if (fromEnv) {
    try {
      return new URL(fromEnv).origin;
    } catch {
      return fromEnv.replace(/\/$/, "");
    }
  }

  return "";
}
