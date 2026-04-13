import { prisma } from "@/lib/prisma";
import { getCurrentUserOrThrow } from "@/lib/currentUser";
import { HttpError } from "@/services/server/api/errors";
import { fetchRapidApiMatchLive } from "@/lib/ipl-rapidapi";

export async function getLiveMatchForCurrentUser(matchId: string) {
  const user = await getCurrentUserOrThrow();

  const match = await prisma.match.findFirst({
    where: {
      id: matchId,
      tournament: {
        OR: [{ ownerId: user.id }, { members: { some: { userId: user.id } } }],
      },
    },
    select: {
      id: true,
      iplMatchId: true,
      team1: true,
      team2: true,
      status: true,
      matchDate: true,
      venue: true,
    },
  });

  if (!match) throw new HttpError("Match not found", 404);

  if (!match.iplMatchId) {
    return {
      match,
      live: {
        scoreboard: null,
        commentary: null,
      },
    };
  }

  const live = await fetchRapidApiMatchLive(match.iplMatchId);
  return { match, live };
}

