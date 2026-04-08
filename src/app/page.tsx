import Image from "next/image";
import Link from "next/link";
import { redirect } from "next/navigation";
import TopBar from "@/components/navigation/TopBar";
import { HERO_STADIUM_IMAGE } from "@/lib/team-logos";
import { getAuthContext } from "@/services/server";

export default async function Home() {
  const { supabaseUser } = await getAuthContext();
  if (supabaseUser) redirect("/dashboard");

  return (
    <div className="min-h-screen bg-background bg-stadium-mesh text-on-surface">
      <TopBar
        rightSlot={
          <div className="flex items-center gap-3">
            <Link
              href="/predictions"
              className="hidden font-display text-sm font-bold tracking-tight text-zinc-400 hover:text-primary-container md:block"
            >
              Predictions
            </Link>
            <Link
              href="/tournaments"
              className="hidden font-display text-sm font-bold tracking-tight text-zinc-400 hover:text-primary-container md:block"
            >
              Circles
            </Link>
            <Link
              href="/leaderboard"
              className="hidden font-display text-sm font-bold tracking-tight text-zinc-400 hover:text-primary-container md:block"
            >
              Rankings
            </Link>
            <Link
              href="/login"
              className="rounded-full border border-primary-container/35 bg-surface-container-high px-4 py-1.5 font-display text-sm font-bold text-primary-container"
            >
              Login
            </Link>
          </div>
        }
      />

      <main className="bg-hero-glow mx-auto flex w-full max-w-md flex-grow flex-col items-center justify-start px-6 pb-24 pt-16">
        <div className="group relative mt-8 aspect-[4/5] w-full overflow-hidden rounded-xl shadow-2xl shadow-primary-container/10">
          <Image
            src={HERO_STADIUM_IMAGE}
            alt="Floodlit cricket stadium at night"
            fill
            priority
            sizes="(max-width: 768px) 100vw, 448px"
            className="object-cover grayscale-[20%] transition-all duration-700 group-hover:grayscale-0"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-background via-transparent to-transparent" />
          <div className="absolute bottom-6 left-6 right-6">
            <h1 className="font-display text-4xl font-extrabold italic tracking-tighter text-primary-container drop-shadow-2xl sm:text-5xl">
              STADIUM PULSE
            </h1>
            <div className="mt-2 h-1 w-20 rounded-full bg-primary-container" />
          </div>
        </div>

        <section className="mt-12 w-full text-center">
          <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-outline-variant/50 bg-surface-container-high px-3 py-1">
            <span className="material-symbols-outlined text-[16px] text-primary-container">verified</span>
            <span className="font-display text-[10px] font-bold uppercase tracking-widest text-on-surface-variant">
              Pure Skill • No Stakes
            </span>
          </div>
          <h2 className="font-display text-3xl font-black leading-none tracking-tight text-on-surface">
            FOR THE GLORY.
            <br />
            <span className="text-primary-container">FOR THE FUN.</span>
          </h2>
          <p className="mt-4 px-4 text-sm leading-relaxed text-on-surface-variant">
            The ultimate IPL prediction playground. Rise through the rankings, earn bragging rights, and feel the adrenaline of every match—strictly for the love of the game.
          </p>
        </section>

        <section className="mt-12 w-full space-y-4 pb-8">
          <Link
            href="/onboarding"
            className="btn-primary flex w-full items-center justify-center gap-2 py-4 text-base"
          >
            <span>Get Started</span>
            <span className="material-symbols-outlined font-bold">arrow_forward</span>
          </Link>
          <Link href="/login" className="btn-outline flex w-full justify-center py-4 text-base">
            Sign In
          </Link>

          <div className="grid grid-cols-3 gap-4 border-t border-outline-variant/20 pt-8">
            <div className="text-center">
              <p className="font-display text-lg font-bold leading-none text-primary-container">500K+</p>
              <p className="mt-1 text-[9px] font-medium uppercase tracking-widest text-on-surface-variant">Players</p>
            </div>
            <div className="border-x border-outline-variant/20 text-center">
              <p className="font-display text-lg font-bold leading-none text-primary-container">₹0</p>
              <p className="mt-1 text-[9px] font-medium uppercase tracking-widest text-on-surface-variant">Entry Fee</p>
            </div>
            <div className="text-center">
              <p className="font-display text-lg font-bold leading-none text-primary-container">IPL</p>
              <p className="mt-1 text-[9px] font-medium uppercase tracking-widest text-on-surface-variant">Live</p>
            </div>
          </div>
        </section>

        <section className="mt-8 w-full space-y-6">
          <div className="glass-card p-6">
            <div className="mb-4 inline-flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10 text-primary">
              <span className="material-symbols-outlined">groups</span>
            </div>
            <h3 className="font-display text-xl font-bold uppercase tracking-tight text-on-surface">
              Private Squad Leaderboards
            </h3>
            <p className="mt-3 text-sm text-on-surface-variant">
              Create exclusive circles for your friends, family, or colleagues and dominate the ranks.
            </p>
          </div>
          <div className="glass-card p-6">
            <div className="mb-4 inline-flex h-12 w-12 items-center justify-center rounded-xl bg-secondary/10 text-secondary">
              <span className="material-symbols-outlined">query_stats</span>
            </div>
            <h3 className="font-display text-xl font-bold uppercase tracking-tight text-on-surface">
              Predict Match Outcomes
            </h3>
            <p className="mt-3 text-sm text-on-surface-variant">
              Dive into live stats and make your call each matchday to climb rankings.
            </p>
          </div>
          <div className="glass-card p-6">
            <div className="mb-4 inline-flex h-12 w-12 items-center justify-center rounded-xl bg-tertiary/10 text-tertiary">
              <span className="material-symbols-outlined">military_tech</span>
            </div>
            <h3 className="font-display text-xl font-bold uppercase tracking-tight text-on-surface">
              For Glory, For Fun
            </h3>
            <p className="mt-3 text-sm text-on-surface-variant">
              Level up your profile, earn badges, and compete for bragging rights.
            </p>
          </div>
        </section>

        <p className="mt-10 text-center text-xs uppercase tracking-widest text-on-surface-variant">
          No monetary value. Purely for entertainment.
        </p>
      </main>
    </div>
  );
}
