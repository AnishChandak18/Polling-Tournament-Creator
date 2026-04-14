/**
 * Shared extraction of match arrays from varied RapidAPI / Cricbuzz JSON wrappers.
 */

export function extractCandidates(payload: unknown): unknown[] | null {
  if (Array.isArray(payload)) return payload;

  if (!payload || typeof payload !== "object") return null;
  const root = payload as Record<string, unknown>;

  const nested =
    (root.fixtures as unknown[] | undefined) ??
    (root.schedule as unknown[] | undefined) ??
    (root.Matchsummary as unknown[] | undefined) ??
    (root.matches as unknown[] | undefined) ??
    (root.matchList as unknown[] | undefined) ??
    (root.data as unknown[] | undefined);

  if (Array.isArray(nested)) return nested;

  const resp = root.response;
  if (resp && typeof resp === "object") {
    const r = resp as Record<string, unknown>;
    const fromResp =
      (r.matches as unknown[] | undefined) ??
      (r.matchList as unknown[] | undefined) ??
      (r.schedule as unknown[] | undefined) ??
      (r.fixtures as unknown[] | undefined) ??
      (r.data as unknown[] | undefined);
    if (Array.isArray(fromResp)) return fromResp;
  }

  const dataObj = root.data as Record<string, unknown> | undefined;
  if (dataObj && typeof dataObj === "object") {
    const fromData =
      (dataObj.matchList as unknown[] | undefined) ??
      (dataObj.matches as unknown[] | undefined) ??
      (dataObj.fixtures as unknown[] | undefined) ??
      (dataObj.schedule as unknown[] | undefined);
    if (Array.isArray(fromData)) return fromData;
  }

  const apiResults = root.apiResults as Record<string, unknown> | undefined;
  if (apiResults?.data && Array.isArray(apiResults.data)) {
    return apiResults.data as unknown[];
  }

  const arrayValues = Object.values(root).filter(
    (v): v is unknown[] => Array.isArray(v) && v.length > 0
  );
  if (arrayValues.length === 1) {
    return arrayValues[0];
  }
  if (arrayValues.length > 1) {
    const longest = arrayValues.reduce((a, b) => (a.length >= b.length ? a : b));
    return longest;
  }

  return null;
}
