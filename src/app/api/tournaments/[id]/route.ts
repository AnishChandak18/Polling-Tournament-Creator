import { NextResponse, type NextRequest } from "next/server";
import {
  getTournamentForCurrentUserById,
  toErrorResponse,
} from "@/services/server/api";

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: tournamentId } = await params;
    const data = await getTournamentForCurrentUserById(tournamentId);
    return NextResponse.json(data);
  } catch (error: unknown) {
    return toErrorResponse(error);
  }
}

