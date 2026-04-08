import { NextResponse } from "next/server";
import { createVoteForCurrentUser, toErrorResponse } from "@/services/server/api";

export async function POST(request: Request) {
  try {
    const body = await request.json().catch(() => ({}));
    const data = await createVoteForCurrentUser({
      matchId: body?.matchId as string | undefined,
      teamVoted: body?.teamVoted as string | undefined,
    });
    return NextResponse.json(data, { status: 201 });
  } catch (error: unknown) {
    return toErrorResponse(error);
  }
}

