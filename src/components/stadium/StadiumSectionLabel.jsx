/** Eyebrow line + kicker — matches Stitch “Access Protocol” / section labels */
export default function StadiumSectionLabel({ kicker, children, className = "" }) {
  return (
    <div className={className}>
      <div className="mb-2 flex items-center gap-2">
        <span className="h-px w-8 bg-primary-container" aria-hidden />
        <span className="font-display text-[10px] font-bold uppercase tracking-[0.3em] text-primary-container">
          {kicker}
        </span>
      </div>
      {children}
    </div>
  );
}
