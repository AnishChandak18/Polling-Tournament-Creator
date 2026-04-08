"use client";

/**
 * Points chip — Stitch landing / library: compact gold label on dark pill.
 */
export default function PointsChip({ points = 0 }) {
  const formatted = typeof points === "number" ? points.toLocaleString() : points;
  return (
    <div className="flex items-center gap-1.5 rounded-full border border-outline-variant/30 bg-surface-container-highest px-3 py-1">
      <span className="font-display text-[10px] font-bold tracking-tighter text-primary">
        {formatted} PTS
      </span>
    </div>
  );
}
