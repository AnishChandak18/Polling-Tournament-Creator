"use client";

import Link from "next/link";
import Image from "next/image";

/** Stitch Live Arena — TopAppBar (avatar in primary square, stars + PTS). */
export default function LiveArenaTopBar({ avatarUrl, points, userName }) {
  return (
    <header className="fixed top-0 z-50 flex h-16 w-full items-center justify-between border-b border-zinc-800 bg-zinc-950/90 px-4 shadow-[0_0_15px_rgba(255,215,0,0.1)] backdrop-blur-md">
      <Link href="/dashboard" className="flex min-w-0 items-center gap-3">
        <div className="flex h-8 w-8 shrink-0 items-center justify-center overflow-hidden rounded-lg bg-primary-container">
          {avatarUrl ? (
            <Image
              src={avatarUrl}
              alt=""
              width={32}
              height={32}
              className="h-full w-full object-cover"
              unoptimized
            />
          ) : (
            <span className="font-headline text-xs font-bold text-on-primary-container">
              {(userName || "?").slice(0, 1).toUpperCase()}
            </span>
          )}
        </div>
        <h1 className="font-headline text-xl font-black uppercase italic tracking-widest text-yellow-400">
          STADIUM PULSE
        </h1>
      </Link>
      <div className="flex items-center gap-4">
        <div className="flex items-center gap-2 rounded-lg border border-zinc-800 bg-zinc-900 px-3 py-1">
          <span
            className="material-symbols-outlined text-sm text-primary"
            style={{ fontVariationSettings: "'FILL' 1" }}
          >
            stars
          </span>
          <span className="font-headline text-sm font-bold tracking-tighter text-yellow-400">
            {points.toLocaleString()} PTS
          </span>
        </div>
      </div>
    </header>
  );
}
