"use client";

import Link from "next/link";
import { useEffect, useState, type FormEvent } from "react";
import { createSupabaseBrowserClient } from "@/lib/supabase/client";
import { getAuthCallbackUrl, setAuthRedirectCookie } from "@/lib/auth-browser";
import AuthStitchLayout from "@/components/auth/AuthStitchLayout";
import { Alert } from "@/components/ui/Alert";
import { Input } from "@/components/ui/input";

const DB_ERROR_MSG =
  "Database connection failed. Check DATABASE_URL in .env.local (use your Supabase database password, not the anon key).";

export default function ForgotPasswordClient() {
  const [error, setError] = useState<string | null>(null);
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    if (params.get("error") === "database") setError(DB_ERROR_MSG);
  }, []);

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    const trimmed = email.trim().toLowerCase();
    if (!trimmed) {
      setError("Enter your email address.");
      return;
    }
    setLoading(true);
    setError(null);
    setSent(false);
    try {
      setAuthRedirectCookie("/reset-password");
      const supabase = createSupabaseBrowserClient();
      const { error: resetError } = await supabase.auth.resetPasswordForEmail(trimmed, {
        redirectTo: getAuthCallbackUrl(),
      });
      if (resetError) {
        setError(resetError.message);
        return;
      }
      setSent(true);
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : "Request failed.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <AuthStitchLayout>
      <div className="relative z-10 w-full max-w-md">
        <div className="mb-10 flex flex-col items-center text-center">
          <div className="mb-6 flex h-16 w-16 rotate-45 items-center justify-center border border-primary-container/30 bg-surface-container-highest shadow-[0_0_30px_rgba(255,231,146,0.1)]">
            <span className="material-symbols-outlined -rotate-45 text-4xl text-primary">lock_reset</span>
          </div>
          <h2 className="font-display text-3xl font-bold uppercase tracking-tighter text-on-surface">
            Access Recovery
          </h2>
          <p className="mt-2 max-w-[280px] text-sm text-on-surface-variant">
            Initiate an encrypted recovery sequence to reclaim your tactical account.
          </p>
        </div>

        <div className="relative border border-outline-variant/30 bg-surface-container-low p-8 shadow-2xl">
          <div className="absolute right-0 top-0 h-8 w-8 translate-x-1 -translate-y-1 border-r-2 border-t-2 border-primary-container" />
          <div className="absolute bottom-0 left-0 h-8 w-8 -translate-x-1 translate-y-1 border-b-2 border-l-2 border-primary-container" />

          {sent ? (
            <div className="space-y-4 text-center text-sm text-on-surface">
              <p className="font-display font-bold uppercase tracking-widest text-primary">Check your email</p>
              <p className="text-on-surface-variant">
                If an account exists for <span className="font-medium text-on-surface">{email}</span>, you will receive a
                reset link shortly.
              </p>
              <Link href="/login" className="btn-outline inline-flex w-full justify-center py-3 text-sm">
                Return to login
              </Link>
            </div>
          ) : (
            <form className="space-y-6" onSubmit={onSubmit}>
              <div className="space-y-2">
                <label
                  className="block text-[10px] font-bold uppercase tracking-[0.2em] text-primary"
                  htmlFor="forgot-email"
                >
                  Tactical Email ID
                </label>
                <div className="relative">
                  <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-4">
                    <span className="material-symbols-outlined text-sm text-outline">alternate_email</span>
                  </div>
                  <Input
                    id="forgot-email"
                    type="email"
                    autoComplete="email"
                    required
                    placeholder="operator@stadiumpulse.grid"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="rounded-none border-0 border-l-4 border-transparent bg-surface-container-highest py-4 pl-12 placeholder:text-zinc-700 focus-visible:border-primary-container focus-visible:ring-0"
                  />
                </div>
                <p className="text-[10px] font-medium text-zinc-500">
                  Verify your identity via the registered tactical node.
                </p>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="btn-primary flex w-full items-center justify-center gap-3 py-4 text-sm uppercase tracking-widest"
              >
                <span>{loading ? "Sending..." : "Reset password"}</span>
                <span className="material-symbols-outlined">key</span>
              </button>
            </form>
          )}

          <div className="mt-10 flex items-center justify-center">
            <Link
              href="/login"
              className="group flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-zinc-500 transition-colors hover:text-primary-container"
            >
              <span className="material-symbols-outlined text-lg">arrow_back</span>
              Return to login
            </Link>
          </div>
        </div>

        <div className="mt-8 flex items-start gap-4 border-l border-primary-container/20 bg-primary-container/5 p-4">
          <span className="material-symbols-outlined shrink-0 text-xl text-primary" style={{ fontVariationSettings: "'FILL' 1" }}>
            security
          </span>
          <p className="text-[11px] leading-relaxed text-on-surface-variant">
            Reset links expire after a limited time. Use a strong password when you set a new encryption key.
          </p>
        </div>

        {error ? (
          <Alert className="mt-4">
            {error}{" "}
            <a className="font-medium text-primary underline" href="/setup">
              Open setup
            </a>
            .
          </Alert>
        ) : null}
      </div>
    </AuthStitchLayout>
  );
}
