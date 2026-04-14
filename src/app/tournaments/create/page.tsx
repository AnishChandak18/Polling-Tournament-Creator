"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { FormField } from "@/components/ui/FormField";
import { Input } from "@/components/ui/input";
import { Alert } from "@/components/ui/Alert";
import BackButton from "@/components/common/BackButton";
import { createTournament } from "@/services/api";
import { navigateSpa } from "@/lib/client-navigation";

export default function CreateTournamentPage() {
  const router = useRouter();
  const [name, setName] = useState("");
  const [season, setSeason] = useState("2026");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    setError(null);

    try {
      const json = await createTournament({ name, season });
      await navigateSpa(router, `/tournaments/${json.tournamentId}`);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Error");
      setSaving(false);
    }
  }

  return (
    <main className="min-h-screen bg-background bg-stadium-mesh p-6 text-on-surface">
      <div className="mx-auto max-w-4xl">
        <BackButton fallbackHref="/tournaments" className="mb-4" />
        <section className="glass-card mt-6 overflow-hidden rounded-2xl">
          <div className="grid md:grid-cols-[1.1fr_1fr]">
            <div className="border-b border-outline-variant/15 p-8 md:border-b-0 md:border-r md:p-10">
              <div className="text-xs font-black uppercase tracking-widest text-primary">IPL Custom League</div>
              <h1 className="font-display mt-3 text-4xl font-black uppercase italic leading-tight">
                Create Your
                <br />
                Tournament
              </h1>
              <p className="mt-4 text-on-surface-variant">
                Start a private league, invite participants, and track predictions through the season.
              </p>

              <div className="mt-8 space-y-3">
                <div className="rounded-xl border border-outline-variant/15 bg-surface-container-high px-4 py-3 text-sm">
                  Daily match predictions
                </div>
                <div className="rounded-xl border border-outline-variant/15 bg-surface-container-high px-4 py-3 text-sm">
                  Live leaderboard updates
                </div>
                <div className="rounded-xl border border-outline-variant/15 bg-surface-container-high px-4 py-3 text-sm">
                  Fixtures refresh when you open your circle
                </div>
              </div>
            </div>

            <div className="p-8 md:p-10">
              <form onSubmit={onSubmit} className="grid gap-5">
                <FormField
                  id="tournament-name"
                  label="Tournament name"
                  labelClassName="text-xs font-black uppercase tracking-widest text-on-surface-variant"
                >
                  <Input
                    id="tournament-name"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="My IPL Predictions"
                    required
                    className="h-11"
                  />
                </FormField>

                <FormField
                  id="tournament-season"
                  label="Season"
                  labelClassName="text-xs font-black uppercase tracking-widest text-on-surface-variant"
                >
                  <Input
                    id="tournament-season"
                    value={season}
                    onChange={(e) => setSeason(e.target.value)}
                    placeholder="2026"
                    className="h-11"
                  />
                </FormField>

                {error ? <Alert>{error}</Alert> : null}

                <Button
                  type="submit"
                  variant="stadium"
                  disabled={saving}
                  className="h-11 min-h-0 text-base"
                >
                  {saving ? "Creating..." : "Create Tournament"}
                </Button>
              </form>
            </div>
          </div>
        </section>
      </div>
    </main>
  );
}

