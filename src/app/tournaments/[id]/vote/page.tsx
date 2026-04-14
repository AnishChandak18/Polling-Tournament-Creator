import Link from "next/link";
import { redirect } from "next/navigation";
import PageShell from "@/components/layout/PageShell";
import PointsChip from "@/components/ui/PointsChip";
import CircleArenaNav from "@/components/circle-arena/CircleArenaNav";
import MatchVoteCard from "@/components/voting/MatchVoteCard";
import { getAuthContext, getTournamentWithMatchesForUser, getUserPointsChipTotal } from "@/services/server";
import { asMatchDisplayMeta, groupMatchesByScheduleDay } from "@/lib/match-display";
import { canVoteOnMatch } from "@/lib/vote-window";

function isKickoffPast(matchDate: Date) {
  return matchDate.getTime() < Date.now();
}

export default async function TournamentVotePage({
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

  const liveMatches = tournament.matches.filter((m) => m.status === "LIVE");
  const upcomingMatches = tournament.matches.filter(
    (m) => m.status === "UPCOMING" && !isKickoffPast(m.matchDate)
  );
  /** Includes COMPLETED and stale UPCOMING (kickoff passed but sync not updated yet). */
  const completed = tournament.matches.filter(
    (m) => m.status === "COMPLETED" || (m.status === "UPCOMING" && isKickoffPast(m.matchDate))
  );

  type M = (typeof tournament.matches)[number];

  function groupedCards(matches: M[]) {
    return groupMatchesByScheduleDay(matches).map(({ label, matches: ms }) => (
      <div key={label} className="space-y-2">
        <h3 className="px-1 font-display text-xs font-black uppercase tracking-widest text-on-surface-variant">
          {label}
        </h3>
        <div className="space-y-3">
          {ms.map((m) => (
            <MatchVoteCard
              key={m.id}
              match={{
                id: m.id,
                team1: m.team1,
                team2: m.team2,
                matchDate: m.matchDate.toISOString(),
                venue: m.venue,
                status: m.status,
                winnerTeam: m.winnerTeam ?? null,
                displayMeta: asMatchDisplayMeta(m.displayMeta),
              }}
              existingVoteTeam={m.votes?.[0]?.teamVoted ?? null}
              canVote={canVoteOnMatch(m.matchDate, m.status)}
            />
          ))}
        </div>
      </div>
    ));
  }

  return (
    <PageShell
      active="predictions"
      maxWidth="max-w-3xl"
      rightSlot={<PointsChip points={totalPoints} />}
    >
      <div className="mb-2">
        <Link
          href={`/tournaments/${tournament.id}`}
          className="text-xs font-bold uppercase tracking-widest text-primary hover:underline"
        >
          ← Back to circle
        </Link>
      </div>

      <CircleArenaNav tournamentId={tournament.id} hasLive={liveMatches.length > 0} />

      <header>
        <p className="text-xs font-bold uppercase tracking-widest text-on-surface-variant">
          {tournament.name} · IPL {tournament.season}
        </p>
        <h1 className="font-display text-3xl font-black tracking-tight text-on-surface sm:text-4xl">
          Cast your vote
        </h1>
        <p className="mt-2 text-sm text-on-surface-variant">
          Pick a team for each upcoming match. You can vote or change your pick until 30 minutes before kickoff.
        </p>
      </header>

      {tournament.matches.length === 0 ? (
        <div className="rounded-2xl border border-zinc-800 bg-zinc-900/40 p-6 text-center text-on-surface-variant">
          No fixtures available for this season yet.
        </div>
      ) : (
        <div className="space-y-10">
          {liveMatches.length > 0 ? (
            <section className="space-y-4">
              <h2 className="font-display text-sm font-black uppercase tracking-widest text-secondary">Live now</h2>
              <div className="space-y-6">{groupedCards(liveMatches)}</div>
            </section>
          ) : null}

          {upcomingMatches.length > 0 ? (
            <section className="space-y-4">
              <h2 className="font-display text-sm font-black uppercase tracking-widest text-secondary">
                Upcoming
              </h2>
              <div className="space-y-6">{groupedCards(upcomingMatches)}</div>
            </section>
          ) : null}

          {completed.length > 0 ? (
            <section className="space-y-4">
              <h2 className="font-display text-sm font-black uppercase tracking-widest text-on-surface-variant">
                Completed
              </h2>
              <div className="space-y-6 opacity-90">{groupedCards(completed)}</div>
            </section>
          ) : null}
        </div>
      )}
    </PageShell>
  );
}
