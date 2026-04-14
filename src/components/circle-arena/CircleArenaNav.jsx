"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";

const tabBase =
  "shrink-0 px-6 py-3 font-headline text-xs font-bold uppercase tracking-widest transition-all border-b-2";

/**
 * Stitch — Technical HUD tabs (Live / Predictions / History / Leaderboard / Invite).
 */
export default function CircleArenaNav({ tournamentId, hasLive = false }) {
  const pathname = usePathname();
  const base = `/tournaments/${tournamentId}`;
  const isPred = pathname === base || pathname === `${base}/vote`;
  const isHistory = pathname === `${base}/history`;
  const isLb = pathname === `${base}/leaderboard`;
  const isLive = pathname === `${base}/live`;

  return (
    <nav className="mb-8 flex gap-1 overflow-x-auto border-b border-zinc-800" aria-label="Circle sections">
      {hasLive ? (
        <Link
          href={`${base}/live`}
          className={cn(
            tabBase,
            isLive
              ? "border-primary bg-primary/5 text-primary"
              : "border-transparent text-zinc-500 hover:text-zinc-300"
          )}
        >
          Live arena
        </Link>
      ) : null}
      <Link
        href={base}
        className={cn(
          tabBase,
          isPred
            ? "border-primary bg-primary/5 text-primary"
            : "border-transparent text-zinc-500 hover:text-zinc-300"
        )}
      >
        Predictions
      </Link>
      <Link
        href={`${base}/history`}
        className={cn(
          tabBase,
          isHistory
            ? "border-primary bg-primary/5 text-primary"
            : "border-transparent text-zinc-500 hover:text-zinc-300"
        )}
      >
        History
      </Link>
      <Link
        href={`${base}/leaderboard`}
        className={cn(
          tabBase,
          isLb
            ? "border-primary bg-primary/5 text-primary"
            : "border-transparent text-zinc-500 hover:text-zinc-300"
        )}
      >
        Leaderboard
      </Link>
      <Link
        href={`${base}#invite`}
        scroll
        className={cn(tabBase, "border-transparent text-zinc-500 hover:text-zinc-300")}
      >
        Invite
      </Link>
    </nav>
  );
}
