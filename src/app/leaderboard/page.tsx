import Link from "next/link";
import { redirect } from "next/navigation";
import PageShell from "@/components/layout/PageShell";
import PointsChip from "@/components/ui/PointsChip";
import CircleCard from "@/components/cards/CircleCard";
import { getAuthContext, listUserTournaments } from "@/services/server";

export default async function LeaderboardPage() {
  const { supabaseUser, dbUser } = await getAuthContext();
  if (!supabaseUser) redirect("/login");
  if (!dbUser) redirect("/login?error=database");

  const tournaments = await listUserTournaments(dbUser.id, { take: 12 });

  return (
    <PageShell
      active="leaderboard"
      rightSlot={<PointsChip points={2450} />}
    >
      <header className="text-center">
        <h1 className="font-display text-5xl font-black tracking-tight text-on-surface">
          Rankings
        </h1>
        <p className="mt-2 text-xs font-medium uppercase tracking-widest text-on-surface-variant">
          Circle standings
        </p>
      </header>

      <section className="glass-card rounded-2xl p-6">
        <div className="flex items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <span className="material-symbols-outlined text-xl text-primary">
              emoji_events
            </span>
            <div className="font-display text-sm font-black uppercase tracking-widest text-on-surface">
              Your circles
            </div>
          </div>
          <Link
            href="/tournaments"
            className="text-sm font-bold uppercase tracking-widest text-primary hover:underline"
          >
            Manage
          </Link>
        </div>

        <div className="mt-5 grid gap-3">
          {tournaments.length === 0 ? (
            <div className="text-sm text-on-surface-variant">No circles found.</div>
          ) : (
            tournaments.slice(0, 7).map((t, idx) => (
              <CircleCard
                key={t.id}
                href={`/tournaments/${t.id}/leaderboard`}
                name={t.name}
                season={t.season}
                status={t.status}
                variant="ranking"
                rank={idx + 1}
                isFirst={idx === 0}
              />
            ))
          )}
        </div>
      </section>
    </PageShell>
  );
}
