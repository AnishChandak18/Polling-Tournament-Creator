/**
 * RapidAPI — "Cricbuzz Cricket" (cricbuzz-cricket.p.rapidapi.com).
 *
 * Required: RAPIDAPI_KEY
 * Optional overrides:
 * - RAPIDAPI_HOST — base URL (default https://cricbuzz-cricket.p.rapidapi.com)
 * - RAPIDAPI_SCHEDULE_URL — full schedule URL (overrides host + path)
 * - RAPIDAPI_SCHEDULE_PATH — path only (default /schedule/v1/league)
 * - RAPIDAPI_SCOREBOARD_URL + RAPIDAPI_COMMENTARY_URL — legacy full URLs; use {matchId} in path/query
 *
 * X-RapidAPI-Host is taken from each request URL hostname.
 */

import { extractCandidates } from "@/lib/ipl-payload";

const DEFAULT_RAPIDAPI_HOST = "https://cricbuzz-cricket.p.rapidapi.com";
const DEFAULT_SCHEDULE_PATH = "/schedule/v1/league";

export type RapidCompletedMatch = {
  matchId: string;
  winnerTeamName: string;
};

export function getRapidApiScheduleConfig(): { key: string; scheduleUrl: URL } | null {
  const key = process.env.RAPIDAPI_KEY?.trim();
  if (!key) return null;
  const rawUrl = process.env.RAPIDAPI_SCHEDULE_URL?.trim();
  if (rawUrl) {
    try {
      return { key, scheduleUrl: new URL(rawUrl) };
    } catch {
      return null;
    }
  }
  const host = (process.env.RAPIDAPI_HOST?.trim() || DEFAULT_RAPIDAPI_HOST).replace(/\/$/, "");
  const path = process.env.RAPIDAPI_SCHEDULE_PATH?.trim() || DEFAULT_SCHEDULE_PATH;
  try {
    const scheduleUrl = new URL(path.startsWith("/") ? `${host}${path}` : `${host}/${path}`);
    return { key, scheduleUrl };
  } catch {
    return null;
  }
}

export function getRapidApiLiveConfig(
  matchId: string
): { key: string; scoreboardUrl: URL; commentaryUrl: URL } | null {
  const key = process.env.RAPIDAPI_KEY?.trim();
  if (!key) return null;

  const scoreOverride = process.env.RAPIDAPI_SCOREBOARD_URL?.trim();
  const commOverride = process.env.RAPIDAPI_COMMENTARY_URL?.trim();

  if (scoreOverride && commOverride) {
    try {
      const scoreboardUrl = new URL(
        scoreOverride.replace(/\{matchId\}/gi, matchId).replace(/\{matchid\}/gi, matchId)
      );
      const commentaryUrl = new URL(
        commOverride.replace(/\{matchId\}/gi, matchId).replace(/\{matchid\}/gi, matchId)
      );
      return { key, scoreboardUrl, commentaryUrl };
    } catch {
      /* fall through to defaults */
    }
  }

  const base = (process.env.RAPIDAPI_HOST?.trim() || DEFAULT_RAPIDAPI_HOST).replace(/\/$/, "");
  const sid = encodeURIComponent(matchId);
  try {
    const scoreboardUrl = new URL(`${base}/mcenter/v1/${sid}/hscard`);
    const commentaryUrl = new URL(`${base}/mcenter/v1/${sid}/hcomm`);
    return { key, scoreboardUrl, commentaryUrl };
  } catch {
    return null;
  }
}

export async function fetchJsonFromRapidApi(scheduleUrl: URL, key: string): Promise<unknown> {
  const res = await fetch(scheduleUrl.toString(), {
    method: "GET",
    headers: {
      "X-RapidAPI-Key": key,
      "X-RapidAPI-Host": scheduleUrl.hostname,
    },
    next: { revalidate: 0 },
  });

  if (!res.ok) {
    const text = await res.text().catch(() => "");
    throw new Error(`RapidAPI request failed: ${res.status} ${text.slice(0, 200)}`);
  }

  const json: unknown = await res.json();

  return json;
}

export async function fetchRapidApiMatchLive(matchId: string): Promise<{
  scoreboard: unknown | null;
  commentary: unknown | null;
}> {
  const cfg = getRapidApiLiveConfig(matchId);
  if (!cfg) return { scoreboard: null, commentary: null };

  const [scoreboard, commentary] = await Promise.all([
    fetchJsonFromRapidApi(cfg.scoreboardUrl, cfg.key).catch(() => null),
    fetchJsonFromRapidApi(cfg.commentaryUrl, cfg.key).catch(() => null),
  ]);

  return { scoreboard, commentary };
}

function normalizeRapidName(value: string) {
  return value.toLowerCase().replace(/[^a-z0-9]+/g, " ").trim();
}

function matchIdFromRow(m: Record<string, unknown>): string | null {
  const matchId =
    (typeof m.matchId === "number" && String(m.matchId)) ||
    (typeof m.matchId === "string" && m.matchId) ||
    (typeof m.id === "number" && String(m.id)) ||
    (typeof m.id === "string" && m.id) ||
    null;
  return matchId;
}

function addCompletedFromMatchRow(m: unknown, out: Map<string, RapidCompletedMatch>) {
  if (!m || typeof m !== "object") return;
  const row = m as Record<string, unknown>;
  const matchId = matchIdFromRow(row);
  if (!matchId) return;

  const state = typeof row.state === "string" ? row.state : "";
  const status = typeof row.status === "string" ? row.status : "";
  const stateLooksComplete =
    normalizeRapidName(state).includes("complete") ||
    normalizeRapidName(state).includes("result");
  if (!stateLooksComplete) return;

  const candidates = [
    typeof row.winnerTeamName === "string" ? row.winnerTeamName : null,
    typeof row.winningTeam === "string" ? row.winningTeam : null,
    typeof row.winner === "string" ? row.winner : null,
    status,
  ].filter(Boolean) as string[];

  const winner =
    candidates.find((c) => {
      const n = normalizeRapidName(c);
      return (
        n.includes(" won ") ||
        n.endsWith(" won") ||
        n.includes(" beat ") ||
        n.includes(" defeated ")
      );
    }) ?? candidates[0];

  if (!winner || !winner.trim()) return;
  out.set(matchId, { matchId, winnerTeamName: winner.trim() });
}

/**
 * Pulls completed matches from schedule endpoint with inferred winner names.
 * Useful for backfilling historical results without N scoreboard calls.
 */
export async function fetchRapidApiCompletedMatches(): Promise<RapidCompletedMatch[]> {
  const cfg = getRapidApiScheduleConfig();
  if (!cfg) return [];

  const json = await fetchJsonFromRapidApi(cfg.scheduleUrl, cfg.key).catch((err) => {
    console.warn("[match-results] RapidAPI schedule fetch failed (completed matches)", err);
    return null;
  });
  if (json == null) {
    console.warn("[match-results] RapidAPI schedule: no JSON (completed matches)");
    return [];
  }
  if (typeof json !== "object") {
    console.warn("[match-results] RapidAPI schedule: unexpected body type", typeof json, json);
    return [];
  }

  console.log("[match-results] RapidAPI schedule API response (completed / winner inference)", json);

  const root = json as Record<string, unknown>;
  const inner =
    root?.response && typeof root.response === "object"
      ? (root.response as Record<string, unknown>)
      : root;
  const schedules = inner?.schedules;

  const out = new Map<string, RapidCompletedMatch>();

  if (Array.isArray(schedules)) {
    for (const sch of schedules) {
      const wrappers = sch as Record<string, unknown>;
      const scheduleWrapper = wrappers?.scheduleAdWrapper as Record<string, unknown> | undefined;
      const matchScheduleList = scheduleWrapper?.matchScheduleList;
      if (!Array.isArray(matchScheduleList)) continue;

      for (const ms of matchScheduleList) {
        const msObj = ms as Record<string, unknown>;
        const matchInfo = msObj.matchInfo;
        if (!Array.isArray(matchInfo)) continue;

        for (const mi of matchInfo) {
          addCompletedFromMatchRow(mi, out);
        }
      }
    }
  }

  const flatCandidates = extractCandidates(json);
  if (flatCandidates) {
    for (const item of flatCandidates) {
      const i = item as Record<string, unknown>;
      const matchInfo = i.matchInfo;
      if (Array.isArray(matchInfo)) {
        for (const mi of matchInfo) {
          addCompletedFromMatchRow(mi, out);
        }
      } else {
        addCompletedFromMatchRow(item, out);
      }
    }
  }

  const inferred = Array.from(out.values());
  console.log("[match-results] RapidAPI schedule → inferred completed winners", inferred.length, inferred);
  return inferred;
}
