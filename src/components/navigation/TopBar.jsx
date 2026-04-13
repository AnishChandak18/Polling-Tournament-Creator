"use client";

import BrandLogo from "@/components/branding/BrandLogo";

/**
 * Fixed top bar — Stitch "TopAppBar": zinc scrim, blur, subtle border, points optional via rightSlot.
 *
 * @param {{
 *   title?: string;
 *   rightSlot?: import("react").ReactNode;
 *   leftSlot?: import("react").ReactNode;
 * }} props
 */
export default function TopBar({
  title = "STADIUM PULSE",
  rightSlot = null,
  leftSlot = null,
}) {
  return (
    <header className="fixed top-0 z-50 w-full border-b border-zinc-800 bg-zinc-950/90 shadow-[0_0_15px_rgba(255,215,0,0.1)] backdrop-blur-md">
      <div className="mx-auto flex h-16 w-full max-w-7xl items-center justify-between gap-4 px-4 md:px-6">
        <div className="flex min-w-0 items-center gap-3">
          {leftSlot}
          <BrandLogo compact={title !== "STADIUM PULSE"} />
        </div>

        <div className="flex shrink-0 items-center gap-2">{rightSlot}</div>
      </div>
    </header>
  );
}
