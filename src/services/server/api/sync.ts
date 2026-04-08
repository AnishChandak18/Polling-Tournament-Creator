import { Prisma } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { fetchIplFixtures } from "@/lib/ipl";
import type { IplFixture } from "@/lib/ipl";

/** After first DB error, skip `displayMeta` until process restart (column added → restart dev server). */
let skipDisplayMetaColumn = false;

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
 * Fetches IPL fixtures (RapidAPI or local JSON) and upserts them into the tournament.
 * Call only after verifying the user may access this tournament.
 */
export async function upsertIplFixturesForTournament(tournamentId: string): Promise<void> {
  const tournament = await prisma.tournament.findUnique({
    where: { id: tournamentId },
    select: { id: true },
  });
  if (!tournament) return;

  const fixtures = await fetchIplFixtures();

  const run = (includeDisplayMeta: boolean) =>
    Promise.all(
      fixtures.map((fx) => prisma.match.upsert(upsertArgs(tournament.id, fx, includeDisplayMeta)))
    );

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
      return;
    }
    throw e;
  }

  // NOTE:
  // Some schedule providers temporarily return only future days (e.g. starting tomorrow).
  // Keep sync non-destructive so existing same-day fixtures are not accidentally removed.
}
