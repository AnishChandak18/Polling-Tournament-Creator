-- Enable RLS on all app tables exposed via PostgREST.
ALTER TABLE public."User" ENABLE ROW LEVEL SECURITY;
ALTER TABLE public."Tournament" ENABLE ROW LEVEL SECURITY;
ALTER TABLE public."TournamentMember" ENABLE ROW LEVEL SECURITY;
ALTER TABLE public."Match" ENABLE ROW LEVEL SECURITY;
ALTER TABLE public."Vote" ENABLE ROW LEVEL SECURITY;

-- USER
DROP POLICY IF EXISTS user_select_self ON public."User";
CREATE POLICY user_select_self
ON public."User"
FOR SELECT
TO authenticated
USING ("supabaseId" = auth.uid()::text);

DROP POLICY IF EXISTS user_update_self ON public."User";
CREATE POLICY user_update_self
ON public."User"
FOR UPDATE
TO authenticated
USING ("supabaseId" = auth.uid()::text)
WITH CHECK ("supabaseId" = auth.uid()::text);

-- TOURNAMENT
DROP POLICY IF EXISTS tournament_select_member_or_owner ON public."Tournament";
CREATE POLICY tournament_select_member_or_owner
ON public."Tournament"
FOR SELECT
TO authenticated
USING (
  EXISTS (
    SELECT 1
    FROM public."User" u
    WHERE u.id = "Tournament"."ownerId"
      AND u."supabaseId" = auth.uid()::text
  )
  OR EXISTS (
    SELECT 1
    FROM public."TournamentMember" tm
    JOIN public."User" u ON u.id = tm."userId"
    WHERE tm."tournamentId" = "Tournament".id
      AND u."supabaseId" = auth.uid()::text
  )
);

DROP POLICY IF EXISTS tournament_insert_owner ON public."Tournament";
CREATE POLICY tournament_insert_owner
ON public."Tournament"
FOR INSERT
TO authenticated
WITH CHECK (
  EXISTS (
    SELECT 1
    FROM public."User" u
    WHERE u.id = "Tournament"."ownerId"
      AND u."supabaseId" = auth.uid()::text
  )
);

DROP POLICY IF EXISTS tournament_update_owner ON public."Tournament";
CREATE POLICY tournament_update_owner
ON public."Tournament"
FOR UPDATE
TO authenticated
USING (
  EXISTS (
    SELECT 1
    FROM public."User" u
    WHERE u.id = "Tournament"."ownerId"
      AND u."supabaseId" = auth.uid()::text
  )
)
WITH CHECK (
  EXISTS (
    SELECT 1
    FROM public."User" u
    WHERE u.id = "Tournament"."ownerId"
      AND u."supabaseId" = auth.uid()::text
  )
);

DROP POLICY IF EXISTS tournament_delete_owner ON public."Tournament";
CREATE POLICY tournament_delete_owner
ON public."Tournament"
FOR DELETE
TO authenticated
USING (
  EXISTS (
    SELECT 1
    FROM public."User" u
    WHERE u.id = "Tournament"."ownerId"
      AND u."supabaseId" = auth.uid()::text
  )
);

-- TOURNAMENT MEMBER
DROP POLICY IF EXISTS member_select_self_or_owner ON public."TournamentMember";
CREATE POLICY member_select_self_or_owner
ON public."TournamentMember"
FOR SELECT
TO authenticated
USING (
  EXISTS (
    SELECT 1
    FROM public."User" u
    WHERE u.id = "TournamentMember"."userId"
      AND u."supabaseId" = auth.uid()::text
  )
  OR EXISTS (
    SELECT 1
    FROM public."Tournament" t
    JOIN public."User" u ON u.id = t."ownerId"
    WHERE t.id = "TournamentMember"."tournamentId"
      AND u."supabaseId" = auth.uid()::text
  )
);

-- MATCH
DROP POLICY IF EXISTS match_select_member_or_owner ON public."Match";
CREATE POLICY match_select_member_or_owner
ON public."Match"
FOR SELECT
TO authenticated
USING (
  EXISTS (
    SELECT 1
    FROM public."Tournament" t
    JOIN public."User" u ON u.id = t."ownerId"
    WHERE t.id = "Match"."tournamentId"
      AND u."supabaseId" = auth.uid()::text
  )
  OR EXISTS (
    SELECT 1
    FROM public."TournamentMember" tm
    JOIN public."User" u ON u.id = tm."userId"
    WHERE tm."tournamentId" = "Match"."tournamentId"
      AND u."supabaseId" = auth.uid()::text
  )
);

DROP POLICY IF EXISTS match_update_owner ON public."Match";
CREATE POLICY match_update_owner
ON public."Match"
FOR UPDATE
TO authenticated
USING (
  EXISTS (
    SELECT 1
    FROM public."Tournament" t
    JOIN public."User" u ON u.id = t."ownerId"
    WHERE t.id = "Match"."tournamentId"
      AND u."supabaseId" = auth.uid()::text
  )
)
WITH CHECK (
  EXISTS (
    SELECT 1
    FROM public."Tournament" t
    JOIN public."User" u ON u.id = t."ownerId"
    WHERE t.id = "Match"."tournamentId"
      AND u."supabaseId" = auth.uid()::text
  )
);

-- VOTE
DROP POLICY IF EXISTS vote_select_member_or_owner ON public."Vote";
CREATE POLICY vote_select_member_or_owner
ON public."Vote"
FOR SELECT
TO authenticated
USING (
  EXISTS (
    SELECT 1
    FROM public."Match" m
    JOIN public."Tournament" t ON t.id = m."tournamentId"
    JOIN public."User" u ON u.id = t."ownerId"
    WHERE m.id = "Vote"."matchId"
      AND u."supabaseId" = auth.uid()::text
  )
  OR EXISTS (
    SELECT 1
    FROM public."Match" m
    JOIN public."TournamentMember" tm ON tm."tournamentId" = m."tournamentId"
    JOIN public."User" u ON u.id = tm."userId"
    WHERE m.id = "Vote"."matchId"
      AND u."supabaseId" = auth.uid()::text
  )
);

DROP POLICY IF EXISTS vote_insert_self_member ON public."Vote";
CREATE POLICY vote_insert_self_member
ON public."Vote"
FOR INSERT
TO authenticated
WITH CHECK (
  EXISTS (
    SELECT 1
    FROM public."User" me
    WHERE me.id = "Vote"."userId"
      AND me."supabaseId" = auth.uid()::text
  )
  AND EXISTS (
    SELECT 1
    FROM public."Match" m
    JOIN public."TournamentMember" tm ON tm."tournamentId" = m."tournamentId"
    JOIN public."User" u ON u.id = tm."userId"
    WHERE m.id = "Vote"."matchId"
      AND u."supabaseId" = auth.uid()::text
  )
);
