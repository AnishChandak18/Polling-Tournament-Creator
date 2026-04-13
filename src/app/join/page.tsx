import { getAuthContext } from "@/services/server";
import JoinClient from "./JoinClient";

export default async function JoinPage({
  searchParams,
}: {
  searchParams: Promise<{ t?: string; code?: string }>;
}) {
  const { t, code } = await searchParams;

  const { supabaseUser, dbUser } = await getAuthContext();
  const needsOnboarding = Boolean(
    supabaseUser && dbUser && !dbUser.onboardingCompletedAt
  );

  return (
    <JoinClient
      token={typeof t === "string" ? t : ""}
      initialCode={typeof code === "string" ? code : ""}
      isLoggedIn={Boolean(supabaseUser && dbUser)}
      needsOnboarding={needsOnboarding}
    />
  );
}
