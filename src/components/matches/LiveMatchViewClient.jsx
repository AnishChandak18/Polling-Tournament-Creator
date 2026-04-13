"use client";

import { useEffect, useMemo, useState } from "react";

function pickScoreText(scoreboard) {
  if (!scoreboard || typeof scoreboard !== "object") return null;
  const textKeys = ["score", "scoreText", "status", "result", "state"];
  for (const key of textKeys) {
    const v = scoreboard[key];
    if (typeof v === "string" && v.trim()) return v.trim();
  }
  const asJson = JSON.stringify(scoreboard);
  return asJson.length > 6 ? asJson.slice(0, 180) : null;
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
        item.commText ??
        item.commentary ??
        item.text ??
        item.msg ??
        item.event ??
        null;
      if (typeof text !== "string" || !text.trim()) return null;
      const over = item.overNumber ?? item.over ?? item.ballNbr ?? item.ballNumber ?? null;
      return { text: text.trim(), over: over != null ? String(over) : null };
    })
    .filter(Boolean)
    .slice(0, 8);
}

export default function LiveMatchViewClient({ matchId, title = "Live Arena" }) {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [payload, setPayload] = useState(null);

  useEffect(() => {
    let active = true;
    let timer = null;

    const run = async () => {
      try {
        const res = await fetch(`/api/matches/${matchId}/live`, { cache: "no-store" });
        const json = await res.json().catch(() => ({}));
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

  return (
    <section className="relative mt-6 overflow-hidden rounded-lg border border-zinc-800 bg-zinc-900">
      <div className="pointer-events-none absolute inset-0 bg-stadium-mesh opacity-40" />
      <div className="absolute right-0 top-0 z-10 p-4">
        <div className="flex items-center gap-2 rounded-sm border border-error/30 bg-error-container/20 px-3 py-1 text-error">
          <span className="relative flex h-2 w-2">
            <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-error opacity-75" />
            <span className="relative inline-flex h-2 w-2 rounded-full bg-error" />
          </span>
          <span className="font-display text-[10px] font-black uppercase tracking-widest">Live Now</span>
        </div>
      </div>

      <div className="relative z-10 space-y-6 p-6 md:p-8">
        <div className="flex items-center justify-between gap-2">
          <h3 className="font-display text-sm font-black uppercase tracking-[0.2em] text-on-surface">{title}</h3>
        </div>

        {loading ? (
          <p className="text-sm text-zinc-500">Syncing live feed…</p>
        ) : error ? (
          <p className="text-sm text-red-400">{error}</p>
        ) : (
          <div className="space-y-4">
            <div className="rounded-lg border border-zinc-800 bg-zinc-950/80 p-4">
              <p className="text-[10px] font-bold uppercase tracking-widest text-zinc-500">Scoreboard</p>
              <p className="mt-2 font-display text-sm font-bold leading-relaxed text-on-surface">
                {scoreLine || "No live score available right now."}
              </p>
            </div>
            <div>
              <p className="mb-2 text-[10px] font-bold uppercase tracking-widest text-zinc-500">Commentary</p>
              {commentaryItems.length === 0 ? (
                <p className="text-sm text-zinc-500">No commentary updates yet.</p>
              ) : (
                <div className="max-h-64 space-y-2 overflow-y-auto pr-1">
                  {commentaryItems.map((item, idx) => (
                    <div
                      key={`${idx}-${item.over ?? "n"}`}
                      className="rounded-sm border border-zinc-800 bg-zinc-950/50 p-3"
                    >
                      <p className="text-xs text-on-surface">
                        {item.over ? (
                          <span className="mr-2 font-display font-bold text-primary-container">{item.over}</span>
                        ) : null}
                        {item.text}
                      </p>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}
      </div>
      <div className="pointer-events-none absolute inset-0 bg-gradient-to-br from-yellow-400/10 to-transparent opacity-10" />
    </section>
  );
}
