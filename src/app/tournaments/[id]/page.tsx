import { redirect } from "next/navigation";
import Link from "next/link";
import PageShell from "@/components/layout/PageShell";
import PointsChip from "@/components/ui/PointsChip";
import MatchVoteCard from "@/components/voting/MatchVoteCard";
import BackButton from "@/components/common/BackButton";
import InviteToCircleClient from "@/components/circles/InviteToCircleClient";
import LiveMatchViewClient from "@/components/matches/LiveMatchViewClient";
import {
  getAuthContext,
  getTournamentWithMatchesForUser,
  getUserPointsChipTotal,
  scheduleFixtureSyncForUser,
} from "@/services/server";
import { asMatchDisplayMeta, groupMatchesByScheduleDay } from "@/lib/match-display";

function isTodayUtc(date: Date) {
  const now = new Date();
  const start = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate()));
  const end = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate() + 1));
  return date >= start && date < end;
}

export default async function TournamentDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { supabaseUser, dbUser } = await getAuthContext();
  if (!supabaseUser) redirect("/login");
  if (!dbUser) redirect("/login?error=database");

  const { id: tournamentId } = await params;
  const [tournament, totalPoints] = await Promise.all([
    getTournamentWithMatchesForUser(tournamentId, dbUser.id),
    getUserPointsChipTotal(dbUser.id),
  ]);

  if (!tournament) redirect("/tournaments");

  await scheduleFixtureSyncForUser(dbUser.id);

  const visibleMatches = tournament.matches.filter((m) => m.status !== "COMPLETED");
  const scheduleGroups = groupMatchesByScheduleDay(visibleMatches);
  const isOwner = tournament.ownerId === dbUser.id;
  const liveMatch =
    visibleMatches.find((m) => m.status === "LIVE") ??
    visibleMatches.find((m) => m.status === "UPCOMING");

  return (
    <PageShell active="circles" maxWidth="max-w-5xl" className="px-4" rightSlot={<PointsChip points={totalPoints} />}>
      <BackButton fallbackHref="/tournaments" className="mb-2" />

      <section className="relative overflow-hidden rounded-xl border border-zinc-800 bg-surface-container p-6 sm:p-8">
        <div className="pointer-events-none absolute inset-0 hud-scanline-light opacity-30" />
        <div className="relative z-10 flex flex-wrap items-start justify-between gap-4">
          <div>
            <div className="font-display text-xs font-black uppercase tracking-[0.2em] text-primary-container">
              Circle Arena
            </div>
            <h1 className="font-display mt-2 text-4xl font-black uppercase italic tracking-tighter text-on-surface">
              {tournament.name}
            </h1>
            <p className="mt-1 text-on-surface-variant">IPL {tournament.season}</p>
          </div>
          <div className="flex flex-wrap gap-2">
            <Link className="btn-primary h-10 px-4 text-xs" href={`/tournaments/${tournament.id}/vote`}>
              Vote
            </Link>
            <Link
              className="inline-flex items-center rounded-xl border border-zinc-800 bg-zinc-950 px-4 py-2 text-xs font-black uppercase tracking-wider text-on-surface hover:border-primary-container"
              href={`/tournaments/${tournament.id}/leaderboard`}
            >
              Leaderboard
            </Link>
            <Link
              className="inline-flex items-center rounded-xl border border-zinc-800 bg-zinc-950 px-4 py-2 text-xs font-black uppercase tracking-wider text-on-surface hover:border-primary-container"
              href={`/tournaments/${tournament.id}/history`}
            >
              History
            </Link>
          </div>
        </div>

        <div className="relative z-10 mt-6 grid gap-3 sm:grid-cols-3">
          <div className="rounded-xl border border-zinc-800 bg-zinc-950/50 p-4">
            <div className="text-xs uppercase tracking-wider text-zinc-500">Total Matches</div>
            <div className="mt-1 font-display text-2xl font-black text-on-surface">{visibleMatches.length}</div>
          </div>
          <div className="rounded-xl border border-zinc-800 bg-zinc-950/50 p-4">
            <div className="text-xs uppercase tracking-wider text-zinc-500">Open Today</div>
            <div className="mt-1 font-display text-2xl font-black text-on-surface">
              {visibleMatches.filter((m) => m.status === "UPCOMING" && isTodayUtc(m.matchDate)).length}
            </div>
          </div>
          <div className="rounded-xl border border-zinc-800 bg-zinc-950/50 p-4">
            <div className="text-xs uppercase tracking-wider text-zinc-500">Completed</div>
            <div className="mt-1 font-display text-2xl font-black text-on-surface">
              {tournament.matches.filter((m) => m.status === "COMPLETED").length}
            </div>
          </div>
        </div>

        <div className="relative z-10 mt-6">
          <InviteToCircleClient tournamentId={tournament.id} isOwner={isOwner} />
        </div>
        {liveMatch ? <LiveMatchViewClient matchId={liveMatch.id} /> : null}

        <div className="relative z-10 mt-6 overflow-hidden rounded-xl border border-zinc-800 bg-zinc-950/50">
          <div className="border-b border-zinc-800 p-4 font-display text-sm font-black uppercase tracking-wider text-on-surface">
            Matches
          </div>
          <div className="divide-y divide-zinc-800/80">
            {visibleMatches.length === 0 ? (
              <div className="p-4 text-on-surface-variant">No fixtures available for this season yet.</div>
            ) : (
              scheduleGroups.map(({ label, matches }) => (
                <div key={label}>
                  <div className="border-b border-zinc-800 bg-zinc-900/50 px-4 py-2 text-xs font-black uppercase tracking-widest text-primary-container">
                    {label}
                  </div>
                  <div className="divide-y divide-zinc-800/80">
                    {matches.map((m) => (
                      <MatchVoteCard
                        key={m.id}
                        match={{
                          id: m.id,
                          team1: m.team1,
                          team2: m.team2,
                          matchDate: m.matchDate.toISOString(),
                          venue: m.venue,
                          status: m.status,
                          displayMeta: asMatchDisplayMeta(m.displayMeta),
                        }}
                        existingVoteTeam={m.votes?.[0]?.teamVoted ?? null}
                        canVote={m.status === "UPCOMING" && isTodayUtc(m.matchDate)}
                      />
                    ))}
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </section>
    </PageShell>
  );
}
