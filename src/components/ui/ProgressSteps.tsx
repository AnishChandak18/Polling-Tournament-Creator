import { cn } from "@/lib/utils";

type ProgressStepsProps = {
  /** 1-based step index that is “filled” up to and including this step */
  current: number;
  total?: number;
  className?: string;
};

/** Thin progress bar segments (e.g. onboarding). */
export function ProgressSteps({ current, total = 3, className }: ProgressStepsProps) {
  const safe = Math.min(Math.max(current, 0), total);
  return (
    <div
      className={cn("mb-10 flex gap-2", className)}
      role="progressbar"
      aria-valuenow={safe}
      aria-valuemin={0}
      aria-valuemax={total}
      aria-label={`Step ${safe} of ${total}`}
    >
      {Array.from({ length: total }, (_, i) => (
        <div
          key={i}
          className={cn(
            "h-1 flex-1 rounded-full transition-colors",
            i < safe ? "bg-primary" : "bg-surface-container-highest"
          )}
        />
      ))}
    </div>
  );
}
