/** Fields aligned with RapidAPI Cricbuzz `scheduleAdWrapper` / `matchInfo` / `venueInfo`. */
export type MatchDisplayMeta = {
  scheduleDateLabel?: string | null;
  longDate?: string | null;
  matchDesc?: string | null;
  matchFormat?: string | null;
  seriesName?: string | null;
  venueCity?: string | null;
  venueCountry?: string | null;
  timezone?: string | null;
  team1Short?: string | null;
  team2Short?: string | null;
};

export function asMatchDisplayMeta(value: unknown): MatchDisplayMeta | null {
  if (!value || typeof value !== "object") return null;
  return value as MatchDisplayMeta;
}

/** Group sorted matches by API schedule day label (e.g. "WED, APR 01 2026") or calendar date fallback. */
export function groupMatchesByScheduleDay<
  T extends { matchDate: Date; displayMeta?: unknown },
>(matches: T[]): { label: string; matches: T[] }[] {
  const sorted = [...matches].sort((a, b) => a.matchDate.getTime() - b.matchDate.getTime());
  const groups: { label: string; matches: T[] }[] = [];
  for (const m of sorted) {
    const meta = asMatchDisplayMeta(m.displayMeta);
    const label =
      meta?.scheduleDateLabel?.trim() ||
      new Intl.DateTimeFormat("en-GB", {
        weekday: "short",
        day: "2-digit",
        month: "short",
        year: "numeric",
        timeZone: "Asia/Kolkata",
      }).format(m.matchDate);
    const last = groups[groups.length - 1];
    if (!last || last.label !== label) {
      groups.push({ label, matches: [m] });
    } else {
      last.matches.push(m);
    }
  }
  return groups;
}
