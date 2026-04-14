import Link from "next/link";
import Image from "next/image";
import {
  formatMatchTopLine,
  displayTeamName,
} from "@/lib/circle-match-card-format";
import { getTeamLogoByName } from "@/lib/team-logos";

const matchDateFormatter = new Intl.DateTimeFormat("en-IN", {
  day: "2-digit",
  month: "short",
  year: "numeric",
  hour: "2-digit",
  minute: "2-digit",
  timeZone: "Asia/Kolkata",
});

/**
 * Dashboard spotlight — same shell as MatchVoteCard (/vote).
 *
 * @param {object} props
 * @param {string} props.team1
 * @param {string} props.team2
 * @param {Date} props.matchDate
 * @param {string|number} props.season
 * @param {boolean} props.isLiveDay
 * @param {string} props.predictHref
 * @param {string|null|undefined} [props.liveArenaHref]
 * @param {boolean} [props.isMatchLive]
 */
export default function DashboardLiveCard({
  team1,
  team2,
  matchDate,
  season,
  isLiveDay,
  predictHref,
  liveArenaHref = null,
  isMatchLive = false,
}) {
  const matchLike = {
    status: isMatchLive ? "LIVE" : "UPCOMING",
    matchDate: matchDate.toISOString(),
  };
  const meta = { seriesName: "IPL" };
  const topLine = formatMatchTopLine(matchLike, meta, { kickoffPast: false });
  const t1 = displayTeamName(team1, null);
  const t2 = displayTeamName(team2, null);
  const team1Logo = getTeamLogoByName(team1);
  const team2Logo = getTeamLogoByName(team2);
  const formattedWhen = matchDateFormatter.format(matchDate);

  const ctaHref = isMatchLive && liveArenaHref ? liveArenaHref : predictHref;
  const ctaLabel =
    isMatchLive && liveArenaHref ? "Enter live arena" : "Predict now";
  const ctaIcon = isMatchLive && liveArenaHref ? "sensors" : "query_stats";

  return (
    <section>
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
            {isMatchLive ? (
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
              isMatchLive
                ? "mb-6 flex items-center justify-between gap-4"
                : "mb-6 flex items-center justify-between gap-4 transition-all opacity-100"
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
                    unoptimized
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
                    unoptimized
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
            <span className="text-zinc-600"> · IPL {season}</span>
            {isLiveDay && !isMatchLive ? (
              <span className="ml-2 rounded bg-error/20 px-1.5 py-0.5 text-[9px] font-black text-error">
                Match day
              </span>
            ) : null}
          </p>

          <div className="grid grid-cols-2 gap-3">
            <Link
              href={ctaHref}
              className="col-span-2 flex h-14 w-full items-center justify-center gap-2 border border-zinc-700 bg-zinc-800 py-3 font-headline text-xs font-bold uppercase tracking-widest text-on-surface transition-all hover:bg-primary hover:text-on-primary"
            >
              <span className="material-symbols-outlined text-xl">
                {ctaIcon}
              </span>
              {ctaLabel}
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}
