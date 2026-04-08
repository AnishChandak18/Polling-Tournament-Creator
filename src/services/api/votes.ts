import { apiRequest } from "@/services/api/client";

export async function submitVote(payload: { matchId: string; teamVoted: string }) {
  return apiRequest<{ voteId: string }>("/api/votes", {
    method: "POST",
    body: payload,
  });
}
