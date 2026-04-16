import Link from "next/link";
import { redirect } from "next/navigation";
import PageShell from "@/components/layout/PageShell";
import PointsChip from "@/components/ui/PointsChip";
import CircleCard from "@/components/cards/CircleCard";
import {
  getAuthContext,
  getUserPointsChipTotal,
  getUserRankInTournament,
  listUserTournaments,
} from "@/services/server";

export default async function LeaderboardPage() {
  const { supabaseUser, dbUser } = await getAuthContext();
  if (!supabaseUser) redirect("/login");
  if (!dbUser) redirect("/login?error=database");

  const tournaments = await listUserTournaments(dbUser.id, { take: 12 });
  const [totalPoints, ...ranks] = await Promise.all([
    getUserPointsChipTotal(dbUser.id),
    ...tournaments.map((t) => getUserRankInTournament(dbUser.id, t.id)),
  ]);

  return (
    <PageShell active="leaderboard" maxWidth="max-w-lg" className="px-4" rightSlot={<PointsChip points={totalPoints} />}>
      <header className="mb-8 text-center">
        <h1 className="font-display text-4xl font-black italic uppercase tracking-tighter text-primary-container">
          Rankings
        </h1>
        <div className="mx-auto mt-2 h-1 w-16 bg-primary-container" />
        <p className="mt-3 text-xs font-medium uppercase tracking-widest text-on-surface-variant">
          Circle standings &amp; results
        </p>
      </header>

      <div className="mb-4 flex items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <span className="material-symbols-outlined text-xl text-primary-container">emoji_events</span>
          <div className="font-display text-sm font-black uppercase tracking-widest text-on-surface">Your circles</div>
        </div>
        <Link
          href="/tournaments"
          className="font-display text-xs font-bold uppercase tracking-widest text-primary-container hover:underline"
        >
          All circles
        </Link>
      </div>

      <div className="grid gap-3">
        {tournaments.length === 0 ? (
          <div className="rounded-lg border border-zinc-800 bg-surface-container p-4 text-sm text-on-surface-variant">
            No circles found.
          </div>
        ) : (
          tournaments.slice(0, 7).map((t, idx) => (
            <CircleCard
              key={t.id}
              href={`/tournaments/${t.id}/leaderboard`}
              name={t.name}
              season={t.season}
              status={t.status}
              variant="ranking"
              rank={ranks[idx]}
              isFirst={ranks[idx] === 1}
            />
          ))
        )}
      </div>
    </PageShell>
  );
}
