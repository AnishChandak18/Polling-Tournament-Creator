"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { joinWithCircleCode, joinWithInviteToken } from "@/services/api";
import { Alert } from "@/components/ui/Alert";
import BrandLogo from "@/components/branding/BrandLogo";
import BottomNav from "@/components/navigation/BottomNav";
import { navigateSpa } from "@/lib/client-navigation";

export default function JoinClient({
  token,
  initialCode = "",
  isLoggedIn,
  needsOnboarding,
}) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [code, setCode] = useState(initialCode);

  const joinPath = token
    ? `/join?t=${encodeURIComponent(token)}`
    : `/join${initialCode ? `?code=${encodeURIComponent(initialCode)}` : ""}`;
  const nextEncoded = encodeURIComponent(joinPath);

  async function handleJoin() {
    setLoading(true);
    setError(null);
    try {
      const payload = token
        ? await joinWithInviteToken(token)
        : await joinWithCircleCode(code.trim().toUpperCase());
      const { tournamentId } = payload;
      const target = `/tournaments/${tournamentId}`;
      if (needsOnboarding) {
        await navigateSpa(router, `/onboarding?next=${encodeURIComponent(target)}`);
      } else {
        await navigateSpa(router, target);
      }
    } catch (e) {
      setError(e instanceof Error ? e.message : "Could not join circle");
    } finally {
      setLoading(false);
    }
  }

  const hasToken = Boolean(token);
  const preview =
    token.length > 12 ? `${token.slice(0, 6)}…${token.slice(-4)}` : token;

  return (
    <div className="min-h-screen bg-background bg-stadium-mesh text-on-surface">
      <header className="fixed left-0 top-0 z-50 flex h-16 w-full items-center justify-between border-b-2 border-primary/30 bg-black/90 px-6 shadow-[0_0_15px_rgba(255,215,0,0.08)] backdrop-blur-md">
        <BrandLogo href="/" />
      </header>

      <main className="relative mx-auto max-w-2xl flex-grow px-6 pb-32 pt-24">
        <div
          className="pointer-events-none fixed inset-0 opacity-20 [background:linear-gradient(to_bottom,transparent_50%,rgba(255,215,9,0.05)_50%)] [background-size:100%_4px]"
          aria-hidden
        />

        <div className="mb-10">
          <div className="mb-2 flex items-center gap-2">
            <div className="h-1 w-12 bg-primary" />
            <span className="font-display text-xs font-bold uppercase tracking-[0.2em] text-primary">
              Infiltration sequence
            </span>
          </div>
          <h1 className="font-display text-4xl font-black uppercase leading-none tracking-tighter">
            Join tactical
            <br />
            <span className="text-primary-container">circle</span>
          </h1>
          <p className="mt-3 max-w-md text-sm text-on-surface-variant">
            Synchronize with your squad. Join using a circle code or a private
            invite link.
          </p>
        </div>

        <div className="relative mb-8 group">
          <div className="absolute -inset-1 bg-primary/20 opacity-25 blur transition-opacity group-focus-within:opacity-50" />
          <div className="relative border-l-4 border-primary bg-surface-container p-1">
            <div className="px-4 pt-2 font-display text-[10px] font-bold uppercase tracking-widest text-primary">
              Circle deployment code
            </div>
            <div className="flex items-center px-4 pb-4">
              <span
                className="material-symbols-outlined mr-4 text-primary"
                style={{ fontVariationSettings: "'FILL' 1" }}
              >
                qr_code_2
              </span>
              {hasToken ? (
                <p className="font-display w-full break-all text-lg font-bold uppercase tracking-wider text-on-surface">
                  {preview}
                </p>
              ) : (
                <input
                  value={code}
                  onChange={(e) => setCode(e.target.value.toUpperCase())}
                  placeholder="ENTER CODE"
                  className="w-full bg-transparent text-lg font-bold uppercase tracking-[0.22em] text-on-surface outline-none placeholder:text-on-surface-variant"
                />
              )}
            </div>
          </div>
          <div className="absolute -right-1 -top-1 h-4 w-4 border-r-2 border-t-2 border-primary/40" />
          <div className="absolute -bottom-1 -right-1 h-4 w-4 border-b-2 border-r-2 border-primary/40" />
        </div>

        {!isLoggedIn ? (
          <div className="space-y-3">
            <p className="text-sm text-on-surface-variant">
              Sign in to accept this invite.
            </p>
            <Link
              href={`/login?next=${nextEncoded}`}
              className="btn-primary flex h-14 w-full items-center justify-center gap-2 text-sm font-black uppercase tracking-widest shadow-[0_8px_0_0_#665500]"
            >
              Sign in
            </Link>
            <Link
              href={`/signup?next=${nextEncoded}`}
              className="flex h-12 w-full items-center justify-center border border-outline-variant text-xs font-bold uppercase tracking-widest text-on-surface hover:bg-surface-container-high"
            >
              Create an account
            </Link>
          </div>
        ) : (
          <button
            type="button"
            disabled={loading || (!hasToken && !code.trim())}
            onClick={handleJoin}
            className="flex w-full items-center justify-center gap-3 bg-primary-container py-5 font-display text-xl font-black uppercase tracking-[0.15em] text-on-primary-container shadow-[0_8px_0_0_#665500] transition-all [clip-path:polygon(0_0,100%_0,100%_85%,95%_100%,0_100%)] active:translate-y-1 active:shadow-none disabled:opacity-60"
          >
            <span>{loading ? "Joining…" : "Join arena"}</span>
            <span className="material-symbols-outlined font-bold">
              rocket_launch
            </span>
          </button>
        )}

        {error ? <Alert className="mt-4">{error}</Alert> : null}

        <div className="mt-12 grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div className="relative overflow-hidden rounded-lg border border-outline-variant bg-surface-container-low p-4">
            <div className="absolute bottom-0 left-0 top-0 w-1 bg-primary-dim" />
            <h4 className="mb-1 font-display text-[10px] font-bold uppercase tracking-widest text-on-surface-variant">
              Privacy protocol
            </h4>
            <p className="text-xs text-on-surface/70">
              Circles are private; only people with the link can request to
              join.
            </p>
          </div>
          <div className="relative overflow-hidden rounded-lg border border-outline-variant bg-surface-container-low p-4">
            <div className="absolute bottom-0 left-0 top-0 w-1 bg-primary-dim" />
            <h4 className="mb-1 font-display text-[10px] font-bold uppercase tracking-widest text-on-surface-variant">
              Recreational use
            </h4>
            <p className="text-xs text-on-surface/70">
              Built for fun predictions and friendly competition.
            </p>
          </div>
        </div>
      </main>
      <BottomNav active="circles" />
    </div>
  );
}
