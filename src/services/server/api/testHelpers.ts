import { HttpError } from "@/services/server/api/errors";

/**
 * Build params payload matching Next App Router route handler signature.
 *
 * Example:
 *   const ctx = makeRouteContext({ id: "abc" });
 *   await GET(new Request("http://x"), ctx);
 */
export function makeRouteContext<T extends Record<string, string>>(params: T) {
  return { params: Promise.resolve(params) };
}

/**
 * Build JSON request for route handler tests.
 *
 * Example:
 *   const req = makeJsonRequest("POST", { name: "My Tournament" });
 */
export function makeJsonRequest(
  method: "GET" | "POST" | "PATCH" | "PUT" | "DELETE",
  body?: unknown,
  url = "http://localhost:3000"
) {
  return new Request(url, {
    method,
    headers: { "Content-Type": "application/json" },
    body: body === undefined ? undefined : JSON.stringify(body),
  });
}

/**
 * Tiny assertion helper for service tests.
 * Throws if a promise does not reject with HttpError + expected status.
 */
export async function expectHttpError(
  fn: () => Promise<unknown>,
  status: number
) {
  try {
    await fn();
    throw new Error(`Expected HttpError(${status}), but function resolved`);
  } catch (error: unknown) {
    if (!(error instanceof HttpError)) {
      throw new Error("Expected HttpError, got different error type");
    }
    if (error.status !== status) {
      throw new Error(
        `Expected HttpError(${status}), got HttpError(${error.status})`
      );
    }
  }
}
