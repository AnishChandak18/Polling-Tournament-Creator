"use client";

import { AppErrorFallback } from "@/components/errors/AppErrorFallback";

export default function RootError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <AppErrorFallback
      error={error}
      reset={reset}
      secondaryLinks={[
        { href: "/", label: "Home" },
        { href: "/dashboard", label: "Dashboard" },
      ]}
    />
  );
}
