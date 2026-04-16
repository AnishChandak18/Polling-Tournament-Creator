"use client";

import Image from "next/image";
import { useRouter, useSearchParams } from "next/navigation";
import { useState } from "react";
import PageShell from "@/components/layout/PageShell";
import PointsChip from "@/components/ui/PointsChip";
import { Input } from "@/components/ui/input";
import { FormField } from "@/components/ui/FormField";
import { Button } from "@/components/ui/button";
import { Alert } from "@/components/ui/Alert";
import { patchMe } from "@/services/api";
import { navigateSpa } from "@/lib/client-navigation";

export default function OnboardingClient({ initialUsername, initialName, points = 0 }) {
  const router = useRouter();
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
      await navigateSpa(router, path);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not save profile");
    } finally {
      setLoading(false);
    }
  }

  return (
    <PageShell active="home" maxWidth="max-w-xl" className="relative px-4" rightSlot={<PointsChip points={points} />}>
      <div className="relative mb-10 space-y-2 border-l-4 border-primary-container pl-6">
        <h1 className="font-display text-4xl font-black uppercase leading-none tracking-tighter text-on-surface md:text-5xl">
          Create your <br /> <span className="text-primary">Profile</span>
        </h1>
        <p className="text-sm font-medium uppercase tracking-widest text-on-surface-variant">
          Enter your details to join the action
        </p>
      </div>

      <div className="relative mb-8 overflow-hidden rounded-2xl border border-outline-variant/20">
        <div className="relative h-36 w-full">
          <Image
            src="/design/stitch-stadium-pulse/onboarding-c1df380a.png"
            alt=""
            fill
            className="object-cover object-top opacity-90"
            sizes="576px"
            priority
          />
          <div className="absolute inset-0 bg-gradient-to-t from-background to-transparent" />
        </div>
      </div>

      <section className="space-y-6 rounded-xl border border-zinc-800 bg-surface-container p-6">
        <header className="flex items-center justify-between gap-2">
          <label className="flex items-center gap-2 font-display text-xs font-bold uppercase tracking-widest text-primary">
            <span className="material-symbols-outlined text-sm">person</span>
            Username
          </label>
          <span className="font-display text-[10px] uppercase text-zinc-600">Required</span>
        </header>

        <form className="space-y-5" onSubmit={onSubmit}>
          <FormField label="Handle" htmlFor="onb-username">
            <div className="relative">
              <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-on-surface-variant">@</span>
              <Input
                id="onb-username"
                autoComplete="username"
                placeholder="striker_42"
                value={username}
                onChange={(e) => setUsername(e.target.value.replace(/\s/g, ""))}
                className="border-2 border-zinc-800 bg-zinc-950 pl-8 focus-visible:border-primary-container"
              />
            </div>
            <p className="mt-1 text-xs text-on-surface-variant">Letters, numbers, underscores only. 3–20 characters.</p>
          </FormField>

          <FormField label="Display name" htmlFor="onb-name">
            <Input
              id="onb-name"
              autoComplete="name"
              placeholder="Your name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="border-2 border-zinc-800 bg-zinc-950 focus-visible:border-primary-container"
            />
          </FormField>

          {error ? <Alert>{error}</Alert> : null}

          <Button type="submit" variant="stadium" disabled={loading} className="w-full py-4 font-display uppercase tracking-widest">
            {loading ? "Saving…" : "Enter arena"}
          </Button>
        </form>
      </section>
    </PageShell>
  );
}
