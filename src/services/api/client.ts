export class ApiError extends Error {
  status: number;

  constructor(message: string, status: number) {
    super(message);
    this.name = "ApiError";
    this.status = status;
  }
}

type ApiRequestOptions = {
  method?: "GET" | "POST" | "PATCH" | "PUT" | "DELETE";
  body?: unknown;
  headers?: Record<string, string>;
};

function logDevToolsApiResponse(
  method: string,
  path: string,
  status: number,
  ok: boolean,
  body: unknown
) {
  if (process.env.NODE_ENV !== "production" && typeof window !== "undefined") {
    console.log("[api response]", { method, path, status, ok, body });
  }
}

export async function apiRequest<T>(
  path: string,
  { method = "GET", body, headers = {} }: ApiRequestOptions = {}
): Promise<T> {
  const res = await fetch(path, {
    method,
    headers: {
      "Content-Type": "application/json",
      ...headers,
    },
    body: body === undefined ? undefined : JSON.stringify(body),
  });

  const json = await res.json().catch(() => ({}));
  logDevToolsApiResponse(method, path, res.status, res.ok, json);

  if (!res.ok) {
    const message =
      typeof json?.error === "string" && json.error.length > 0
        ? json.error
        : "Request failed";
    throw new ApiError(message, res.status);
  }

  return json as T;
}
