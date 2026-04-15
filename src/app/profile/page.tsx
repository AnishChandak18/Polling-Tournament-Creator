import Link from "next/link";
import Image from "next/image";
import { redirect } from "next/navigation";
import SignOutButton from "@/components/auth/SignOutButton";
import CircleArenaBottomNav from "@/components/circle-arena/CircleArenaBottomNav";
import {
  getAuthContext,
  getRecentVotesForUser,
  getUserBestRankInCircles,
  getUserPointsChipTotal,
  getUserPredictionCount,
  getUserWinRateStats,
} from "@/services/server";

function outcomeForVote(row: {
  teamVoted: string;
  winnerTeam: string | null;
  matchStatus: string;
}) {
  if (row.matchStatus !== "COMPLETED" || !row.winnerTeam)
    return "pending" as const;
  return row.winnerTeam === row.teamVoted
    ? ("win" as const)
    : ("loss" as const);
}

export default async function ProfilePage() {
  const { supabaseUser, dbUser } = await getAuthContext();
  if (!supabaseUser) redirect("/login");
  if (!dbUser) redirect("/login?error=database");

  const [predictionCount, bestRank, totalPoints, winStats, recentVotes] =
    await Promise.all([
      getUserPredictionCount(dbUser.id),
      getUserBestRankInCircles(dbUser.id),
      getUserPointsChipTotal(dbUser.id),
      getUserWinRateStats(dbUser.id),
      getRecentVotesForUser(dbUser.id, 3),
    ]);

  const handle = dbUser.username
    ? `@${dbUser.username}`
    : dbUser.name || "Player";
  const winRateLabel =
    winStats.winRate != null ? winStats.winRate.toFixed(1) : "—";
  const rankLabel = bestRank != null ? `#${bestRank}` : "—";
  const milestoneCap = 10000;
  const xpPct = Math.min(100, Math.round((totalPoints / milestoneCap) * 100));
  const level = Math.max(1, Math.floor(totalPoints / 500) + 1);

  return (
    <div className="min-h-screen bg-background pb-24 text-on-background">
      <header className="fixed top-0 z-50 flex h-16 w-full items-center justify-between border-b border-zinc-800 bg-zinc-950/90 px-4 shadow-[0_0_15px_rgba(255,215,0,0.1)] backdrop-blur-md">
        <Link href="/dashboard" className="flex min-w-0 items-center gap-3">
          <div className="h-8 w-8 overflow-hidden rounded-full border border-primary-container">
            {dbUser.avatarUrl ? (
              <Image
                src={dbUser.avatarUrl}
                alt=""
                width={32}
                height={32}
                className="h-full w-full object-cover"
                unoptimized
              />
            ) : (
              <span className="flex h-full w-full items-center justify-center font-display text-sm font-bold text-on-surface">
                {(dbUser.name || "?").slice(0, 1).toUpperCase()}
              </span>
            )}
          </div>
          <span className="font-display text-xl font-black uppercase italic tracking-widest text-yellow-400">
            STADIUM PULSE
          </span>
        </Link>
        <div className="flex items-center gap-2">
          <span className="font-display font-bold uppercase tracking-tighter text-yellow-400">
            {totalPoints.toLocaleString()} PTS
          </span>
          <Link
            href="/settings"
            className="inline-flex items-center justify-center rounded-xl border border-outline-variant/30 bg-surface-container-high p-2 text-primary"
            aria-label="Settings"
          >
            <span className="material-symbols-outlined text-xl">settings</span>
          </Link>
        </div>
      </header>

      <main className="mx-auto max-w-2xl space-y-6 px-4 pt-20">
        <section className="relative overflow-hidden rounded-xl border-l-4 border-primary-container bg-surface-container p-6">
          <div className="pointer-events-none absolute right-0 top-0 opacity-10">
            <span className="material-symbols-outlined text-9xl">stadium</span>
          </div>
          <div className="relative z-10 flex flex-col items-center gap-4">
            <div className="relative">
              <div className="h-24 w-24 rounded-full bg-gradient-to-tr from-primary-container to-secondary p-1">
                {dbUser.avatarUrl ? (
                  <Image
                    src={dbUser.avatarUrl}
                    alt=""
                    width={96}
                    height={96}
                    className="h-full w-full rounded-full border-2 border-surface object-cover"
                    unoptimized
                  />
                ) : (
                  <div className="flex h-full w-full items-center justify-center rounded-full border-2 border-surface bg-surface-container font-display text-2xl font-black text-on-surface">
                    {(dbUser.name || "?").slice(0, 1).toUpperCase()}
                  </div>
                )}
              </div>
              <Link
                href="/settings"
                className="absolute bottom-0 right-0 rounded-full bg-primary-container p-1.5 text-on-primary-container shadow-lg transition-transform hover:scale-105"
                aria-label="Edit profile"
              >
                <span className="material-symbols-outlined text-sm">edit</span>
              </Link>
            </div>
            <div className="text-center">
              <div className="flex items-center justify-center gap-2">
                <h2 className="font-display text-2xl font-bold text-on-surface">
                  {handle}
                </h2>
                <Link href="/settings" className="text-on-surface-variant">
                  <span className="material-symbols-outlined text-base">
                    edit
                  </span>
                </Link>
              </div>
              <div className="mt-1 flex items-center justify-center gap-2">
                <span className="rounded-full border border-primary-container/30 bg-primary-container/20 px-3 py-0.5 font-display text-[10px] font-black uppercase tracking-widest text-primary-container">
                  Elite Strategist
                </span>
              </div>
              <p className="mt-2 text-xs font-bold uppercase tracking-widest text-outline">
                {supabaseUser.email}
              </p>
            </div>
          </div>
        </section>

        <div className="grid grid-cols-2 gap-4">
          <div className="flex flex-col justify-between rounded-lg border-t border-zinc-800 bg-surface-container-high p-4">
            <span className="text-[10px] font-bold uppercase tracking-widest text-on-surface-variant">
              Win Rate
            </span>
            <div className="mt-2 flex items-baseline gap-1">
              <span className="font-display text-3xl font-black text-primary">
                {winRateLabel}
              </span>
              {winStats.winRate != null ? (
                <span className="text-sm font-bold text-primary-container">
                  %
                </span>
              ) : null}
            </div>
          </div>
          <div className="flex flex-col justify-between rounded-lg border-t border-zinc-800 bg-surface-container-high p-4">
            <span className="text-[10px] font-bold uppercase tracking-widest text-on-surface-variant">
              Total Predictions
            </span>
            <span className="mt-2 font-display text-3xl font-black tracking-tighter text-on-surface">
              {predictionCount.toLocaleString()}
            </span>
          </div>
          <div className="flex flex-col justify-between rounded-lg border-t border-zinc-800 bg-surface-container-high p-4">
            <span className="text-[10px] font-bold uppercase tracking-widest text-on-surface-variant">
              Best rank
            </span>
            <div className="mt-2 flex items-center gap-2">
              <span className="font-display text-3xl font-black text-[#e3d845]">
                {rankLabel}
              </span>
              <span
                className="material-symbols-outlined text-[#e3d845]"
                style={{ fontVariationSettings: "'FILL' 1" }}
              >
                local_fire_department
              </span>
            </div>
          </div>
          <div className="flex flex-col justify-between rounded-lg border-t border-zinc-800 bg-surface-container-high p-4">
            <span className="text-[10px] font-bold uppercase tracking-widest text-on-surface-variant">
              Current Streak
            </span>
            <div className="mt-2 flex items-center gap-2">
              <span className="font-display text-3xl font-black text-tertiary">
                —
              </span>
              <span className="material-symbols-outlined text-tertiary">
                trending_up
              </span>
            </div>
          </div>
        </div>

        <section className="space-y-4 rounded-xl border border-zinc-800 bg-surface-container p-6">
          <div className="flex items-end justify-between">
            <div>
              <h3 className="text-[10px] font-black uppercase tracking-widest text-on-surface-variant">
                Milestone Progress
              </h3>
              <p className="mt-1 font-display text-lg font-bold leading-none">
                Level {level} Arena Operative
              </p>
            </div>
            <span className="text-xs font-bold text-primary">
              {totalPoints.toLocaleString()} / {milestoneCap.toLocaleString()}{" "}
              XP
            </span>
          </div>
          <div className="h-3 w-full overflow-hidden rounded-full border border-zinc-800 bg-surface-container-lowest">
            <div
              className="h-full rounded-full bg-gradient-to-r from-primary-container to-secondary shadow-[0_0_10px_rgba(255,215,0,0.3)]"
              style={{ width: `${xpPct}%` }}
            />
          </div>
          <p className="text-[10px] italic text-on-surface-variant">
            Next milestone: higher leaderboard tiers and bonus points in your
            circles.
          </p>
        </section>

        <section className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-xs font-black uppercase tracking-[0.2em] text-on-surface-variant">
              Recent Predictions
            </h3>
            <Link
              href="/predictions"
              className="text-[10px] font-bold uppercase tracking-widest text-primary hover:underline"
            >
              View History
            </Link>
          </div>
          <div className="space-y-3">
            {recentVotes.length === 0 ? (
              <p className="text-sm text-on-surface-variant">
                No predictions yet.
              </p>
            ) : (
              recentVotes.map((v) => {
                const o = outcomeForVote(v);
                const title = `${v.team1} vs ${v.team2} • Picked ${v.teamVoted}`;
                const date = new Intl.DateTimeFormat("en-GB", {
                  day: "numeric",
                  month: "short",
                  timeZone: "Asia/Kolkata",
                }).format(v.matchDate);
                const isWin = o === "win";
                const isLoss = o === "loss";
                return (
                  <div
                    key={v.id}
                    className={`flex items-center justify-between rounded-lg border-l-2 bg-surface-container-low p-4 transition-colors hover:bg-surface-container ${
                      isWin
                        ? "border-primary-container"
                        : isLoss
                          ? "border-error-dim"
                          : "border-zinc-700"
                    }`}
                  >
                    <div className="flex min-w-0 items-center gap-4">
                      <div
                        className={`rounded p-2 ${isWin ? "bg-primary-container/10" : isLoss ? "bg-error-container/10" : "bg-zinc-800"}`}
                      >
                        <span
                          className={`material-symbols-outlined ${isWin ? "text-primary-container" : isLoss ? "text-error-dim" : "text-zinc-500"}`}
                        >
                          sports_cricket
                        </span>
                      </div>
                      <div className="min-w-0">
                        <p className="text-sm font-bold tracking-tight text-on-surface">
                          {title}
                        </p>
                        <p className="text-[10px] font-medium text-on-surface-variant">
                          {date} • {v.tournamentName}
                        </p>
                      </div>
                    </div>
                    <div className="shrink-0 text-right">
                      {o === "pending" ? (
                        <span className="rounded-sm bg-zinc-800 px-2 py-0.5 text-[10px] font-black uppercase tracking-tighter text-zinc-400">
                          Pending
                        </span>
                      ) : (
                        <>
                          <span
                            className={`inline-block rounded-sm px-2 py-0.5 text-[10px] font-black uppercase tracking-tighter ${
                              isWin
                                ? "bg-primary-container text-on-primary-container"
                                : "bg-error-container text-on-error-container"
                            }`}
                          >
                            {isWin ? "WIN" : "LOSS"}
                          </span>
                          <p
                            className={`mt-1 text-xs font-bold ${isWin ? "text-primary-container" : "text-error-dim"}`}
                          >
                            {isWin ? "+PTS" : "—"}
                          </p>
                        </>
                      )}
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </section>

        <SignOutButton className="mt-8 flex h-14 w-full items-center justify-center gap-2 rounded-lg border border-zinc-800 bg-zinc-900 text-xs font-bold uppercase tracking-widest text-on-error hover:bg-zinc-800" />
      </main>

      <CircleArenaBottomNav active="profile" />
    </div>
  );
}
