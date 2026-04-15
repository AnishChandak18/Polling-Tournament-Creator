"use client";

import Link from "next/link";

export default function BrandLogo({
  href = "/dashboard",
  className = "",
  compact = false,
}) {
  const content = (
    <div className={["inline-flex items-center gap-3", className].join(" ")}>
      <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-sm bg-primary-container">
        <span
          className="material-symbols-outlined text-xl text-on-primary-container"
          style={{ fontVariationSettings: "'FILL' 1" }}
        >
          bolt
        </span>
      </div>
      <span
        className={[
          "font-display font-black uppercase italic tracking-widest text-primary-container",
          compact ? "text-base" : "text-xl",
        ].join(" ")}
      >
        Stadium Pulse
      </span>
    </div>
  );

  if (!href) return content;
  return <Link href={href}>{content}</Link>;
}
