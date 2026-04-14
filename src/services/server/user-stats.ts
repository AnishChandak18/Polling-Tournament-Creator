import { prisma } from "@/lib/prisma";
import { withDbFallback } from "@/lib/prisma-errors";

/** Sum of scores across all circles (shown in PointsChip). */
export async function getUserPointsChipTotal(userId: string): Promise<number> {
  return withDbFallback(async () => {
    const agg = await prisma.tournamentMember.aggregate({
      where: { userId },
      _sum: { score: true },
    });
    return agg._sum.score ?? 0;
  }, 0);
}

/** Best finishing position among circles (1 = top of some circle). */
export async function getUserBestRankInCircles(userId: string): Promise<number | null> {
  return withDbFallback(async () => {
    const memberships = await prisma.tournamentMember.findMany({
      where: { userId },
      select: { tournamentId: true, score: true, createdAt: true },
    });
    if (memberships.length === 0) return null;

    let best: number | null = null;
    for (const m of memberships) {
      const ahead = await prisma.tournamentMember.count({
        where: {
          tournamentId: m.tournamentId,
          OR: [
            { score: { gt: m.score } },
            { AND: [{ score: m.score }, { createdAt: { lt: m.createdAt } }] },
          ],
        },
      });
      const rank = ahead + 1;
      if (best === null || rank < best) best = rank;
    }
    return best;
  }, null);
}

export async function getUserPredictionCount(userId: string): Promise<number> {
  return withDbFallback(() => prisma.vote.count({ where: { userId } }), 0);
}

/** Number of circles the user belongs to (including circles they own). */
export async function getUserCircleCount(userId: string): Promise<number> {
  return withDbFallback(() => prisma.tournamentMember.count({ where: { userId } }), 0);
}

/** Win rate on completed matches with a recorded winner. */
export async function getUserWinRateStats(userId: string): Promise<{
  winRate: number | null;
  resolved: number;
  wins: number;
}> {
  return withDbFallback(async () => {
    const rows = await prisma.vote.findMany({
      where: {
        userId,
        match: { status: "COMPLETED", winnerTeam: { not: null } },
      },
      select: {
        teamVoted: true,
        match: { select: { winnerTeam: true } },
      },
    });
    if (rows.length === 0) return { winRate: null, resolved: 0, wins: 0 };
    const wins = rows.filter((r) => r.match.winnerTeam === r.teamVoted).length;
    return { winRate: (wins / rows.length) * 100, resolved: rows.length, wins };
  }, { winRate: null, resolved: 0, wins: 0 });
}

export async function getUserRankInTournament(
  userId: string,
  tournamentId: string
): Promise<number | null> {
  return withDbFallback(async () => {
    const m = await prisma.tournamentMember.findUnique({
      where: {
        tournamentId_userId: { tournamentId, userId },
      },
      select: { score: true, createdAt: true },
    });
    if (!m) return null;
    const ahead = await prisma.tournamentMember.count({
      where: {
        tournamentId,
        OR: [
          { score: { gt: m.score } },
          { AND: [{ score: m.score }, { createdAt: { lt: m.createdAt } }] },
        ],
      },
    });
    return ahead + 1;
  }, null);
}
