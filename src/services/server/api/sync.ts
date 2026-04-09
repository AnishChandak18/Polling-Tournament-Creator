import { Prisma, type MatchStatus } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { fetchIplFixtures } from "@/lib/ipl";
import type { IplFixture } from "@/lib/ipl";

/** ~T20 window: after this from kickoff, treat match as finished for UI status. */
const MATCH_ASSUMED_DURATION_MS = 5.5 * 60 * 60 * 1000;

/** After first DB error, skip `displayMeta` until process restart (column added → restart dev server). */
let skipDisplayMetaColumn = false;

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
}

/**
 * Fetches IPL fixtures (RapidAPI or local JSON) and upserts them into one tournament.
 * Call only after verifying the user may access this tournament.
 */
export async function upsertIplFixturesForTournament(tournamentId: string): Promise<void> {
  await syncIplFixturesForTournamentIds([tournamentId]);
}
