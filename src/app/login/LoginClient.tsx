"use client";

import { useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";
import { createSupabaseBrowserClient } from "@/lib/supabase/client";
import BackButton from "@/components/common/BackButton";
import BrandLogo from "@/components/branding/BrandLogo";
import { Alert } from "@/components/ui/Alert";
import { Button } from "@/components/ui/button";
import { PageHero } from "@/components/ui/PageHero";

const DB_ERROR_MSG =
  "Database connection failed. Check DATABASE_URL in .env.local (use your Supabase database password, not the anon key).";

export default function LoginClient() {
  const searchParams = useSearchParams();
  const next = searchParams.get("next") ?? "/dashboard";
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (searchParams.get("error") === "database") setError(DB_ERROR_MSG);
  }, [searchParams]);

  async function signIn() {
    if (isLoading) return;
    setIsLoading(true);
    setError(null);
    try {
      const supabase = createSupabaseBrowserClient();
      await supabase.auth.signInWithOAuth({
        provider: "google",
        options: {
          redirectTo: `${window.location.origin}/auth/callback?next=${encodeURIComponent(
            next
          )}`,
        },
      });
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : "Supabase is not configured.");
      setIsLoading(false);
    }
  }

  useEffect(() => {
    if (!error) {
      void signIn();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [error]);

  return (
    <main className="relative min-h-screen overflow-x-hidden bg-background px-6 pb-28 pt-24 text-on-surface">
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute -left-24 top-10 h-96 w-96 rounded-full bg-primary/10 blur-[100px] dark:bg-secondary/10" />
        <div className="absolute -right-24 top-1/2 h-64 w-64 rounded-full bg-tertiary/10 blur-[80px] dark:bg-primary/5" />
      </div>

      <div className="relative z-10 mx-auto w-full max-w-md">
        <div className="mb-6 flex items-center justify-between">
          <BackButton
            fallbackHref="/"
            className="border-outline-variant text-on-surface hover:bg-surface-container-high dark:hover:bg-surface-container-highest"
          />
          <BrandLogo href="" compact />
        </div>

        <PageHero
          title={<>Redirecting to <span className="text-primary">Google Sign-In</span></>}
          description="Hang tight while we open Google authentication."
        />

        <div className="pt-4">
          <Button type="button" variant="stadium" onClick={signIn} disabled={isLoading}>
            {isLoading ? "Opening Google..." : "Continue with Google"}
            <span className="material-symbols-outlined">bolt</span>
          </Button>
        </div>

        {error ? (
          <Alert className="mt-3">
            {error}{" "}
            <a className="font-medium underline text-primary" href="/setup">
              Open setup
            </a>
            .
          </Alert>
        ) : null}
      </div>
    </main>
  );
}
