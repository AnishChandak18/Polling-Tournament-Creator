import Link from "next/link";
import { redirect } from "next/navigation";
import PageShell from "@/components/layout/PageShell";
import PointsChip from "@/components/ui/PointsChip";
import CircleBuzz from "@/components/dashboard/CircleBuzz";
import DashboardCircleCard from "@/components/dashboard/DashboardCircleCard";
import DashboardLiveCard from "@/components/dashboard/DashboardLiveCard";
import DashboardLiveEmpty from "@/components/dashboard/DashboardLiveEmpty";
import {
  getAuthContext,
  getLiveArenaTargetForUser,
  getRecentCircleActivity,
  getUserBestRankInCircles,
  getUserPointsChipTotal,
  getUserPredictionCount,
  listUserTournaments,
} from "@/services/server";
import { isTodayIst } from "@/lib/ist";

export default async function DashboardPage() {
  const { supabaseUser, dbUser } = await getAuthContext();
  if (!supabaseUser) redirect("/login");
  if (!dbUser) redirect("/login?error=database");

  const [
    tournaments,
    totalPoints,
    bestRank,
    predictionCount,
    activity,
    liveArena,
  ] = await Promise.all([
    listUserTournaments(dbUser.id, {
      take: 8,
      includeUpcomingMatch: true,
    }),
    getUserPointsChipTotal(dbUser.id),
    getUserBestRankInCircles(dbUser.id),
    getUserPredictionCount(dbUser.id),
    getRecentCircleActivity(dbUser.id, 6),
    getLiveArenaTargetForUser(dbUser.id),
  ]);

  const spotlight = tournaments
    .map((t) =>
      t.matches?.[0] ? { tournament: t, match: t.matches[0] } : null,
    )
    .find(Boolean);

  const predictHref = spotlight
    ? `/tournaments/${spotlight.tournament.id}/vote`
    : "/predictions";
  const historyHref = tournaments[0]
    ? `/tournaments/${tournaments[0].id}/history`
    : null;
  const liveHref = liveArena
    ? `/tournaments/${liveArena.tournamentId}/live`
    : null;
  const spotlightLiveArenaHref =
    spotlight &&
    spotlight.match.status === "LIVE" &&
    liveArena?.tournamentId === spotlight.tournament.id
      ? `/tournaments/${spotlight.tournament.id}/live`
      : null;

  const rankLabel = bestRank != null ? `#${bestRank}` : "—";
  const rankSub =
    bestRank != null
      ? "Best among your circles"
      : "Join a circle to get ranked";

  return (
    <PageShell
      active="home"
      maxWidth="max-w-7xl"
      className="px-4"
      rightSlot={<PointsChip points={totalPoints} />}
    >
      <div className="flex flex-col gap-6 lg:grid lg:grid-cols-12 lg:gap-6">
        <div className="space-y-6 lg:col-span-8">
          {spotlight ? (
            <DashboardLiveCard
              team1={spotlight.match.team1}
              team2={spotlight.match.team2}
              matchDate={new Date(spotlight.match.matchDate)}
              season={spotlight.tournament.season}
              isLiveDay={
                spotlight.match.status === "LIVE" ||
                isTodayIst(new Date(spotlight.match.matchDate))
              }
              predictHref={predictHref}
              liveArenaHref={spotlightLiveArenaHref}
              isMatchLive={spotlight.match.status === "LIVE"}
            />
          ) : (
            <DashboardLiveEmpty />
          )}

          <section className="flex flex-wrap gap-2">
            <Link
              href="/results"
              className="inline-flex items-center gap-1.5 rounded-lg border border-zinc-800 bg-surface-container-high px-3 py-2 font-display text-[10px] font-bold uppercase tracking-widest text-on-surface transition-colors hover:border-primary/40 hover:text-primary-container"
            >
              <span className="material-symbols-outlined text-base text-primary-container">
                emoji_events
              </span>
              Results
            </Link>
            {historyHref ? (
              <Link
                href={historyHref}
                className="inline-flex items-center gap-1.5 rounded-lg border border-zinc-800 bg-surface-container-high px-3 py-2 font-display text-[10px] font-bold uppercase tracking-widest text-on-surface transition-colors hover:border-primary/40 hover:text-primary-container"
              >
                <span className="material-symbols-outlined text-base text-primary-container">
                  history
                </span>
                Match history
              </Link>
            ) : null}
            {liveHref ? (
              <Link
                href={liveHref}
                className="inline-flex items-center gap-1.5 rounded-lg border border-primary/30 bg-primary/10 px-3 py-2 font-display text-[10px] font-bold uppercase tracking-widest text-primary-container transition-colors hover:bg-primary/20"
              >
                <span className="relative flex h-2 w-2">
                  <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-red-500 opacity-75" />
                  <span className="relative inline-flex h-2 w-2 rounded-full bg-red-500" />
                </span>
                Live arena
              </Link>
            ) : null}
          </section>

          <section className="grid grid-cols-2 gap-4">
            <div className="rounded-lg border border-zinc-800 bg-surface-container-high p-4">
              <p className="mb-1 text-[10px] font-bold uppercase tracking-widest text-on-surface-variant">
                Best rank
              </p>
              <div className="flex items-baseline gap-1">
                <span className="font-display text-3xl font-black text-primary-container">
                  {rankLabel}
                </span>
              </div>
              <p className="mt-2 text-[10px] font-bold leading-snug text-on-surface-variant">
                {rankSub}
              </p>
            </div>
            <div className="flex flex-col justify-between rounded-lg border border-zinc-800 bg-surface-container-high p-4">
              <div>
                <p className="mb-1 text-[10px] font-bold uppercase tracking-widest text-on-surface-variant">
                  Predictions
                </p>
                <p className="font-display text-3xl font-black text-on-surface">
                  {predictionCount}
                </p>
                <p className="mt-1 text-[10px] font-bold text-on-surface-variant">
                  All-time picks
                </p>
              </div>
            </div>
          </section>

          <section className="overflow-hidden rounded-lg border border-zinc-800 bg-zinc-950">
            <div className="flex items-center justify-between border-b border-zinc-800 p-5">
              <div className="flex items-center gap-3">
                <span className="material-symbols-outlined text-primary-container">
                  query_stats
                </span>
                <div>
                  <h2 className="font-display text-sm font-black uppercase tracking-[0.2em] text-on-surface">
                    Up next
                  </h2>
                  <p className="mt-0.5 text-[10px] font-medium uppercase tracking-wider text-zinc-500">
                    Snapshot — use Predictions for every circle
                  </p>
                </div>
              </div>
              <Link
                href="/predictions"
                className="text-[10px] font-bold uppercase tracking-widest text-zinc-500 hover:text-primary-container"
              >
                All circles
              </Link>
            </div>
            <div className="p-6">
              {tournaments.length === 0 ? (
                <p className="text-sm text-on-surface-variant">
                  Join a circle to get quick vote prompts.
                </p>
              ) : (
                <div className="grid grid-cols-1 gap-3">
                  {tournaments
                    .filter((t) => t.matches?.[0])
                    .slice(0, 2)
                    .map((t) => {
                      const m = t.matches[0];
                      return (
                        <Link
                          key={`${t.id}-${m.id}`}
                          href={`/tournaments/${t.id}/vote`}
                          className="group relative block border border-zinc-800 bg-zinc-900/50 p-1 transition-all hover:border-primary/40 active:scale-[0.99]"
                        >
                          <div className="flex h-14 items-center justify-between border border-zinc-800/50 px-4">
                            <span className="font-headline text-xs font-bold uppercase tracking-tight text-zinc-300 transition-colors group-hover:text-primary">
                              {m.team1}{" "}
                              <span className="text-zinc-600">vs</span>{" "}
                              {m.team2}
                            </span>
                            <span className="rounded bg-zinc-950 px-2 py-0.5 font-headline text-[10px] font-bold uppercase tracking-widest text-zinc-500">
                              {m.status}
                            </span>
                          </div>
                        </Link>
                      );
                    })}
                </div>
              )}
            </div>
          </section>
        </div>

        <div className="lg:col-span-4">
          <div className="flex h-full min-h-[280px] flex-col overflow-hidden rounded-lg border border-zinc-800 bg-zinc-950 lg:sticky lg:top-28">
            <div className="flex items-center justify-between border-b border-zinc-800 p-5">
              <div className="flex items-center gap-3">
                <span className="material-symbols-outlined text-primary-container">
                  group
                </span>
                <h2 className="font-display text-sm font-black uppercase tracking-[0.2em] text-on-surface">
                  Group Activity
                </h2>
              </div>
              <span className="h-2 w-2 animate-pulse rounded-full bg-primary-container" />
            </div>
            <div className="flex-1 overflow-y-auto p-4">
              <CircleBuzz items={activity} variant="embedded" />
            </div>
          </div>
        </div>
      </div>

      <section className="space-y-3">
        <div className="flex items-end justify-between">
          <h3 className="font-display text-sm font-black uppercase tracking-widest text-on-surface">
            Your circles
          </h3>
          <Link
            href="/tournaments"
            className="text-[10px] font-bold uppercase tracking-widest text-primary-container hover:underline"
          >
            Manage &amp; join
          </Link>
        </div>

        <div className="no-scrollbar flex gap-3 overflow-x-auto pb-2">
          {tournaments.length === 0 ? (
            <div className="min-w-[200px] rounded-xl border border-outline-variant bg-surface-container-high p-4 text-sm text-on-surface-variant">
              No circles yet. Create one to compete with friends.
            </div>
          ) : (
            tournaments.map((t, idx) => (
              <DashboardCircleCard
                key={t.id}
                href={`/tournaments/${t.id}`}
                name={t.name}
                index={idx}
              />
            ))
          )}
          <Link
            href="/tournaments/create"
            className="flex aspect-[4/5] w-36 shrink-0 flex-col items-center justify-center rounded-xl border border-dashed border-zinc-700 bg-transparent"
          >
            <span className="material-symbols-outlined mb-1 text-3xl text-zinc-600">
              add_circle
            </span>
            <p className="text-[10px] font-bold uppercase tracking-widest text-zinc-500">
              Create New
            </p>
          </Link>
        </div>
      </section>
    </PageShell>
  );
}
