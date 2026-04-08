"use client";

import Link from "next/link";

const ITEMS = [
  {
    key: "predictions",
    href: "/predictions",
    label: "Predictions",
    icon: "ads_click",
  },
  { key: "circles", href: "/tournaments", label: "Circles", icon: "groups" },
  { key: "home", href: "/dashboard", label: "Home", icon: "sports_cricket" },
  {
    key: "leaderboard",
    href: "/leaderboard",
    label: "Rankings",
    icon: "leaderboard",
  },
  { key: "profile", href: "/profile", label: "Profile", icon: "person" },
];

export default function BottomNav({ active = "home" }) {
  return (
    <nav className="fixed bottom-0 left-0 z-50 w-full rounded-t-2xl border-t border-outline-variant/10 bg-zinc-950/90 px-2 pb-[max(1rem,env(safe-area-inset-bottom))] pt-2 shadow-[0_-10px_40px_rgba(0,0,0,0.55)] backdrop-blur-xl sm:px-4 sm:pt-3">
      <div className="mx-auto grid w-full max-w-4xl grid-cols-5 items-center gap-1">
        {ITEMS.map(({ key, href, label, icon }) => {
          const isActive = key === active;
          return (
            <Link
              key={key}
              href={href}
              className={[
                "flex w-full min-w-0 flex-col items-center justify-center rounded-xl px-1 py-1.5 transition active:scale-95 sm:px-2",
                isActive
                  ? "bg-primary/15 text-primary"
                  : "text-on-surface-variant hover:text-on-surface",
              ].join(" ")}
            >
              <span
                className="material-symbols-outlined text-[22px] sm:text-2xl"
                style={
                  isActive ? { fontVariationSettings: "'FILL' 1" } : undefined
                }
              >
                {icon}
              </span>
              <span className="mt-1 truncate text-center font-display text-[9px] font-medium uppercase tracking-wide sm:text-[10px] sm:tracking-widest">
                {label}
              </span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
