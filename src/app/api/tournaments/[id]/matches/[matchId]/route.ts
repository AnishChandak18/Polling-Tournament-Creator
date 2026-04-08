import { NextResponse, type NextRequest } from "next/server";
import { setMatchWinnerForOwner, toErrorResponse } from "@/services/server/api";

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string; matchId: string }> }
) {
  try {
    const { id: tournamentId, matchId } = await params;
    const body = await request.json().catch(() => ({}));
    const data = await setMatchWinnerForOwner({
      tournamentId,
      matchId,
      winnerTeam: body?.winnerTeam as string | undefined,
    });
    return NextResponse.json(data);
  } catch (error: unknown) {
    return toErrorResponse(error);
  }
}

