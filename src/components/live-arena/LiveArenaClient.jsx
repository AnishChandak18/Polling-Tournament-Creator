"use client";

import { useEffect, useMemo, useState } from "react";

function pickScoreText(scoreboard) {
  if (!scoreboard || typeof scoreboard !== "object") return null;
  let s = scoreboard;
  if (s.response && typeof s.response === "object") {
    s = s.response;
  }
  const textKeys = ["score", "scoreText", "status", "result", "state"];
  for (const key of textKeys) {
    const v = s[key];
    if (typeof v === "string" && v.trim()) return v.trim();
  }
  const asJson = JSON.stringify(s);
  return asJson.length > 6 ? asJson.slice(0, 280) : null;
}

function pickCommentaryItems(commentary) {
  if (!commentary || typeof commentary !== "object") return [];
  const candidates = [
    commentary.commentaryList,
    commentary.commentary,
    commentary.response?.commentaryList,
    commentary.response?.commentary,
    commentary.data?.commentaryList,
    commentary.data?.commentary,
  ];
  const arr = candidates.find(Array.isArray);
  if (!Array.isArray(arr)) return [];
  return arr
    .map((item) => {
      if (!item || typeof item !== "object") return null;
      const text =
        item.commText ?? item.commentary ?? item.text ?? item.msg ?? item.event ?? null;
      if (typeof text !== "string" || !text.trim()) return null;
      const over = item.overNumber ?? item.over ?? item.ballNbr ?? item.ballNumber ?? null;
      return { text: text.trim(), over: over != null ? String(over) : null };
    })
    .filter(Boolean)
    .slice(0, 24);
}

function extractInningsScores(raw) {
  if (!raw) return [];
  const m = raw.match(/(\d+\/\d+)/g);
  return m || [];
}

function feedVariant(text) {
  const u = text.toUpperCase();
  if (u.includes("WICKET") || u.includes("OUT")) return "wicket";
  if (u.includes("FOUR") || u.includes("SIX") || u.includes("BOUNDARY")) return "big";
  return "default";
}

/**
 * Stitch Live Arena — scorecard hero, crease HUD, bowler, decibel, technical feed.
 */
export default function LiveArenaClient({ matchId, team1, team2 }) {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [payload, setPayload] = useState(null);

  useEffect(() => {
    let active = true;
    let timer = null;
    const run = async () => {
      try {
        const path = `/api/matches/${matchId}/live`;
        const res = await fetch(path, { cache: "no-store" });
        const json = await res.json().catch(() => ({}));
        if (process.env.NODE_ENV !== "production" && typeof window !== "undefined") {
          console.log("[api response]", { method: "GET", path, status: res.status, ok: res.ok, body: json });
        }
        if (!res.ok) throw new Error(json?.error || "Failed to fetch live match data");
        if (!active) return;
        setPayload(json);
        setError(null);
      } catch (e) {
        if (!active) return;
        setError(e instanceof Error ? e.message : "Failed to fetch live match data");
      } finally {
        if (active) setLoading(false);
      }
    };
    run();
    timer = setInterval(run, 30000);
    return () => {
      active = false;
      if (timer) clearInterval(timer);
    };
  }, [matchId]);

  const scoreLine = useMemo(
    () => pickScoreText(payload?.live?.scoreboard ?? payload?.live),
    [payload]
  );
  const commentaryItems = useMemo(
    () => pickCommentaryItems(payload?.live?.commentary ?? payload?.live),
    [payload]
  );

  const scores = extractInningsScores(scoreLine);
  const scoreA = scores[0] ?? "—";
  const scoreB = scores[1] ?? "—";
  const t1 = team1?.slice(0, 18) ?? "Team A";
  const t2 = team2?.slice(0, 18) ?? "Team B";

  return (
    <main className="mx-auto min-h-screen max-w-5xl px-4 pb-24 pt-20 hud-grid-pattern">
      <section className="relative mb-6 overflow-hidden rounded-xl border border-zinc-800 bg-surface-container-low p-6">
        <div className="scanning-line" />
        <div className="absolute right-0 top-0 p-3">
          <span className="flex items-center gap-2 rounded border border-error/20 bg-error/10 px-2 py-0.5 text-[10px] font-bold uppercase tracking-widest text-error">
            <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-error" />
            LIVE: INNINGS 2
          </span>
        </div>
        <div className="relative z-10 flex flex-col items-center justify-between gap-8 md:flex-row">
          <div className="flex-1 text-center">
            <div className="mb-1 font-headline text-xs uppercase tracking-widest text-zinc-500">{t1}</div>
            <div className="font-headline text-4xl font-black italic text-on-surface md:text-5xl">{scoreA}</div>
            <div className="mt-1 text-[10px] uppercase text-zinc-500">20.0 Overs (Target 194)</div>
          </div>
          <div className="flex flex-col items-center">
            <div className="h-12 w-px bg-gradient-to-b from-transparent via-primary/30 to-transparent" />
            <div className="my-2 font-headline text-xl font-black italic text-primary">VS</div>
            <div className="h-12 w-px bg-gradient-to-b from-primary/30 via-primary/30 to-transparent" />
          </div>
          <div className="flex-1 text-center">
            <div className="mb-1 font-headline text-xs uppercase tracking-widest text-zinc-500">{t2}</div>
            <div className="font-headline text-4xl font-black italic text-primary md:text-5xl">{scoreB}</div>
            <div className="mt-1 text-[10px] font-bold uppercase tracking-tighter text-primary/60">
              Requires 40 from 11 balls
            </div>
          </div>
        </div>
        <div className="relative mt-8 h-1.5 overflow-hidden rounded-full bg-zinc-900">
          <div className="absolute left-0 top-0 h-full w-[82%] bg-primary shadow-[0_0_10px_#ffe792]" />
        </div>
      </section>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <div className="space-y-6 lg:col-span-1">
          <div className="relative overflow-hidden rounded-xl border border-zinc-800 bg-surface-container p-5">
            <div className="mb-4 flex items-center justify-between">
              <h3 className="font-headline text-xs font-black uppercase tracking-widest text-zinc-400">On the Crease</h3>
              <span className="material-symbols-outlined text-lg text-primary">sports_cricket</span>
            </div>
            <div className="space-y-4">
              <div className="flex items-end justify-between border-b border-zinc-800/50 pb-3">
                <div>
                  <div className="text-sm font-bold text-on-surface">Striker</div>
                  <div className="text-[10px] uppercase text-zinc-500">Live feed</div>
                </div>
                <div className="text-right">
                  <div className="font-headline text-xl font-black text-primary">
                    — <span className="text-xs font-normal text-zinc-500">(—)</span>
                  </div>
                </div>
              </div>
              <div className="flex items-end justify-between">
                <div>
                  <div className="text-sm font-bold text-zinc-400">Non-Striker</div>
                  <div className="text-[10px] uppercase text-zinc-500">—</div>
                </div>
                <div className="text-right font-headline text-xl font-black text-zinc-300">—</div>
              </div>
            </div>
          </div>

          <div className="rounded-xl border border-zinc-800 border-l-4 border-l-primary bg-surface-container-high p-5">
            <div className="mb-4 flex items-center justify-between">
              <h3 className="font-headline text-xs font-black uppercase tracking-widest text-zinc-400">Current Bowler</h3>
              <span className="material-symbols-outlined text-lg text-primary">sports_baseball</span>
            </div>
            <div className="flex items-center gap-4">
              <div className="h-12 w-12 overflow-hidden rounded border border-zinc-800 bg-zinc-900" />
              <div className="flex-1">
                <div className="text-sm font-bold">—</div>
                <div className="mt-1 grid grid-cols-4 gap-2">
                  {["O", "M", "R", "W"].map((k) => (
                    <div key={k}>
                      <div className="text-[9px] uppercase text-zinc-500">{k}</div>
                      <div className="text-xs font-bold">—</div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>

          <div className="rounded-xl border border-zinc-800 bg-zinc-950 p-5">
            <div className="mb-4 flex items-center justify-between">
              <h3 className="font-headline text-xs font-black uppercase tracking-widest text-zinc-400">Live Crowd Energy</h3>
              <span className="text-xs font-bold text-primary">108 dB</span>
            </div>
            <div className="flex h-16 items-end gap-1.5">
              <div className="h-1/4 flex-1 rounded-t-sm bg-zinc-800" />
              <div className="h-2/4 flex-1 rounded-t-sm bg-zinc-800" />
              <div className="h-3/4 flex-1 rounded-t-sm bg-zinc-800" />
              <div className="h-full flex-1 rounded-t-sm bg-primary/40" />
              <div className="h-5/6 flex-1 rounded-t-sm bg-primary shadow-[0_0_10px_#ffe792]" />
              <div className="h-full flex-1 rounded-t-sm bg-primary shadow-[0_0_10px_#ffe792]" />
              <div className="h-3/4 flex-1 rounded-t-sm bg-primary/60" />
              <div className="h-1/2 flex-1 rounded-t-sm bg-zinc-800" />
              <div className="h-1/4 flex-1 rounded-t-sm bg-zinc-800" />
              <div className="h-2/4 flex-1 rounded-t-sm bg-zinc-800" />
            </div>
            <p className="mt-3 text-center text-[9px] font-bold uppercase tracking-widest text-zinc-500">
              Stadium Peak: 114 dB (Over 17.4)
            </p>
          </div>
        </div>

        <div className="flex h-full flex-col overflow-hidden rounded-xl border border-zinc-800 bg-surface-container lg:col-span-2">
          <div className="flex items-center justify-between border-b border-zinc-800 bg-surface-container-high p-4">
            <div className="flex items-center gap-2">
              <div className="h-2 w-2 rounded-full bg-primary" />
              <h3 className="font-headline text-xs font-black uppercase tracking-widest text-primary">Technical Feed</h3>
            </div>
            <div className="flex gap-2">
              <button
                type="button"
                className="rounded border border-zinc-700 bg-zinc-800 px-2 py-1 text-[10px] font-bold uppercase text-zinc-300 transition-colors hover:bg-zinc-700"
              >
                Filter
              </button>
              <button
                type="button"
                className="rounded bg-primary px-2 py-1 text-[10px] font-bold uppercase text-on-primary-container"
              >
                Auto-Refresh
              </button>
            </div>
          </div>
          <div className="max-h-[600px] flex-1 space-y-4 overflow-y-auto p-4">
            {loading ? (
              <p className="text-sm text-zinc-500">Syncing live feed…</p>
            ) : error ? (
              <p className="text-sm text-error">{error}</p>
            ) : commentaryItems.length === 0 ? (
              <p className="text-sm text-zinc-500">No commentary updates yet.</p>
            ) : (
              commentaryItems.map((item, idx) => {
                const v = feedVariant(item.text);
                const border =
                  v === "wicket"
                    ? "border-l-2 border-error bg-error/5"
                    : v === "big"
                      ? "border-l-2 border-primary bg-primary/5"
                      : "border-l-2 border-zinc-800 hover:border-zinc-700";
                return (
                  <div key={`${idx}-${item.over ?? "x"}`} className={`flex gap-4 rounded-r-lg p-3 ${border}`}>
                    <div className="pt-1 font-headline text-xs font-bold text-zinc-500">{item.over ?? "—"}</div>
                    <div className="flex-1">
                      <p className="text-sm leading-relaxed text-zinc-400">{item.text}</p>
                    </div>
                  </div>
                );
              })
            )}
            {scoreLine && (
              <div className="rounded-lg border border-zinc-800 bg-zinc-950/80 p-3">
                <p className="text-[10px] font-bold uppercase tracking-widest text-zinc-500">Raw scoreboard</p>
                <p className="mt-2 font-headline text-xs font-bold text-on-surface">{scoreLine}</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </main>
  );
}
