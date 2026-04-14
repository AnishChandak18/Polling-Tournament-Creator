import Link from "next/link";
import { redirect } from "next/navigation";
import PageShell from "@/components/layout/PageShell";
import PointsChip from "@/components/ui/PointsChip";
import CircleCard from "@/components/cards/CircleCard";
import {
  getAuthContext,
  getRecentVotesForUser,
  getUserPointsChipTotal,
  listUserTournaments,
  scheduleFixtureSyncForUser,
} from "@/services/server";

export default async function PredictionsPage() {
  const { supabaseUser, dbUser } = await getAuthContext();
  if (!supabaseUser) redirect("/login");
  if (!dbUser) redirect("/login?error=database");

  await scheduleFixtureSyncForUser(dbUser.id);

  const [tournaments, totalPoints, recentVotes] = await Promise.all([
    listUserTournaments(dbUser.id, {
      take: 8,
      includeUpcomingMatch: true,
    }),
    getUserPointsChipTotal(dbUser.id),
    getRecentVotesForUser(dbUser.id, 10),
  ]);

  return (
    <PageShell
      active="predictions"
      rightSlot={<PointsChip points={totalPoints} />}
    >
      <header className="section-header">
        <h1 className="font-display text-4xl font-black tracking-tight text-on-surface">Match Predictions</h1>
        <p className="mt-2 max-w-2xl text-on-surface-variant">
          Live matches and upcoming fixtures from your circles.
        </p>
      </header>

      <section className="space-y-4">
        <h2 className="font-display text-xs font-black uppercase tracking-[0.2em] text-on-surface-variant">
          Pick a circle to vote
        </h2>
        {tournaments.length === 0 ? (
          <div className="card-stadium">
            <div className="text-sm font-bold text-on-surface">No circles yet</div>
            <div className="mt-2 text-sm text-on-surface-variant">
              Create a tournament to start predicting.
            </div>
            <div className="mt-4">
              <Link href="/tournaments/create" className="btn-primary h-11 px-6">
                Create Circle
              </Link>
            </div>
          </div>
        ) : (
          tournaments.map((t) => (
            <CircleCard
              key={t.id}
              href={`/tournaments/${t.id}/vote`}
              name={t.name}
              season={t.season}
              status={t.status}
              variant="prediction"
              nextMatch={t.matches[0] ?? null}
            />
          ))
        )}
      </section>

      <section className="space-y-3 rounded-xl border border-zinc-800 bg-surface-container p-4">
        <div className="flex items-center justify-between">
          <h2 className="font-display text-sm font-black uppercase tracking-widest text-on-surface">My Recent Votes</h2>
          <Link
            href="/leaderboard"
            className="text-[10px] font-bold uppercase tracking-widest text-primary-container hover:underline"
          >
            Rankings
          </Link>
        </div>

        {recentVotes.length === 0 ? (
          <p className="text-sm text-on-surface-variant">
            No vote history yet. Make your first pick from a circle above.
          </p>
        ) : (
          <div className="space-y-2">
            {recentVotes.map((vote) => (
              <div key={vote.id} className="rounded-lg border border-zinc-800 bg-zinc-950/60 p-3">
                <div className="flex items-center justify-between gap-2">
                  <p className="font-display text-sm font-black text-on-surface">
                    {vote.team1} <span className="text-zinc-500">vs</span> {vote.team2}
                  </p>
                  <span className="rounded bg-primary/10 px-2 py-0.5 text-[10px] font-bold uppercase tracking-widest text-primary">
                    Picked: {vote.teamVoted}
                  </span>
                </div>
                <p className="mt-1 text-xs text-on-surface-variant">
                  {vote.tournamentName} •{" "}
                  {new Intl.DateTimeFormat("en-IN", {
                    day: "2-digit",
                    month: "short",
                    hour: "2-digit",
                    minute: "2-digit",
                    timeZone: "Asia/Kolkata",
                  }).format(new Date(vote.createdAt))}
                </p>
                <div className="mt-2">
                  <Link
                    href={`/tournaments/${vote.tournamentId}/vote`}
                    className="text-[10px] font-bold uppercase tracking-widest text-primary-container hover:underline"
                  >
                    Open match voting
                  </Link>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>
    </PageShell>
  );
}
