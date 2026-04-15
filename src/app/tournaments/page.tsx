import { redirect } from "next/navigation";
import Link from "next/link";
import PageShell from "@/components/layout/PageShell";
import PointsChip from "@/components/ui/PointsChip";
import {
  getAuthContext,
  getUserPointsChipTotal,
  listUserTournaments,
} from "@/services/server";

export default async function TournamentsPage() {
  const { supabaseUser, dbUser } = await getAuthContext();
  if (!supabaseUser) redirect("/login");
  if (!dbUser) redirect("/login?error=database");

  const [tournaments, totalPoints] = await Promise.all([
    listUserTournaments(dbUser.id),
    getUserPointsChipTotal(dbUser.id),
  ]);
  const activeCount = tournaments.filter(
    (t) => t.status !== "COMPLETED",
  ).length;

  return (
    <PageShell
      active="circles"
      maxWidth="max-w-7xl"
      className="space-y-8 px-4"
      rightSlot={<PointsChip points={totalPoints} />}
    >
      <header className="space-y-1">
        <h1 className="font-display text-4xl font-black uppercase tracking-tighter text-on-surface">
          Circles
        </h1>
        <p className="text-sm font-medium uppercase tracking-tight text-on-surface-variant">
          Your Groups &amp; Private Arenas
        </p>
      </header>

      <div className="flex flex-col gap-6 lg:grid lg:grid-cols-12 lg:gap-6">
        <div className="flex flex-col gap-6 lg:col-span-5">
          <Link
            href="/tournaments/create"
            className="group relative flex flex-col justify-center gap-4 overflow-hidden rounded-xl bg-primary-container p-6 transition-all active:scale-[0.98] hover:bg-primary-dim"
          >
            <div className="absolute -right-2 -top-2 p-4 opacity-5 transition-opacity group-hover:opacity-10">
              <span
                className="material-symbols-outlined text-[100px] text-on-primary-container"
                style={{ fontVariationSettings: "'FILL' 1" }}
              >
                add_circle
              </span>
            </div>
            <div className="relative z-10 flex items-center gap-4">
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-on-primary-container/10">
                <span className="material-symbols-outlined text-2xl text-on-primary-container">
                  group_add
                </span>
              </div>
              <div>
                <h3 className="font-display text-2xl font-black uppercase leading-none text-on-primary-container">
                  Create Private Circle
                </h3>
                <div className="mt-1 flex items-center gap-2">
                  <p className="text-xs font-bold uppercase tracking-widest text-on-primary-container/80">
                    Create New Group
                  </p>
                  <span className="material-symbols-outlined text-sm text-on-primary-container">
                    arrow_forward
                  </span>
                </div>
              </div>
            </div>
          </Link>

          <div className="relative rounded-xl border border-zinc-800 bg-surface-container p-6 after:absolute after:bottom-0 after:right-0 after:h-5 after:w-5 after:border-b-2 after:border-r-2 after:border-primary after:content-['']">
            <p className="mb-4 font-display text-xs font-bold uppercase tracking-[0.2em] text-zinc-500">
              Join with Circle ID
            </p>
            <p className="text-sm text-on-surface-variant">
              Enter your invite code on the join screen — open the tactical join
              flow.
            </p>
            <Link
              href="/join"
              className="btn-primary mt-6 flex w-full items-center justify-center gap-2 py-4 font-display text-sm font-black uppercase tracking-widest"
            >
              <span className="material-symbols-outlined">login</span>
              Open join flow
            </Link>
          </div>
        </div>

        <div className="lg:col-span-7">
          <div className="flex h-full flex-col overflow-hidden rounded-xl border border-zinc-800 bg-surface-container-low p-6">
            <div className="mb-8 flex items-center justify-between">
              <div>
                <h3 className="font-display text-2xl font-black uppercase tracking-tighter text-on-surface">
                  Your Circles
                </h3>
                <p className="text-xs font-bold uppercase tracking-widest text-zinc-500">
                  Your Active Groups
                </p>
              </div>
              <span className="rounded bg-primary/10 px-2 py-0.5 text-xs font-bold text-primary">
                {activeCount} Active
              </span>
            </div>

            <section className="space-y-3">
              <div className="flex items-center justify-between">
                <h2 className="font-display text-[10px] font-black uppercase tracking-[0.2em] text-on-surface-variant">
                  Circle Invites (0)
                </h2>
              </div>
              <div className="rounded-lg border border-zinc-800 bg-zinc-950/50 p-4 text-xs text-zinc-500">
                No pending invites right now.
              </div>
            </section>

            <div className="mt-8 space-y-3">
              {tournaments.length === 0 ? (
                <div className="rounded-lg border border-zinc-800 bg-zinc-950/50 p-8 text-center text-on-surface-variant">
                  No tournaments yet.
                </div>
              ) : (
                tournaments.map((t, idx) => (
                  <Link
                    key={t.id}
                    href={`/tournaments/${t.id}`}
                    className="group flex items-center justify-between rounded-lg border border-zinc-800 bg-zinc-950/50 p-5 transition-all hover:border-primary-container"
                  >
                    <div className="flex min-w-0 flex-1 items-center gap-4">
                      <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-lg border border-zinc-700 bg-zinc-800 font-display text-lg font-black text-on-surface">
                        {String(idx + 1).padStart(2, "0")}
                      </div>
                      <div className="min-w-0">
                        <p className="font-display text-xl font-black text-on-surface">
                          {t.name}
                        </p>
                        <p className="mt-1 text-[10px] font-bold uppercase tracking-widest text-zinc-500">
                          IPL {t.season} • {t.status}
                        </p>
                      </div>
                    </div>
                    <span className="material-symbols-outlined text-zinc-600 transition-colors group-hover:text-primary-container">
                      chevron_right
                    </span>
                  </Link>
                ))
              )}
            </div>
          </div>
        </div>
      </div>
    </PageShell>
  );
}
