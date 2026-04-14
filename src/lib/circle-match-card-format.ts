/** Shared top-line + team labels for Circle Arena match cards (tournament + vote pages). */

export function formatMatchTopLine(
  match: { status: string; matchDate: Date | string },
  meta: { seriesName?: string | null } | null,
  opts?: { kickoffPast?: boolean }
) {
  const series = meta?.seriesName?.trim() || "IPL";
  if (match.status === "LIVE") return `${series} • LIVE`;
  if (match.status === "COMPLETED") return `${series} • FINAL`;
  if (opts?.kickoffPast && match.status === "UPCOMING") return `${series} • FINAL`;
  const start = new Date(match.matchDate).getTime();
  const delta = start - Date.now();
  const hours = Math.max(0, Math.floor(delta / (1000 * 60 * 60)));
  return `${series} • STARTS IN ${hours}H`;
}

export function displayTeamName(full: string, metaShort?: string | null) {
  const s = metaShort?.trim();
  if (s) return s;
  return full;
}
