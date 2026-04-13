import { redirect } from "next/navigation";
import Link from "next/link";
import PageShell from "@/components/layout/PageShell";
import PointsChip from "@/components/ui/PointsChip";
import SignOutButton from "@/components/auth/SignOutButton";
import { getAuthContext, getUserBestRankInCircles, getUserPointsChipTotal, getUserPredictionCount } from "@/services/server";

export default async function ProfilePage() {
  const { supabaseUser, dbUser } = await getAuthContext();
  if (!supabaseUser) redirect("/login");
  if (!dbUser) redirect("/login?error=database");

  const [predictionCount, bestRank, totalPoints] = await Promise.all([
    getUserPredictionCount(dbUser.id),
    getUserBestRankInCircles(dbUser.id),
    getUserPointsChipTotal(dbUser.id),
  ]);
  const rankLabel = bestRank != null ? `#${bestRank}` : "—";
  const handle = dbUser.username ? `@${dbUser.username}` : dbUser.name || "Player";

  return (
    <PageShell
      active="profile"
      maxWidth="max-w-2xl"
      className="px-4"
      rightSlot={
        <div className="flex items-center gap-2">
          <PointsChip points={totalPoints} />
          <Link
            href="/settings"
            className="inline-flex items-center justify-center rounded-xl border border-outline-variant/30 bg-surface-container-high p-2.5 text-primary shadow-sm transition hover:opacity-90 active:scale-95"
            aria-label="Open settings"
          >
            <span className="material-symbols-outlined text-xl">settings</span>
          </Link>
        </div>
      }
    >
      <section className="relative overflow-hidden rounded-xl border border-zinc-800 border-l-4 border-l-primary-container bg-surface-container p-6">
        <div className="pointer-events-none absolute right-0 top-0 opacity-10">
          <span className="material-symbols-outlined text-9xl">stadium</span>
        </div>
        <div className="relative z-10 flex flex-col items-center gap-4">
          <div className="relative">
            <div className="h-24 w-24 rounded-full bg-gradient-to-tr from-primary-container to-secondary p-1">
              <div className="flex h-full w-full items-center justify-center rounded-full border-2 border-surface bg-surface-container font-display text-2xl font-black text-on-surface">
                {(dbUser.name || dbUser.username || "?").slice(0, 1).toUpperCase()}
              </div>
            </div>
          </div>
          <div className="text-center">
            <h1 className="font-display text-2xl font-bold text-on-surface">{handle}</h1>
            <div className="mt-2 text-xs font-bold uppercase tracking-widest text-outline">{supabaseUser.email}</div>
            <div className="mt-3 inline-flex">
              <span className="rounded-full border border-primary-container/30 bg-primary-container/20 px-3 py-0.5 font-display text-[10px] font-black uppercase tracking-widest text-primary-container">
                Arena Player
              </span>
            </div>
          </div>
        </div>
      </section>

      <div className="grid grid-cols-2 gap-4">
        <div className="flex flex-col justify-between rounded-lg border-t border-zinc-800 bg-surface-container-high p-4">
          <span className="text-[10px] font-bold uppercase tracking-widest text-on-surface-variant">Predictions</span>
          <span className="mt-2 font-display text-3xl font-black tracking-tighter text-on-surface">{predictionCount}</span>
        </div>
        <div className="flex flex-col justify-between rounded-lg border-t border-zinc-800 bg-surface-container-high p-4">
          <span className="text-[10px] font-bold uppercase tracking-widest text-on-surface-variant">Best rank</span>
          <span className="mt-2 font-display text-3xl font-black tracking-tighter text-primary-container">{rankLabel}</span>
        </div>
      </div>

      <div className="pt-2">
        <SignOutButton className="h-11 w-full rounded-xl border border-zinc-800 bg-zinc-950 text-sm font-bold uppercase tracking-widest hover:bg-zinc-900" />
      </div>
    </PageShell>
  );
}
