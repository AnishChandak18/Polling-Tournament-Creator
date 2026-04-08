import Link from "next/link";
import { redirect } from "next/navigation";
import PageShell from "@/components/layout/PageShell";
import PointsChip from "@/components/ui/PointsChip";
import CircleCard from "@/components/cards/CircleCard";
import { getAuthContext, listUserTournaments } from "@/services/server";

export default async function PredictionsPage() {
  const { supabaseUser, dbUser } = await getAuthContext();
  if (!supabaseUser) redirect("/login");
  if (!dbUser) redirect("/login?error=database");

  const tournaments = await listUserTournaments(dbUser.id, {
    take: 8,
    includeUpcomingMatch: true,
  });

  return (
    <PageShell
      active="predictions"
      rightSlot={<PointsChip points={2450} />}
    >
      <header className="section-header">
        <h1 className="font-display text-4xl font-black tracking-tight text-on-surface">Match Predictions</h1>
        <p className="mt-2 max-w-2xl text-on-surface-variant">
          Live matches and upcoming fixtures from your circles.
        </p>
      </header>

      <div className="space-y-4">
        {tournaments.length === 0 ? (
          <div className="card-stadium">
            <div className="text-sm font-bold text-on-surface">No circles yet</div>
            <div className="mt-2 text-sm text-on-surface-variant">
              Create a tournament to start predicting.
            </div>
            <div className="mt-4">
              <Link href="/tournaments/create" className="btn-primary h-11 px-6">
                Create Circle
              </Link>
            </div>
          </div>
        ) : (
          tournaments.map((t) => (
            <CircleCard
              key={t.id}
              href={`/tournaments/${t.id}/vote`}
              name={t.name}
              season={t.season}
              status={t.status}
              variant="prediction"
              nextMatch={t.matches[0] ?? null}
            />
          ))
        )}
      </div>
    </PageShell>
  );
}
