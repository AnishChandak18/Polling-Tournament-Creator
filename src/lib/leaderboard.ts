import { prisma } from "@/lib/prisma";

export async function recalculateTournamentScores(tournamentId: string) {
  const completedMatches = await prisma.match.findMany({
    where: { tournamentId, status: "COMPLETED", winnerTeam: { not: null } },
    select: { id: true, winnerTeam: true },
  });

  const winnerByMatchId = new Map(
    completedMatches.map((m) => [m.id, m.winnerTeam as string])
  );

  const votes = await prisma.vote.findMany({
    where: { matchId: { in: completedMatches.map((m) => m.id) } },
    select: { userId: true, matchId: true, teamVoted: true },
  });

  const scoreByUserId = new Map<string, number>();
  for (const v of votes) {
    const winner = winnerByMatchId.get(v.matchId);
    if (!winner) continue;
    if (v.teamVoted === winner) {
      scoreByUserId.set(v.userId, (scoreByUserId.get(v.userId) ?? 0) + 1);
    }
  }

  const members = await prisma.tournamentMember.findMany({
    where: { tournamentId },
    select: { id: true, userId: true },
  });

  await prisma.$transaction(
    members.map((m) =>
      prisma.tournamentMember.update({
        where: { id: m.id },
        data: { score: scoreByUserId.get(m.userId) ?? 0 },
      })
    )
  );
}

