import Link from "next/link";

/**
 * Circle / tournament card — Stitch: tonal layers, minimal borders, optional left accent.
 *
 * @param {{
 *   href: string;
 *   name: string;
 *   season: string | number;
 *   status: string;
 *   rank?: number | null;
 *   nextMatch?: { team1: string; team2: string } | null;
 *   variant?: "default" | "prediction" | "ranking";
 *   isFirst?: boolean;
 *   cta?: string;
 * }} props
 */
export default function CircleCard({
  href,
  name,
  season,
  status,
  rank,
  nextMatch,
  variant = "default",
  isFirst = false,
  cta = "Open Circle",
}) {
  const meta = `IPL ${season} • ${status}`;

  if (variant === "ranking") {
    return (
      <Link
        href={href}
        className={[
          "flex items-center justify-between rounded-xl px-4 py-3 transition hover:-translate-y-0.5",
          isFirst
            ? "border-l-4 border-primary-container bg-primary/10"
            : "border border-outline-variant/10 bg-surface-container-low",
        ].join(" ")}
      >
        <div className="flex items-center gap-3">
          <span className="min-w-[2rem] text-center font-display font-bold text-on-surface-variant">
            {rank != null ? `#${rank}` : "—"}
          </span>
          <div>
            <div className="text-xs font-bold uppercase tracking-wider text-on-surface-variant">{meta}</div>
            <div className="mt-1 font-semibold text-on-surface">{name}</div>
          </div>
        </div>
        <span className="text-sm font-bold text-primary">View</span>
      </Link>
    );
  }

  if (variant === "prediction") {
    return (
      <Link
        href={href}
        className="glass-card block overflow-hidden p-6 transition hover:-translate-y-0.5"
      >
        <div className="text-xs font-bold uppercase tracking-wider text-on-surface-variant">{meta}</div>
        <div className="mt-2 font-display text-2xl font-bold text-on-surface">{name}</div>
        {nextMatch ? (
          <div className="mt-4 text-sm text-on-surface-variant">
            Next:{" "}
            <span className="font-bold">
              {nextMatch.team1} vs {nextMatch.team2}
            </span>
            <p className="mt-1 text-xs font-bold uppercase tracking-widest text-primary">Tap to predict</p>
          </div>
        ) : (
          <p className="mt-4 text-sm text-on-surface-variant">No upcoming match</p>
        )}
      </Link>
    );
  }

  return (
    <Link
      href={href}
      className="w-72 flex-shrink-0 rounded-2xl border border-outline-variant/10 bg-surface-container-high p-5 transition hover:bg-surface-bright/10"
    >
      <h5 className="font-display text-lg font-bold text-on-surface">{name}</h5>
      <p className="mt-1 text-xs text-on-surface-variant">{meta}</p>
      <p className="mt-6 text-xs font-bold uppercase tracking-wider text-on-surface-variant">{cta}</p>
    </Link>
  );
}
