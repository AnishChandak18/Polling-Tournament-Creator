import { randomBytes } from "crypto";
import { prisma } from "@/lib/prisma";
import { HttpError } from "@/services/server/api/errors";
import { getRequestOrigin } from "@/lib/request-origin";

const CODE_ALPHABET = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";

function randomJoinCode(length = 8) {
  let out = "";
  const bytes = randomBytes(length);
  for (let i = 0; i < length; i += 1) {
    out += CODE_ALPHABET[bytes[i] % CODE_ALPHABET.length];
  }
  return out;
}

export async function generateUniqueJoinCode(): Promise<string> {
  for (let i = 0; i < 8; i += 1) {
    const code = randomJoinCode(8);
    const existing = await prisma.tournament.findUnique({
      where: { joinCode: code },
      select: { id: true },
    });
    if (!existing) return code;
  }
  throw new HttpError("Failed to generate join code", 500);
}

export function buildInviteUrlForRequest(request: Request, token: string) {
  const envBase = process.env.NEXT_PUBLIC_APP_URL?.replace(/\/$/, "");
  const origin = envBase ?? getRequestOrigin(request);
  return `${origin}/join?t=${encodeURIComponent(token)}`;
}

export async function getInviteLinkForOwner(
  tournamentId: string,
  ownerUserId: string,
  request: Request
): Promise<{ inviteUrl: string | null; joinCode: string }> {
  const row = await prisma.tournament.findFirst({
    where: { id: tournamentId },
    select: { ownerId: true, inviteToken: true, joinCode: true },
  });
  if (!row) throw new HttpError("Not found", 404);
  if (row.ownerId !== ownerUserId) throw new HttpError("Forbidden", 403);
  if (!row.inviteToken) return { inviteUrl: null, joinCode: row.joinCode };
  return { inviteUrl: buildInviteUrlForRequest(request, row.inviteToken), joinCode: row.joinCode };
}

/** Create or rotate invite token. Returns full invite URL. */
export async function rotateInviteTokenForOwner(
  tournamentId: string,
  ownerUserId: string,
  request: Request
): Promise<{ inviteUrl: string; joinCode: string }> {
  const row = await prisma.tournament.findFirst({
    where: { id: tournamentId },
    select: { id: true, ownerId: true, joinCode: true },
  });
  if (!row) throw new HttpError("Not found", 404);
  if (row.ownerId !== ownerUserId) throw new HttpError("Forbidden", 403);

  const token = randomBytes(24).toString("hex");
  await prisma.tournament.update({
    where: { id: tournamentId },
    data: {
      inviteToken: token,
      inviteTokenCreatedAt: new Date(),
    },
  });

  return { inviteUrl: buildInviteUrlForRequest(request, token), joinCode: row.joinCode };
}

export async function joinTournamentWithToken(
  userId: string,
  token: string
): Promise<{ tournamentId: string; alreadyMember: boolean }> {
  const trimmed = token.trim();
  if (!trimmed) throw new HttpError("Invite token is required", 400);

  const tournament = await prisma.tournament.findFirst({
    where: { inviteToken: trimmed },
    select: { id: true, ownerId: true },
  });
  if (!tournament) throw new HttpError("Invalid or expired invite", 404);

  if (tournament.ownerId === userId) {
    return { tournamentId: tournament.id, alreadyMember: true };
  }

  const existing = await prisma.tournamentMember.findUnique({
    where: {
      tournamentId_userId: { tournamentId: tournament.id, userId },
    },
    select: { id: true },
  });
  if (existing) {
    return { tournamentId: tournament.id, alreadyMember: true };
  }

  await prisma.tournamentMember.create({
    data: { tournamentId: tournament.id, userId },
  });

  return { tournamentId: tournament.id, alreadyMember: false };
}

export async function joinTournamentWithCode(
  userId: string,
  code: string
): Promise<{ tournamentId: string; alreadyMember: boolean }> {
  const normalized = code.trim().toUpperCase().replace(/\s+/g, "");
  if (!normalized) throw new HttpError("Circle code is required", 400);

  const tournament = await prisma.tournament.findUnique({
    where: { joinCode: normalized },
    select: { id: true, ownerId: true },
  });
  if (!tournament) throw new HttpError("Invalid circle code", 404);

  if (tournament.ownerId === userId) {
    return { tournamentId: tournament.id, alreadyMember: true };
  }

  const existing = await prisma.tournamentMember.findUnique({
    where: {
      tournamentId_userId: { tournamentId: tournament.id, userId },
    },
    select: { id: true },
  });
  if (existing) {
    return { tournamentId: tournament.id, alreadyMember: true };
  }

  await prisma.tournamentMember.create({
    data: { tournamentId: tournament.id, userId },
  });

  return { tournamentId: tournament.id, alreadyMember: false };
}
