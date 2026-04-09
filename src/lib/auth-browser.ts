import { AUTH_REDIRECT_COOKIE, safeNextPath } from "@/lib/auth-redirect";
import { getPublicSiteOrigin } from "@/lib/supabase/site-url";

/**
 * Browser-only callback URL for Supabase redirectTo/emailRedirectTo.
 * Keep this exact (`/auth/callback`) so it matches allow-list entries reliably.
 */
export function getAuthCallbackUrl(): string {
  if (typeof window === "undefined") return "";
  const origin = getPublicSiteOrigin() || window.location.origin;
  return `${origin}/auth/callback`;
}

/**
 * Call immediately before `signInWithOAuth`. OAuth often returns to `/auth/callback` without
 * `?next=` (redirect allowlist / provider), so we persist the target in a short-lived cookie.
 */
export function setAuthRedirectCookie(nextPath: string): void {
  if (typeof window === "undefined") return;
  const next = safeNextPath(nextPath.startsWith("/") ? nextPath : `/${nextPath}`);
  document.cookie = `${AUTH_REDIRECT_COOKIE}=${encodeURIComponent(next)}; path=/; max-age=600; SameSite=Lax`;
}
