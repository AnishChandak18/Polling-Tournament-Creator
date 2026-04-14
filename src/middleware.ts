import { NextResponse, type NextRequest } from "next/server";
import { createServerClient } from "@supabase/ssr";
import { getSupabaseEnv } from "@/lib/supabase/env";

function createSupabaseMiddlewareClient(request: NextRequest) {
  const response = NextResponse.next({ request });
  const env = getSupabaseEnv();
  if (!env) return { supabase: null, response };

  const supabase = createServerClient(
    env.url,
    env.anonKey,
    {
      cookies: {
        get(name) {
          return request.cookies.get(name)?.value;
        },
        set(name, value, options) {
          request.cookies.set({ name, value, ...options });
          response.cookies.set({ name, value, ...options });
        },
        remove(name, options) {
          request.cookies.set({ name, value: "", ...options });
          response.cookies.set({ name, value: "", ...options });
        },
      },
    }
  );

  return { supabase, response };
}

function hasSupabaseSessionCookie(request: NextRequest) {
  const cookies = request.cookies.getAll();
  return cookies.some(({ name }) => name.startsWith("sb-") && name.includes("auth-token"));
}

export async function middleware(request: NextRequest) {
  const { supabase, response } = createSupabaseMiddlewareClient(request);

  const pathname = request.nextUrl.pathname;
  const isProtectedRoute =
    pathname.startsWith("/dashboard") ||
    pathname.startsWith("/tournaments") ||
    pathname === "/predictions" ||
    pathname === "/leaderboard" ||
    pathname === "/profile" ||
    pathname === "/results" ||
    pathname === "/onboarding";
  const isSetupRoute = pathname.startsWith("/setup");
  const isAuthGateRoute =
    pathname === "/login" || pathname === "/signup" || pathname === "/forgot-password";

  if (!supabase) {
    if (isProtectedRoute) {
      const url = request.nextUrl.clone();
      url.pathname = "/setup";
      url.searchParams.set("next", pathname);
      return NextResponse.redirect(url);
    }
    return response;
  }

  // Fast path: no session cookie → unauthenticated for routing purposes.
  const hasSessionCookie = hasSupabaseSessionCookie(request);
  if (!hasSessionCookie) {
    if (isProtectedRoute) {
      const url = request.nextUrl.clone();
      url.pathname = "/login";
      url.searchParams.set("next", pathname);
      return NextResponse.redirect(url);
    }
    return response;
  }

  // Has a Supabase auth cookie. Do NOT call supabase.auth.getUser() here — that adds a
  // network round-trip on every navigation; Server Components already validate via getAuthContext().
  // We only use cookie presence for redirects; invalid/expired sessions are handled on the page.

  if (isProtectedRoute) {
    return response;
  }

  if (isAuthGateRoute) {
    const next = request.nextUrl.searchParams.get("next");
    if (next && next.startsWith("/") && !next.startsWith("//")) {
      return NextResponse.redirect(new URL(next, request.url));
    }
    const url = request.nextUrl.clone();
    url.pathname = "/dashboard";
    url.search = "";
    return NextResponse.redirect(url);
  }

  if (isSetupRoute) {
    const url = request.nextUrl.clone();
    url.pathname = "/dashboard";
    return NextResponse.redirect(url);
  }

  return response;
}

export const config = {
  matcher: [
    "/dashboard/:path*",
    "/tournaments/:path*",
    "/predictions",
    "/leaderboard",
    "/profile",
    "/results",
    "/onboarding",
    "/login",
    "/signup",
    "/forgot-password",
    "/reset-password",
    "/auth/callback",
    "/setup",
  ],
};

