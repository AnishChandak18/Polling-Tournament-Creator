import { cache } from "react";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { getOrCreateUserBySupabase } from "@/lib/currentUser";

/** Dedupes Supabase + DB user lookup when multiple server components call auth in one request. */
export const getAuthContext = cache(async function getAuthContext() {
  const supabase = await createSupabaseServerClient();
  const {
    data: { user: supabaseUser },
  } = await supabase.auth.getUser();

  if (!supabaseUser) {
    return { supabaseUser: null, dbUser: null };
  }

  const dbUser = await getOrCreateUserBySupabase(supabaseUser).catch(() => null);
  return { supabaseUser, dbUser };
});
