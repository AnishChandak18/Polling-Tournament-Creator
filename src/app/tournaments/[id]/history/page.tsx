import { redirect } from "next/navigation";
import TournamentHistoryClient from "@/components/history/TournamentHistoryClient";
import { getAuthContext, getTournamentForUser } from "@/services/server";

export default async function TournamentMatchHistoryPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { supabaseUser, dbUser } = await getAuthContext();
  if (!supabaseUser) redirect("/login");
  if (!dbUser) redirect("/login?error=database");

  const { id: tournamentId } = await params;
  const allowed = await getTournamentForUser(tournamentId, dbUser.id);
  if (!allowed) redirect("/tournaments");

  return <TournamentHistoryClient tournamentId={tournamentId} />;
}
