import { apiRequest } from "@/services/api/client";

export type TournamentSummary = {
  id: string;
  name: string;
  season: string;
  type: string;
  status: string;
  ownerId: string;
  createdAt: string;
};

export type TournamentMatch = {
  id: string;
  iplMatchId: string;
  matchDate: string;
  venue: string | null;
  team1: string;
  team2: string;
  status: string;
  winnerTeam: string | null;
  displayMeta?: unknown;
};

export type TournamentDetail = {
  id: string;
  name: string;
  season: string;
  type: string;
  status: string;
  ownerId: string;
  matches: TournamentMatch[];
};

export async function listTournaments() {
  return apiRequest<{ tournaments: TournamentSummary[] }>("/api/tournaments");
}

export async function createTournament(payload: { name: string; season?: string }) {
  return apiRequest<{ tournamentId: string }>("/api/tournaments", {
    method: "POST",
    body: payload,
  });
}

export async function getTournament(tournamentId: string) {
  return apiRequest<{ tournament: TournamentDetail }>(`/api/tournaments/${tournamentId}`);
}

export async function getTournamentInvite(tournamentId: string) {
  return apiRequest<{ inviteUrl: string | null; joinCode: string }>(
    `/api/tournaments/${tournamentId}/invite`
  );
}

export async function rotateTournamentInvite(tournamentId: string) {
  return apiRequest<{ inviteUrl: string; joinCode: string }>(`/api/tournaments/${tournamentId}/invite`, {
    method: "POST",
  });
}

export async function setMatchWinner(payload: {
  tournamentId: string;
  matchId: string;
  winnerTeam: string;
}) {
  const { tournamentId, matchId, winnerTeam } = payload;
  return apiRequest<{ ok: boolean }>(
    `/api/tournaments/${tournamentId}/matches/${matchId}`,
    {
      method: "PATCH",
      body: { winnerTeam },
    }
  );
}
