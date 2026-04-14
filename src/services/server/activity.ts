import { prisma } from "@/lib/prisma";

export type CircleActivityRow = {
  id: string;
  actorLabel: string;
  pickTeam: string;
  circleName: string;
  ago: string;
  iconLetter: string;
};

export type UserVoteHistoryRow = {
  id: string;
  teamVoted: string;
  createdAt: Date;
  matchId: string;
  team1: string;
  team2: string;
  matchDate: Date;
  tournamentId: string;
  tournamentName: string;
  matchStatus: string;
  winnerTeam: string | null;
};

function formatRelativeAgo(d: Date): string {
  const sec = Math.max(0, Math.floor((Date.now() - d.getTime()) / 1000));
  if (sec < 60) return "just now";
  if (sec < 3600) return `${Math.floor(sec / 60)}m ago`;
  if (sec < 86400) return `${Math.floor(sec / 3600)}h ago`;
  return `${Math.floor(sec / 86400)}d ago`;
}

function actorInitial(name: string | null, email: string) {
  const s = (name || email || "?").trim();
  return s.slice(0, 1).toUpperCase();
}

/** Recent votes in circles the user belongs to (or owns). */
export async function getRecentCircleActivity(
  userId: string,
  take = 6
): Promise<CircleActivityRow[]> {
  const votes = await prisma.vote.findMany({
    where: {
      match: {
        tournament: {
          OR: [{ ownerId: userId }, { members: { some: { userId } } }],
        },
      },
    },
    orderBy: { createdAt: "desc" },
    take,
    select: {
      id: true,
      teamVoted: true,
      createdAt: true,
      user: { select: { name: true, email: true } },
      match: {
        select: {
          tournament: { select: { name: true } },
        },
      },
    },
  });

  return votes.map((v) => {
    const actorLabel = v.user.name?.trim() || v.user.email.split("@")[0] || "Someone";
    return {
      id: v.id,
      actorLabel,
      pickTeam: v.teamVoted,
      circleName: v.match.tournament.name,
      ago: formatRelativeAgo(v.createdAt),
      iconLetter: actorInitial(v.user.name, v.user.email),
    };
  });
}

/** Recent votes made by the current user across circles. */
export async function getRecentVotesForUser(
  userId: string,
  take = 12
): Promise<UserVoteHistoryRow[]> {
  const votes = await prisma.vote.findMany({
    where: { userId },
    orderBy: { createdAt: "desc" },
    take,
    select: {
      id: true,
      teamVoted: true,
      createdAt: true,
      match: {
        select: {
          id: true,
          team1: true,
          team2: true,
          matchDate: true,
          status: true,
          winnerTeam: true,
          tournament: {
            select: {
              id: true,
              name: true,
            },
          },
        },
      },
    },
  });

  return votes.map((v) => ({
    id: v.id,
    teamVoted: v.teamVoted,
    createdAt: v.createdAt,
    matchId: v.match.id,
    team1: v.match.team1,
    team2: v.match.team2,
    matchDate: v.match.matchDate,
    tournamentId: v.match.tournament.id,
    tournamentName: v.match.tournament.name,
    matchStatus: v.match.status,
    winnerTeam: v.match.winnerTeam,
  }));
}
