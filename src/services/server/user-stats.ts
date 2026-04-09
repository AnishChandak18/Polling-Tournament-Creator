import { prisma } from "@/lib/prisma";

/** Sum of scores across all circles (shown in PointsChip). */
export async function getUserPointsChipTotal(userId: string): Promise<number> {
  const agg = await prisma.tournamentMember.aggregate({
    where: { userId },
    _sum: { score: true },
  });
  return agg._sum.score ?? 0;
}

/** Best finishing position among circles (1 = top of some circle). */
export async function getUserBestRankInCircles(userId: string): Promise<number | null> {
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
}

export async function getUserPredictionCount(userId: string): Promise<number> {
  return prisma.vote.count({ where: { userId } });
}

export async function getUserRankInTournament(
  userId: string,
  tournamentId: string
): Promise<number | null> {
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
}
