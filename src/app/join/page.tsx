import Link from "next/link";
import { getAuthContext } from "@/services/server";
import JoinClient from "./JoinClient";

export default async function JoinPage({
  searchParams,
}: {
  searchParams: Promise<{ t?: string }>;
}) {
  const { t } = await searchParams;
  if (!t || typeof t !== "string") {
    return (
      <main className="min-h-screen bg-background bg-stadium-mesh p-6 text-on-surface">
        <div className="mx-auto max-w-md text-center">
          <h1 className="font-display text-2xl font-black">Invalid invite</h1>
          <p className="mt-2 text-sm text-on-surface-variant">
            This link is missing a circle code. Ask the owner for a new invite link.
          </p>
          <Link href="/tournaments" className="btn-primary mt-6 inline-block px-6 py-3 text-sm">
            Go to circles
          </Link>
        </div>
      </main>
    );
  }

  const { supabaseUser, dbUser } = await getAuthContext();
  const needsOnboarding = Boolean(
    supabaseUser && dbUser && !dbUser.onboardingCompletedAt
  );

  return (
    <JoinClient
      token={t}
      isLoggedIn={Boolean(supabaseUser && dbUser)}
      needsOnboarding={needsOnboarding}
    />
  );
}
