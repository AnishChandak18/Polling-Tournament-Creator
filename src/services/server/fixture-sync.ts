import { after } from "next/server";
import { prisma } from "@/lib/prisma";
import {
  MATCH_ASSUMED_DURATION_MS,
  syncIplFixturesForTournamentIds,
} from "@/services/server/api/sync";

/** Skip expensive “needs sync?” scans right after a successful sync (burst navigations). */
const FIXTURE_SYNC_DEBOUNCE_MS = 90_000;

/** Refresh IPL fixtures + match statuses for every circle the user can access (one schedule fetch). */
export async function syncFixturesForUserTournaments(userId: string): Promise<void> {
  const rows = await prisma.tournament.findMany({
    where: {
      OR: [{ ownerId: userId }, { members: { some: { userId } } }],
    },
    select: { id: true },
  });
  await syncIplFixturesForTournamentIds(rows.map((r) => r.id));
}

async function getUserTournamentIds(userId: string): Promise<string[]> {
  const rows = await prisma.tournament.findMany({
    where: {
      OR: [{ ownerId: userId }, { members: { some: { userId } } }],
    },
    select: { id: true },
  });
  return rows.map((r) => r.id);
}

/**
 * True when a new IPL sync is needed: never synced, or at least one match has
 * finished (kickoff + {@link MATCH_ASSUMED_DURATION_MS}) since `lastFixtureSyncAt`.
 * Uses stored `matchDate` (same end-time rule as match status in `api/sync.ts`).
 */
async function computeUserNeedsFixtureSync(
  lastFixtureSyncAt: Date | null,
  userId: string
): Promise<boolean> {
  if (!lastFixtureSyncAt) return true;

  const sinceSyncMs = Date.now() - lastFixtureSyncAt.getTime();
  if (sinceSyncMs >= 0 && sinceSyncMs < FIXTURE_SYNC_DEBOUNCE_MS) {
    return false;
  }

  const tournamentIds = await getUserTournamentIds(userId);
  if (tournamentIds.length === 0) return false;

  const now = Date.now();
  const lastSyncMs = lastFixtureSyncAt.getTime();
  const cutoff = new Date(now - MATCH_ASSUMED_DURATION_MS);

  const candidates = await prisma.match.findMany({
    where: {
      tournamentId: { in: tournamentIds },
      matchDate: { lte: cutoff },
    },
    select: { matchDate: true },
  });

  return candidates.some((m) => {
    const playedOutEndMs = m.matchDate.getTime() + MATCH_ASSUMED_DURATION_MS;
    return playedOutEndMs <= now && lastSyncMs < playedOutEndMs;
  });
}

export async function userNeedsFixtureSync(userId: string): Promise<boolean> {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { lastFixtureSyncAt: true },
  });
  return computeUserNeedsFixtureSync(user?.lastFixtureSyncAt ?? null, userId);
}

export async function isUserFixtureSyncFresh(userId: string): Promise<boolean> {
  return !(await userNeedsFixtureSync(userId));
}

/**
 * Enqueues a full IPL sync for all of this user’s circles **after the HTTP response is sent**.
 * Never blocks page render. List/hub pages do not call this; opening a circle still loads fixtures
 * via {@link getTournamentWithMatchesForUser} when needed. Use from APIs/cron if you want background refresh.
 */
export function scheduleFixtureSyncForUser(userId: string): void {
  after(async () => {
    try {
      const user = await prisma.user.findUnique({
        where: { id: userId },
        select: { lastFixtureSyncAt: true },
      });
      if (!user) return;

      if (!(await computeUserNeedsFixtureSync(user.lastFixtureSyncAt, userId))) {
        return;
      }

      await syncFixturesForUserTournaments(userId);
      await prisma.user.update({
        where: { id: userId },
        data: { lastFixtureSyncAt: new Date() },
      });
    } catch (e) {
      console.error("[scheduleFixtureSyncForUser]", e);
    }
  });
}
