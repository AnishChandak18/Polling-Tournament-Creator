import { NextResponse, type NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCurrentUserOrThrow } from "@/lib/currentUser";
import { HttpError, toErrorResponse } from "@/services/server/api/errors";
import { upsertIplFixturesForTournament } from "@/services/server/api/sync";
import { getTournamentWithMatchesForUser } from "@/services/server/tournaments";
import { getUserPointsChipTotal } from "@/services/server/user-stats";

function isKickoffPast(matchDate: Date) {
  return matchDate.getTime() < Date.now();
}

/**
 * Syncs fixtures + winner resolution from RapidAPI, then returns completed / past matches for history UI.
 */
export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await getCurrentUserOrThrow();
    const { id: tournamentId } = await params;

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

    await upsertIplFixturesForTournament(tournamentId);
    await prisma.user.update({
      where: { id: user.id },
      data: { lastFixtureSyncAt: new Date() },
    });

    const [tournament, totalPoints] = await Promise.all([
      getTournamentWithMatchesForUser(tournamentId, user.id),
      getUserPointsChipTotal(user.id),
    ]);
    if (!tournament) {
      throw new HttpError("Not found", 404);
    }

    const historyMatches = tournament.matches.filter(
      (m) => m.status === "COMPLETED" || (m.status === "UPCOMING" && isKickoffPast(m.matchDate))
    );
    const hasLive = tournament.matches.some((m) => m.status === "LIVE");

    return NextResponse.json({
      tournament: {
        id: tournament.id,
        name: tournament.name,
        season: tournament.season,
      },
      points: totalPoints,
      hasLive,
      matches: historyMatches.map((m) => ({
        id: m.id,
        team1: m.team1,
        team2: m.team2,
        matchDate: m.matchDate.toISOString(),
        venue: m.venue,
        status: m.status,
        winnerTeam: m.winnerTeam,
        displayMeta: m.displayMeta,
        userVote: m.votes?.[0]?.teamVoted ?? null,
      })),
    });
  } catch (error: unknown) {
    return toErrorResponse(error);
  }
}
