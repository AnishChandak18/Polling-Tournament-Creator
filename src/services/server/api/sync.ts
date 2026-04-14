import { Prisma, type MatchStatus } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { fetchIplFixtures } from "@/lib/ipl";
import type { IplFixture } from "@/lib/ipl";
import { fetchRapidApiCompletedMatches, fetchRapidApiMatchLive } from "@/lib/ipl-rapidapi";
import { recalculateTournamentScores } from "@/lib/leaderboard";

/** ~T20 window: after this from kickoff, treat match as finished for UI status. */
export const MATCH_ASSUMED_DURATION_MS = 5.5 * 60 * 60 * 1000;

/** After first DB error, skip `displayMeta` until process restart (column added → restart dev server). */
let skipDisplayMetaColumn = false;

function normalizeName(value: string) {
  return value.toLowerCase().replace(/[^a-z0-9]+/g, " ").trim();
}

function collectStringsDeep(value: unknown, out: string[], depth = 0) {
  if (depth > 4 || out.length > 120) return;
  if (typeof value === "string") {
    const trimmed = value.trim();
    if (trimmed) out.push(trimmed);
    return;
  }
  if (!value || typeof value !== "object") return;
  if (Array.isArray(value)) {
    for (const item of value) collectStringsDeep(item, out, depth + 1);
    return;
  }
  for (const v of Object.values(value as Record<string, unknown>)) {
    collectStringsDeep(v, out, depth + 1);
  }
}

function inferWinnerFromScoreboard(
  scoreboard: unknown,
  team1: string,
  team2: string
): string | null {
  if (!scoreboard || typeof scoreboard !== "object") return null;
  let root = scoreboard as Record<string, unknown>;
  if (root.response && typeof root.response === "object") {
    root = root.response as Record<string, unknown>;
  }

  const directWinner =
    (typeof root.winnerTeamName === "string" && root.winnerTeamName) ||
    (typeof root.winningTeam === "string" && root.winningTeam) ||
    (typeof root.winner === "string" && root.winner) ||
    (typeof root.resultWinnerTeam === "string" && root.resultWinnerTeam);

  if (typeof directWinner === "string" && directWinner.trim()) {
    const n = normalizeName(directWinner);
    if (n.includes(normalizeName(team1))) return team1;
    if (n.includes(normalizeName(team2))) return team2;
  }

  const teamInfo = (root.teamInfo ?? root.teams) as unknown;
  if (Array.isArray(teamInfo)) {
    for (const t of teamInfo) {
      if (!t || typeof t !== "object") continue;
      const obj = t as Record<string, unknown>;
      const isWinner = obj.isWinner === true || obj.winner === true;
      const nameCandidate =
        (typeof obj.teamName === "string" && obj.teamName) ||
        (typeof obj.name === "string" && obj.name) ||
        (typeof obj.shortName === "string" && obj.shortName);
      if (isWinner && typeof nameCandidate === "string") {
        const n = normalizeName(nameCandidate);
        if (n.includes(normalizeName(team1))) return team1;
        if (n.includes(normalizeName(team2))) return team2;
      }
    }
  }

  const strings: string[] = [];
  collectStringsDeep(scoreboard, strings);
  const n1 = normalizeName(team1);
  const n2 = normalizeName(team2);
  for (const s of strings) {
    const n = normalizeName(s);
    const looksResult =
      n.includes(" won ") ||
      n.endsWith(" won") ||
      n.includes(" beat ") ||
      n.includes(" defeated ") ||
      n.includes(" win by ");
    if (!looksResult) continue;
    const has1 = n.includes(n1);
    const has2 = n.includes(n2);
    if (has1 && !has2) return team1;
    if (has2 && !has1) return team2;
  }

  return null;
}

function deriveMatchStatus(matchDate: Date, nowMs: number): MatchStatus {
  const start = matchDate.getTime();
  if (nowMs >= start + MATCH_ASSUMED_DURATION_MS) return "COMPLETED";
  if (nowMs >= start) return "LIVE";
  return "UPCOMING";
}

async function reconcileMatchStatusesForTournamentIds(tournamentIds: string[]) {
  if (tournamentIds.length === 0) return;
  const nowMs = Date.now();
  const matches = await prisma.match.findMany({
    where: { tournamentId: { in: tournamentIds } },
    select: { id: true, matchDate: true },
  });
  const updates = matches.map((m) =>
    prisma.match.update({
      where: { id: m.id },
      data: { status: deriveMatchStatus(m.matchDate, nowMs) },
    })
  );
  const chunk = 50;
  for (let i = 0; i < updates.length; i += chunk) {
    await prisma.$transaction(updates.slice(i, i + chunk));
  }
}

async function resolveCompletedWinnersForTournamentIds(tournamentIds: string[]) {
  if (tournamentIds.length === 0) return;

  const pending = await prisma.match.findMany({
    where: {
      tournamentId: { in: tournamentIds },
      status: "COMPLETED",
      winnerTeam: null,
      iplMatchId: { not: null },
    },
    select: {
      id: true,
      tournamentId: true,
      iplMatchId: true,
      team1: true,
      team2: true,
    },
    orderBy: { matchDate: "desc" },
    take: 25,
  });

  if (pending.length === 0) return;

  const changedTournamentIds = new Set<string>();
  const completedFromSchedule = await fetchRapidApiCompletedMatches().catch(() => []);
  const scheduleWinnerByMatchId = new Map(
    completedFromSchedule.map((m) => [String(m.matchId), m.winnerTeamName])
  );
  for (const match of pending) {
    if (!match.iplMatchId) continue;
    const scheduleWinnerRaw = scheduleWinnerByMatchId.get(String(match.iplMatchId)) ?? null;
    let winner: string | null = null;
    if (scheduleWinnerRaw) {
      const n = normalizeName(scheduleWinnerRaw);
      if (n.includes(normalizeName(match.team1))) winner = match.team1;
      else if (n.includes(normalizeName(match.team2))) winner = match.team2;
    }
    if (!winner) {
      const live = await fetchRapidApiMatchLive(match.iplMatchId).catch((err) => {
        console.warn("[match-results] RapidAPI match live fetch failed", {
          dbMatchId: match.id,
          iplMatchId: match.iplMatchId,
          err,
        });
        return null;
      });
      console.log("[match-results] RapidAPI match live API response (winner resolution)", {
        dbMatchId: match.id,
        iplMatchId: match.iplMatchId,
        team1: match.team1,
        team2: match.team2,
        scoreboard: live?.scoreboard ?? null,
        commentary: live?.commentary ?? null,
      });
      winner = inferWinnerFromScoreboard(live?.scoreboard ?? null, match.team1, match.team2);
    }
    if (!winner) continue;

    await prisma.match.update({
      where: { id: match.id },
      data: { winnerTeam: winner, status: "COMPLETED" },
    });
    changedTournamentIds.add(match.tournamentId);
  }

  for (const tid of changedTournamentIds) {
    await recalculateTournamentScores(tid);
  }
}

function upsertArgs(tournamentId: string, fx: IplFixture, includeDisplayMeta: boolean) {
  const meta = includeDisplayMeta
    ? {
        displayMeta:
          fx.displayMeta != null
            ? (fx.displayMeta as Prisma.InputJsonValue)
            : Prisma.JsonNull,
      }
    : {};

  return {
    where: {
      tournamentId_iplMatchId: {
        tournamentId,
        iplMatchId: fx.iplMatchId,
      },
    },
    create: {
      tournamentId,
      iplMatchId: fx.iplMatchId,
      matchDate: fx.matchDate,
      venue: fx.venue ?? null,
      team1: fx.team1,
      team2: fx.team2,
      ...meta,
    },
    update: {
      matchDate: fx.matchDate,
      venue: fx.venue ?? null,
      team1: fx.team1,
      team2: fx.team2,
      ...meta,
    },
    select: { id: true },
  };
}

/**
 * Fetches IPL fixtures once and upserts into every tournament in the list.
 * Reconciles match status (UPCOMING / LIVE / COMPLETED) from kickoff time so stale rows don’t stay “upcoming”.
 */
export async function syncIplFixturesForTournamentIds(tournamentIds: string[]): Promise<void> {
  const unique = [...new Set(tournamentIds.filter(Boolean))];
  if (unique.length === 0) return;

  const tournaments = await prisma.tournament.findMany({
    where: { id: { in: unique } },
    select: { id: true },
  });
  const ids = tournaments.map((t) => t.id);
  if (ids.length === 0) return;

  const fixtures = await fetchIplFixtures();

  const run = (includeDisplayMeta: boolean) => {
    const ops: Promise<unknown>[] = [];
    for (const tid of ids) {
      for (const fx of fixtures) {
        ops.push(prisma.match.upsert(upsertArgs(tid, fx, includeDisplayMeta)));
      }
    }
    return Promise.all(ops);
  };

  try {
    await run(!skipDisplayMetaColumn);
  } catch (e: unknown) {
    const msg = e instanceof Error ? e.message : String(e);
    const missingColumn =
      msg.includes("displayMeta") &&
      (msg.includes("does not exist") || msg.includes("Unknown column"));

    if (missingColumn && !skipDisplayMetaColumn) {
      skipDisplayMetaColumn = true;
      console.warn(
        "[sync] Match.displayMeta column missing. Run: npm run db:add-display-meta (or npm run db:migrate), then restart the dev server. Retrying upsert without displayMeta."
      );
      await run(false);
    } else {
      throw e;
    }
  }

  await reconcileMatchStatusesForTournamentIds(ids);
  await resolveCompletedWinnersForTournamentIds(ids);
}

/**
 * Fetches IPL fixtures (RapidAPI or local JSON) and upserts them into one tournament.
 * Call only after verifying the user may access this tournament.
 */
export async function upsertIplFixturesForTournament(tournamentId: string): Promise<void> {
  await syncIplFixturesForTournamentIds([tournamentId]);
}
