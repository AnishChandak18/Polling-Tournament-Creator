"use client";

import Link from "next/link";

/**
 * Shared shell for Stitch auth screens: black top bar, gold accent, kinetic grid.
 */
export default function AuthStitchLayout({ children }) {
  return (
    <div className="min-h-screen bg-background text-on-surface selection:bg-primary selection:text-on-primary">
      <header className="fixed top-0 z-50 flex h-16 w-full items-center justify-between border-b-2 border-primary-container/20 bg-black px-6 shadow-[0_0_15px_rgba(255,215,0,0.1)]">
        <Link href="/" className="flex min-w-0 items-center gap-2">
          <span className="material-symbols-outlined shrink-0 text-2xl text-primary-container">
            sports_cricket
          </span>
          <span className="font-display truncate text-lg font-black uppercase italic tracking-widest text-primary-container sm:text-xl">
            Stadium Pulse
          </span>
        </Link>
        <div className="hidden shrink-0 gap-6 md:flex">
          <Link
            href="/"
            className="font-display text-xs font-bold uppercase tracking-widest text-zinc-500 transition-colors hover:text-primary-container"
          >
            Home
          </Link>
        </div>
      </header>

      <main className="relative min-h-screen overflow-hidden pt-16">
        <div className="pointer-events-none absolute inset-0 kinetic-grid opacity-90" />
        <div className="pointer-events-none absolute top-1/4 -left-20 h-96 w-96 rounded-full bg-primary/10 blur-[120px]" />
        <div className="pointer-events-none absolute bottom-1/4 -right-20 h-96 w-96 rounded-full bg-secondary/10 blur-[120px]" />
        <div className="relative z-10 flex min-h-[calc(100dvh-4rem)] flex-col items-center justify-center p-4 pb-12">
          {children}
        </div>
      </main>
    </div>
  );
}
