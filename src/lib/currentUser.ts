import { createSupabaseServerClient } from "@/lib/supabase/server";
import { prisma } from "@/lib/prisma";
import type { User as SupabaseUser } from "@supabase/supabase-js";

export async function getOrCreateUserBySupabase(supabaseUser: SupabaseUser) {
  if (!supabaseUser.email) throw new Error("Supabase user email missing");

  return prisma.user.upsert({
    where: { supabaseId: supabaseUser.id },
    create: {
      supabaseId: supabaseUser.id,
      email: supabaseUser.email,
      name: supabaseUser.user_metadata?.full_name ?? null,
      avatarUrl: supabaseUser.user_metadata?.avatar_url ?? null,
    },
    update: {
      email: supabaseUser.email,
      name: supabaseUser.user_metadata?.full_name ?? null,
      avatarUrl: supabaseUser.user_metadata?.avatar_url ?? null,
    },
  });
}

export async function getCurrentUserOrThrow() {
  const supabase = await createSupabaseServerClient();
  const {
    data: { user: supabaseUser },
  } = await supabase.auth.getUser();

  if (!supabaseUser) throw new Error("Unauthorized");

  return getOrCreateUserBySupabase(supabaseUser);
}

