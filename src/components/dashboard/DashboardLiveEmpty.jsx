import Link from "next/link";

/** Empty state when no upcoming match is available — same canvas as Stitch live card. */
export default function DashboardLiveEmpty() {
  return (
    <section>
      <div className="relative overflow-hidden rounded-xl border border-outline-variant bg-surface-container-high">
        <div className="pointer-events-none absolute inset-0 bg-gradient-to-br from-yellow-400/10 to-transparent" />
        <div className="relative z-10 space-y-4 p-5">
          <div className="flex items-start justify-between">
            <span className="rounded bg-surface-container px-2 py-0.5 text-[10px] font-bold uppercase tracking-widest text-on-surface-variant">
              Fixtures
            </span>
            <span className="text-xs font-medium text-on-surface-variant">
              Indian Premier League
            </span>
          </div>
          <p className="text-sm leading-relaxed text-on-surface-variant">
            No upcoming match is synced in your circles yet. Open predictions or
            create a circle to get started.
          </p>
          <div className="flex flex-col gap-2 sm:flex-row">
            <Link
              href="/predictions"
              className="btn-primary pulse-shadow flex flex-1 items-center justify-center gap-2 py-4 text-sm uppercase tracking-widest"
            >
              <span className="material-symbols-outlined text-xl">
                query_stats
              </span>
              Predictions
            </Link>
            <Link
              href="/tournaments/create"
              className="btn-outline flex flex-1 justify-center py-4 text-sm uppercase tracking-widest"
            >
              Create circle
            </Link>
          </div>
        </div>
        <div className="pointer-events-none absolute -bottom-10 -right-10 h-32 w-32 rounded-full bg-yellow-400/5 blur-3xl" />
      </div>
    </section>
  );
}
