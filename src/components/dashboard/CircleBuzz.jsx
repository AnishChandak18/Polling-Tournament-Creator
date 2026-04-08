/**
 * Stitch Home — "Circle Buzz" activity strip (illustrative copy).
 */
export default function CircleBuzz() {
  return (
    <section className="space-y-3 pb-6">
      <h3 className="font-display text-sm font-black uppercase tracking-widest text-on-surface">Circle Buzz</h3>
      <div className="space-y-3">
        <div className="flex gap-4 rounded-xl border border-outline-variant/30 bg-surface-container-low p-3">
          <div className="relative shrink-0">
            <div className="flex h-10 w-10 items-center justify-center rounded-full border border-outline-variant bg-zinc-800 font-display text-xs font-bold text-on-surface">
              R
            </div>
            <div className="absolute -bottom-1 -right-1 flex h-4 w-4 items-center justify-center rounded-full border-2 border-background bg-secondary">
              <span className="material-symbols-outlined text-[8px] text-white">check_circle</span>
            </div>
          </div>
          <div className="min-w-0 flex-1">
            <p className="text-xs text-on-surface">
              <span className="font-bold">Rahul</span> predicted{" "}
              <span className="font-bold text-secondary">Mumbai Victory</span>
            </p>
            <div className="mt-2 flex flex-wrap items-center gap-3">
              <span className="text-[10px] font-bold uppercase tracking-tighter text-on-surface-variant">2m ago</span>
              <span className="h-1 w-1 rounded-full bg-zinc-700" />
              <span className="text-[10px] font-bold uppercase tracking-tighter text-on-surface-variant">
                Weekend Warriors
              </span>
            </div>
          </div>
        </div>

        <div className="flex gap-4 rounded-xl border border-outline-variant/30 bg-surface-container-low p-3">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full border border-outline-variant bg-zinc-800 font-display text-xs font-bold text-on-surface">
            S
          </div>
          <div className="min-w-0 flex-1">
            <p className="text-xs text-on-surface">
              <span className="font-bold">Sanya</span> just won{" "}
              <span className="font-bold text-primary-container">500 PTS</span> in Power Play
            </p>
            <div className="mt-2 flex flex-wrap items-center gap-3">
              <span className="text-[10px] font-bold uppercase tracking-tighter text-on-surface-variant">15m ago</span>
              <span className="h-1 w-1 rounded-full bg-zinc-700" />
              <span className="text-[10px] font-bold uppercase tracking-tighter text-on-surface-variant">
                Office Pitch
              </span>
            </div>
          </div>
        </div>

        <div className="flex gap-4 rounded-xl border border-outline-variant/30 bg-surface-container-low p-3">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full border border-outline-variant bg-zinc-800 font-display text-xs font-bold text-on-surface">
            A
          </div>
          <div className="min-w-0 flex-1">
            <p className="text-xs text-on-surface">
              <span className="font-bold">Amit</span> created a new circle{" "}
              <span className="font-bold text-tertiary">Finals Frenzy</span>
            </p>
            <div className="mt-2 flex flex-wrap items-center gap-3">
              <span className="text-[10px] font-bold uppercase tracking-tighter text-on-surface-variant">1h ago</span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
