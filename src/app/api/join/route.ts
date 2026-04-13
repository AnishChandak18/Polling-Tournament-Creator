import { NextResponse } from "next/server";
import { joinTournamentForCurrentUser, toErrorResponse } from "@/services/server/api";

export async function POST(request: Request) {
  try {
    const body = await request.json().catch(() => ({}));
    const token = typeof body?.token === "string" ? body.token : undefined;
    const code = typeof body?.code === "string" ? body.code : undefined;
    const data = await joinTournamentForCurrentUser({ token, code });
    return NextResponse.json(data);
  } catch (error: unknown) {
    return toErrorResponse(error);
  }
}
