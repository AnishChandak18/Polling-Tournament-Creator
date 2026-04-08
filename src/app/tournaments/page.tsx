import { redirect } from "next/navigation";
import Link from "next/link";
import PageShell from "@/components/layout/PageShell";
import PointsChip from "@/components/ui/PointsChip";
import { getAuthContext, listUserTournaments } from "@/services/server";

export default async function TournamentsPage() {
  const { supabaseUser, dbUser } = await getAuthContext();
  if (!supabaseUser) redirect("/login");
  if (!dbUser) redirect("/login?error=database");

  const tournaments = await listUserTournaments(dbUser.id);
  const points = 1240;

  return (
    <PageShell active="circles" maxWidth="max-w-3xl" rightSlot={<PointsChip points={points} />}>
      <header>
        <h1 className="font-display text-4xl font-black uppercase tracking-tight text-on-surface">Circles</h1>
        <p className="mt-2 text-sm text-on-surface-variant">Your created and joined tournaments.</p>
      </header>

      <div className="flex justify-end">
        <Link
          href="/tournaments/create"
          className="btn-primary h-11 px-6 text-sm"
        >
          Create
        </Link>
      </div>

      <div className="space-y-3">
        {tournaments.length === 0 ? (
          <div className="glass-card rounded-xl p-8 text-center text-on-surface-variant">
            No tournaments yet.
          </div>
        ) : (
          tournaments.map((t) => (
            <Link
              key={t.id}
              href={`/tournaments/${t.id}`}
              className="glass-card block rounded-xl p-5 transition hover:-translate-y-0.5"
            >
              <div className="flex items-center justify-between gap-4">
                <div>
                  <div className="font-display text-lg font-bold text-on-surface">{t.name}</div>
                  <div className="mt-1 text-sm text-on-surface-variant">
                    IPL {t.season} • {t.status}
                  </div>
                </div>
                <div className="text-xs font-bold uppercase tracking-wider text-on-surface-variant">
                  {t.ownerId === dbUser.id ? "Owner" : "Member"}
                </div>
              </div>
            </Link>
          ))
        )}
      </div>
    </PageShell>
  );
}
