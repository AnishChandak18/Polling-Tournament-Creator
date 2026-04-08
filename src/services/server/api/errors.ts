import { NextResponse } from "next/server";

export class HttpError extends Error {
  status: number;

  constructor(message: string, status: number) {
    super(message);
    this.name = "HttpError";
    this.status = status;
  }
}

export function toErrorResponse(error: unknown) {
  if (error instanceof HttpError) {
    return NextResponse.json({ error: error.message }, { status: error.status });
  }

  const msg = error instanceof Error ? error.message : "Error";

  // Keep backward compatibility with existing auth error mapping.
  const status =
    msg === "Unauthorized" ? 401 : msg === "User not found" ? 404 : 500;

  // Preserve existing unique-vote handling.
  if (typeof msg === "string" && msg.toLowerCase().includes("unique")) {
    return NextResponse.json(
      { error: "You already voted for this match" },
      { status: 400 }
    );
  }

  return NextResponse.json({ error: msg }, { status });
}
