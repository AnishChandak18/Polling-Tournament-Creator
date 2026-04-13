import Link from "next/link";
import { redirect } from "next/navigation";
import BackButton from "@/components/common/BackButton";
import { getAuthContext, getTournamentWithMatchesForUser } from "@/services/server";

export default async function TournamentMatchHistoryPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { supabaseUser, dbUser } = await getAuthContext();
  if (!supabaseUser) redirect("/login");
  if (!dbUser) redirect("/login?error=database");

  const { id: tournamentId } = await params;
  const tournament = await getTournamentWithMatchesForUser(tournamentId, dbUser.id);
  if (!tournament) redirect("/tournaments");

  const completed = tournament.matches.filter((m) => m.status === "COMPLETED");

  return (
    <main className="min-h-screen bg-background bg-stadium-mesh p-6 text-on-surface">
      <div className="mx-auto max-w-2xl">
        <BackButton fallbackHref={`/tournaments/${tournament.id}`} className="mb-4" />
        <section className="rounded-2xl border border-outline-variant/20 bg-surface-container p-6">
          <div className="mb-5">
            <h1 className="font-display text-3xl font-black tracking-tight">Match History</h1>
            <p className="mt-1 text-sm text-on-surface-variant">
              {tournament.name} • Completed matches and results
            </p>
          </div>

          {completed.length === 0 ? (
            <p className="text-sm text-on-surface-variant">No completed matches yet.</p>
          ) : (
            <div className="space-y-3">
              {completed.map((m) => (
                <div
                  key={m.id}
                  className="rounded-xl border border-outline-variant/20 bg-surface-container-high p-4"
                >
                  <div className="flex items-center justify-between gap-3">
                    <p className="font-display text-lg font-black">
                      {m.team1} <span className="text-on-surface-variant">vs</span> {m.team2}
                    </p>
                    <span className="rounded bg-primary/10 px-2 py-0.5 text-xs font-bold text-primary">
                      {m.winnerTeam ? `${m.winnerTeam} won` : "Result pending"}
                    </span>
                  </div>
                  <p className="mt-2 text-xs text-on-surface-variant">
                    {new Intl.DateTimeFormat("en-IN", {
                      day: "2-digit",
                      month: "short",
                      year: "numeric",
                      hour: "2-digit",
                      minute: "2-digit",
                      timeZone: "Asia/Kolkata",
                    }).format(m.matchDate)}
                    {m.venue ? ` • ${m.venue}` : ""}
                  </p>
                </div>
              ))}
            </div>
          )}

          <Link
            href={`/tournaments/${tournament.id}`}
            className="mt-6 inline-flex rounded-xl border border-outline-variant px-4 py-2 text-xs font-bold uppercase tracking-widest text-on-surface hover:bg-surface-container-high"
          >
            Back to live view
          </Link>
        </section>
      </div>
    </main>
  );
}

