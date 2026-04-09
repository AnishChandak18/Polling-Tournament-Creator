/** Cookie set before OAuth so `/auth/callback` can recover `next` when query params are stripped. */
export const AUTH_REDIRECT_COOKIE = "auth_next";

/** Only allow same-app relative paths (avoid open redirects). */
export function safeNextPath(next: string): string {
  const t = next.trim();
  if (!t.startsWith("/") || t.startsWith("//")) return "/dashboard";
  return t;
}

export function resolvePostAuthRedirect(
  searchParamsNext: string | null,
  cookieValue: string | undefined
): string {
  const fromUrl = searchParamsNext?.length ? searchParamsNext : null;
  let fromCookie: string | null = null;
  if (cookieValue) {
    try {
      fromCookie = decodeURIComponent(cookieValue);
    } catch {
      fromCookie = null;
    }
  }
  const raw = fromUrl ?? fromCookie ?? "/dashboard";
  return safeNextPath(raw);
}
