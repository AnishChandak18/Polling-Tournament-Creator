import Image from "next/image";
import Link from "next/link";
import { redirect } from "next/navigation";
import PageShell from "@/components/layout/PageShell";
import PointsChip from "@/components/ui/PointsChip";
import CircleArenaNav from "@/components/circle-arena/CircleArenaNav";
import {
  getAuthContext,
  getTournamentLeaderboardForUser,
  getTournamentWithMatchesForUser,
  getUserPointsChipTotal,
} from "@/services/server";

export default async function TournamentLeaderboardPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { supabaseUser, dbUser } = await getAuthContext();
  if (!supabaseUser) redirect("/login");
  if (!dbUser) redirect("/login?error=database");

  const { id: tournamentId } = await params;
  const [data, totalPoints, tournamentWithMatches] = await Promise.all([
    getTournamentLeaderboardForUser(tournamentId, dbUser.id),
    getUserPointsChipTotal(dbUser.id),
    getTournamentWithMatchesForUser(tournamentId, dbUser.id),
  ]);
  if (!data || !tournamentWithMatches) redirect("/tournaments");

  const { tournament, leaderboard } = data;
  const hasLive = tournamentWithMatches.matches.some((m) => m.status === "LIVE");
  const topThree = leaderboard.slice(0, 3);

  return (
    <PageShell
      active="leaderboard"
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

      <CircleArenaNav tournamentId={tournament.id} hasLive={hasLive} />

      <header>
        <p className="text-xs font-bold uppercase tracking-widest text-on-surface-variant">
          {tournament.name} · IPL {tournamentWithMatches.season}
        </p>
        <h1 className="font-display text-3xl font-black tracking-tight text-on-surface sm:text-4xl">
          Leaderboard
        </h1>
        <p className="mt-2 text-sm text-on-surface-variant">
          Full standings for this circle — points from correct match predictions.
        </p>
      </header>

      {leaderboard.length === 0 ? (
        <div className="rounded-2xl border border-zinc-800 bg-zinc-900/40 p-8 text-center text-sm text-on-surface-variant">
          No leaderboard entries yet. Play matches and earn points when your picks win.
        </div>
      ) : (
        <div className="space-y-10">
          {topThree.length > 0 ? (
            <section className="space-y-4">
              <h2 className="font-display text-sm font-black uppercase tracking-widest text-secondary">Top 3</h2>
              <div className="grid gap-4 md:grid-cols-3">
                {topThree.map((row, idx) => (
                  <div
                    key={`${row.userId}-podium-${idx}`}
                    className={[
                      "group relative border border-zinc-800 bg-zinc-900/50 p-1 transition-all hover:border-primary/40",
                      idx === 0 ? "md:-mt-1 md:shadow-[0_0_24px_rgba(255,215,0,0.12)]" : "",
                    ].join(" ")}
                  >
                    <div className="border border-zinc-800/50 p-4">
                      <div className="mb-3 flex items-center justify-between">
                        <span
                          className={[
                            "font-headline text-[10px] font-bold uppercase tracking-widest",
                            idx === 0 ? "text-primary" : "text-zinc-500",
                          ].join(" ")}
                        >
                          Rank #{idx + 1}
                        </span>
                        <span className="material-symbols-outlined text-zinc-700 group-hover:text-primary/50">
                          {idx === 0 ? "military_tech" : "shield"}
                        </span>
                      </div>
                      <div className="mb-3 flex justify-center">
                        <div className="relative h-16 w-16 overflow-hidden border border-zinc-700 bg-zinc-800">
                          {row.user.avatarUrl ? (
                            <Image
                              src={row.user.avatarUrl}
                              alt=""
                              fill
                              sizes="64px"
                              className="object-cover"
                              unoptimized
                            />
                          ) : (
                            <span className="flex h-full w-full items-center justify-center font-headline text-sm font-bold text-zinc-500">
                              {(row.user.name ?? row.user.email ?? "?").slice(0, 1).toUpperCase()}
                            </span>
                          )}
                        </div>
                      </div>
                      <div className="text-center">
                        <div className="font-headline text-sm font-bold uppercase tracking-tight text-on-surface">
                          {row.user.name ?? row.user.email}
                        </div>
                        {row.user.name ? (
                          <div className="mt-1 truncate font-headline text-[10px] text-zinc-500">{row.user.email}</div>
                        ) : null}
                        <div
                          className={[
                            "mt-3 font-headline text-2xl font-black tabular-nums",
                            idx === 0 ? "text-primary" : "text-zinc-200",
                          ].join(" ")}
                        >
                          {row.score.toLocaleString()}
                          <span className="ml-1 text-xs font-bold text-zinc-500">PTS</span>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </section>
          ) : null}

          <section className="space-y-4">
            <h2 className="font-display text-sm font-black uppercase tracking-widest text-on-surface-variant">
              Full standings
            </h2>
            <div className="relative border border-zinc-800 bg-zinc-900/50">
              <div className="grid grid-cols-[52px_1fr_88px] gap-2 border-b border-zinc-800 bg-zinc-950/60 px-3 py-3 font-headline text-[10px] font-bold uppercase tracking-widest text-zinc-500">
                <div>#</div>
                <div>Player</div>
                <div className="text-right">Score</div>
              </div>
              <div className="divide-y divide-zinc-800/80">
                {leaderboard.map((row, idx) => {
                  const isYou = row.userId === dbUser.id;
                  return (
                    <div
                      key={`${row.userId}-${idx}`}
                      className={[
                        "grid grid-cols-[52px_1fr_88px] items-center gap-2 px-3 py-3 font-headline text-sm",
                        isYou ? "bg-primary/10" : "bg-transparent",
                      ].join(" ")}
                    >
                      <div className={isYou ? "font-black italic text-primary" : "text-zinc-500"}>
                        {String(idx + 1).padStart(2, "0")}
                      </div>
                      <div className="flex min-w-0 items-center gap-3">
                        <div className="relative h-9 w-9 shrink-0 overflow-hidden border border-zinc-700 bg-zinc-800">
                          {row.user.avatarUrl ? (
                            <Image
                              src={row.user.avatarUrl}
                              alt=""
                              fill
                              sizes="36px"
                              className="object-cover"
                              unoptimized
                            />
                          ) : (
                            <span className="flex h-full w-full items-center justify-center text-[10px] font-bold text-zinc-500">
                              {(row.user.name ?? row.user.email ?? "?").slice(0, 1).toUpperCase()}
                            </span>
                          )}
                        </div>
                        <div className="min-w-0">
                          <div className="truncate font-bold uppercase tracking-tight text-on-surface">
                            {row.user.name ?? row.user.email}
                          </div>
                          {row.user.name ? (
                            <div className="truncate text-[10px] text-zinc-500">{row.user.email}</div>
                          ) : null}
                        </div>
                      </div>
                      <div className="text-right font-black tabular-nums text-on-surface">{row.score.toLocaleString()}</div>
                    </div>
                  );
                })}
              </div>
            </div>
          </section>
        </div>
      )}
    </PageShell>
  );
}
