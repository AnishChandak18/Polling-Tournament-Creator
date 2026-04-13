import { getCurrentUserOrThrow } from "@/lib/currentUser";
import {
  joinTournamentWithCode,
  joinTournamentWithToken,
} from "@/services/server/circle-invite";
import { HttpError } from "@/services/server/api/errors";

export async function joinTournamentForCurrentUser(input: {
  token?: string;
  code?: string;
}) {
  const user = await getCurrentUserOrThrow();
  const token = input.token?.trim();
  if (token) return joinTournamentWithToken(user.id, token);

  const code = input.code?.trim();
  if (code) return joinTournamentWithCode(user.id, code);

  throw new HttpError("Invite token or circle code is required", 400);
}
