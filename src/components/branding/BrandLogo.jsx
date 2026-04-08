"use client";

import Link from "next/link";

export default function BrandLogo({ href = "/dashboard", className = "", compact = false }) {
  const content = (
    <div className={["inline-flex items-center gap-2", className].join(" ")}>
      <span className="material-symbols-outlined text-2xl leading-none text-primary-container">
        electric_bolt
      </span>
      <span
        className={[
          "font-display font-black uppercase italic tracking-tighter text-primary-container",
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
