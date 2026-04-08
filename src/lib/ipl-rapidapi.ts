/**
 * Optional RapidAPI schedule fetch.
 *
 * Required: RAPIDAPI_KEY
 * Optional: RAPIDAPI_SCHEDULE_URL — only if you use a different host/path than the default Cricbuzz league endpoint.
 * X-RapidAPI-Host is taken from the request URL hostname.
 */

const DEFAULT_RAPIDAPI_SCHEDULE_URL =
  "https://free-cricbuzz-cricket-api.p.rapidapi.com/cricket-schedule-league";

export function getRapidApiScheduleConfig(): { key: string; scheduleUrl: URL } | null {
  const key = process.env.RAPIDAPI_KEY?.trim();
  if (!key) return null;
  const rawUrl = process.env.RAPIDAPI_SCHEDULE_URL?.trim() || DEFAULT_RAPIDAPI_SCHEDULE_URL;
  try {
    return { key, scheduleUrl: new URL(rawUrl) };
  } catch {
    return null;
  }
}

export async function fetchJsonFromRapidApi(scheduleUrl: URL, key: string): Promise<unknown> {
  const res = await fetch(scheduleUrl.toString(), {
    method: "GET",
    headers: {
      "X-RapidAPI-Key": key,
      "X-RapidAPI-Host": scheduleUrl.hostname,
    },
    next: { revalidate: 0 },
  });

  if (!res.ok) {
    const text = await res.text().catch(() => "");
    throw new Error(`RapidAPI schedule request failed: ${res.status} ${text.slice(0, 200)}`);
  }

  const json: unknown = await res.json();

  console.log("[ipl:rapidapi] GET", scheduleUrl.toString());
  console.log("[ipl:rapidapi] response:", json);

  return json;
}
