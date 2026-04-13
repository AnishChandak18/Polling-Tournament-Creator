"use client";

import TopBar from "@/components/navigation/TopBar";
import BottomNav from "@/components/navigation/BottomNav";

/**
 * Authenticated shell: TopBar + bottom nav + stadium mesh backdrop.
 */
export default function PageShell({
  active = "home",
  rightSlot,
  maxWidth = "max-w-5xl",
  className = "",
  children,
}) {
  return (
    <div className="min-h-screen bg-background pb-28">
      <TopBar rightSlot={rightSlot} />

      <main
        className={["mx-auto space-y-8 bg-stadium-mesh px-4 pb-32 pt-24 sm:px-6", maxWidth, className].join(" ")}
      >
        {children}
      </main>

      <BottomNav active={active} />
    </div>
  );
}
