"use client";

import Link from "next/link";

const ITEMS = [
  { key: "predictions", href: "/predictions", label: "Predictions", icon: "query_stats" },
  { key: "circles", href: "/tournaments", label: "Circles", icon: "group" },
  { key: "home", href: "/dashboard", label: "Home", icon: "stadium" },
  { key: "leaderboard", href: "/leaderboard", label: "Rankings", icon: "leaderboard" },
  { key: "results", href: "/results", label: "Results", icon: "emoji_events" },
  { key: "profile", href: "/profile", label: "Profile", icon: "person" },
];

/**
 * Stitch Circle Arena — bottom nav (md:hidden), Circles active on this flow.
 */
export default function CircleArenaBottomNav({ active = "circles" }) {
  return (
    <nav className="fixed bottom-0 left-0 z-50 flex h-[4.25rem] w-full items-center border-t border-zinc-800 bg-zinc-950 px-1 pb-[max(0.25rem,env(safe-area-inset-bottom))] shadow-[0_-4px_20px_rgba(0,0,0,0.5)] md:hidden">
      {ITEMS.map(({ key, href, label, icon }) => {
        const isActive = key === active;
        return (
          <Link
            key={key}
            href={href}
            className={[
              "flex min-w-0 flex-1 flex-col items-center justify-center px-0.5 pt-2 pb-1 transition-all duration-300 ease-out",
              isActive
                ? "rounded-none border-t-2 border-yellow-400 bg-yellow-400/10 text-yellow-400"
                : "text-zinc-500 hover:text-yellow-200",
            ].join(" ")}
          >
            <span
              className="material-symbols-outlined"
              style={isActive && key === "circles" ? { fontVariationSettings: "'FILL' 1" } : undefined}
            >
              {icon}
            </span>
            <span className="mt-1 max-w-full truncate text-center font-display text-[8px] font-bold uppercase tracking-wide sm:text-[9px] sm:tracking-widest">
              {label}
            </span>
          </Link>
        );
      })}
    </nav>
  );
}
