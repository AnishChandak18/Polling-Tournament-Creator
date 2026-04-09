/** Recent picks from your circles (data-driven). */
export default function CircleBuzz({ items }) {
  const list = Array.isArray(items) ? items : [];
  return (
    <section className="space-y-3 pb-6">
      <h3 className="font-display text-sm font-black uppercase tracking-widest text-on-surface">Circle Buzz</h3>
      {list.length === 0 ? (
        <div className="rounded-xl border border-outline-variant/30 bg-surface-container-low px-4 py-6 text-center text-xs text-on-surface-variant">
          No recent picks in your circles yet. Vote on a match to see activity here.
        </div>
      ) : (
        <div className="space-y-3">
          {list.map((row) => (
            <div
              key={row.id}
              className="flex gap-4 rounded-xl border border-outline-variant/30 bg-surface-container-low p-3"
            >
              <div className="relative shrink-0">
                <div className="flex h-10 w-10 items-center justify-center rounded-full border border-outline-variant bg-zinc-800 font-display text-xs font-bold text-on-surface">
                  {row.iconLetter}
                </div>
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-xs text-on-surface">
                  <span className="font-bold">{row.actorLabel}</span> picked{" "}
                  <span className="font-bold text-secondary">{row.pickTeam}</span>
                </p>
                <div className="mt-2 flex flex-wrap items-center gap-3">
                  <span className="text-[10px] font-bold uppercase tracking-tighter text-on-surface-variant">
                    {row.ago}
                  </span>
                  <span className="h-1 w-1 rounded-full bg-zinc-700" />
                  <span className="text-[10px] font-bold uppercase tracking-tighter text-on-surface-variant">
                    {row.circleName}
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </section>
  );
}
