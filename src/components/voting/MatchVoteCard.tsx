"use client";

import { useState } from "react";
import Image from "next/image";
import { submitVote } from "@/services/api";
import type { MatchDisplayMeta } from "@/lib/match-display";
import { getTeamLogoByName } from "@/lib/team-logos";

const matchDateFormatter = new Intl.DateTimeFormat("en-GB", {
  day: "2-digit",
  month: "2-digit",
  year: "numeric",
  hour: "2-digit",
  minute: "2-digit",
  second: "2-digit",
  hour12: false,
  timeZone: "Asia/Kolkata",
});

function venueLine(meta: MatchDisplayMeta | null | undefined, ground: string | null | undefined) {
  const parts: string[] = [];
  if (ground) parts.push(ground);
  const city = meta?.venueCity;
  const country = meta?.venueCountry;
  if (city && country) parts.push(`${city}, ${country}`);
  else if (city) parts.push(city);
  else if (country) parts.push(country);
  if (meta?.timezone) parts.push(`(${meta.timezone})`);
  return parts.length ? parts.join(" · ") : null;
}

function getTeamBadge(name: string, short?: string | null) {
  const base = short?.trim() || name;
  return base
    .split(/\s+/)
    .map((w) => w[0])
    .join("")
    .slice(0, 3)
    .toUpperCase();
}

function getStartInText(isoDate: string) {
  const matchTime = new Date(isoDate).getTime();
  const now = Date.now();
  const delta = matchTime - now;
  if (delta <= 0) return "LIVE / STARTED";
  const minutes = Math.floor(delta / (1000 * 60));
  const hours = Math.floor(minutes / 60);
  const mins = minutes % 60;
  return `STARTS IN ${hours}H ${mins}M`;
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
    displayMeta?: MatchDisplayMeta | null;
  };
  existingVoteTeam?: string | null;
  canVote: boolean;
}) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const voted = Boolean(existingVoteTeam);
  const formattedMatchDate = matchDateFormatter.format(new Date(match.matchDate));
  const meta = match.displayMeta ?? null;

  const subtitleParts = [meta?.seriesName, meta?.matchDesc, meta?.matchFormat].filter(Boolean);
  const venue = venueLine(meta, match.venue ?? null);
  const team1Badge = getTeamBadge(match.team1, meta?.team1Short);
  const team2Badge = getTeamBadge(match.team2, meta?.team2Short);
  const team1Logo = getTeamLogoByName(match.team1);
  const team2Logo = getTeamLogoByName(match.team2);
  const startIn = getStartInText(match.matchDate);
  const confidenceLabel = canVote ? "HIGH CONFIDENCE" : "PREVIEW";
  const insight =
    venue && meta?.matchDesc
      ? `${meta.matchDesc} at ${venue}. Watch toss impact and venue trend before locking your pick.`
      : venue
        ? `Venue trend at ${venue} can influence the result. Check lineups before placing your vote.`
        : "Recent form and toss can shift match momentum quickly. Review squads before voting.";

  async function vote(teamVoted: string) {
    if (loading || voted) return;
    setLoading(true);
    setError(null);

    try {
      await submitVote({ matchId: match.id, teamVoted });
      window.location.reload();
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : "Error");
      setLoading(false);
    }
  }

  return (
    <div className="glass-card overflow-hidden rounded-2xl p-5">
      <div className="mb-4 flex items-center justify-between gap-2">
        <div className="rounded-full bg-surface-container-high px-3 py-1 text-[10px] font-bold uppercase tracking-[0.2em] text-on-surface-variant">
          {startIn}
        </div>
        <div className="rounded-full bg-secondary/20 px-3 py-1 text-[10px] font-bold uppercase tracking-[0.18em] text-secondary">
          {confidenceLabel}
        </div>
      </div>

      <div className="border-b border-outline-variant/15 pb-5">
        {subtitleParts.length > 0 ? (
          <p className="mb-3 text-[11px] font-bold uppercase tracking-[0.18em] text-on-surface-variant">
            {subtitleParts.join(" · ")}
          </p>
        ) : null}

        <div className="grid grid-cols-[1fr_auto_1fr] items-center gap-3">
          <div className="text-center">
            <div className="mx-auto mb-2 flex h-16 w-16 items-center justify-center overflow-hidden rounded-full bg-surface-container-highest text-sm font-black text-primary">
              {team1Logo ? (
                <Image
                  src={team1Logo}
                  alt={match.team1}
                  width={56}
                  height={56}
                  className="scale-125 object-cover"
                />
              ) : (
                team1Badge
              )}
            </div>
            <p className="font-display text-base font-bold uppercase tracking-wide text-on-surface">
              {meta?.team1Short ?? match.team1}
            </p>
          </div>

          <div className="text-center">
            <p className="font-display text-lg font-black italic text-on-surface-variant">VS</p>
            <p className="mt-1 text-xs font-bold uppercase tracking-[0.16em] text-on-surface-variant">
              {match.status}
            </p>
          </div>

          <div className="text-center">
            <div className="mx-auto mb-2 flex h-16 w-16 items-center justify-center overflow-hidden rounded-full bg-surface-container-highest text-sm font-black text-secondary">
              {team2Logo ? (
                <Image
                  src={team2Logo}
                  alt={match.team2}
                  width={56}
                  height={56}
                  className="scale-125 object-cover"
                />
              ) : (
                team2Badge
              )}
            </div>
            <p className="font-display text-base font-bold uppercase tracking-wide text-on-surface">
              {meta?.team2Short ?? match.team2}
            </p>
          </div>
        </div>

        <p className="mt-3 text-center text-sm text-on-surface-variant">
          {formattedMatchDate}
          {venue ? ` • ${venue}` : ""}
        </p>
      </div>

      <div className="mt-4 rounded-xl bg-surface-container-high px-4 py-3">
        <p className="text-xs font-bold uppercase tracking-[0.16em] text-primary">Expert Insight</p>
        <p className="mt-1 text-sm leading-relaxed text-on-surface-variant">{insight}</p>
      </div>

      <div className="mt-4 flex flex-wrap items-center gap-2">
        {voted ? (
          <div className="w-full rounded-xl bg-surface-container-high px-4 py-3 text-sm text-on-surface">
            Your vote:{" "}
            <span className="font-display font-bold text-primary">{existingVoteTeam}</span>
          </div>
        ) : canVote ? (
          <>
            <button
              type="button"
              onClick={() => vote(match.team1)}
              disabled={loading}
              className="btn-primary h-12 flex-1 px-4 text-sm"
            >
              Vote {meta?.team1Short ?? match.team1}
            </button>
            <button
              type="button"
              onClick={() => vote(match.team2)}
              disabled={loading}
              className="btn-outline h-12 flex-1 px-4 text-sm"
            >
              Vote {meta?.team2Short ?? match.team2}
            </button>
          </>
        ) : (
          <div className="w-full rounded-xl bg-surface-container-high px-4 py-3 text-sm text-on-surface-variant">
            Voting not available on this day.
          </div>
        )}
      </div>

      {error ? <div className="mt-2 text-sm text-tertiary">{error}</div> : null}
    </div>
  );
}
