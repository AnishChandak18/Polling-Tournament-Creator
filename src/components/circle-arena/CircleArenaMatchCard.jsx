"use client";

import Image from "next/image";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { submitVote } from "@/services/api";
import {
  displayTeamName,
  formatMatchTopLine,
} from "@/lib/circle-match-card-format";
import { getTeamLogoByName } from "@/lib/team-logos";

export default function CircleArenaMatchCard({ match, displayMeta, canVote }) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const meta = displayMeta ?? null;
  const topLine = formatMatchTopLine(match, meta);
  const isLive = match.status === "LIVE";
  const mult = isLive ? "2.4x" : "1.8x";
  const team1Logo = getTeamLogoByName(match.team1);
  const team2Logo = getTeamLogoByName(match.team2);
  const t1 = displayTeamName(match.team1, meta?.team1Short);
  const t2 = displayTeamName(match.team2, meta?.team2Short);

  async function vote(teamVoted) {
    if (loading || !canVote) return;
    setLoading(true);
    setError(null);
    try {
      await submitVote({ matchId: match.id, teamVoted });
      await router.refresh();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Error");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="group relative border border-zinc-800 bg-zinc-900/50 p-1 transition-all hover:border-primary/50">
      <div className="absolute right-0 top-0 p-2">
        <span className="material-symbols-outlined text-zinc-700 group-hover:text-primary/50">
          radar
        </span>
      </div>
      <div className="border border-zinc-800/50 p-4">
        <div className="mb-6 flex items-center justify-between">
          <div className="text-[10px] font-headline font-bold uppercase tracking-widest text-zinc-500">
            {topLine}
          </div>
          {isLive ? (
            <div className="bg-primary/10 px-2 py-0.5 font-headline text-[10px] font-bold uppercase tracking-widest text-primary">
              {mult} Multiplier
            </div>
          ) : (
            <div className="font-headline text-[10px] font-bold uppercase tracking-widest text-zinc-500">
              {mult} Multiplier
            </div>
          )}
        </div>

        <div
          className={
            isLive
              ? "mb-8 flex items-center justify-between gap-4"
              : "mb-8 flex items-center justify-between gap-4 transition-all opacity-100"
          }
        >
          <div className="flex-1 text-center">
            <div className="relative mx-auto mb-2 h-16 w-16 border border-zinc-700 bg-zinc-800 p-2">
              {team1Logo ? (
                <Image
                  src={team1Logo}
                  alt=""
                  fill
                  sizes="64px"
                  className="object-contain p-1"
                />
              ) : (
                <span className="flex h-full w-full items-center justify-center font-headline text-[10px] font-bold text-zinc-500">
                  {t1.slice(0, 3).toUpperCase()}
                </span>
              )}
            </div>
            <span className="font-headline text-sm font-bold uppercase tracking-tighter">
              {t1}
            </span>
          </div>
          <div className="flex flex-col items-center">
            <span className="font-headline text-2xl font-black italic text-zinc-700">
              VS
            </span>
          </div>
          <div className="flex-1 text-center">
            <div className="relative mx-auto mb-2 h-16 w-16 border border-zinc-700 bg-zinc-800 p-2">
              {team2Logo ? (
                <Image
                  src={team2Logo}
                  alt=""
                  fill
                  sizes="64px"
                  className="object-contain p-1"
                />
              ) : (
                <span className="flex h-full w-full items-center justify-center font-headline text-[10px] font-bold text-zinc-500">
                  {t2.slice(0, 3).toUpperCase()}
                </span>
              )}
            </div>
            <span className="font-headline text-sm font-bold uppercase tracking-tighter">
              {t2}
            </span>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-3">
          {isLive ? (
            <>
              <button
                type="button"
                disabled={loading || !canVote}
                onClick={() => vote(match.team1)}
                className="flex flex-col items-center gap-1 border border-zinc-700 bg-zinc-800 py-3 px-4 font-headline text-xs font-bold uppercase tracking-widest transition-all hover:bg-primary hover:text-on-primary disabled:opacity-50"
              >
                <span>Vote {t1}</span>
                <span className="text-[9px] opacity-70">— Pool</span>
              </button>
              <button
                type="button"
                disabled={loading || !canVote}
                onClick={() => vote(match.team2)}
                className="flex flex-col items-center gap-1 border border-zinc-700 bg-zinc-800 py-3 px-4 font-headline text-xs font-bold uppercase tracking-widest transition-all hover:bg-primary hover:text-on-primary disabled:opacity-50"
              >
                <span>Vote {t2}</span>
                <span className="text-[9px] opacity-70">— Pool</span>
              </button>
            </>
          ) : (
            <>
              <button
                type="button"
                disabled={loading || !canVote}
                onClick={() => vote(match.team1)}
                className="border border-zinc-700 bg-zinc-800 py-3 px-4 font-headline text-xs font-bold uppercase tracking-widest transition-all hover:bg-primary hover:text-on-primary disabled:opacity-50"
              >
                Vote {t1}
              </button>
              <button
                type="button"
                disabled={loading || !canVote}
                onClick={() => vote(match.team2)}
                className="border border-zinc-700 bg-zinc-800 py-3 px-4 font-headline text-xs font-bold uppercase tracking-widest transition-all hover:bg-primary hover:text-on-primary disabled:opacity-50"
              >
                Vote {t2}
              </button>
            </>
          )}
        </div>
        {error ? (
          <p className="mt-2 text-center text-xs text-error">{error}</p>
        ) : null}
      </div>
    </div>
  );
}
