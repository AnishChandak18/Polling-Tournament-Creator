import { NextResponse, type NextRequest } from "next/server";
import {
  getLeaderboardForCurrentUser,
  toErrorResponse,
} from "@/services/server/api";

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: tournamentId } = await params;
    const data = await getLeaderboardForCurrentUser(tournamentId);
    return NextResponse.json(data);
  } catch (error: unknown) {
    return toErrorResponse(error);
  }
}

