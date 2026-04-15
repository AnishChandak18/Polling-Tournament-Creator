"use client";

import Link from "next/link";
import { useEffect } from "react";
import { DATABASE_UNAVAILABLE_MESSAGE } from "@/lib/prisma-errors";

export type AppErrorFallbackLink = {
  href: string;
  label: string;
};

type AppErrorFallbackProps = {
  error: Error & { digest?: string };
  reset: () => void;
  secondaryLinks: AppErrorFallbackLink[];
};

export function AppErrorFallback({
  error,
  reset,
  secondaryLinks,
}: AppErrorFallbackProps) {
  const isDb = error.message === DATABASE_UNAVAILABLE_MESSAGE;

  useEffect(() => {
    if (process.env.NODE_ENV === "development") {
      console.error(error);
    }
  }, [error]);

  return (
    <div className="mx-auto flex min-h-[50vh] max-w-lg flex-col justify-center px-4 py-12 text-center">
      <h1 className="font-display text-2xl font-black text-on-surface">
        {isDb ? "Database unreachable" : "Something went wrong"}
      </h1>
      <p className="mt-3 text-sm text-on-surface-variant">
        {isDb
          ? "The app could not reach your database. Resume the Supabase project, confirm DATABASE_URL, and try again."
          : error.message}
      </p>
      <div className="mt-6 flex flex-wrap justify-center gap-3">
        <button
          type="button"
          onClick={() => reset()}
          className="btn-primary h-10 px-4 text-xs"
        >
          Try again
        </button>
        {secondaryLinks.map(({ href, label }) => (
          <Link key={href} href={href} className="btn-outline h-10 px-4 text-xs">
            {label}
          </Link>
        ))}
      </div>
    </div>
  );
}
