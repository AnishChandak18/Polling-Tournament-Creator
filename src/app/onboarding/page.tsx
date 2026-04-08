import Link from "next/link";
import { redirect } from "next/navigation";
import PageShell from "@/components/layout/PageShell";
import { getAuthContext } from "@/services/server";

export default async function OnboardingPage() {
  const { supabaseUser, dbUser } = await getAuthContext();
  if (!supabaseUser || !dbUser) redirect("/login");

  return (
    <PageShell active="profile" maxWidth="max-w-md" rightSlot={null}>
      <section className="space-y-4 rounded-2xl border border-outline-variant bg-surface-container p-6">
        <p className="text-xs font-bold uppercase tracking-widest text-primary">Welcome</p>
        <h1 className="font-display text-3xl font-black tracking-tight text-on-surface">
          Account Created
        </h1>
        <p className="text-sm text-on-surface-variant">
          Your profile is ready. Onboarding customization is coming soon.
        </p>
        <Link href="/dashboard" className="btn-primary mt-2 h-12 px-6 text-sm">
          Continue to Dashboard
        </Link>
      </section>
    </PageShell>
  );
}

