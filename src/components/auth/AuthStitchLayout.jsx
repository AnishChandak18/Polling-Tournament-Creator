"use client";

import BottomNav from "@/components/navigation/BottomNav";
import BrandLogo from "@/components/branding/BrandLogo";

/**
 * Shared shell for Stitch auth screens: tactical header, gold accent, kinetic grid.
 */
export default function AuthStitchLayout({ children }) {
  return (
    <div className="min-h-screen bg-background text-on-surface selection:bg-primary selection:text-on-primary">
      <header className="fixed top-0 z-50 flex h-20 w-full items-center justify-between border-b border-zinc-800/50 bg-zinc-950/40 px-6 backdrop-blur-xl">
        <BrandLogo href="/" />
        <div className="hidden items-center gap-4 md:flex">
          <span className="font-display text-[10px] font-bold uppercase tracking-[0.2em] text-zinc-500">
            System Status: <span className="text-emerald-500">Nominal</span>
          </span>
        </div>
      </header>

      <main className="relative min-h-screen overflow-hidden pb-28 pt-20">
        <div className="pointer-events-none absolute inset-0 bg-stadium-mesh opacity-90" />
        <div className="pointer-events-none absolute -left-20 top-1/4 h-96 w-96 rounded-full bg-primary/10 blur-[120px]" />
        <div className="pointer-events-none absolute -right-20 bottom-1/4 h-96 w-96 rounded-full bg-secondary/10 blur-[120px]" />
        <div className="relative z-10 flex min-h-[calc(100dvh-5rem)] flex-col items-center justify-center p-4 pb-12">
          {children}
        </div>
      </main>
      <BottomNav active="home" />
    </div>
  );
}
