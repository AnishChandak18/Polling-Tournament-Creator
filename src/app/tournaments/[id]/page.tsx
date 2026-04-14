import Link from "next/link";
import { redirect } from "next/navigation";
import {
  getAuthContext,
  getTournamentWithMatchesForUser,
  getTournamentMemberCount,
  getTournamentLeaderboardForUser,
  getUserPointsChipTotal,
  getUserRankInTournament,
  scheduleFixtureSyncForUser,
} from "@/services/server";
import { asMatchDisplayMeta } from "@/lib/match-display";
import { canVoteOnMatch } from "@/lib/vote-window";
import CircleArenaTopBar from "@/components/circle-arena/CircleArenaTopBar";
import CircleArenaBottomNav from "@/components/circle-arena/CircleArenaBottomNav";
import CircleArenaNav from "@/components/circle-arena/CircleArenaNav";
import CircleArenaMatchCard from "@/components/circle-arena/CircleArenaMatchCard";
import CircleArenaLeaderboard from "@/components/circle-arena/CircleArenaLeaderboard";
import CircleArenaInvite from "@/components/circle-arena/CircleArenaInvite";

export default async function TournamentDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { supabaseUser, dbUser } = await getAuthContext();
  if (!supabaseUser) redirect("/login");
  if (!dbUser) redirect("/login?error=database");

  const { id: tournamentId } = await params;
  const [tournament, totalPoints, memberCount, leaderboardData, userRank] = await Promise.all([
    getTournamentWithMatchesForUser(tournamentId, dbUser.id),
    getUserPointsChipTotal(dbUser.id),
    getTournamentMemberCount(tournamentId),
    getTournamentLeaderboardForUser(tournamentId, dbUser.id),
    getUserRankInTournament(dbUser.id, tournamentId),
  ]);

  if (!tournament) redirect("/tournaments");

  await scheduleFixtureSyncForUser(dbUser.id);

  const visibleMatches = tournament.matches
    .filter((m) => m.status !== "COMPLETED")
    .sort((a, b) => a.matchDate.getTime() - b.matchDate.getTime());

  const isOwner = tournament.ownerId === dbUser.id;

  const leaderboardTop = (leaderboardData?.leaderboard ?? []).slice(0, 3).map((row, i) => ({
    rank: i + 1,
    displayName: row.user.name?.trim() || row.user.email?.split("@")[0] || "Player",
    score: row.score,
    avatarUrl: row.user.avatarUrl,
  }));

  const circleIdLabel = `#${tournament.id.replace(/[^a-z0-9]/gi, "").slice(0, 8).toUpperCase()}`;
  const liveMatch = tournament.matches.find((m) => m.status === "LIVE");

  return (
    <div className="min-h-[max(884px,100dvh)] bg-background font-body text-on-background selection:bg-primary selection:text-on-primary">
      <CircleArenaTopBar
        avatarUrl={dbUser.avatarUrl}
        points={totalPoints}
        userName={dbUser.name ?? dbUser.email ?? "?"}
      />

      <main className="mx-auto max-w-5xl px-4 pb-24 pt-20 kinetic-grid">
        <section className="relative mb-8">
          <div className="absolute -left-4 top-0 h-16 w-1 bg-primary" aria-hidden />
          <div className="pl-4">
            <div className="mb-1 flex items-center gap-2">
              <span className="border border-primary/20 bg-primary/10 px-2 py-0.5 font-headline text-[10px] font-bold uppercase tracking-widest text-primary">
                Active Circle
              </span>
              <span className="font-headline text-[10px] font-medium uppercase tracking-widest text-zinc-500">
                ID: {circleIdLabel}
              </span>
            </div>
            <h2 className="font-headline text-4xl font-black uppercase italic tracking-tighter text-on-background">
              {tournament.name}
            </h2>
            <p className="mt-1 flex items-center gap-2 text-sm text-zinc-500">
              <span className="material-symbols-outlined text-sm">group</span>
              {memberCount} Members active in this hub
            </p>
          </div>
        </section>

        <CircleArenaNav tournamentId={tournament.id} hasLive={!!liveMatch} />

        {liveMatch ? (
          <Link
            href={`/tournaments/${tournament.id}/live`}
            className="mb-6 flex items-center justify-between gap-3 rounded-lg border border-primary/40 bg-primary/10 px-4 py-3 font-headline text-sm font-bold uppercase tracking-wider text-primary transition-colors hover:bg-primary/20"
          >
            <span className="flex items-center gap-2">
              <span className="relative flex h-2 w-2">
                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-red-500 opacity-75" />
                <span className="relative inline-flex h-2 w-2 rounded-full bg-red-500" />
              </span>
              Live match in progress — open arena
            </span>
            <span className="material-symbols-outlined">chevron_right</span>
          </Link>
        ) : null}

        <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
          {visibleMatches.length === 0 ? (
            <div className="col-span-full border border-zinc-800 bg-zinc-900/50 p-8 text-center text-zinc-500">
              No fixtures available for this season yet.
            </div>
          ) : (
            visibleMatches.map((m) => (
              <CircleArenaMatchCard
                key={m.id}
                match={{
                  id: m.id,
                  team1: m.team1,
                  team2: m.team2,
                  matchDate: m.matchDate.toISOString(),
                  venue: m.venue,
                  status: m.status,
                }}
                displayMeta={asMatchDisplayMeta(m.displayMeta)}
                canVote={canVoteOnMatch(m.matchDate, m.status)}
              />
            ))
          )}
        </div>

        <CircleArenaLeaderboard tournamentId={tournament.id} userRank={userRank} rows={leaderboardTop} />

        <CircleArenaInvite tournamentId={tournament.id} isOwner={isOwner} />
      </main>

      <CircleArenaBottomNav active="circles" />
    </div>
  );
}
