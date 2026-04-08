const IST_OFFSET_MS = 5.5 * 60 * 60 * 1000;

export function getIstDayBounds(now = new Date()) {
  const shifted = new Date(now.getTime() + IST_OFFSET_MS);
  const startShifted = Date.UTC(
    shifted.getUTCFullYear(),
    shifted.getUTCMonth(),
    shifted.getUTCDate()
  );
  const start = new Date(startShifted - IST_OFFSET_MS);
  const end = new Date(start.getTime() + 24 * 60 * 60 * 1000);
  return { start, end };
}

export function isTodayIst(date: Date) {
  const { start, end } = getIstDayBounds();
  return date >= start && date < end;
}

export function isPastIst(date: Date) {
  const { start } = getIstDayBounds();
  return date < start;
}
