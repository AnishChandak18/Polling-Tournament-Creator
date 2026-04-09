"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { useEffect, useState, type FormEvent } from "react";
import { createSupabaseBrowserClient } from "@/lib/supabase/client";
import { getAuthCallbackUrl, setAuthRedirectCookie } from "@/lib/auth-browser";
import { safeNextPath } from "@/lib/auth-redirect";
import AuthStitchLayout from "@/components/auth/AuthStitchLayout";
import GoogleGlyph from "@/components/auth/GoogleGlyph";
import { Alert } from "@/components/ui/Alert";
import { Input } from "@/components/ui/input";

const DB_ERROR_MSG =
  "Database connection failed. Check DATABASE_URL in .env.local (use your Supabase database password, not the anon key).";

export default function LoginClient() {
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
      window.location.href = safeNextPath(next);
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : "Sign-in failed.");
    } finally {
      setPwdLoading(false);
    }
  }

  return (
    <AuthStitchLayout>
      <div className="relative w-full max-w-md border border-outline-variant bg-surface-container/80 p-8 shadow-2xl backdrop-blur-xl">
        <div className="absolute -left-[1px] -top-[1px] h-8 w-8 border-l-2 border-t-2 border-primary" />
        <div className="absolute -bottom-[1px] -right-[1px] h-8 w-8 border-b-2 border-r-2 border-primary" />

        <div className="mb-10 text-center">
          <h2 className="font-display text-4xl font-black uppercase tracking-tighter text-on-surface">
            Welcome Back
          </h2>
          <p className="mt-2 text-sm font-medium tracking-wide text-on-surface-variant">
            Enter your credentials to access the grid.
          </p>
        </div>

        <form className="space-y-6" onSubmit={signInWithPassword}>
          <div className="space-y-2">
            <label
              className="block text-[10px] font-bold uppercase tracking-widest text-primary"
              htmlFor="login-email"
            >
              Tactical Email ID
            </label>
            <div className="group relative">
              <span className="material-symbols-outlined pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-lg text-outline transition-colors group-focus-within:text-primary">
                alternate_email
              </span>
              <Input
                id="login-email"
                type="email"
                autoComplete="email"
                placeholder="OPERATOR@STADIUM.PULSE"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="rounded-none border-outline-variant bg-surface-container-high py-3 pl-10 pr-4 text-sm placeholder:uppercase placeholder:text-outline-variant focus-visible:border-primary focus-visible:ring-primary"
              />
            </div>
          </div>

          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <label
                className="text-[10px] font-bold uppercase tracking-widest text-primary"
                htmlFor="login-password"
              >
                Encryption Key
              </label>
              <Link
                href="/forgot-password"
                className="text-[10px] font-bold uppercase tracking-widest text-on-surface-variant transition-colors hover:text-primary"
              >
                Forgot Access?
              </Link>
            </div>
            <div className="group relative">
              <span className="material-symbols-outlined pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-lg text-outline transition-colors group-focus-within:text-primary">
                lock
              </span>
              <Input
                id="login-password"
                type="password"
                autoComplete="current-password"
                placeholder="••••••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="rounded-none border-outline-variant bg-surface-container-high py-3 pl-10 pr-4 text-sm placeholder:text-outline-variant focus-visible:border-primary focus-visible:ring-primary"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={pwdLoading}
            className="btn-primary w-full py-4 text-sm uppercase tracking-widest shadow-[0_0_20px_rgba(255,215,9,0.2)]"
          >
            {pwdLoading ? "Signing in..." : "Initiate Login"}
          </button>

          <div className="relative flex items-center py-2">
            <div className="flex-grow border-t border-outline-variant" />
            <span className="mx-4 flex-shrink text-[10px] font-black uppercase tracking-tighter text-outline">
              Secure Link Protocol
            </span>
            <div className="flex-grow border-t border-outline-variant" />
          </div>

          <button
            type="button"
            onClick={signInWithGoogle}
            disabled={oauthLoading}
            className="flex w-full items-center justify-center gap-3 border border-outline-variant bg-surface-container-highest py-4 text-xs font-bold uppercase tracking-widest text-on-surface transition-all hover:bg-surface-bright active:scale-[0.98] disabled:opacity-60"
          >
            <GoogleGlyph />
            {oauthLoading ? "Opening Google..." : "Sign in with Google"}
          </button>
        </form>

        <div className="mt-8 text-center">
          <p className="text-xs font-medium uppercase tracking-wide text-on-surface-variant">
            New to the Stadium?{" "}
            <Link
              href={next === "/dashboard" ? "/signup" : `/signup?next=${encodeURIComponent(next)}`}
              className="ml-1 font-black text-primary underline-offset-4 hover:underline"
            >
              Create an account
            </Link>
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
