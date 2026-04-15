"use client";

import { useCallback, useEffect, useState } from "react";
import { getTournamentInvite, rotateTournamentInvite } from "@/services/api";
import { Alert } from "@/components/ui/Alert";

/**
 * Stitch — Recruit New Members + Quick Join (grid).
 */
export default function CircleArenaInvite({ tournamentId, isOwner }) {
  const [inviteUrl, setInviteUrl] = useState(null);
  const [joinCode, setJoinCode] = useState("");
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState(null);
  const [copied, setCopied] = useState(false);

  const load = useCallback(() => {
    if (!isOwner) return;
    setLoading(true);
    setError(null);
    getTournamentInvite(tournamentId)
      .then((r) => {
        setInviteUrl(r.inviteUrl);
        setJoinCode(r.joinCode);
      })
      .catch((e) =>
        setError(e instanceof Error ? e.message : "Failed to load invite"),
      )
      .finally(() => setLoading(false));
  }, [isOwner, tournamentId]);

  useEffect(() => {
    load();
  }, [load]);

  async function generateOrRotate() {
    setBusy(true);
    setError(null);
    try {
      const r = await rotateTournamentInvite(tournamentId);
      setInviteUrl(r.inviteUrl);
      setJoinCode(r.joinCode);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Could not update link");
    } finally {
      setBusy(false);
    }
  }

  async function copy() {
    if (!inviteUrl) return;
    try {
      await navigator.clipboard.writeText(inviteUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      setError("Clipboard not available");
    }
  }

  async function copyCode() {
    if (!joinCode) return;
    try {
      await navigator.clipboard.writeText(joinCode);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      setError("Clipboard not available");
    }
  }

  if (!isOwner) {
    return (
      <section className="mt-12 grid grid-cols-1 gap-6 md:grid-cols-3">
        <div className="border border-zinc-800 bg-zinc-900/40 p-8 md:col-span-3">
          <h3 className="font-headline text-xl font-black uppercase italic tracking-tighter text-on-background">
            Invites
          </h3>
          <p className="mt-2 text-sm text-zinc-400">
            Only the circle owner can generate invite links and codes. Ask them
            to share the circle link with you.
          </p>
        </div>
      </section>
    );
  }

  return (
    <section className="mt-12 grid grid-cols-1 gap-6 md:grid-cols-3">
      <div className="relative flex flex-col justify-center border border-primary/20 bg-primary/5 p-8 md:col-span-2">
        <div className="pointer-events-none absolute right-0 top-0 h-24 w-24 overflow-hidden opacity-10">
          <span className="material-symbols-outlined -translate-y-8 translate-x-8 -rotate-12 text-[100px] text-primary">
            qr_code_2
          </span>
        </div>
        <h3 className="mb-2 font-headline text-2xl font-black uppercase italic tracking-tighter text-primary">
          Recruit New Members
        </h3>
        <p className="mb-6 max-w-md text-sm text-zinc-400">
          Expand the Circle. For every member that joins using your unique
          kinetic pulse code, you earn{" "}
          <span className="font-bold text-primary">50 BONUS PTS</span>.
        </p>
        {error ? <Alert className="mb-4">{error}</Alert> : null}
        {loading ? (
          <p className="text-sm text-zinc-500">Loading invite…</p>
        ) : inviteUrl ? (
          <div className="flex gap-2">
            <div className="flex flex-1 items-center justify-between border border-primary/30 bg-zinc-950 px-4 py-3 font-headline font-bold tracking-[0.3em] text-primary">
              <span className="font-mono text-sm tracking-[0.28em] sm:text-base">
                {joinCode}
              </span>
              <button
                type="button"
                className="material-symbols-outlined text-sm transition-colors hover:text-white"
                onClick={copyCode}
                aria-label="Copy code"
              >
                content_copy
              </button>
            </div>
            <button
              type="button"
              onClick={copy}
              disabled={busy}
              className="btn-primary h-12 shrink-0 px-6 font-headline text-xs font-black uppercase tracking-widest active:scale-95 disabled:opacity-60"
            >
              {copied ? "Copied" : "SHARE"}
            </button>
          </div>
        ) : (
          <button
            type="button"
            disabled={busy}
            onClick={generateOrRotate}
            className="btn-primary h-12 px-6 font-headline text-xs font-black uppercase tracking-widest"
          >
            {busy ? "Generating…" : "Generate invite"}
          </button>
        )}
      </div>
      <div className="flex flex-col items-center justify-center border border-zinc-800 bg-zinc-900 p-8 text-center">
        <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-full border-2 border-dashed border-zinc-700 text-zinc-700">
          <span className="material-symbols-outlined text-3xl">add</span>
        </div>
        <h4 className="font-headline text-xs font-bold uppercase tracking-widest text-zinc-500">
          Quick Join
        </h4>
        <p className="mt-2 text-[10px] uppercase text-zinc-600">
          Scan QR to sync mobile
        </p>
      </div>
    </section>
  );
}
