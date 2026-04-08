/**
 * Section heading with a left gold accent bar.
 * Usage: <SectionHeader title="Identity & Atmosphere" subtitle="Visual foundations..." />
 */
export default function SectionHeader({ title, subtitle = undefined, className = "" }) {
  return (
    <div className={["section-header", className].join(" ")}>
      <h2 className="font-display text-3xl font-bold uppercase tracking-tighter text-on-surface md:text-4xl">
        {title}
      </h2>
      {subtitle && (
        <p className="mt-2 max-w-2xl text-on-surface-variant">{subtitle}</p>
      )}
    </div>
  );
}
