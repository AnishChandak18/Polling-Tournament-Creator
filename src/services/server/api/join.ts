import { getCurrentUserOrThrow } from "@/lib/currentUser";
import { joinTournamentWithToken } from "@/services/server/circle-invite";

export async function joinTournamentForCurrentUser(token: string) {
  const user = await getCurrentUserOrThrow();
  return joinTournamentWithToken(user.id, token);
}
