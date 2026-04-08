import * as React from "react";
import { cn } from "@/lib/utils";

export type PageHeroProps = {
  title: React.ReactNode;
  description?: string;
  className?: string;
};

/** Page title block (auth/marketing) — uses semantic typography tokens. */
export function PageHero({ title, description, className }: PageHeroProps) {
  return (
    <header className={cn("mb-10", className)}>
      <h1 className="font-display text-4xl font-extrabold uppercase leading-none tracking-tighter text-on-surface md:text-5xl">
        {title}
      </h1>
      {description ? (
        <p className="mt-4 text-lg leading-relaxed text-on-surface-variant">{description}</p>
      ) : null}
    </header>
  );
}
