import { NextResponse } from "next/server";
import { patchProfileForCurrentUser, toErrorResponse } from "@/services/server/api";

export async function PATCH(request: Request) {
  try {
    const body = await request.json().catch(() => ({}));
    await patchProfileForCurrentUser({
      username: body?.username as string | null | undefined,
      name: body?.name as string | null | undefined,
      markOnboardingComplete: Boolean(body?.onboardingComplete),
    });
    return NextResponse.json({ ok: true });
  } catch (error: unknown) {
    return toErrorResponse(error);
  }
}
