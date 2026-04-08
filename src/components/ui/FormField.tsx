import * as React from "react";
import { cn } from "@/lib/utils";

export type FormFieldProps = {
  id?: string;
  label: string;
  optional?: boolean;
  optionalLabel?: string;
  hint?: React.ReactNode;
  error?: string;
  children: React.ReactNode;
  className?: string;
  labelClassName?: string;
};

/**
 * Label + optional badge + field slot + hint/error. Use with `Input` or any control.
 */
export function FormField({
  id,
  label,
  optional = false,
  optionalLabel = "Optional",
  hint,
  error,
  children,
  className,
  labelClassName,
}: FormFieldProps) {
  return (
    <div className={cn("space-y-2", className)}>
      <div className="flex items-end justify-between gap-2">
        <label
          htmlFor={id}
          className={cn(
            "ml-1 text-xs font-bold uppercase tracking-widest text-primary",
            labelClassName
          )}
        >
          {label}
        </label>
        {optional ? (
          <span className="text-[10px] font-bold uppercase text-on-surface-variant">{optionalLabel}</span>
        ) : null}
      </div>
      {children}
      {hint ? <p className="text-xs text-on-surface-variant">{hint}</p> : null}
      {error ? (
        <p className="text-sm text-red-600 dark:text-red-400" role="alert">
          {error}
        </p>
      ) : null}
    </div>
  );
}
