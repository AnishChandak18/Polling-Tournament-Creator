import { NextResponse } from "next/server";
import { joinTournamentForCurrentUser, toErrorResponse } from "@/services/server/api";

export async function POST(request: Request) {
  try {
    const body = await request.json().catch(() => ({}));
    const token = typeof body?.token === "string" ? body.token : "";
    const data = await joinTournamentForCurrentUser(token);
    return NextResponse.json(data);
  } catch (error: unknown) {
    return toErrorResponse(error);
  }
}
