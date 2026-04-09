import { NextResponse, type NextRequest } from "next/server";
import {
  getInviteLinkForCurrentUser,
  rotateInviteForCurrentUser,
  toErrorResponse,
} from "@/services/server/api";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: tournamentId } = await params;
    const data = await getInviteLinkForCurrentUser(tournamentId, request);
    return NextResponse.json(data);
  } catch (error: unknown) {
    return toErrorResponse(error);
  }
}

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: tournamentId } = await params;
    const data = await rotateInviteForCurrentUser(tournamentId, request);
    return NextResponse.json(data, { status: 201 });
  } catch (error: unknown) {
    return toErrorResponse(error);
  }
}
