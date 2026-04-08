import { redirect } from "next/navigation";
import BackButton from "@/components/common/BackButton";
import { getAuthContext, getTournamentLeaderboardForUser } from "@/services/server";

export default async function LeaderboardPage({ params }: { params: { id: string } }) {
  const { supabaseUser, dbUser } = await getAuthContext();
  if (!supabaseUser) redirect("/login");
  if (!dbUser) redirect("/login?error=database");

  const data = await getTournamentLeaderboardForUser(params.id, dbUser.id);
  if (!data) redirect("/tournaments");
  const { tournament, leaderboard } = data;

  const topThree = leaderboard.slice(0, 3);

  return (
    <main className="p-6">
      <div className="mx-auto max-w-5xl">
        <BackButton fallbackHref={`/tournaments/${tournament.id}`} className="mb-4" />
        <div className="rounded-3xl border bg-bg/70 p-6 shadow-2xl sm:p-8">
          <h1 className="text-4xl font-black uppercase italic">Leaderboard</h1>
          <p className="mt-1 text-text/70">{tournament.name}</p>

          <div className="mt-6 grid gap-4 md:grid-cols-3">
            {topThree.map((row, idx) => (
              <div
                key={`${row.user.email}-podium-${idx}`}
                className={[
                  "rounded-2xl border p-5",
                  idx === 0 ? "bg-primary/15 border-primary" : "bg-black/20",
                ].join(" ")}
              >
                <div className="text-xs font-black uppercase tracking-wider text-text/70">
                  Rank #{idx + 1}
                </div>
                <div className="mt-2 truncate text-lg font-black">
                  {row.user.name ?? row.user.email}
                </div>
                <div className="mt-1 text-sm text-text/70">{row.user.email}</div>
                <div className="mt-4 text-3xl font-black">{row.score}</div>
              </div>
            ))}
          </div>

          <div className="mt-6 overflow-hidden rounded-2xl border bg-black/10">
            <div className="grid grid-cols-[60px_1fr_90px] border-b p-3 text-xs font-black uppercase tracking-wider text-text/70">
              <div>#</div>
              <div>Player</div>
              <div className="text-right">Score</div>
            </div>
            <div className="divide-y">
              {leaderboard.map((row, idx) => (
                <div
                  key={`${row.user.email}-${idx}`}
                  className={[
                    "grid grid-cols-[60px_1fr_90px] p-3",
                    row.userId === dbUser.id ? "bg-primary/10" : "",
                  ].join(" ")}
                >
                  <div className="text-text/70">{idx + 1}</div>
                  <div>
                    <div className="font-bold">{row.user.name ?? row.user.email}</div>
                    {row.user.name ? (
                      <div className="text-sm text-text/70">{row.user.email}</div>
                    ) : null}
                  </div>
                  <div className="text-right text-lg font-black">{row.score}</div>
                </div>
              ))}
              {leaderboard.length === 0 ? (
                <div className="p-4 text-sm text-text/70">No leaderboard entries yet.</div>
              ) : null}
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}

