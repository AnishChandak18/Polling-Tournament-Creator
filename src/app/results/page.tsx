import Link from "next/link";
import Image from "next/image";
import { redirect } from "next/navigation";
import CircleArenaBottomNav from "@/components/circle-arena/CircleArenaBottomNav";
import { getAuthContext, getUserBestRankInCircles, getUserPointsChipTotal } from "@/services/server";

export default async function ResultsPage() {
  const { supabaseUser, dbUser } = await getAuthContext();
  if (!supabaseUser) redirect("/login");
  if (!dbUser) redirect("/login?error=database");

  const [totalPoints, bestRank] = await Promise.all([
    getUserPointsChipTotal(dbUser.id),
    getUserBestRankInCircles(dbUser.id),
  ]);

  const rankDisplay = bestRank != null ? `#${bestRank}` : "#—";
  const circlePct = bestRank != null ? Math.min(99, Math.max(5, 100 - bestRank)) : 50;
  const dashOffset = 314 - (314 * circlePct) / 100;

  return (
    <div className="min-h-screen bg-[#0e0e10] pb-32 text-on-background selection:bg-primary selection:text-on-primary-container">
      <header className="fixed top-0 z-50 flex h-16 w-full items-center justify-between border-b border-zinc-800 bg-zinc-950/90 px-4 shadow-[0_0_15px_rgba(255,215,0,0.1)] backdrop-blur-md">
        <Link href="/dashboard" className="flex min-w-0 items-center gap-3">
          <div className="h-8 w-8 overflow-hidden rounded-full border border-yellow-400/30">
            {dbUser.avatarUrl ? (
              <Image src={dbUser.avatarUrl} alt="" width={32} height={32} className="h-full w-full object-cover" unoptimized />
            ) : (
              <span className="flex h-full w-full items-center justify-center font-headline text-xs font-bold text-zinc-400">
                {(dbUser.name || "?").slice(0, 1).toUpperCase()}
              </span>
            )}
          </div>
          <span className="font-headline text-xl font-black uppercase italic tracking-widest text-yellow-400">
            STADIUM PULSE
          </span>
        </Link>
        <div className="flex items-center">
          <span className="rounded-full border border-yellow-400/20 bg-zinc-900 px-4 py-1.5 font-headline text-sm font-bold text-yellow-400 transition-colors hover:bg-zinc-800 active:scale-95 active:duration-100">
            {totalPoints.toLocaleString()} PTS
          </span>
        </div>
      </header>

      <main className="mx-auto max-w-lg px-4 pb-32 pt-24">
        <div className="mb-8 text-center">
          <h1 className="font-headline text-4xl font-black uppercase italic tracking-tighter text-yellow-400">RESULTS LOGGED</h1>
          <div className="mx-auto mt-2 h-1 w-16 bg-yellow-400" />
        </div>

        <div className="relative mb-6 overflow-hidden rounded-lg border border-zinc-800 bg-surface-container shadow-2xl">
          <div className="absolute right-0 top-0 p-3">
            <span className="flex items-center gap-1 rounded bg-tertiary-container px-2 py-0.5 font-headline text-[10px] font-black uppercase tracking-widest text-on-tertiary-container">
              <span className="material-symbols-outlined !text-[12px]" style={{ fontVariationSettings: "'FILL' 1" }}>
                verified
              </span>
              PREDICTION SUCCESSFUL
            </span>
          </div>
          <div className="p-6">
            <div className="mb-6 flex items-center justify-between pt-4">
              <div className="text-center">
                <div className="mx-auto mb-2 flex h-14 w-14 items-center justify-center rounded-full border border-zinc-700 bg-zinc-900">
                  <span className="font-headline text-xl font-black text-white">YOU</span>
                </div>
                <p className="font-headline text-[10px] font-bold uppercase tracking-widest text-zinc-500">YOUR RUN</p>
              </div>
              <div className="flex flex-col items-center">
                <span className="font-headline text-2xl font-black italic text-zinc-600">VS</span>
                <div className="mt-1 rounded-md border border-zinc-800 bg-zinc-950 px-3 py-1">
                  <span className="font-headline text-sm font-bold text-yellow-400">COMPLETED</span>
                </div>
              </div>
              <div className="text-center">
                <div className="mx-auto mb-2 flex h-14 w-14 items-center justify-center rounded-full border border-zinc-700 bg-zinc-900">
                  <span className="font-headline text-xl font-black text-white">IPL</span>
                </div>
                <p className="font-headline text-[10px] font-bold uppercase tracking-widest text-zinc-500">SEASON</p>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="flex flex-col items-center justify-center border border-zinc-800/50 bg-zinc-950/50 p-4">
                <span className="mb-1 font-headline text-[10px] font-bold uppercase tracking-widest text-zinc-500">ACCURACY</span>
                <span className="font-headline text-3xl font-black italic tracking-tighter text-white">
                  {bestRank != null ? Math.min(99, 70 + Math.min(29, 30 - bestRank)) : "—"}
                  <span className="text-yellow-400">%</span>
                </span>
              </div>
              <div className="flex flex-col items-center justify-center border border-zinc-800/50 bg-zinc-950/50 p-4">
                <span className="mb-1 font-headline text-[10px] font-bold uppercase tracking-widest text-zinc-500">MULTIPLIER</span>
                <span className="font-headline text-3xl font-black italic tracking-tighter text-white">x2.4</span>
              </div>
            </div>
          </div>
          <div className="flex items-center justify-between border-t border-yellow-400/20 bg-yellow-400/10 p-4">
            <span className="font-headline text-xs font-black uppercase tracking-widest text-yellow-400">Total Earnings</span>
            <span className="font-headline text-2xl font-black text-yellow-400">+{totalPoints.toLocaleString()} ARENA POINTS</span>
          </div>
        </div>

        <div className="mb-8 grid grid-cols-6 gap-3">
          <div className="relative col-span-4 flex flex-col items-center justify-center overflow-hidden border border-zinc-800 bg-surface-container-high p-5">
            <div className="pointer-events-none absolute inset-0 opacity-10">
              <div className="h-full w-full bg-gradient-to-t from-primary/20 to-transparent" />
            </div>
            <div className="relative z-10 text-center">
              <span className="mb-3 block font-headline text-[10px] font-bold uppercase tracking-widest text-zinc-500">
                Global Ranking Update
              </span>
              <div className="relative flex h-28 w-28 items-center justify-center">
                <svg className="absolute h-full w-full -rotate-90" viewBox="0 0 112 112">
                  <circle cx="56" cy="56" r="50" fill="transparent" stroke="#1f1f22" strokeWidth="8" />
                  <circle
                    cx="56"
                    cy="56"
                    r="50"
                    fill="transparent"
                    stroke="#ffd709"
                    strokeWidth="8"
                    strokeDasharray="314"
                    strokeDashoffset={dashOffset}
                  />
                </svg>
                <div className="absolute inset-0 flex flex-col items-center justify-center">
                  <span className="font-headline text-2xl font-black text-white">{rankDisplay}</span>
                  <span className="font-headline text-[8px] font-bold uppercase tracking-widest text-yellow-400">
                    best in circle
                  </span>
                </div>
              </div>
            </div>
          </div>
          <div className="col-span-2 flex flex-col gap-3">
            <div className="flex h-full flex-col items-center justify-center border border-zinc-800 bg-zinc-900 p-3">
              <span className="material-symbols-outlined mb-1 !text-3xl text-yellow-400">trending_up</span>
              <span className="font-headline text-xl font-black text-white">TOP 5%</span>
              <span className="font-headline text-[8px] font-bold uppercase tracking-widest text-zinc-500">Elite Tier</span>
            </div>
            <div className="flex h-full flex-col items-center justify-center border border-zinc-800 bg-zinc-900 p-3">
              <span className="material-symbols-outlined mb-1 !text-3xl text-yellow-400">local_fire_department</span>
              <span className="font-headline text-xl font-black text-white">7 DAY</span>
              <span className="font-headline text-[8px] font-bold uppercase tracking-widest text-zinc-500">Win Streak</span>
            </div>
          </div>
        </div>

        <Link
          href="/dashboard"
          className="flex h-16 w-full items-center justify-center gap-3 bg-primary-container font-headline text-lg font-black uppercase tracking-tighter text-on-primary-container transition-all hover:brightness-110 active:scale-95"
        >
          RETURN TO ARENA
          <span className="material-symbols-outlined">arrow_forward</span>
        </Link>
      </main>

      <CircleArenaBottomNav active="results" />
    </div>
  );
}
