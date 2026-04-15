import { prisma } from "@/lib/prisma";
import { getCurrentUserOrThrow } from "@/lib/currentUser";
import { HttpError } from "@/services/server/api/errors";

export async function getLeaderboardForCurrentUser(tournamentId: string) {
  const user = await getCurrentUserOrThrow();

  const tournament = await prisma.tournament.findFirst({
    where: {
      id: tournamentId,
      OR: [{ ownerId: user.id }, { members: { some: { userId: user.id } } }],
    },
    select: {
      id: true,
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
  if (!tournament) {
    throw new HttpError("Not found", 404);
  }

  return { leaderboard: tournament.members };
}
