/** Dark card with Stitch-style inset glow — auth and arena surfaces */
export default function StadiumGlowPanel({ children, className = "" }) {
  return (
    <div
      className={[
        "relative overflow-hidden border border-zinc-800 bg-surface-container p-6 sm:p-8 glow-border-stitch",
        className,
      ].join(" ")}
    >
      <div className="pointer-events-none absolute right-0 top-0 p-2 opacity-20">
        <span className="material-symbols-outlined text-4xl text-primary">
          grid_view
        </span>
      </div>
      <div className="relative z-10">{children}</div>
    </div>
  );
}
