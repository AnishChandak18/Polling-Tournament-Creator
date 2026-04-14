import { prisma } from "@/lib/prisma";
import { DatabaseUnavailableError, isPrismaDbUnavailableError } from "@/lib/prisma-errors";
import { upsertIplFixturesForTournament } from "@/services/server/api/sync";
import { isUserFixtureSyncFresh } from "@/services/server/fixture-sync";

export async function listUserTournaments(
  userId: string,
  options?: { take?: number; includeUpcomingMatch?: boolean }
) {
  return prisma.tournament.findMany({
    where: {
      OR: [{ ownerId: userId }, { members: { some: { userId } } }],
    },
    orderBy: { createdAt: "desc" },
    take: options?.take,
    select: {
      id: true,
      name: true,
      season: true,
      status: true,
      ownerId: true,
      createdAt: true,
      ...(options?.includeUpcomingMatch
        ? {
            matches: {
              where: { status: { in: ["UPCOMING", "LIVE"] } },
              orderBy: { matchDate: "asc" },
              take: 1,
              select: { id: true, team1: true, team2: true, matchDate: true, status: true },
            },
          }
        : {}),
    },
  });
}

export async function getTournamentForUser(
  tournamentId: string,
  userId: string
) {
  return prisma.tournament.findFirst({
    where: {
      id: tournamentId,
      OR: [{ ownerId: userId }, { members: { some: { userId } } }],
    },
    select: { id: true, name: true },
  });
}

export async function getTournamentWithMatchesForUser(
  tournamentId: string,
  userId: string
) {
  try {
    const allowed = await prisma.tournament.findFirst({
      where: {
        id: tournamentId,
        OR: [{ ownerId: userId }, { members: { some: { userId } } }],
      },
      select: { id: true },
    });
    if (!allowed) return null;

    if (!(await isUserFixtureSyncFresh(userId))) {
      await upsertIplFixturesForTournament(allowed.id);
      await prisma.user.update({
        where: { id: userId },
        data: { lastFixtureSyncAt: new Date() },
      });
    }

    return await prisma.tournament.findFirst({
      where: {
        id: tournamentId,
        OR: [{ ownerId: userId }, { members: { some: { userId } } }],
      },
      select: {
        id: true,
        name: true,
        season: true,
        ownerId: true,
        matches: {
          orderBy: { matchDate: "asc" },
          select: {
            id: true,
            matchDate: true,
            venue: true,
            team1: true,
            team2: true,
            displayMeta: true,
            status: true,
            winnerTeam: true,
            votes: {
              where: { userId },
              select: { teamVoted: true },
            },
          },
        },
      },
    });
  } catch (e) {
    if (isPrismaDbUnavailableError(e)) {
      throw new DatabaseUnavailableError();
    }
    throw e;
  }
}

/** First LIVE match in any of the user's circles (for global "live arena" links). */
export async function getLiveArenaTargetForUser(userId: string) {
  const row = await prisma.match.findFirst({
    where: {
      status: "LIVE",
      tournament: {
        OR: [{ ownerId: userId }, { members: { some: { userId } } }],
      },
    },
    select: { tournamentId: true },
    orderBy: { matchDate: "asc" },
  });
  return row ? { tournamentId: row.tournamentId } : null;
}

export async function getTournamentMemberCount(tournamentId: string) {
  return prisma.tournamentMember.count({ where: { tournamentId } });
}

export async function getTournamentLeaderboardForUser(
  tournamentId: string,
  userId: string
) {
  const tournament = await getTournamentForUser(tournamentId, userId);
  if (!tournament) return null;

  const leaderboard = await prisma.tournamentMember.findMany({
    where: { tournamentId: tournament.id },
    orderBy: [{ score: "desc" }, { createdAt: "asc" }],
    select: {
      userId: true,
      score: true,
      user: { select: { name: true, email: true, avatarUrl: true } },
    },
  });

  return { tournament, leaderboard };
}
