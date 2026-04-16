/**
 * Bento-style stat block — Stitch glass/tonal cards.
 *
 * @param {{
 *   label: string;
 *   value: string;
 *   icon?: string;
 *   trend?: string;
 *   progress?: number;
 *   accent?: "primary" | "secondary" | "tertiary";
 *   className?: string;
 * }} props
 */
export default function StatBento({
  label,
  value,
  icon,
  trend,
  progress,
  accent = "primary",
  className = "",
}) {
  const accentClass =
    accent === "secondary" ? "text-secondary" : accent === "tertiary" ? "text-tertiary" : "text-primary";

  return (
    <div className={["glass-card relative overflow-hidden p-6", className].join(" ")}>
      {icon && (
        <div className="pointer-events-none absolute -bottom-4 -right-4 opacity-10">
          <span className="material-symbols-outlined text-9xl font-black">{icon}</span>
        </div>
      )}

      <p className={`mb-1 font-sans text-xs uppercase tracking-widest ${accentClass}`}>{label}</p>
      <h4 className="font-display text-5xl font-bold italic leading-none tracking-tighter text-on-surface">
        {value}
      </h4>

      {trend && (
        <div className="mt-4 flex items-center gap-2 text-sm font-bold text-secondary">
          <span className="material-symbols-outlined text-base">trending_up</span>
          <span>{trend}</span>
        </div>
      )}

      {typeof progress === "number" && (
        <div className="mt-6 h-2 w-full overflow-hidden rounded-full bg-surface-container">
          <div
            className="h-full rounded-full bg-primary shadow-[0_0_10px_rgba(255,231,146,0.5)]"
            style={{ width: `${progress}%` }}
          />
        </div>
      )}
    </div>
  );
}
