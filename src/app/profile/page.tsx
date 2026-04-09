import { redirect } from "next/navigation";
import Link from "next/link";
import PageShell from "@/components/layout/PageShell";
import StatBento from "@/components/ui/StatBento";
import SignOutButton from "@/components/auth/SignOutButton";
import { getAuthContext, getUserBestRankInCircles, getUserPredictionCount } from "@/services/server";

export default async function ProfilePage() {
  const { supabaseUser, dbUser } = await getAuthContext();
  if (!supabaseUser) redirect("/login");
  if (!dbUser) redirect("/login?error=database");

  const [predictionCount, bestRank] = await Promise.all([
    getUserPredictionCount(dbUser.id),
    getUserBestRankInCircles(dbUser.id),
  ]);
  const rankLabel = bestRank != null ? `#${bestRank}` : "—";

  return (
    <PageShell
      active="profile"
      maxWidth="max-w-md"
      rightSlot={
        <Link
          href="/settings"
          className="inline-flex items-center justify-center rounded-xl border border-outline-variant/30 bg-surface-container-high p-2.5 text-primary shadow-sm transition hover:opacity-90 active:scale-95"
          aria-label="Open settings"
        >
          <span className="material-symbols-outlined text-xl">settings</span>
        </Link>
      }
    >
      {/* Avatar + identity */}
      <section className="flex flex-col items-center">
        <div className="h-28 w-28 rounded-full bg-gradient-to-tr from-primary via-primary-dim to-secondary p-1 shadow-[0_0_30px_rgba(255,231,146,0.25)]">
          <div className="h-full w-full rounded-full border-4 border-background bg-surface-container" />
        </div>

        <div className="mt-6 text-center">
          <h1 className="font-display text-3xl font-bold tracking-tight text-on-surface">
            {dbUser.name || "Arena Player"}
          </h1>
          <div className="mt-2 text-xs font-bold uppercase tracking-widest text-outline">
            {supabaseUser.email}
          </div>
        </div>
      </section>

      {/* Stats */}
      <section className="grid gap-4">
        <StatBento
          label="Total Predictions"
          value={String(predictionCount)}
          icon="ads_click"
          accent="primary"
        />
        <StatBento
          label="Best rank (your circles)"
          value={rankLabel}
          icon="leaderboard"
          accent="secondary"
        />
        <div className="pt-2">
          <SignOutButton className="h-11 w-full rounded-xl text-sm font-bold uppercase tracking-widest" />
        </div>
      </section>
    </PageShell>
  );
}
