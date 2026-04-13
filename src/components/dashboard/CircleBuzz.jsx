/** Recent picks from your circles (data-driven). */
export default function CircleBuzz({ items, variant = "default" }) {
  const list = Array.isArray(items) ? items : [];
  const embedded = variant === "embedded";

  const inner =
    list.length === 0 ? (
      <div className="rounded-sm border border-zinc-800 bg-zinc-900/40 px-4 py-6 text-center text-xs text-zinc-500">
        No recent picks in your circles yet. Vote on a match to see activity here.
      </div>
    ) : (
      <div className="space-y-3">
        {list.map((row) => (
          <div
            key={row.id}
            className="flex cursor-pointer gap-4 rounded-sm border border-transparent p-3 transition-colors hover:border-zinc-800 hover:bg-zinc-900"
          >
            <div className="relative shrink-0">
              <div className="flex h-10 w-10 items-center justify-center rounded-sm border border-zinc-700 bg-zinc-800 font-display text-xs font-bold text-on-surface">
                {row.iconLetter}
              </div>
            </div>
            <div className="min-w-0 flex-1">
              <div className="flex items-start justify-between gap-2">
                <span className="text-xs font-bold text-primary-container">{row.actorLabel}</span>
                <span className="text-[9px] font-black uppercase text-zinc-600">{row.ago}</span>
              </div>
              <p className="mt-1 text-xs text-on-surface">
                predicted <span className="font-bold text-primary">{row.pickTeam}</span>
              </p>
              <div className="mt-2">
                <span className="rounded border border-zinc-800 bg-zinc-900 px-2 py-0.5 text-[10px] text-zinc-500">
                  {row.circleName}
                </span>
              </div>
            </div>
          </div>
        ))}
      </div>
    );

  if (embedded) return inner;

  return (
    <section className="space-y-3 pb-6">
      <h3 className="font-display text-sm font-black uppercase tracking-widest text-on-surface">Circle Buzz</h3>
      {inner}
    </section>
  );
}
