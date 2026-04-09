import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { prisma } from "@/lib/prisma";
import { getRequestOrigin } from "@/lib/request-origin";
import {
  AUTH_REDIRECT_COOKIE,
  resolvePostAuthRedirect,
} from "@/lib/auth-redirect";

function successRedirect(origin: string, nextPath: string) {
  const p = nextPath.startsWith("/") ? nextPath : `/${nextPath}`;
  const response = NextResponse.redirect(`${origin}${p}`);
  response.cookies.set(AUTH_REDIRECT_COOKIE, "", { path: "/", maxAge: 0 });
  return response;
}

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const origin = getRequestOrigin(request);
  const code = searchParams.get("code");
  const cookieStore = await cookies();
  const next = resolvePostAuthRedirect(
    searchParams.get("next"),
    cookieStore.get(AUTH_REDIRECT_COOKIE)?.value
  );

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
    if (next.startsWith("/join")) {
      return successRedirect(origin, next);
    }
    return successRedirect(origin, "/onboarding");
  }

  return successRedirect(origin, next);
}

