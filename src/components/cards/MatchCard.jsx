import Link from "next/link";
import LiveBadge from "@/components/ui/LiveBadge";

/**
 * Match prediction card — component library "Signature Cards > Match Card".
 *
 * Props:
 *   href       — link target (e.g. /tournaments/[id])
 *   team1      — home team name
 *   team2      — away team name
 *   score1     — current score string, e.g. "164/4"
 *   overs      — overs string, e.g. "14.2"
 *   isLive     — show live badge
 *   ctaLabel   — button text (default "Predict Now")
 */
export default function MatchCard({
  href,
  team1,
  team2,
  score1,
  overs,
  isLive = false,
  ctaLabel = "Predict Now",
}) {
  const inner = (
    <div className="bg-surface-container-high rounded-3xl p-1 overflow-hidden group cursor-pointer">
      <div className="card-match">
        <div className="flex justify-between items-center">
          {isLive ? (
            <LiveBadge />
          ) : (
            <span className="badge-live bg-secondary/10 text-secondary">
              Upcoming
            </span>
          )}
          {overs && (
            <span className="text-xs font-label text-outline">
              Overs: {overs}
            </span>
          )}
        </div>

        <div className="flex justify-between items-center gap-4">
          <div className="flex-1 text-center space-y-2">
            <div className="w-16 h-16 mx-auto bg-surface-container-highest rounded-full flex items-center justify-center border border-outline-variant/20">
              <span className="material-symbols-outlined text-2xl text-primary">
                sports_cricket
              </span>
            </div>
            <h4 className="font-display font-bold text-lg leading-tight uppercase">
              {team1}
            </h4>
            {score1 && (
              <p className="text-sm font-bold text-primary">{score1}</p>
            )}
          </div>

          <div className="text-center">
            <p className="font-display text-3xl font-black text-primary italic">
              VS
            </p>
          </div>

          <div className="flex-1 text-center space-y-2">
            <div className="w-16 h-16 mx-auto bg-surface-container-highest rounded-full flex items-center justify-center border border-outline-variant/20">
              <span className="material-symbols-outlined text-2xl text-secondary">
                sports_cricket
              </span>
            </div>
            <h4 className="font-display font-bold text-lg leading-tight uppercase">
              {team2}
            </h4>
          </div>
        </div>

        <button className="w-full py-4 bg-primary text-on-primary font-black uppercase tracking-widest rounded-xl text-sm group-hover:scale-105 transition-transform">
          {ctaLabel}
        </button>
      </div>
    </div>
  );

  if (href) {
    return <Link href={href}>{inner}</Link>;
  }
  return inner;
}
