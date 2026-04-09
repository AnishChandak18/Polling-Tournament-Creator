import { redirect } from "next/navigation";
import Link from "next/link";
import MatchVoteCard from "@/components/voting/MatchVoteCard";
import BackButton from "@/components/common/BackButton";
import InviteToCircleClient from "@/components/circles/InviteToCircleClient";
import { getAuthContext, getTournamentWithMatchesForUser } from "@/services/server";
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
  const tournament = await getTournamentWithMatchesForUser(tournamentId, dbUser.id);

  if (!tournament) redirect("/tournaments");

  const scheduleGroups = groupMatchesByScheduleDay(tournament.matches);
  const isOwner = tournament.ownerId === dbUser.id;

  return (
    <main className="min-h-screen bg-background bg-stadium-mesh p-6 text-on-surface">
      <div className="mx-auto max-w-5xl">
        <BackButton fallbackHref="/tournaments" className="mb-4" />
        <section className="glass-card rounded-2xl p-6 sm:p-8">
          <div className="flex flex-wrap items-start justify-between gap-4">
            <div>
              <div className="text-xs font-black uppercase tracking-widest text-primary">
                Match Prediction Arena
              </div>
              <h1 className="font-display mt-2 text-4xl font-black uppercase italic">{tournament.name}</h1>
              <p className="mt-1 text-on-surface-variant">IPL {tournament.season}</p>
            </div>
            <div className="flex flex-wrap gap-2">
              <Link
                className="btn-primary h-10 px-4 text-xs"
                href={`/tournaments/${tournament.id}/vote`}
              >
                Vote
              </Link>
              <Link
                className="inline-flex items-center rounded-xl border border-outline-variant px-4 py-2 text-xs font-black uppercase tracking-wider text-on-surface hover:bg-surface-container-high"
                href={`/tournaments/${tournament.id}/leaderboard`}
              >
                Leaderboard
              </Link>
            </div>
          </div>

          <div className="mt-6 grid gap-3 sm:grid-cols-3">
            <div className="rounded-xl border border-outline-variant/15 bg-surface-container-high p-4">
              <div className="text-xs uppercase tracking-wider text-on-surface-variant">Total Matches</div>
              <div className="mt-1 font-display text-2xl font-black">{tournament.matches.length}</div>
            </div>
            <div className="rounded-xl border border-outline-variant/15 bg-surface-container-high p-4">
              <div className="text-xs uppercase tracking-wider text-on-surface-variant">Open Today</div>
              <div className="mt-1 font-display text-2xl font-black">
                {
                  tournament.matches.filter((m) => m.status === "UPCOMING" && isTodayUtc(m.matchDate))
                    .length
                }
              </div>
            </div>
            <div className="rounded-xl border border-outline-variant/15 bg-surface-container-high p-4">
              <div className="text-xs uppercase tracking-wider text-on-surface-variant">Completed</div>
              <div className="mt-1 font-display text-2xl font-black">
                {tournament.matches.filter((m) => m.status === "COMPLETED").length}
              </div>
            </div>
          </div>

          <InviteToCircleClient tournamentId={tournament.id} isOwner={isOwner} />

          <div className="mt-6 overflow-hidden rounded-2xl border border-outline-variant/15 bg-surface-container-low/50">
            <div className="border-b border-outline-variant/15 p-4 font-display text-sm font-black uppercase tracking-wider">
              Matches
            </div>
            <div className="divide-y divide-outline-variant/10">
              {tournament.matches.length === 0 ? (
                <div className="p-4 text-on-surface-variant">No fixtures available for this season yet.</div>
              ) : (
                scheduleGroups.map(({ label, matches }) => (
                  <div key={label}>
                    <div className="border-b border-outline-variant/10 bg-surface-container-high/50 px-4 py-2 text-xs font-black uppercase tracking-widest text-primary">
                      {label}
                    </div>
                    <div className="divide-y divide-outline-variant/10">
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
      </div>
    </main>
  );
}

