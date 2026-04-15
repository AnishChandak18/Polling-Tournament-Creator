import { prisma } from "@/lib/prisma";
import { getCurrentUserOrThrow } from "@/lib/currentUser";
import { recalculateTournamentScores } from "@/lib/leaderboard";
import { HttpError } from "@/services/server/api/errors";
import { upsertIplFixturesForTournament } from "@/services/server/api/sync";
import { isUserFixtureSyncFresh } from "@/services/server/fixture-sync";
import { generateUniqueJoinCode } from "@/services/server/circle-invite";
import { listUserTournaments } from "@/services/server/tournaments";

export async function listTournamentsForCurrentUser() {
  const user = await getCurrentUserOrThrow();
  const tournaments = await listUserTournaments(user.id);
  return { tournaments };
}

export async function createTournamentForCurrentUser(input: {
  name?: string;
  season?: string;
}) {
  const user = await getCurrentUserOrThrow();
  const name = input?.name;
  const season = input?.season ?? "2026";

  if (!name) {
    throw new HttpError("name is required", 400);
  }

  const joinCode = await generateUniqueJoinCode();
  const tournament = await prisma.tournament.create({
    data: {
      name,
      season,
      ownerId: user.id,
      joinCode,
      members: {
        create: { userId: user.id },
      },
    },
    select: { id: true },
  });

  return { tournamentId: tournament.id };
}

const tournamentDetailSelect = {
  id: true,
  name: true,
  season: true,
  type: true,
  status: true,
  ownerId: true,
  matches: {
    orderBy: { matchDate: "asc" as const },
    select: {
      id: true,
      iplMatchId: true,
      matchDate: true,
      venue: true,
      team1: true,
      team2: true,
      displayMeta: true,
      status: true,
      winnerTeam: true,
    },
  },
} as const;

export async function getTournamentForCurrentUserById(tournamentId: string) {
  const user = await getCurrentUserOrThrow();

  const accessWhere = {
    id: tournamentId,
    OR: [{ ownerId: user.id }, { members: { some: { userId: user.id } } }],
  };

  let tournament = await prisma.tournament.findFirst({
    where: accessWhere,
    select: tournamentDetailSelect,
  });

  if (!tournament) {
    throw new HttpError("Not found", 404);
  }

  if (!(await isUserFixtureSyncFresh(user.id))) {
    await upsertIplFixturesForTournament(tournament.id);
    await prisma.user.update({
      where: { id: user.id },
      data: { lastFixtureSyncAt: new Date() },
    });
    tournament = await prisma.tournament.findFirst({
      where: accessWhere,
      select: tournamentDetailSelect,
    });
    if (!tournament) {
      throw new HttpError("Not found", 404);
    }
  }

  return { tournament };
}

export async function setMatchWinnerForOwner(input: {
  tournamentId: string;
  matchId: string;
  winnerTeam?: string;
}) {
  const user = await getCurrentUserOrThrow();
  const { tournamentId, matchId, winnerTeam } = input;

  const tournament = await prisma.tournament.findFirst({
    where: { id: tournamentId, ownerId: user.id },
    select: { id: true },
  });
  if (!tournament) {
    throw new HttpError("Not found", 404);
  }

  if (!winnerTeam) {
    throw new HttpError("winnerTeam is required", 400);
  }

  const match = await prisma.match.findFirst({
    where: { id: matchId, tournamentId },
    select: { id: true, team1: true, team2: true },
  });
  if (!match) {
    throw new HttpError("Match not found", 404);
  }

  if (![match.team1, match.team2].includes(winnerTeam)) {
    throw new HttpError("Invalid winnerTeam", 400);
  }

  await prisma.match.update({
    where: { id: match.id },
    data: { status: "COMPLETED", winnerTeam },
  });

  await recalculateTournamentScores(tournamentId);

  return { ok: true };
}
