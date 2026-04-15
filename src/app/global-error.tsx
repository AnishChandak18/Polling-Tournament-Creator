"use client";

import "./globals.css";
import "./theme.css";
import { AppErrorFallback } from "@/components/errors/AppErrorFallback";

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <html lang="en" className="dark" suppressHydrationWarning>
      <body
        className="min-h-screen bg-background font-sans antialiased text-on-surface"
        suppressHydrationWarning
      >
        <AppErrorFallback
          error={error}
          reset={reset}
          secondaryLinks={[
            { href: "/", label: "Home" },
            { href: "/dashboard", label: "Dashboard" },
          ]}
        />
      </body>
    </html>
  );
}
