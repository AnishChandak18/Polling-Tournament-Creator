import rawSchedule from "@/data/ipl-schedule.json";
import { fetchJsonFromRapidApi, getRapidApiScheduleConfig } from "@/lib/ipl-rapidapi";
import { extractCandidates } from "@/lib/ipl-payload";
import type { MatchDisplayMeta } from "@/lib/match-display";

export type { MatchDisplayMeta } from "@/lib/match-display";

export type IplFixture = {
  iplMatchId: string;
  matchDate: Date;
  venue?: string | null;
  team1: string;
  team2: string;
  displayMeta?: MatchDisplayMeta | null;
};

type RawFixture = Record<string, unknown>;

function asString(v: unknown) {
  if (typeof v === "string") return v;
  if (typeof v === "number") return String(v);
  return null;
}

function asStringArray(v: unknown) {
  if (!Array.isArray(v)) return null;
  const strings = v.map(asString).filter(Boolean) as string[];
  return strings.length ? strings : null;
}

/** Team may be a string or { name, shortName, ... } from APIs like RapidAPI */
function teamString(v: unknown): string | null {
  if (typeof v === "string") return v;
  if (v && typeof v === "object") {
    const o = v as Record<string, unknown>;
    return (
      asString(o.name) ??
      asString(o.teamName) ??
      asString(o.shortName) ??
      asString(o.short_name)
    );
  }
  return null;
}

function pickString(raw: RawFixture, keys: string[]) {
  for (const key of keys) {
    const value = asString(raw[key]);
    if (value) return value;
  }
  return null;
}

/** RapidAPI uses epoch ms as string (e.g. `"1775052000000"`). */
function coalesceDate(v: unknown): Date | null {
  if (v == null) return null;
  if (typeof v === "number" && Number.isFinite(v)) return new Date(v);
  if (typeof v === "string") {
    const t = v.trim();
    if (/^\d{10,13}$/.test(t)) {
      const n = Number(t);
      if (!Number.isNaN(n)) return new Date(n);
    }
    const d = new Date(t);
    if (!Number.isNaN(d.getTime())) return d;
  }
  return null;
}

function parseDateFromRaw(raw: RawFixture): Date | null {
  const keys = [
    "startDate",
    "dateTimeGMT",
    "GMTMatchDate",
    "MATCH_COMMENCE_START_DATE",
    "dateTime",
    "date",
    "MatchDate",
    "startTime",
    "matchDate",
    "commence_time",
    "endDate",
  ];
  for (const key of keys) {
    const d = coalesceDate(raw[key]);
    if (d) return d;
  }
  return null;
}

function buildDisplayMeta(raw: RawFixture): MatchDisplayMeta | null {
  const meta: MatchDisplayMeta = {};
  const sdl = pickString(raw, ["scheduleDateLabel"]);
  if (sdl) meta.scheduleDateLabel = sdl;
  const ld = pickString(raw, ["longDate"]);
  if (ld) meta.longDate = ld;
  const md = pickString(raw, ["matchDesc"]);
  if (md) meta.matchDesc = md;
  const mf = pickString(raw, ["matchFormat"]);
  if (mf) meta.matchFormat = mf;
  const sn = pickString(raw, ["seriesName"]);
  if (sn) meta.seriesName = sn;

  const vi = raw.venueInfo;
  if (vi && typeof vi === "object") {
    const o = vi as Record<string, unknown>;
    const city = asString(o.city);
    const country = asString(o.country);
    const tz = asString(o.timezone);
    if (city) meta.venueCity = city;
    if (country) meta.venueCountry = country;
    if (tz) meta.timezone = tz;
  }

  const t1 = raw.team1;
  const t2 = raw.team2;
  if (t1 && typeof t1 === "object") {
    const s = asString((t1 as Record<string, unknown>).teamSName);
    if (s) meta.team1Short = s;
  }
  if (t2 && typeof t2 === "object") {
    const s = asString((t2 as Record<string, unknown>).teamSName);
    if (s) meta.team2Short = s;
  }

  return Object.keys(meta).length > 0 ? meta : null;
}

function seriesLabelFromRaw(raw: RawFixture): string {
  const direct = pickString(raw, ["seriesName", "series_name"]);
  if (direct) return direct;
  const ser = raw.series;
  if (ser && typeof ser === "object") {
    return (
      pickString(ser as Record<string, unknown>, ["name", "longName", "seriesName"]) ?? ""
    );
  }
  return "";
}

/** Flat list / new Cricbuzz Cricket API shapes (e.g. /schedule/v1/league). */
function parseIplFixturesFromFlatCandidates(json: unknown, wantIpl: number | null): IplFixture[] {
  const candidates = extractCandidates(json);
  if (!candidates) return [];
  const fixtures: IplFixture[] = [];
  for (const raw of candidates as RawFixture[]) {
    const seriesName = seriesLabelFromRaw(raw);
    const seriesIdRaw = pickString(raw, ["seriesId", "series_id"]);
    const shouldInclude =
      seriesName.toLowerCase().includes("indian premier league") ||
      (wantIpl !== null && seriesIdRaw !== null && Number(seriesIdRaw) === wantIpl);
    if (!shouldInclude) continue;
    const fixture = parseFixture(raw);
    if (fixture) fixtures.push(fixture);
  }
  return fixtures;
}

function parseFixture(raw: RawFixture): IplFixture | null {
  const iplMatchId = pickString(raw, [
    "id",
    "matchId",
    "MatchID",
    "unique_id",
    "uniqueId",
    "key",
    "match_id",
  ]);

  const teams = (() => {
    const direct = asStringArray(raw.teams);
    if (direct) return direct;

    const teamInfo = raw.teamInfo;
    if (Array.isArray(teamInfo)) {
      const names = teamInfo
        .map((t) =>
          t && typeof t === "object"
            ? asString((t as Record<string, unknown>).name)
            : null
        )
        .filter(Boolean) as string[];
      if (names.length) return names;
    }

    const t1 =
      teamString(raw.team1) ??
      pickString(raw, ["team1", "FirstBattingTeamName", "HomeTeamName"]) ??
      null;
    const t2 =
      teamString(raw.team2) ??
      pickString(raw, ["team2", "SecondBattingTeamName", "AwayTeamName"]) ??
      null;
    const fromSingles = [t1, t2].filter(Boolean) as string[];
    return fromSingles.length ? fromSingles : null;
  })();

  const teamFromAlt = asStringArray(raw.team);
  const team1 =
    teams?.[0] ??
    teamFromAlt?.[0] ??
    teamString(raw.team1) ??
    pickString(raw, ["t1", "HomeTeamName", "FirstBattingTeamName"]);
  const team2 =
    teams?.[1] ??
    teamFromAlt?.[1] ??
    teamString(raw.team2) ??
    pickString(raw, ["t2", "AwayTeamName", "SecondBattingTeamName"]);

  const matchDate = parseDateFromRaw(raw);
  if (!iplMatchId || !matchDate || !team1 || !team2) return null;

  const venueFromInfo =
    raw &&
    typeof raw === "object" &&
    (raw as Record<string, unknown>).venueInfo &&
    typeof (raw as Record<string, unknown>).venueInfo === "object"
      ? asString(
          ((raw as Record<string, unknown>).venueInfo as Record<string, unknown>)
            .ground
        )
      : null;

  const displayMeta = buildDisplayMeta(raw);

  return {
    iplMatchId,
    matchDate,
    venue:
      pickString(raw, ["venue", "ground", "GroundName", "stadium"]) ??
      venueFromInfo ??
      null,
    team1,
    team2,
    displayMeta,
  };
}

function fixturesFromPayload(payload: unknown): IplFixture[] {
  const candidates = extractCandidates(payload);
  if (!candidates || !Array.isArray(candidates)) {
    const keys =
      payload && typeof payload === "object"
        ? Object.keys(payload as object).join(", ")
        : typeof payload;
    throw new Error(
      `IPL schedule JSON: expected an array or known wrapper (fixtures, schedule, data.matches, …). Got: ${keys}`
    );
  }

  return (candidates as RawFixture[]).map(parseFixture).filter(Boolean) as IplFixture[];
}

export function fetchIplFixturesFromLocalJson(): IplFixture[] {
  return fixturesFromPayload(rawSchedule as unknown);
}

function mergeFixturesById(sources: Array<IplFixture[] | null | undefined>): IplFixture[] {
  const merged = new Map<string, IplFixture>();
  for (const list of sources) {
    if (!list) continue;
    for (const fx of list) {
      if (!merged.has(fx.iplMatchId)) {
        merged.set(fx.iplMatchId, fx);
      }
    }
  }
  return Array.from(merged.values()).sort(
    (a, b) => a.matchDate.getTime() - b.matchDate.getTime()
  );
}

export async function fetchIplFixturesFromCricApi(): Promise<IplFixture[] | null> {
  const apiKey = process.env.CRICAPI_API_KEY?.trim();
  if (!apiKey) return null;

  const seriesId =
    process.env.CRICAPI_SERIES_ID_IPL &&
    Number(process.env.CRICAPI_SERIES_ID_IPL) > 0
      ? Number(process.env.CRICAPI_SERIES_ID_IPL)
      : 9241;

  const baseUrl = process.env.CRICAPI_BASE_URL?.trim() || "https://api.cricapi.com/v1";
  const url = new URL("/series_info", baseUrl);
  url.searchParams.set("apikey", apiKey);
  url.searchParams.set("id", String(seriesId));

  const res = await fetch(url.toString(), { next: { revalidate: 0 } });
  if (!res.ok) {
    const text = await res.text().catch(() => "");
    throw new Error(`CricAPI series_info failed: ${res.status} ${text.slice(0, 200)}`);
  }

  const json = (await res.json()) as Record<string, unknown>;
  if (json?.status && String(json.status).toLowerCase() !== "success") {
    return null;
  }

  const payload =
    (json?.data as Record<string, unknown> | undefined)?.matchList ??
    (json?.data as Record<string, unknown> | undefined)?.matches ??
    json?.data ??
    json;

  try {
    const list = fixturesFromPayload(payload);
    return list.length ? list : null;
  } catch {
    return null;
  }
}

export async function fetchIplFixturesFromRapidApi(): Promise<IplFixture[] | null> {
  const cfg = getRapidApiScheduleConfig();
  if (!cfg) return null;

  const json = await fetchJsonFromRapidApi(cfg.scheduleUrl, cfg.key);

  // Legacy nested shape (older Free Cricbuzz API): schedules[].scheduleAdWrapper.matchScheduleList[].matchInfo[]
  // New "Cricbuzz Cricket" API: often flat match lists under response/data (see parseIplFixturesFromFlatCandidates).
  const root = json as Record<string, unknown>;
  const inner =
    root?.response && typeof root.response === "object"
      ? (root.response as Record<string, unknown>)
      : root;
  const schedules = inner?.schedules;

  const wantIpl =
    process.env.CRICAPI_SERIES_ID_IPL &&
    Number(process.env.CRICAPI_SERIES_ID_IPL) > 0
      ? Number(process.env.CRICAPI_SERIES_ID_IPL)
      : null;

  if (Array.isArray(schedules)) {
    const fixtures: IplFixture[] = [];

    for (const sch of schedules) {
      const wrappers = sch as Record<string, unknown>;
      const scheduleWrapper = wrappers?.scheduleAdWrapper as Record<string, unknown> | undefined;
      const matchScheduleList = scheduleWrapper?.matchScheduleList;
      if (!Array.isArray(matchScheduleList)) continue;

      const scheduleDateLabel = asString(scheduleWrapper?.date);
      const scheduleLongDate = asString(scheduleWrapper?.longDate);

      for (const ms of matchScheduleList) {
        const msObj = ms as Record<string, unknown>;
        const seriesName = asString(msObj.seriesName) ?? "";
        const matchInfo = msObj.matchInfo;
        if (!Array.isArray(matchInfo)) continue;

        // Filter IPL only (RapidAPI endpoint includes other leagues in the same payload)
        const shouldInclude =
          seriesName.toLowerCase().includes("indian premier league") ||
          (wantIpl !== null &&
            matchInfo.length > 0 &&
            asString((matchInfo[0] as Record<string, unknown>)?.seriesId) !== null &&
            Number(asString((matchInfo[0] as Record<string, unknown>)?.seriesId)) === wantIpl);

        if (!shouldInclude) continue;

        for (const mi of matchInfo) {
          const miObj = mi as Record<string, unknown>;
          const venueGround =
            miObj?.venueInfo &&
            typeof miObj.venueInfo === "object"
              ? asString((miObj.venueInfo as Record<string, unknown>).ground)
              : null;

          const normalized = {
            ...miObj,
            venue: venueGround,
            seriesName: asString(msObj.seriesName),
            scheduleDateLabel,
            longDate: scheduleLongDate,
          };

          const fixture = parseFixture(normalized);
          if (fixture) fixtures.push(fixture);
        }
      }
    }

    if (fixtures.length) return fixtures;
  }

  const tryRoots = [
    json,
    (json as Record<string, unknown>).response,
    (json as Record<string, unknown>).data,
  ];
  for (const root of tryRoots) {
    if (root == null || typeof root !== "object") continue;
    const fromFlat = parseIplFixturesFromFlatCandidates(root, wantIpl);
    if (fromFlat.length) return fromFlat;
  }

  // Fallback: try generic extraction for other provider shapes.
  try {
    const list = fixturesFromPayload(json);
    return list.length ? list : null;
  } catch {
    return null;
  }
}

/**
 * Primary: RapidAPI (schedule-league) for future fixtures.
 * Secondary: CricAPI series_info for today/current gaps.
 * Final fallback: local JSON so sync still works in dev.
 */
export async function fetchIplFixtures(): Promise<IplFixture[]> {
  let rapid: IplFixture[] | null = null;
  let cricapi: IplFixture[] | null = null;

  try {
    rapid = await fetchIplFixturesFromRapidApi();
  } catch (e) {
    console.warn(
      "[ipl] RapidAPI schedule fetch failed:",
      e instanceof Error ? e.message : e
    );
  }

  try {
    cricapi = await fetchIplFixturesFromCricApi();
  } catch (e) {
    console.warn(
      "[ipl] CricAPI series_info fetch failed:",
      e instanceof Error ? e.message : e
    );
  }

  const merged = mergeFixturesById([cricapi, rapid]);
  if (merged.length > 0) return merged;

  return fetchIplFixturesFromLocalJson();
}
