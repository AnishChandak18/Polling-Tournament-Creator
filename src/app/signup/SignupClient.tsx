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
  const [termsAccepted, setTermsAccepted] = useState(false);
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
    if (!termsAccepted) {
      setError("Accept the terms to continue.");
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
      <div className="pointer-events-none fixed inset-0 z-0 overflow-hidden">
        <div className="absolute -right-[10%] -top-[10%] h-[60%] w-[60%] rounded-full bg-primary/10 blur-[120px]" />
        <div className="absolute -left-[10%] -bottom-[10%] h-[40%] w-[40%] rounded-full bg-secondary/5 blur-[100px]" />
        <div className="absolute inset-0 bg-stadium-mesh opacity-30" />
      </div>

      <div className="relative z-10 w-full max-w-[1100px] overflow-hidden rounded-xl border border-outline-variant/30 shadow-2xl">
        <div className="grid grid-cols-1 lg:grid-cols-2">
          <div className="relative hidden flex-col justify-between overflow-hidden bg-surface-container-lowest p-10 lg:flex">
            <div className="relative z-10">
              <h1 className="font-display text-3xl font-black italic tracking-widest text-primary">STADIUM PULSE</h1>
              <div className="mt-20">
                <h2 className="font-display text-5xl font-black uppercase leading-tight tracking-tighter">
                  Join the <br />
                  <span className="text-primary">Arena</span>
                </h2>
                <p className="mt-6 max-w-sm text-lg leading-relaxed text-on-surface-variant">
                  Initialize your tactical dashboard and gain access to high-velocity sports data, circle metrics, and live
                  predictive grids.
                </p>
              </div>
            </div>
            <div className="relative z-10 flex items-center gap-8">
              <div className="flex flex-col">
                <span className="font-display text-2xl font-bold text-primary">Live</span>
                <span className="text-xs uppercase tracking-widest text-on-surface-variant">Season updates</span>
              </div>
              <div className="h-8 w-px bg-outline-variant" />
              <div className="flex flex-col">
                <span className="font-display text-2xl font-bold text-primary">Circles</span>
                <span className="text-xs uppercase tracking-widest text-on-surface-variant">Private leagues</span>
              </div>
            </div>
            <div className="pointer-events-none absolute bottom-0 right-0 h-full w-full translate-x-1/4 translate-y-1/4 opacity-20">
              <div className="h-full w-full scale-150 rounded-full border border-primary/30" />
            </div>
          </div>

          <div className="glass-card border-l border-outline-variant/30 p-8 md:p-12 lg:p-16">
            <div className="mb-8 lg:hidden">
              <h1 className="font-display text-2xl font-black italic tracking-widest text-primary">STADIUM PULSE</h1>
              <h2 className="mt-6 font-display text-4xl font-black uppercase tracking-tighter">Join the Arena</h2>
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
              <>
                <header className="space-y-2">
                  <div className="flex items-center gap-2 text-primary">
                    <span className="h-0.5 w-8 bg-primary" />
                    <span className="font-display text-xs font-bold uppercase tracking-widest">Create Your Account</span>
                  </div>
                  <h3 className="font-display text-xl font-bold uppercase tracking-tight">Personal Details</h3>
                </header>

                <form className="mt-8 space-y-6" onSubmit={signUp}>
                  <div className="group space-y-2">
                    <label
                      className="font-display text-[10px] font-bold uppercase tracking-widest text-on-surface-variant"
                      htmlFor="signup-name"
                    >
                      Full Name
                    </label>
                    <div className="relative">
                      <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-sm text-on-surface-variant transition-colors group-focus-within:text-primary">
                        person
                      </span>
                      <Input
                        id="signup-name"
                        type="text"
                        autoComplete="name"
                        placeholder="YOUR FULL NAME"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        className="w-full rounded-none border-0 border-b-2 border-outline-variant bg-surface-container-high py-4 pl-12 pr-4 font-display uppercase tracking-tight placeholder:text-outline-variant focus-visible:border-primary focus-visible:ring-0"
                      />
                    </div>
                  </div>

                  <div className="group space-y-2">
                    <label
                      className="font-display text-[10px] font-bold uppercase tracking-widest text-on-surface-variant"
                      htmlFor="signup-email"
                    >
                      Email Address
                    </label>
                    <div className="relative">
                      <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-sm text-on-surface-variant transition-colors group-focus-within:text-primary">
                        alternate_email
                      </span>
                      <Input
                        id="signup-email"
                        type="email"
                        autoComplete="email"
                        placeholder="EMAIL@EXAMPLE.COM"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        className="w-full rounded-none border-0 border-b-2 border-outline-variant bg-surface-container-high py-4 pl-12 pr-4 font-display uppercase tracking-tight placeholder:text-outline-variant focus-visible:border-primary focus-visible:ring-0"
                      />
                    </div>
                  </div>

                  <div className="group space-y-2">
                    <label
                      className="font-display text-[10px] font-bold uppercase tracking-widest text-on-surface-variant"
                      htmlFor="signup-password"
                    >
                      Password
                    </label>
                    <div className="relative">
                      <span
                        className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-sm text-on-surface-variant transition-colors group-focus-within:text-primary"
                        style={{ fontVariationSettings: "'FILL' 1" }}
                      >
                        shield_lock
                      </span>
                      <Input
                        id="signup-password"
                        type="password"
                        autoComplete="new-password"
                        placeholder="••••••••••••"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        className="w-full rounded-none border-0 border-b-2 border-outline-variant bg-surface-container-high py-4 pl-12 pr-4 font-display tracking-widest placeholder:text-outline-variant focus-visible:border-primary focus-visible:ring-0"
                      />
                    </div>
                  </div>

                  <label className="flex cursor-pointer items-start gap-3 py-2">
                    <input
                      type="checkbox"
                      checked={termsAccepted}
                      onChange={(e) => setTermsAccepted(e.target.checked)}
                      className="mt-1 h-5 w-5 rounded-none border-2 border-outline-variant bg-transparent text-primary focus:ring-0 focus:ring-offset-0"
                    />
                    <span className="text-sm leading-tight text-on-surface-variant">
                      I agree to the{" "}
                      <Link href="/" className="font-bold text-primary underline-offset-4 hover:underline">
                        terms of service
                      </Link>{" "}
                      and privacy policy.
                    </span>
                  </label>

                  <button
                    type="submit"
                    disabled={submitLoading}
                    className="btn-primary flex w-full items-center justify-center gap-3 py-4 text-sm uppercase tracking-widest"
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
              </>
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
        </div>
      </div>
    </AuthStitchLayout>
  );
}
