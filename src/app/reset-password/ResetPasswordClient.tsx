"use client";

import Link from "next/link";
import { useEffect, useState, type FormEvent } from "react";
import { createSupabaseBrowserClient } from "@/lib/supabase/client";
import AuthStitchLayout from "@/components/auth/AuthStitchLayout";
import { Alert } from "@/components/ui/Alert";
import { Input } from "@/components/ui/input";

export default function ResetPasswordClient() {
  const [ready, setReady] = useState(false);
  const [hasSession, setHasSession] = useState(false);
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [done, setDone] = useState(false);

  useEffect(() => {
    const supabase = createSupabaseBrowserClient();
    supabase.auth.getSession().then(({ data: { session } }) => {
      setHasSession(Boolean(session));
      setReady(true);
    });
  }, []);

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    if (password.length < 12) {
      setError("Use at least 12 characters.");
      return;
    }
    if (password !== confirm) {
      setError("Passwords do not match.");
      return;
    }
    setLoading(true);
    setError(null);
    try {
      const supabase = createSupabaseBrowserClient();
      const { error: updateError } = await supabase.auth.updateUser({
        password,
      });
      if (updateError) {
        setError(updateError.message);
        return;
      }
      setDone(true);
      await supabase.auth.signOut();
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : "Update failed.");
    } finally {
      setLoading(false);
    }
  }

  if (!ready) {
    return (
      <AuthStitchLayout>
        <p className="text-on-surface-variant">Loading…</p>
      </AuthStitchLayout>
    );
  }

  if (!hasSession) {
    return (
      <AuthStitchLayout>
        <div className="w-full max-w-md border border-outline-variant bg-surface-container p-8 text-center shadow-xl">
          <p className="font-display text-lg font-bold uppercase text-on-surface">
            Link invalid or expired
          </p>
          <p className="mt-2 text-sm text-on-surface-variant">
            Request a new reset link from the forgot password page.
          </p>
          <Link
            href="/forgot-password"
            className="btn-primary mt-6 inline-flex w-full justify-center py-3 text-sm"
          >
            Forgot password
          </Link>
          <Link
            href="/login"
            className="btn-outline mt-3 inline-flex w-full justify-center py-3 text-sm"
          >
            Back to login
          </Link>
        </div>
      </AuthStitchLayout>
    );
  }

  if (done) {
    return (
      <AuthStitchLayout>
        <div className="w-full max-w-md border border-primary/30 bg-primary-container/10 p-8 text-center">
          <span
            className="material-symbols-outlined text-4xl text-primary"
            style={{ fontVariationSettings: "'FILL' 1" }}
          >
            verified_user
          </span>
          <p className="mt-4 font-display text-sm font-bold uppercase tracking-widest text-primary">
            Key updated
          </p>
          <p className="mt-2 text-sm text-on-surface-variant">
            Sign in with your new password.
          </p>
          <Link
            href="/login"
            className="btn-primary mt-6 inline-flex w-full justify-center py-3 text-sm"
          >
            Go to login
          </Link>
        </div>
      </AuthStitchLayout>
    );
  }

  return (
    <AuthStitchLayout>
      <div className="relative z-10 w-full max-w-xl px-2">
        <Link
          href="/login"
          className="group mb-8 flex w-fit cursor-pointer items-center gap-2"
        >
          <span className="material-symbols-outlined text-primary transition-transform group-hover:-translate-x-1">
            arrow_back
          </span>
          <span className="text-xs font-bold uppercase tracking-widest text-on-surface-variant transition-colors group-hover:text-primary">
            Return to login
          </span>
        </Link>

        <div className="relative border border-outline-variant/30 bg-surface-container p-8 shadow-[0_0_40px_-10px_rgba(255,231,146,0.3)] md:p-12">
          <div className="absolute -top-3 left-8 bg-primary px-4 py-1 text-[10px] font-black uppercase tracking-[0.2em] text-black">
            High Security Access
          </div>

          <div className="mb-10">
            <h1 className="font-display text-3xl font-bold uppercase leading-none tracking-tight text-on-surface md:text-4xl">
              Reset <span className="italic text-primary">Encryption Key</span>
            </h1>
            <p className="mt-4 max-w-md text-sm leading-relaxed text-on-surface-variant">
              Choose a new password for your account. Use at least 12 characters
              with a mix of letters and numbers.
            </p>
          </div>

          <form className="space-y-6" onSubmit={onSubmit}>
            <div className="space-y-2">
              <label
                className="ml-1 text-[10px] font-bold uppercase tracking-widest text-primary"
                htmlFor="new-pw"
              >
                New encryption key
              </label>
              <div className="relative">
                <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-4">
                  <span className="material-symbols-outlined text-lg text-on-surface-variant">
                    vpn_key
                  </span>
                </div>
                <Input
                  id="new-pw"
                  type="password"
                  autoComplete="new-password"
                  placeholder="••••••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="rounded-none border border-outline-variant/50 bg-surface-container-highest py-4 pl-12 font-mono text-on-surface focus-visible:border-primary focus-visible:ring-primary"
                />
              </div>
            </div>

            <div className="space-y-2">
              <label
                className="ml-1 text-[10px] font-bold uppercase tracking-widest text-primary"
                htmlFor="confirm-pw"
              >
                Confirm encryption key
              </label>
              <div className="relative">
                <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-4">
                  <span className="material-symbols-outlined text-lg text-on-surface-variant">
                    lock_reset
                  </span>
                </div>
                <Input
                  id="confirm-pw"
                  type="password"
                  autoComplete="new-password"
                  placeholder="••••••••••••"
                  value={confirm}
                  onChange={(e) => setConfirm(e.target.value)}
                  className="rounded-none border border-outline-variant/50 bg-surface-container-highest py-4 pl-12 font-mono text-on-surface focus-visible:border-primary focus-visible:ring-primary"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4 py-4">
              <div className="flex items-center gap-2 border-l-2 border-primary bg-surface-container-high p-3">
                <span
                  className="material-symbols-outlined text-sm text-primary"
                  style={{ fontVariationSettings: "'FILL' 1" }}
                >
                  check_circle
                </span>
                <span className="font-display text-[10px] font-bold uppercase tracking-tighter text-on-surface">
                  Min 12 chars
                </span>
              </div>
              <div className="flex items-center gap-2 border-l-2 border-primary bg-surface-container-high p-3">
                <span
                  className="material-symbols-outlined text-sm text-primary"
                  style={{ fontVariationSettings: "'FILL' 1" }}
                >
                  check_circle
                </span>
                <span className="font-display text-[10px] font-bold uppercase tracking-tighter text-on-surface">
                  Match both fields
                </span>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="btn-primary mt-4 flex w-full items-center justify-center gap-3 py-5 text-sm uppercase tracking-widest"
            >
              {loading ? "Updating..." : "Update key"}
              <span className="material-symbols-outlined">refresh</span>
            </button>
          </form>

          <div className="mt-8 flex items-start gap-4 border border-primary/20 bg-primary-container/10 p-4">
            <div className="rounded-full bg-primary/20 p-2">
              <span
                className="material-symbols-outlined text-xl text-primary"
                style={{ fontVariationSettings: "'FILL' 1" }}
              >
                verified_user
              </span>
            </div>
            <div>
              <p className="mb-1 text-xs font-bold uppercase tracking-widest text-primary">
                Status: Ready to sync
              </p>
              <p className="text-xs text-on-surface-variant">
                After updating, you will be signed out and must log in with the
                new password.
              </p>
            </div>
          </div>
        </div>

        {error ? <Alert className="mt-4">{error}</Alert> : null}
      </div>
    </AuthStitchLayout>
  );
}
