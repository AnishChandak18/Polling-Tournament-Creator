import { prisma } from "@/lib/prisma";
import { syncIplFixturesForTournamentIds, upsertIplFixturesForTournament } from "@/services/server/api/sync";

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
  const allowed = await prisma.tournament.findFirst({
    where: {
      id: tournamentId,
      OR: [{ ownerId: userId }, { members: { some: { userId } } }],
    },
    select: { id: true },
  });
  if (!allowed) return null;

  await upsertIplFixturesForTournament(allowed.id);

  return prisma.tournament.findFirst({
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
