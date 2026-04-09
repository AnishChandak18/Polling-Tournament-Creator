import { redirect } from "next/navigation";
import { Suspense } from "react";
import { getAuthContext } from "@/services/server";
import OnboardingClient from "./OnboardingClient";

export default async function OnboardingPage() {
  const { supabaseUser, dbUser } = await getAuthContext();
  if (!supabaseUser || !dbUser) redirect("/login");
  if (dbUser.onboardingCompletedAt) redirect("/dashboard");

  return (
    <Suspense fallback={<div className="min-h-screen bg-background bg-stadium-mesh" />}>
      <OnboardingClient
        initialUsername={dbUser.username ?? ""}
        initialName={dbUser.name ?? ""}
      />
    </Suspense>
  );
}
