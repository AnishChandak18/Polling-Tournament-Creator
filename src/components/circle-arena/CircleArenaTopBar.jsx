"use client";

import Link from "next/link";
import Image from "next/image";

/**
 * Stitch Circle Arena — TopAppBar (avatar + STADIUM PULSE + PTS chip).
 */
export default function CircleArenaTopBar({ avatarUrl, points, userName }) {
  return (
    <header className="fixed top-0 z-50 flex h-16 w-full items-center justify-between border-b border-zinc-800 bg-zinc-950/90 px-4 shadow-[0_0_15px_rgba(255,215,0,0.1)] backdrop-blur-md">
      <Link href="/dashboard" className="flex min-w-0 items-center gap-3">
        <div className="h-8 w-8 shrink-0 overflow-hidden rounded-full border border-yellow-400/30 bg-zinc-800">
          {avatarUrl ? (
            <Image src={avatarUrl} alt="" width={32} height={32} className="h-full w-full object-cover" unoptimized />
          ) : (
            <span className="flex h-full w-full items-center justify-center font-headline text-xs font-bold text-zinc-400">
              {(userName || "?").slice(0, 1).toUpperCase()}
            </span>
          )}
        </div>
        <span className="font-headline text-xl font-black uppercase italic tracking-tighter tracking-widest text-yellow-400">
          STADIUM PULSE
        </span>
      </Link>
      <div className="flex items-center">
        <span className="border border-yellow-400/20 bg-yellow-400/10 px-3 py-1 font-headline text-xs font-bold tracking-widest text-yellow-400">
          {points.toLocaleString()} PTS
        </span>
      </div>
    </header>
  );
}
