import { apiRequest } from "@/services/api/client";

export async function joinWithInviteToken(token: string) {
  return apiRequest<{ tournamentId: string; alreadyMember: boolean }>("/api/join", {
    method: "POST",
    body: { token },
  });
}
