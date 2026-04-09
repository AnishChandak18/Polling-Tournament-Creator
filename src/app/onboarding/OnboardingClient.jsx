"use client";

import Image from "next/image";
import { useSearchParams } from "next/navigation";
import { useState } from "react";
import PageShell from "@/components/layout/PageShell";
import { Input } from "@/components/ui/input";
import { FormField } from "@/components/ui/FormField";
import { Button } from "@/components/ui/button";
import { Alert } from "@/components/ui/Alert";
import { patchMe } from "@/services/api";

export default function OnboardingClient({ initialUsername, initialName }) {
  const searchParams = useSearchParams();
  const next = searchParams.get("next") ?? "/dashboard";
  const [username, setUsername] = useState(initialUsername ?? "");
  const [name, setName] = useState(initialName ?? "");
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);

  async function onSubmit(e) {
    e.preventDefault();
    const u = username.trim();
    if (u.length < 3) {
      setError("Choose a username (3–20 characters).");
      return;
    }
    setLoading(true);
    setError(null);
    try {
      await patchMe({
        username: u,
        name: name.trim() || null,
        onboardingComplete: true,
      });
      const path = next.startsWith("/") ? next : `/${next}`;
      window.location.href = path;
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not save profile");
    } finally {
      setLoading(false);
    }
  }

  return (
    <PageShell active="profile" maxWidth="max-w-md" rightSlot={null}>
      <div className="mb-8 overflow-hidden rounded-2xl border border-outline-variant/20">
        <div className="relative h-36 w-full">
          <Image
            src="/design/stitch-onboarding/username-settings.png"
            alt=""
            fill
            className="object-cover object-top opacity-90"
            sizes="448px"
            priority
          />
          <div className="absolute inset-0 bg-gradient-to-t from-background to-transparent" />
        </div>
      </div>

      <section className="space-y-2 rounded-2xl border border-outline-variant bg-surface-container p-6">
        <p className="text-xs font-bold uppercase tracking-widest text-primary">Identity</p>
        <h1 className="font-display text-3xl font-black tracking-tight text-on-surface">
          Username & settings
        </h1>
        <p className="text-sm text-on-surface-variant">
          Pick a public handle and how you appear in circles and leaderboards.
        </p>

        <form className="mt-6 space-y-5" onSubmit={onSubmit}>
          <FormField label="Username" htmlFor="onb-username">
            <div className="relative">
              <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-on-surface-variant">
                @
              </span>
              <Input
                id="onb-username"
                autoComplete="username"
                placeholder="striker_42"
                value={username}
                onChange={(e) => setUsername(e.target.value.replace(/\s/g, ""))}
                className="pl-8"
              />
            </div>
            <p className="mt-1 text-xs text-on-surface-variant">
              Letters, numbers, underscores only. 3–20 characters.
            </p>
          </FormField>

          <FormField label="Display name" htmlFor="onb-name">
            <Input
              id="onb-name"
              autoComplete="name"
              placeholder="Your name"
              value={name}
              onChange={(e) => setName(e.target.value)}
            />
          </FormField>

          {error ? <Alert>{error}</Alert> : null}

          <Button type="submit" variant="stadium" disabled={loading}>
            {loading ? "Saving…" : "Continue"}
          </Button>
        </form>
      </section>
    </PageShell>
  );
}
