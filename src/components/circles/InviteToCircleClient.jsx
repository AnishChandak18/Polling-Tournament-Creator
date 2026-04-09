"use client";

import { useCallback, useEffect, useState } from "react";
import { getTournamentInvite, rotateTournamentInvite } from "@/services/api";
import { Alert } from "@/components/ui/Alert";
import { Button } from "@/components/ui/button";

export default function InviteToCircleClient({ tournamentId, isOwner }) {
  const [inviteUrl, setInviteUrl] = useState(null);
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState(null);
  const [copied, setCopied] = useState(false);

  const load = useCallback(() => {
    if (!isOwner) return;
    setLoading(true);
    setError(null);
    getTournamentInvite(tournamentId)
      .then((r) => setInviteUrl(r.inviteUrl))
      .catch((e) => setError(e instanceof Error ? e.message : "Failed to load invite"))
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

  if (!isOwner) return null;

  return (
    <section className="mt-8 overflow-hidden rounded-2xl border border-outline-variant/20 bg-surface-container-low/80 p-6">
      <div className="mb-2 flex items-center gap-2">
        <span className="material-symbols-outlined text-primary">person_add</span>
        <h2 className="font-display text-lg font-black uppercase tracking-tight text-on-surface">
          Invite to circle
        </h2>
      </div>
      <p className="text-sm text-on-surface-variant">
        Share a private link. Anyone with the link can join after signing in.
      </p>

      {error ? <Alert className="mt-3">{error}</Alert> : null}

      {loading ? (
        <p className="mt-4 text-xs text-on-surface-variant">Loading invite…</p>
      ) : inviteUrl ? (
        <div className="mt-4 space-y-3">
          <div className="break-all rounded-xl border border-outline-variant/30 bg-surface-container-high px-3 py-2 font-mono text-xs text-on-surface">
            {inviteUrl}
          </div>
          <div className="flex flex-wrap gap-2">
            <Button type="button" variant="default" disabled={busy} onClick={copy}>
              {copied ? "Copied" : "Copy link"}
            </Button>
            <Button type="button" variant="outline" disabled={busy} onClick={generateOrRotate}>
              {busy ? "Working…" : "New link"}
            </Button>
          </div>
        </div>
      ) : (
        <div className="mt-4">
          <Button type="button" disabled={busy} onClick={generateOrRotate}>
            {busy ? "Creating…" : "Generate invite link"}
          </Button>
        </div>
      )}
    </section>
  );
}
