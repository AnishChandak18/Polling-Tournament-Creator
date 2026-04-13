import { NextResponse, type NextRequest } from "next/server";
import { getLiveMatchForCurrentUser, toErrorResponse } from "@/services/server/api";

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: matchId } = await params;
    const data = await getLiveMatchForCurrentUser(matchId);
    return NextResponse.json(data);
  } catch (error: unknown) {
    return toErrorResponse(error);
  }
}

