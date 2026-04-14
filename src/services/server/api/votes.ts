import { prisma } from "@/lib/prisma";
import { canVoteOnMatch } from "@/lib/vote-window";
import { getCurrentUserOrThrow } from "@/lib/currentUser";
import { HttpError } from "@/services/server/api/errors";

export async function createVoteForCurrentUser(input: {
  matchId?: string;
  teamVoted?: string;
}) {
  const user = await getCurrentUserOrThrow();
  const { matchId, teamVoted } = input;

  if (!matchId || !teamVoted) {
    throw new HttpError("matchId and teamVoted are required", 400);
  }

  const match = await prisma.match.findUnique({
    where: { id: matchId },
    select: { id: true, status: true, matchDate: true, team1: true, team2: true },
  });
  if (!match) {
    throw new HttpError("Match not found", 404);
  }

  if (!canVoteOnMatch(match.matchDate, match.status)) {
    throw new HttpError("Voting closed — picks lock 30 minutes before scheduled kickoff", 400);
  }

  if (![match.team1, match.team2].includes(teamVoted)) {
    throw new HttpError("Invalid team selection", 400);
  }

  const vote = await prisma.vote.upsert({
    where: {
      matchId_userId: {
        matchId: match.id,
        userId: user.id,
      },
    },
    create: {
      matchId: match.id,
      userId: user.id,
      teamVoted,
    },
    update: {
      teamVoted,
    },
    select: { id: true },
  });

  return { voteId: vote.id };
}
