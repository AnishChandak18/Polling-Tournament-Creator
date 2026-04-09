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
  getRecentCircleActivity,
  getUserBestRankInCircles,
  getUserPointsChipTotal,
  getUserPredictionCount,
  listUserTournaments,
  syncFixturesForUserTournaments,
} from "@/services/server";
import { isTodayIst } from "@/lib/ist";

export default async function DashboardPage() {
  const { supabaseUser, dbUser } = await getAuthContext();
  if (!supabaseUser) redirect("/login");
  if (!dbUser) redirect("/login?error=database");

  await syncFixturesForUserTournaments(dbUser.id);

  const [tournaments, totalPoints, bestRank, predictionCount, activity] = await Promise.all([
    listUserTournaments(dbUser.id, {
      take: 8,
      includeUpcomingMatch: true,
    }),
    getUserPointsChipTotal(dbUser.id),
    getUserBestRankInCircles(dbUser.id),
    getUserPredictionCount(dbUser.id),
    getRecentCircleActivity(dbUser.id, 6),
  ]);

  const spotlight = tournaments
    .map((t) => (t.matches?.[0] ? { tournament: t, match: t.matches[0] } : null))
    .find(Boolean);

  const predictHref = spotlight
    ? `/tournaments/${spotlight.tournament.id}/vote`
    : "/predictions";

  const rankLabel = bestRank != null ? `#${bestRank}` : "—";
  const rankSub =
    bestRank != null ? "Best among your circles" : "Join a circle to get ranked";

  return (
    <PageShell
      active="home"
      maxWidth="max-w-md"
      className="px-4"
      rightSlot={<PointsChip points={totalPoints} />}
    >
      <div className="flex flex-col gap-6">
        {spotlight ? (
          <DashboardLiveCard
            team1={spotlight.match.team1}
            team2={spotlight.match.team2}
            matchDate={new Date(spotlight.match.matchDate)}
            season={spotlight.tournament.season}
            isLiveDay={
              spotlight.match.status === "LIVE" || isTodayIst(new Date(spotlight.match.matchDate))
            }
            predictHref={predictHref}
          />
        ) : (
          <DashboardLiveEmpty />
        )}

        <section className="grid grid-cols-2 gap-4">
          <div className="rounded-xl border border-outline-variant bg-surface-container-high p-4">
            <p className="mb-1 text-[10px] font-bold uppercase tracking-widest text-on-surface-variant">
              Best rank
            </p>
            <div className="flex items-baseline gap-1">
              <span className="font-display text-3xl font-black text-primary-container">{rankLabel}</span>
            </div>
            <p className="mt-2 text-[10px] font-bold leading-snug text-on-surface-variant">{rankSub}</p>
          </div>
          <div className="flex flex-col justify-between rounded-xl border border-outline-variant bg-surface-container-high p-4">
            <div>
              <p className="mb-1 text-[10px] font-bold uppercase tracking-widest text-on-surface-variant">
                Predictions
              </p>
              <p className="font-display text-3xl font-black text-on-surface">{predictionCount}</p>
              <p className="mt-1 text-[10px] font-bold text-on-surface-variant">All-time picks</p>
            </div>
          </div>
        </section>

        <section className="space-y-3">
          <div className="flex items-end justify-between">
            <h3 className="font-display text-sm font-black uppercase tracking-widest text-on-surface">
              Private Circles
            </h3>
            <Link
              href="/tournaments"
              className="text-[10px] font-bold uppercase tracking-widest text-primary-container hover:underline"
            >
              View All
            </Link>
          </div>

          <div className="no-scrollbar flex gap-3 overflow-x-auto pb-2">
            {tournaments.length === 0 ? (
              <div className="min-w-[200px] rounded-xl border border-outline-variant bg-surface-container-high p-4 text-sm text-on-surface-variant">
                No circles yet. Create one to compete with friends.
              </div>
            ) : (
              tournaments.map((t, idx) => (
                <DashboardCircleCard key={t.id} href={`/tournaments/${t.id}`} name={t.name} index={idx} />
              ))
            )}
            <Link
              href="/tournaments/create"
              className="flex aspect-[4/5] w-36 shrink-0 flex-col items-center justify-center rounded-xl border border-dashed border-zinc-700 bg-transparent"
            >
              <span className="material-symbols-outlined mb-1 text-3xl text-zinc-600">add_circle</span>
              <p className="text-[10px] font-bold uppercase tracking-widest text-zinc-500">Create New</p>
            </Link>
          </div>
        </section>

        <CircleBuzz items={activity} />
      </div>
    </PageShell>
  );
}
