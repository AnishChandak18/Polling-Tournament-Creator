import { NextResponse } from "next/server";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { prisma } from "@/lib/prisma";

function getRequestOrigin(request: Request) {
  const url = new URL(request.url);
  const forwardedHost = request.headers.get("x-forwarded-host");
  const forwardedProto = request.headers.get("x-forwarded-proto");
  const host = forwardedHost ?? request.headers.get("host");
  const proto = forwardedProto ?? url.protocol.replace(":", "");
  if (host) return `${proto}://${host}`;
  return url.origin;
}

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const origin = getRequestOrigin(request);
  const code = searchParams.get("code");
  const next = searchParams.get("next") ?? "/dashboard";

  if (!code) return NextResponse.redirect(`${origin}/login`);

  const supabase = await createSupabaseServerClient();
  const { data, error } = await supabase.auth.exchangeCodeForSession(code);
  if (error || !data.session) return NextResponse.redirect(`${origin}/login`);

  const user = data.session.user;
  const email = user.email;
  let isNewUser = false;

  if (email) {
    try {
      const existing = await prisma.user.findUnique({
        where: { supabaseId: user.id },
        select: { id: true },
      });

      if (!existing) {
        isNewUser = true;
      }

      await prisma.user.upsert({
        where: { supabaseId: user.id },
        create: {
          supabaseId: user.id,
          email,
          name: user.user_metadata?.full_name ?? null,
          avatarUrl: user.user_metadata?.avatar_url ?? null,
        },
        update: {
          email,
          name: user.user_metadata?.full_name ?? null,
          avatarUrl: user.user_metadata?.avatar_url ?? null,
        },
      });
    } catch (dbError) {
      console.error("Auth callback: database error", dbError);
      const url = new URL("/login", origin);
      url.searchParams.set("error", "database");
      return NextResponse.redirect(url.toString());
    }
  }

  const recoveryNext = next === "/reset-password" || next.startsWith("/reset-password?");
  if (isNewUser && !recoveryNext) {
    return NextResponse.redirect(`${origin}/onboarding`);
  }

  return NextResponse.redirect(`${origin}${next}`);
}

