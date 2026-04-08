import { prisma } from "@/lib/prisma";
import { getCurrentUserOrThrow } from "@/lib/currentUser";
import { HttpError } from "@/services/server/api/errors";

export async function getLeaderboardForCurrentUser(tournamentId: string) {
  const user = await getCurrentUserOrThrow();

  const allowed = await prisma.tournament.findFirst({
    where: {
      id: tournamentId,
      OR: [{ ownerId: user.id }, { members: { some: { userId: user.id } } }],
    },
    select: { id: true },
  });
  if (!allowed) {
    throw new HttpError("Not found", 404);
  }

  const leaderboard = await prisma.tournamentMember.findMany({
    where: { tournamentId },
    orderBy: [{ score: "desc" }, { createdAt: "asc" }],
    select: {
      score: true,
      user: { select: { name: true, email: true, avatarUrl: true } },
    },
  });

  return { leaderboard };
}
