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
    <div className="min-h-screen bg-background bg-stadium-mesh pb-28">
      <TopBar rightSlot={rightSlot} />

      <main
        className={["mx-auto space-y-8 px-6 pb-32 pt-24", maxWidth, className].join(" ")}
      >
        {children}
      </main>

      <BottomNav active={active} />
    </div>
  );
}
