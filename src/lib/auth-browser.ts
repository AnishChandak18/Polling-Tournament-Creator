/** Browser-only: Supabase redirect after OAuth, email confirmation, or password recovery. */
export function getAuthCallbackUrl(nextPath: string): string {
  if (typeof window === "undefined") return "";
  const next = nextPath.startsWith("/") ? nextPath : `/${nextPath}`;
  return `${window.location.origin}/auth/callback?next=${encodeURIComponent(next)}`;
}
