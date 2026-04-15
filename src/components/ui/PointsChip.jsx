"use client";

/**
 * Points chip — Stitch landing / library: compact gold label on dark pill.
 */
export default function PointsChip({ points = 0 }) {
  const formatted =
    typeof points === "number" ? points.toLocaleString() : points;
  return (
    <div className="flex items-center gap-2 rounded-lg border border-zinc-800 bg-zinc-900 px-3 py-1.5">
      <span
        className="material-symbols-outlined text-sm text-primary-container"
        style={{ fontVariationSettings: "'FILL' 1" }}
      >
        stars
      </span>
      <span className="font-display text-sm font-bold tracking-tighter text-primary-container">
        {formatted} PTS
      </span>
    </div>
  );
}
