import Link from "next/link";
import { redirect } from "next/navigation";
import PageShell from "@/components/layout/PageShell";
import PointsChip from "@/components/ui/PointsChip";
import MatchVoteCard from "@/components/voting/MatchVoteCard";
import { getAuthContext, getTournamentWithMatchesForUser } from "@/services/server";
import { asMatchDisplayMeta, groupMatchesByScheduleDay } from "@/lib/match-display";
import { isPastIst, isTodayIst } from "@/lib/ist";

export default async function TournamentVotePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { supabaseUser, dbUser } = await getAuthContext();
  if (!supabaseUser) redirect("/login");
  if (!dbUser) redirect("/login?error=database");

  const { id: tournamentId } = await params;
  const tournament = await getTournamentWithMatchesForUser(tournamentId, dbUser.id);
  if (!tournament) redirect("/tournaments");

  const points = 1240;

  const voteToday = tournament.matches.filter((m) => m.status === "UPCOMING" && isTodayIst(m.matchDate));
  const upcomingOther = tournament.matches.filter(
    (m) => m.status === "UPCOMING" && !isTodayIst(m.matchDate) && !isPastIst(m.matchDate)
  );
  const completed = tournament.matches.filter((m) => m.status === "COMPLETED" || isPastIst(m.matchDate));

  type M = (typeof tournament.matches)[number];

  function groupedCards(matches: M[], canVoteFlag: boolean) {
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
                displayMeta: asMatchDisplayMeta(m.displayMeta),
              }}
              existingVoteTeam={m.votes?.[0]?.teamVoted ?? null}
              canVote={canVoteFlag}
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
      rightSlot={<PointsChip points={points} />}
    >
      <div className="mb-2">
        <Link
          href={`/tournaments/${tournament.id}`}
          className="text-xs font-bold uppercase tracking-widest text-primary hover:underline"
        >
          ← Back to circle
        </Link>
      </div>

      <header>
        <p className="text-xs font-bold uppercase tracking-widest text-on-surface-variant">
          {tournament.name} · IPL {tournament.season}
        </p>
        <h1 className="font-display text-3xl font-black tracking-tight text-on-surface sm:text-4xl">
          Cast your vote
        </h1>
        <p className="mt-2 text-sm text-on-surface-variant">
          Pick a team for each match. Voting opens on match day only.
        </p>
      </header>

      {tournament.matches.length === 0 ? (
        <div className="glass-card rounded-2xl p-6 text-center text-on-surface-variant">
          No fixtures available for this season yet.
        </div>
      ) : (
        <div className="space-y-10">
          {voteToday.length > 0 ? (
            <section className="space-y-4">
              <h2 className="font-display text-sm font-black uppercase tracking-widest text-secondary">
                Open today
              </h2>
              <div className="space-y-6">{groupedCards(voteToday, true)}</div>
            </section>
          ) : null}

          {upcomingOther.length > 0 ? (
            <section className="space-y-4">
              <h2 className="font-display text-sm font-black uppercase tracking-widest text-on-surface-variant">
                Upcoming
              </h2>
              <div className="space-y-6">{groupedCards(upcomingOther, false)}</div>
            </section>
          ) : null}

          {completed.length > 0 ? (
            <section className="space-y-4">
              <h2 className="font-display text-sm font-black uppercase tracking-widest text-on-surface-variant">
                Completed
              </h2>
              <div className="space-y-6 opacity-90">{groupedCards(completed, false)}</div>
            </section>
          ) : null}
        </div>
      )}
    </PageShell>
  );
}
