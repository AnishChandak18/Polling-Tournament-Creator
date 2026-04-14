import Link from "next/link";

/**
 * Stitch — Live Standings snapshot (leaderboard rows + Full Leaderboard link).
 * Shell matches MatchVoteCard: zinc border + inner panel.
 */
export default function CircleArenaLeaderboard({ tournamentId, userRank, rows }) {
  const rankLabel = userRank != null ? `#${userRank}` : "—";

  return (
    <section className="relative mt-12 border border-zinc-800 bg-zinc-900/50 p-1">
      <div className="relative overflow-hidden border border-zinc-800/50 p-6">
        <div className="pointer-events-none absolute inset-0 hud-scanline opacity-20" />
        <div className="relative z-10 mb-6 flex items-end justify-between">
          <div>
            <h3 className="font-headline text-xl font-black uppercase italic tracking-tighter text-on-background">
              Live Standings
            </h3>
            <p className="text-xs uppercase tracking-widest text-zinc-500">
              Global Circle Ranking: {rankLabel}
            </p>
          </div>
          <Link
            href={`/tournaments/${tournamentId}/leaderboard`}
            className="inline-flex items-center gap-1 text-[10px] font-headline font-bold uppercase tracking-widest text-primary"
          >
            Full Leaderboard
            <span className="material-symbols-outlined text-xs">arrow_forward_ios</span>
          </Link>
        </div>

        {rows.length === 0 ? (
          <p className="relative z-10 text-sm text-zinc-500">No standings yet.</p>
        ) : (
          <div className="relative z-10 space-y-3">
            {rows.map((row, i) => (
              <div
                key={`${row.displayName}-${row.rank}`}
                className={
                  i === 0
                    ? "flex items-center justify-between border-l-2 border-primary bg-zinc-950/50 p-3"
                    : "flex items-center justify-between border-l-2 border-zinc-700 bg-zinc-950/30 p-3"
                }
              >
                <div className="flex min-w-0 items-center gap-4">
                  <span
                    className={
                      i === 0
                        ? "w-4 font-headline text-sm font-black italic text-primary"
                        : "w-4 font-headline text-sm font-black italic text-zinc-500"
                    }
                  >
                    {String(row.rank).padStart(2, "0")}
                  </span>
                  <div className="h-8 w-8 shrink-0 overflow-hidden rounded-full border border-zinc-700 bg-zinc-800">
                    {row.avatarUrl ? (
                      <img src={row.avatarUrl} alt="" className="h-full w-full object-cover" />
                    ) : (
                      <span className="flex h-full w-full items-center justify-center text-[10px] font-bold text-zinc-500">
                        {row.displayName.slice(0, 1).toUpperCase()}
                      </span>
                    )}
                  </div>
                  <span className="truncate font-headline text-sm font-bold uppercase tracking-tight text-on-background">
                    {row.displayName}
                  </span>
                </div>
                <span
                  className={
                    i === 0
                      ? "shrink-0 font-headline text-sm font-black text-primary"
                      : "shrink-0 font-headline text-sm font-black text-zinc-300"
                  }
                >
                  {row.score.toLocaleString()} XP
                </span>
              </div>
            ))}
          </div>
        )}
      </div>
    </section>
  );
}
