import { Prisma } from "@prisma/client";

const UNREACHABLE_CODES = new Set(["P1001", "P1002", "P1017"]);

/** True when Prisma cannot reach the database (Supabase paused, bad URL, network). */
export function isPrismaDbUnavailableError(error: unknown): boolean {
  if (error instanceof Prisma.PrismaClientKnownRequestError) {
    return UNREACHABLE_CODES.has(error.code);
  }
  if (error instanceof Prisma.PrismaClientInitializationError) {
    return true;
  }
  return false;
}

export const DATABASE_UNAVAILABLE_MESSAGE =
  "Could not connect to the database. If you use Supabase, resume the project or check DATABASE_URL.";

export class DatabaseUnavailableError extends Error {
  constructor() {
    super(DATABASE_UNAVAILABLE_MESSAGE);
    this.name = "DatabaseUnavailableError";
  }
}

export async function withDbFallback<T>(run: () => Promise<T>, fallback: T): Promise<T> {
  try {
    return await run();
  } catch (e) {
    if (isPrismaDbUnavailableError(e)) {
      if (process.env.NODE_ENV === "development") {
        console.warn("[db] unavailable, using fallback:", e);
      }
      return fallback;
    }
    throw e;
  }
}
