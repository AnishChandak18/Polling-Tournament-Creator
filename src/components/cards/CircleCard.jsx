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
            <div className="text-xs font-bold uppercase tracking-wider text-on-surface-variant">
              {meta}
            </div>
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
        className="group relative block border border-zinc-800 bg-zinc-900/50 p-1 transition-all hover:border-primary/50"
      >
        <div className="absolute right-0 top-0 p-2">
          <span className="material-symbols-outlined text-zinc-700 group-hover:text-primary/50">
            radar
          </span>
        </div>
        <div className="border border-zinc-800/50 p-6">
          <div className="text-[10px] font-headline font-bold uppercase tracking-widest text-zinc-500">
            {meta}
          </div>
          <div className="mt-2 font-headline text-xl font-black uppercase italic tracking-tighter text-on-surface">
            {name}
          </div>
          {nextMatch ? (
            <div className="mt-4 font-headline text-sm text-zinc-400">
              Next:{" "}
              <span className="font-bold text-on-surface">
                {nextMatch.team1} vs {nextMatch.team2}
              </span>
              <p className="mt-2 text-[10px] font-bold uppercase tracking-widest text-primary">
                Tap to predict
              </p>
            </div>
          ) : (
            <p className="mt-4 font-headline text-sm text-zinc-500">
              No upcoming match
            </p>
          )}
        </div>
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
      <p className="mt-6 text-xs font-bold uppercase tracking-wider text-on-surface-variant">
        {cta}
      </p>
    </Link>
  );
}
