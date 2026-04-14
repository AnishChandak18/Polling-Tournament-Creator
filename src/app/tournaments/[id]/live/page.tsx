import Link from "next/link";
import { redirect } from "next/navigation";
import LiveArenaTopBar from "@/components/live-arena/LiveArenaTopBar";
import LiveArenaClient from "@/components/live-arena/LiveArenaClient";
import CircleArenaBottomNav from "@/components/circle-arena/CircleArenaBottomNav";
import { getAuthContext, getTournamentWithMatchesForUser, getUserPointsChipTotal } from "@/services/server";

export default async function TournamentLiveArenaPage({
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

  const live = tournament.matches.find((m) => m.status === "LIVE");
  if (!live) redirect(`/tournaments/${tournamentId}`);

  return (
    <div className="min-h-[max(884px,100dvh)] bg-background font-body text-on-background selection:bg-primary selection:text-on-primary-container">
      <LiveArenaTopBar
        avatarUrl={dbUser.avatarUrl}
        points={totalPoints}
        userName={dbUser.name ?? dbUser.email ?? "?"}
      />
      <div className="fixed left-4 top-20 z-40">
        <Link
          href={`/tournaments/${tournamentId}`}
          className="font-headline text-[10px] font-bold uppercase tracking-widest text-zinc-500 hover:text-primary"
        >
          ← Back to circle
        </Link>
      </div>
      <LiveArenaClient matchId={live.id} team1={live.team1} team2={live.team2} />
      <CircleArenaBottomNav active="home" />
    </div>
  );
}
