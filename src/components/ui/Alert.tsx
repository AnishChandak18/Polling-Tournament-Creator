import * as React from "react";
import { cn } from "@/lib/utils";

type AlertProps = {
  variant?: "error" | "info";
  children: React.ReactNode;
  className?: string;
};

/** Inline status message; `error` uses destructive semantic colors. */
export function Alert({ variant = "error", children, className }: AlertProps) {
  return (
    <div
      role="alert"
      className={cn(
        "text-sm",
        variant === "error" && "text-red-600 dark:text-red-400",
        variant === "info" && "text-on-surface-variant",
        className
      )}
    >
      {children}
    </div>
  );
}
