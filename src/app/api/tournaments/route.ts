import { NextResponse } from "next/server";
import {
  listTournamentsForCurrentUser,
  createTournamentForCurrentUser,
  toErrorResponse,
} from "@/services/server/api";

export async function GET() {
  try {
    const data = await listTournamentsForCurrentUser();
    return NextResponse.json(data);
  } catch (error: unknown) {
    return toErrorResponse(error);
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json().catch(() => ({}));
    const data = await createTournamentForCurrentUser(body);
    return NextResponse.json(data, { status: 201 });
  } catch (error: unknown) {
    return toErrorResponse(error);
  }
}

