/** Origin for absolute URLs in API routes (respects proxies). */
export function getRequestOrigin(request: Request) {
  const url = new URL(request.url);
  const forwardedHost = request.headers.get("x-forwarded-host");
  const forwardedProto = request.headers.get("x-forwarded-proto");
  const host = forwardedHost ?? request.headers.get("host");
  const proto = forwardedProto ?? url.protocol.replace(":", "");
  if (host) return `${proto}://${host}`;
  return url.origin;
}
