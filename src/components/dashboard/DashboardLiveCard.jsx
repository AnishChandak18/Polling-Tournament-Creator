import Link from "next/link";
import Image from "next/image";
import { getTeamLogoByName } from "@/lib/team-logos";

function shortTeam(name) {
  const w = name.trim().split(/\s+/)[0];
  return w?.length ? w : name;
}

/**
 * Stitch Home — "Live Now" match spotlight (mobile canvas).
 *
 * @param {object} props
 * @param {string} props.team1
 * @param {string} props.team2
 * @param {Date} props.matchDate
 * @param {string} props.season
 * @param {boolean} props.isLiveDay
 * @param {string} props.predictHref
 * @param {string | null} [props.liveArenaHref]
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
  const t1 = shortTeam(team1);
  const t2 = shortTeam(team2);
  const team1Logo = getTeamLogoByName(team1);
  const team2Logo = getTeamLogoByName(team2);
  const timeLabel = new Intl.DateTimeFormat("en-IN", {
    hour: "2-digit",
    minute: "2-digit",
    timeZone: "Asia/Kolkata",
  }).format(matchDate);

  return (
    <section>
      <div className="group relative overflow-hidden rounded-xl border border-outline-variant bg-surface-container-high">
        <div className="pointer-events-none absolute inset-0 bg-gradient-to-br from-yellow-400/10 to-transparent" />
        <div className="relative z-10 p-5">
          <div className="mb-4 flex items-start justify-between">
            {isLiveDay ? (
              <span className="flex items-center gap-1 rounded bg-error px-2 py-0.5 text-[10px] font-bold uppercase tracking-widest text-white">
                <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-white" />
                Live Now
              </span>
            ) : (
              <span className="rounded bg-surface-container px-2 py-0.5 text-[10px] font-bold uppercase tracking-widest text-on-surface-variant">
                Upcoming
              </span>
            )}
            <span className="text-xs font-medium text-on-surface-variant">Indian Premier League</span>
          </div>

          <div className="flex items-center justify-between text-center">
            <div className="flex-1">
              <div className="mx-auto mb-2 flex h-14 w-14 items-center justify-center overflow-hidden rounded-full border border-outline-variant bg-zinc-800">
                {team1Logo ? (
                  <Image
                    src={team1Logo}
                    alt={team1}
                    width={48}
                    height={48}
                    className="scale-125 object-cover"
                  />
                ) : (
                  <span className="material-symbols-outlined text-2xl text-secondary">shield</span>
                )}
              </div>
              <p className="font-display text-xs font-bold uppercase tracking-tight text-on-surface">{t1}</p>
              <p className="mt-1 font-display text-xl font-extrabold text-on-surface">—</p>
            </div>
            <div className="px-4">
              <span className="font-display text-lg font-black italic text-zinc-600">VS</span>
            </div>
            <div className="flex-1">
              <div className="mx-auto mb-2 flex h-14 w-14 items-center justify-center overflow-hidden rounded-full border border-outline-variant bg-zinc-800">
                {team2Logo ? (
                  <Image
                    src={team2Logo}
                    alt={team2}
                    width={48}
                    height={48}
                    className="scale-125 object-cover"
                  />
                ) : (
                  <span className="material-symbols-outlined text-2xl text-primary-container">shield</span>
                )}
              </div>
              <p className="font-display text-xs font-bold uppercase tracking-tight text-on-surface">{t2}</p>
              <p className="mt-1 font-display text-xl font-extrabold text-on-surface">—</p>
            </div>
          </div>

          <div className="mt-6 flex flex-col gap-3">
            <div className="flex justify-between text-[10px] font-bold uppercase tracking-widest text-on-surface-variant">
              <span>Start · {timeLabel} IST</span>
              <span>IPL {season}</span>
            </div>
            {isMatchLive && liveArenaHref ? (
              <Link
                href={liveArenaHref}
                className="btn-primary pulse-shadow flex h-14 w-full items-center justify-center gap-2 py-4 text-sm uppercase tracking-widest"
              >
                <span className="material-symbols-outlined text-xl">sensors</span>
                Enter live arena
              </Link>
            ) : (
              <Link
                href={predictHref}
                className="btn-primary pulse-shadow flex h-14 w-full items-center justify-center gap-2 py-4 text-sm uppercase tracking-widest"
              >
                <span className="material-symbols-outlined text-xl">query_stats</span>
                Predict Now
              </Link>
            )}
          </div>
        </div>
        <div className="pointer-events-none absolute -bottom-10 -right-10 h-32 w-32 rounded-full bg-yellow-400/5 blur-3xl" />
      </div>
    </section>
  );
}
