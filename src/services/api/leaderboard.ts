import { apiRequest } from "@/services/api/client";

export type LeaderboardRow = {
  score: number;
  user: {
    name: string | null;
    email: string;
    avatarUrl: string | null;
  };
};

export async function getLeaderboard(tournamentId: string) {
  return apiRequest<{ leaderboard: LeaderboardRow[] }>(`/api/leaderboard/${tournamentId}`);
}
