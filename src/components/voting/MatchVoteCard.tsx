"use client";

import { useState } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { submitVote } from "@/services/api";
import {
  displayTeamName,
  formatMatchTopLine,
} from "@/lib/circle-match-card-format";
import type { MatchDisplayMeta } from "@/lib/match-display";
import { getTeamLogoByName } from "@/lib/team-logos";

const matchDateFormatter = new Intl.DateTimeFormat("en-IN", {
  day: "2-digit",
  month: "short",
  year: "numeric",
  hour: "2-digit",
  minute: "2-digit",
  timeZone: "Asia/Kolkata",
});

function venueLine(
  meta: MatchDisplayMeta | null | undefined,
  ground: string | null | undefined,
) {
  const parts: string[] = [];
  if (ground) parts.push(ground);
  const city = meta?.venueCity;
  const country = meta?.venueCountry;
  if (city && country) parts.push(`${city}, ${country}`);
  else if (city) parts.push(city);
  else if (country) parts.push(country);
  return parts.length ? parts.join(" · ") : null;
}

export default function MatchVoteCard({
  match,
  existingVoteTeam,
  canVote,
}: {
  match: {
    id: string;
    team1: string;
    team2: string;
    matchDate: string;
    venue?: string | null;
    status: string;
    winnerTeam?: string | null;
    displayMeta?: MatchDisplayMeta | null;
  };
  existingVoteTeam?: string | null;
  canVote: boolean;
}) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const meta = match.displayMeta ?? null;
  const kickoffPast = new Date(match.matchDate).getTime() < Date.now();
  const isFinished =
    match.status === "COMPLETED" ||
    (match.status === "UPCOMING" && kickoffPast);
  const isLive = match.status === "LIVE";
  const topLine = formatMatchTopLine(match, meta, { kickoffPast });

  const t1 = displayTeamName(match.team1, meta?.team1Short);
  const t2 = displayTeamName(match.team2, meta?.team2Short);
  const team1Logo = getTeamLogoByName(match.team1);
  const team2Logo = getTeamLogoByName(match.team2);

  const voted = Boolean(existingVoteTeam);
  const formattedWhen = matchDateFormatter.format(new Date(match.matchDate));
  const venue = venueLine(meta, match.venue ?? null);

  const winnerLabel = match.winnerTeam?.trim() || null;

  async function vote(teamVoted: string) {
    if (loading || !canVote) return;
    setLoading(true);
    setError(null);

    try {
      await submitVote({ matchId: match.id, teamVoted });
      await router.refresh();
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : "Error");
    } finally {
      setLoading(false);
    }
  }

  const voteBtnClass =
    "flex flex-col items-center gap-1 border border-zinc-700 bg-zinc-800 py-3 px-4 font-headline text-xs font-bold uppercase tracking-widest transition-all hover:bg-primary hover:text-on-primary disabled:opacity-50";
  const voteBtnClassSimple =
    "border border-zinc-700 bg-zinc-800 py-3 px-4 font-headline text-xs font-bold uppercase tracking-widest transition-all hover:bg-primary hover:text-on-primary disabled:opacity-50";

  return (
    <div className="group relative border border-zinc-800 bg-zinc-900/50 p-1 transition-all hover:border-primary/50">
      <div className="absolute right-0 top-0 p-2">
        <span className="material-symbols-outlined text-zinc-700 group-hover:text-primary/50">
          radar
        </span>
      </div>
      <div className="border border-zinc-800/50 p-4">
        <div className="mb-4 flex items-center justify-between">
          <div className="text-[10px] font-headline font-bold uppercase tracking-widest text-zinc-500">
            {topLine}
          </div>
          {isFinished ? (
            <div className="font-headline text-[10px] font-bold uppercase tracking-widest text-zinc-500">
              Final
            </div>
          ) : isLive ? (
            <div className="bg-primary/10 px-2 py-0.5 font-headline text-[10px] font-bold uppercase tracking-widest text-primary">
              LIVE
            </div>
          ) : (
            <div className="font-headline text-[10px] font-bold uppercase tracking-widest text-zinc-500">
              +1 pt if correct
            </div>
          )}
        </div>

        <div
          className={
            isLive
              ? "mb-6 flex items-center justify-between gap-4"
              : [
                  "mb-6 flex items-center justify-between gap-4 transition-all",
                  isFinished ? "opacity-75" : "opacity-100",
                ].join(" ")
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

        <p className="mb-4 text-center font-headline text-[10px] font-bold uppercase tracking-widest text-zinc-500">
          {formattedWhen}
          {venue ? ` · ${venue}` : ""}
        </p>

        {isFinished ? (
          <div className="space-y-3 border-t border-zinc-800/80 pt-4">
            <div className="rounded-sm border border-primary/30 bg-primary/10 px-3 py-2 text-center">
              <p className="font-headline text-[10px] font-bold uppercase tracking-widest text-zinc-500">
                Result
              </p>
              <p className="mt-1 font-headline text-sm font-black uppercase tracking-tight text-primary">
                {winnerLabel ? `${winnerLabel} won` : "Result pending"}
              </p>
            </div>
            {existingVoteTeam ? (
              <p className="text-center font-headline text-xs text-zinc-400">
                Your pick:{" "}
                <span className="font-bold text-on-background">
                  {existingVoteTeam}
                </span>
                {winnerLabel &&
                existingVoteTeam.trim().toLowerCase() ===
                  winnerLabel.trim().toLowerCase() ? (
                  <span className="ml-2 rounded-sm bg-primary/20 px-2 py-0.5 text-[10px] font-black uppercase text-primary">
                    Correct
                  </span>
                ) : winnerLabel ? (
                  <span className="ml-2 rounded-sm bg-zinc-800 px-2 py-0.5 text-[10px] font-black uppercase text-zinc-500">
                    Miss
                  </span>
                ) : null}
              </p>
            ) : (
              <p className="text-center font-headline text-xs text-zinc-500">
                You did not vote on this match.
              </p>
            )}
          </div>
        ) : (
          <div className="grid grid-cols-2 gap-3">
            {isLive ? (
              <>
                <button
                  type="button"
                  disabled={loading || !canVote}
                  onClick={() => vote(match.team1)}
                  className={voteBtnClass}
                >
                  <span>Vote {t1}</span>
                  <span className="text-[9px] opacity-70">— Pool</span>
                </button>
                <button
                  type="button"
                  disabled={loading || !canVote}
                  onClick={() => vote(match.team2)}
                  className={voteBtnClass}
                >
                  <span>Vote {t2}</span>
                  <span className="text-[9px] opacity-70">— Pool</span>
                </button>
              </>
            ) : canVote ? (
              <div className="col-span-2 grid grid-cols-2 gap-3">
                {voted ? (
                  <p className="col-span-2 mb-1 text-center font-headline text-[10px] text-zinc-500">
                    Your pick — tap the other team to change until 30 min before
                    start.
                  </p>
                ) : null}
                <button
                  type="button"
                  disabled={loading}
                  onClick={() => vote(match.team1)}
                  className={voteBtnClassSimple}
                >
                  Vote {t1}
                </button>
                <button
                  type="button"
                  disabled={loading}
                  onClick={() => vote(match.team2)}
                  className={voteBtnClassSimple}
                >
                  Vote {t2}
                </button>
              </div>
            ) : match.status === "UPCOMING" ? (
              <div className="col-span-2 border border-zinc-800 bg-zinc-950/50 px-3 py-3 text-center font-headline text-xs text-zinc-500">
                {voted ? (
                  <>
                    Your vote:{" "}
                    <span className="font-bold text-primary">
                      {existingVoteTeam}
                    </span>
                    <span className="mt-1 block text-[10px] uppercase tracking-widest">
                      Locked — voting closed 30 minutes before kickoff.
                    </span>
                  </>
                ) : (
                  "Voting locked — window closed 30 minutes before this match starts."
                )}
              </div>
            ) : (
              <div className="col-span-2 border border-zinc-800 bg-zinc-950/50 px-3 py-3 text-center font-headline text-xs text-zinc-500">
                Match in progress — voting closed. Open the circle&apos;s live
                arena for updates.
              </div>
            )}
          </div>
        )}

        {error ? (
          <p className="mt-2 text-center font-headline text-xs text-error">
            {error}
          </p>
        ) : null}
      </div>
    </div>
  );
}
