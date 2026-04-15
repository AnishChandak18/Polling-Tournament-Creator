"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useState, type FormEvent } from "react";
import { createSupabaseBrowserClient } from "@/lib/supabase/client";
import { getAuthCallbackUrl, setAuthRedirectCookie } from "@/lib/auth-browser";
import { safeNextPath } from "@/lib/auth-redirect";
import { navigateSpa } from "@/lib/client-navigation";
import AuthStitchLayout from "@/components/auth/AuthStitchLayout";
import GoogleGlyph from "@/components/auth/GoogleGlyph";
import StadiumGlowPanel from "@/components/stadium/StadiumGlowPanel";
import StadiumSectionLabel from "@/components/stadium/StadiumSectionLabel";
import { Alert } from "@/components/ui/Alert";
import { Input } from "@/components/ui/input";

const DB_ERROR_MSG =
  "Database connection failed. Check DATABASE_URL in .env.local (use your Supabase database password, not the anon key).";

export default function LoginClient() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const next = searchParams.get("next") ?? "/dashboard";
  const [error, setError] = useState<string | null>(null);
  const [oauthLoading, setOauthLoading] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [pwdLoading, setPwdLoading] = useState(false);

  useEffect(() => {
    if (searchParams.get("error") === "database") setError(DB_ERROR_MSG);
  }, [searchParams]);

  async function signInWithGoogle() {
    if (oauthLoading) return;
    setOauthLoading(true);
    setError(null);
    try {
      setAuthRedirectCookie(next);
      const supabase = createSupabaseBrowserClient();
      await supabase.auth.signInWithOAuth({
        provider: "google",
        options: {
          redirectTo: getAuthCallbackUrl(),
        },
      });
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : "Supabase is not configured.");
      setOauthLoading(false);
    }
  }

  async function signInWithPassword(e: FormEvent) {
    e.preventDefault();
    const trimmed = email.trim().toLowerCase();
    if (!trimmed || !password) {
      setError("Enter email and password.");
      return;
    }
    setPwdLoading(true);
    setError(null);
    try {
      const supabase = createSupabaseBrowserClient();
      const { error: signError } = await supabase.auth.signInWithPassword({
        email: trimmed,
        password,
      });
      if (signError) {
        setError(signError.message);
        return;
      }
      await navigateSpa(router, safeNextPath(next));
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : "Sign-in failed.");
    } finally {
      setPwdLoading(false);
    }
  }

  return (
    <AuthStitchLayout>
      <div className="w-full max-w-md">
        <StadiumSectionLabel kicker="Access Protocol">
          <h1 className="font-display text-4xl font-bold uppercase tracking-tighter text-on-surface">
            Welcome Back
          </h1>
          <p className="mt-1 text-sm font-medium text-zinc-500">
            Sign in to your account
          </p>
        </StadiumSectionLabel>

        <StadiumGlowPanel className="mt-8">
          <form className="space-y-6" onSubmit={signInWithPassword}>
            <div className="space-y-2">
              <label
                className="ml-1 font-display text-[10px] font-bold uppercase tracking-widest text-zinc-400"
                htmlFor="login-email"
              >
                Email Address
              </label>
              <div className="group relative">
                <span className="material-symbols-outlined pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-lg text-zinc-600 transition-colors group-focus-within:text-primary-container">
                  alternate_email
                </span>
                <Input
                  id="login-email"
                  type="email"
                  autoComplete="email"
                  placeholder="user@stadiumpulse.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full rounded-none border-2 border-zinc-800 bg-zinc-950 py-3 pl-10 pr-4 font-medium text-on-surface placeholder:text-zinc-700 focus-visible:border-primary-container focus-visible:ring-0"
                />
              </div>
            </div>

            <div className="space-y-2">
              <div className="flex items-end justify-between">
                <label
                  className="ml-1 font-display text-[10px] font-bold uppercase tracking-widest text-zinc-400"
                  htmlFor="login-password"
                >
                  Password
                </label>
                <Link
                  href="/forgot-password"
                  className="font-display text-[10px] font-bold uppercase tracking-widest text-primary transition-colors hover:text-on-surface"
                >
                  Recover?
                </Link>
              </div>
              <div className="group relative">
                <span className="material-symbols-outlined pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-lg text-zinc-600 transition-colors group-focus-within:text-primary-container">
                  lock
                </span>
                <Input
                  id="login-password"
                  type="password"
                  autoComplete="current-password"
                  placeholder="••••••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full rounded-none border-2 border-zinc-800 bg-zinc-950 py-3 pl-10 pr-4 font-medium text-on-surface placeholder:text-zinc-700 focus-visible:border-primary-container focus-visible:ring-0"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={pwdLoading}
              className="group flex w-full items-center justify-center gap-2 bg-primary-container py-4 font-display text-on-primary-container transition-transform duration-100 active:scale-95 disabled:opacity-60"
            >
              <span className="font-black uppercase tracking-[0.15em]">
                {pwdLoading ? "Signing in..." : "Sign In"}
              </span>
              <span className="material-symbols-outlined text-xl transition-transform group-hover:translate-x-1">
                login
              </span>
            </button>

            <div className="relative flex items-center py-2">
              <div className="flex-grow border-t border-zinc-800" />
              <span className="mx-4 flex-shrink font-display text-[10px] font-bold uppercase tracking-widest text-zinc-600">
                OR
              </span>
              <div className="flex-grow border-t border-zinc-800" />
            </div>

            <button
              type="button"
              onClick={signInWithGoogle}
              disabled={oauthLoading}
              className="flex w-full items-center justify-center gap-3 border border-zinc-700 bg-zinc-900 py-3 font-display text-xs font-bold uppercase tracking-widest text-on-surface transition-colors hover:bg-zinc-800 disabled:opacity-60"
            >
              <GoogleGlyph className="h-5 w-5 shrink-0 grayscale transition-all hover:grayscale-0" />
              {oauthLoading ? "Opening Google..." : "Sign in with Google"}
            </button>
          </form>

          <div className="mt-8 text-center">
            <p className="text-xs font-medium text-zinc-500">
              New operator?{" "}
              <Link
                href={
                  next === "/dashboard"
                    ? "/signup"
                    : `/signup?next=${encodeURIComponent(next)}`
                }
                className="ml-1 font-bold text-primary-container hover:underline"
              >
                Create an Account
              </Link>
            </p>
          </div>
        </StadiumGlowPanel>

        <div className="mt-8 grid grid-cols-2 gap-4">
          <div className="border-l-2 border-primary-container bg-zinc-900/40 p-3">
            <p className="mb-1 font-display text-[8px] uppercase tracking-widest text-zinc-500">
              Session Integrity
            </p>
            <div className="flex items-center gap-2">
              <div className="h-2 w-2 animate-pulse rounded-full bg-emerald-500" />
              <span className="font-display text-[10px] font-bold text-zinc-300">
                SECURE_LINK_ACTIVE
              </span>
            </div>
          </div>
          <div className="border-l-2 border-zinc-700 bg-zinc-900/40 p-3">
            <p className="mb-1 font-display text-[8px] uppercase tracking-widest text-zinc-500">
              Verification
            </p>
            <div className="flex items-center gap-2">
              <span className="material-symbols-outlined text-[14px] text-zinc-400">
                shield
              </span>
              <span className="font-display text-[10px] font-bold text-zinc-300">
                MFA_READY
              </span>
            </div>
          </div>
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
