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

export default function SignupClient() {
  const searchParams = useSearchParams();
  const next = searchParams.get("next") ?? "/dashboard";
  const [error, setError] = useState<string | null>(null);
  const [oauthLoading, setOauthLoading] = useState(false);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [submitLoading, setSubmitLoading] = useState(false);
  const [checkEmail, setCheckEmail] = useState(false);

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

  async function signUp(e: FormEvent) {
    e.preventDefault();
    const trimmedEmail = email.trim().toLowerCase();
    if (!trimmedEmail || !password) {
      setError("Email and password are required.");
      return;
    }
    setSubmitLoading(true);
    setError(null);
    setCheckEmail(false);
    try {
      setAuthRedirectCookie(next);
      const supabase = createSupabaseBrowserClient();
      const { data, error: signUpError } = await supabase.auth.signUp({
        email: trimmedEmail,
        password,
        options: {
          data: { full_name: name.trim() || null },
          emailRedirectTo: getAuthCallbackUrl(),
        },
      });
      if (signUpError) {
        setError(signUpError.message);
        return;
      }
      if (data.session) {
        window.location.href = safeNextPath(next);
        return;
      }
      setCheckEmail(true);
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : "Sign-up failed.");
    } finally {
      setSubmitLoading(false);
    }
  }

  return (
    <AuthStitchLayout>
      <div className="relative z-10 w-full max-w-md border border-outline-variant/30 bg-surface-container-low p-8 shadow-2xl backdrop-blur-sm md:p-10">
        <div className="mb-10 space-y-2">
          <h1 className="font-display text-4xl font-bold uppercase leading-none tracking-tighter text-on-surface md:text-5xl">
            JOIN THE <span className="text-primary-container">ARENA</span>
          </h1>
          <p className="text-sm font-medium tracking-wide text-on-surface-variant">
            Enter the high-voltage ecosystem of Stadium Pulse.
          </p>
        </div>

        {checkEmail ? (
          <div className="rounded-xl border border-primary/30 bg-primary/5 p-6 text-center text-sm text-on-surface">
            <p className="font-display font-bold uppercase tracking-widest text-primary">Check your email</p>
            <p className="mt-2 text-on-surface-variant">
              We sent a confirmation link to <span className="font-medium text-on-surface">{email}</span>. Open it to
              finish creating your account.
            </p>
            <Link
              href={next === "/dashboard" ? "/login" : `/login?next=${encodeURIComponent(next)}`}
              className="btn-outline mt-6 inline-flex w-full justify-center py-3 text-sm"
            >
              Back to login
            </Link>
          </div>
        ) : (
          <form className="space-y-6" onSubmit={signUp}>
            <div className="space-y-1.5">
              <label
                className="block px-1 text-[10px] font-bold uppercase tracking-[0.2em] text-on-surface-variant"
                htmlFor="signup-name"
              >
                Full Name
              </label>
              <div className="group relative">
                <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-4">
                  <span className="material-symbols-outlined text-sm text-zinc-500 transition-colors group-focus-within:text-primary-container">
                    person
                  </span>
                </div>
                <Input
                  id="signup-name"
                  type="text"
                  autoComplete="name"
                  placeholder="ALEXANDER VITALIS"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="rounded-none border-0 border-b-2 border-outline-variant bg-surface-container-highest/50 py-3.5 pl-11 pr-4 text-sm font-medium placeholder:text-zinc-600 focus-visible:border-primary-container focus-visible:ring-0"
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <label
                className="block px-1 text-[10px] font-bold uppercase tracking-[0.2em] text-on-surface-variant"
                htmlFor="signup-email"
              >
                Email Address
              </label>
              <div className="group relative">
                <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-4">
                  <span className="material-symbols-outlined text-sm text-zinc-500 transition-colors group-focus-within:text-primary-container">
                    alternate_email
                  </span>
                </div>
                <Input
                  id="signup-email"
                  type="email"
                  autoComplete="email"
                  placeholder="PLAYER@STADIUMPULSE.COM"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="rounded-none border-0 border-b-2 border-outline-variant bg-surface-container-highest/50 py-3.5 pl-11 pr-4 text-sm font-medium placeholder:text-zinc-600 focus-visible:border-primary-container focus-visible:ring-0"
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <label
                className="block px-1 text-[10px] font-bold uppercase tracking-[0.2em] text-on-surface-variant"
                htmlFor="signup-password"
              >
                Security Protocol
              </label>
              <div className="group relative">
                <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-4">
                  <span className="material-symbols-outlined text-sm text-zinc-500 transition-colors group-focus-within:text-primary-container">
                    lock
                  </span>
                </div>
                <Input
                  id="signup-password"
                  type="password"
                  autoComplete="new-password"
                  placeholder="••••••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="rounded-none border-0 border-b-2 border-outline-variant bg-surface-container-highest/50 py-3.5 pl-11 pr-4 text-sm font-medium placeholder:text-zinc-600 focus-visible:border-primary-container focus-visible:ring-0"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={submitLoading}
              className="btn-primary mt-4 flex w-full items-center justify-center gap-3 py-4 text-sm uppercase tracking-widest"
            >
              {submitLoading ? "Creating..." : "Create account"}
              <span className="material-symbols-outlined text-lg">stadium</span>
            </button>

            <div className="relative py-4">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-outline-variant/30" />
              </div>
              <div className="relative flex justify-center text-[10px] font-bold uppercase tracking-widest">
                <span className="bg-surface-container-low px-4 text-zinc-500">OR JOIN VIA HUB</span>
              </div>
            </div>

            <button
              type="button"
              onClick={signInWithGoogle}
              disabled={oauthLoading}
              className="flex w-full items-center justify-center gap-3 border border-outline-variant bg-transparent py-3.5 text-xs font-bold uppercase tracking-[0.1em] text-on-surface transition-all hover:bg-surface-container-highest disabled:opacity-60"
            >
              <GoogleGlyph className="h-4 w-4 text-on-surface" />
              {oauthLoading ? "Opening Google..." : "Sign up with Google"}
            </button>
          </form>
        )}

        {!checkEmail ? (
          <div className="mt-8 space-y-4 text-center">
            <p className="text-sm text-zinc-500">
              Already have an account?{" "}
              <Link
                href={next === "/dashboard" ? "/login" : `/login?next=${encodeURIComponent(next)}`}
                className="font-bold text-primary underline decoration-2 underline-offset-4 hover:underline"
              >
                Log in
              </Link>
            </p>
            <div className="flex items-center justify-center gap-2 border-t border-outline-variant/20 pt-6 text-[10px] font-bold uppercase tracking-widest text-zinc-600">
              <span className="material-symbols-outlined text-sm">info</span>
              POINTS FOR FUN ONLY
            </div>
          </div>
        ) : null}

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
