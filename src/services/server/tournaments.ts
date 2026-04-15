import { cache } from "react";
import { prisma } from "@/lib/prisma";
import { DatabaseUnavailableError, isPrismaDbUnavailableError } from "@/lib/prisma-errors";
import { upsertIplFixturesForTournament } from "@/services/server/api/sync";
import { isUserFixtureSyncFresh } from "@/services/server/fixture-sync";

async function listUserTournamentsImpl(
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
      type: true,
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

/** Dedupes list queries when several server components request the same user's tournaments in one RSC tree. */
export const listUserTournaments = cache(listUserTournamentsImpl);

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

function tournamentWithMatchesSelect(userId: string) {
  return {
    id: true,
    name: true,
    season: true,
    ownerId: true,
    matches: {
      orderBy: { matchDate: "asc" as const },
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
  } as const;
}

export async function getTournamentWithMatchesForUser(
  tournamentId: string,
  userId: string
) {
  try {
    const accessWhere = {
      id: tournamentId,
      OR: [{ ownerId: userId }, { members: { some: { userId } } }],
    };

    let tournament = await prisma.tournament.findFirst({
      where: accessWhere,
      select: tournamentWithMatchesSelect(userId),
    });
    if (!tournament) return null;

    if (!(await isUserFixtureSyncFresh(userId))) {
      await upsertIplFixturesForTournament(tournament.id);
      await prisma.user.update({
        where: { id: userId },
        data: { lastFixtureSyncAt: new Date() },
      });
      tournament = await prisma.tournament.findFirst({
        where: accessWhere,
        select: tournamentWithMatchesSelect(userId),
      });
    }

    return tournament;
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
  const row = await prisma.tournament.findFirst({
    where: {
      id: tournamentId,
      OR: [{ ownerId: userId }, { members: { some: { userId } } }],
    },
    select: {
      id: true,
      name: true,
      members: {
        orderBy: [{ score: "desc" }, { createdAt: "asc" }],
        select: {
          userId: true,
          score: true,
          user: { select: { name: true, email: true, avatarUrl: true } },
        },
      },
    },
  });
  if (!row) return null;

  const tournament = { id: row.id, name: row.name };
  const leaderboard = row.members;

  return { tournament, leaderboard };
}
