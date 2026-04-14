"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import PageShell from "@/components/layout/PageShell";
import PointsChip from "@/components/ui/PointsChip";
import CircleArenaNav from "@/components/circle-arena/CircleArenaNav";
import MatchVoteCard from "@/components/voting/MatchVoteCard";
import { asMatchDisplayMeta, groupMatchesByScheduleDay } from "@/lib/match-display";
import { canVoteOnMatch } from "@/lib/vote-window";

function logHistoryResponse(path, res, json) {
  if (process.env.NODE_ENV !== "production" && typeof window !== "undefined") {
    console.log("[api response]", { method: "GET", path, status: res.status, ok: res.ok, body: json });
  }
}

export default function TournamentHistoryClient({ tournamentId }) {
  const [data, setData] = useState(null);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    setError(null);
    setLoading(true);
    try {
      const path = `/api/tournaments/${tournamentId}/history`;
      const res = await fetch(path, { cache: "no-store" });
      const json = await res.json().catch(() => ({}));
      logHistoryResponse(path, res, json);
      if (!res.ok) {
        throw new Error(typeof json?.error === "string" ? json.error : "Failed to load match history");
      }
      setData(json);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to load");
    } finally {
      setLoading(false);
    }
  }, [tournamentId]);

  useEffect(() => {
    load();
  }, [load]);

  const grouped =
    data?.matches?.length > 0
      ? groupMatchesByScheduleDay(
          data.matches.map((m) => ({
            ...m,
            matchDate: new Date(m.matchDate),
            displayMeta: m.displayMeta,
          }))
        )
      : [];

  return (
    <PageShell
      active="circles"
      maxWidth="max-w-3xl"
      rightSlot={data != null ? <PointsChip points={data.points} /> : null}
    >
      <div className="mb-2 flex flex-wrap items-center justify-between gap-2">
        <Link
          href={`/tournaments/${tournamentId}`}
          className="text-xs font-bold uppercase tracking-widest text-primary hover:underline"
        >
          ← Back to circle
        </Link>
        <button
          type="button"
          onClick={() => load()}
          disabled={loading}
          className="font-headline text-[10px] font-bold uppercase tracking-widest text-zinc-500 hover:text-primary disabled:opacity-50"
        >
          {loading ? "Syncing…" : "Refresh"}
        </button>
      </div>

      {data ? (
        <CircleArenaNav tournamentId={data.tournament.id} hasLive={data.hasLive} />
      ) : null}

      <header>
        <p className="text-xs font-bold uppercase tracking-widest text-on-surface-variant">
          {data ? `${data.tournament.name} · IPL ${data.tournament.season}` : "…"}
        </p>
        <h1 className="font-display text-3xl font-black tracking-tight text-on-surface sm:text-4xl">
          Match history
        </h1>
        <p className="mt-2 text-sm text-on-surface-variant">
          Results sync from the live schedule API when you open or refresh this page.
        </p>
      </header>

      {error ? (
        <div className="rounded-2xl border border-error/40 bg-error/10 p-4 text-sm text-error">{error}</div>
      ) : null}

      {loading && !data ? (
        <div className="rounded-2xl border border-zinc-800 bg-zinc-900/40 p-8 text-center text-sm text-on-surface-variant">
          Loading history and syncing fixtures…
        </div>
      ) : null}

      {data && !loading && data.matches.length === 0 ? (
        <div className="rounded-2xl border border-zinc-800 bg-zinc-900/40 p-8 text-center text-sm text-on-surface-variant">
          No completed matches yet. Results appear after matches finish and sync from the API.
        </div>
      ) : null}

      {data && data.matches.length > 0 ? (
        <section className="space-y-4">
          <h2 className="font-display text-sm font-black uppercase tracking-widest text-on-surface-variant">
            Completed &amp; past results
          </h2>
          <div className="space-y-10">
            {grouped.map(({ label, matches: ms }) => (
              <div key={label} className="space-y-2">
                <h3 className="px-1 font-display text-xs font-black uppercase tracking-widest text-on-surface-variant">
                  {label}
                </h3>
                <div className="space-y-3">
                  {ms.map((m) => (
                    <MatchVoteCard
                      key={m.id}
                      match={{
                        id: m.id,
                        team1: m.team1,
                        team2: m.team2,
                        matchDate: m.matchDate.toISOString(),
                        venue: m.venue,
                        status: m.status,
                        winnerTeam: m.winnerTeam ?? null,
                        displayMeta: asMatchDisplayMeta(m.displayMeta),
                      }}
                      existingVoteTeam={m.userVote ?? null}
                      canVote={canVoteOnMatch(m.matchDate, m.status)}
                    />
                  ))}
                </div>
              </div>
            ))}
          </div>
        </section>
      ) : null}
    </PageShell>
  );
}
