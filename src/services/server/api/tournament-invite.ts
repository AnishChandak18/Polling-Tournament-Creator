import { getCurrentUserOrThrow } from "@/lib/currentUser";
import {
  getInviteLinkForOwner,
  rotateInviteTokenForOwner,
} from "@/services/server/circle-invite";

export async function getInviteLinkForCurrentUser(
  tournamentId: string,
  request: Request
) {
  const user = await getCurrentUserOrThrow();
  return getInviteLinkForOwner(tournamentId, user.id, request);
}

export async function rotateInviteForCurrentUser(
  tournamentId: string,
  request: Request
) {
  const user = await getCurrentUserOrThrow();
  return rotateInviteTokenForOwner(tournamentId, user.id, request);
}
