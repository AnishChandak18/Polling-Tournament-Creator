import Image from "next/image";
import Link from "next/link";
import { HERO_STADIUM_IMAGE } from "@/lib/team-logos";

const ICONS = ["swords", "work", "groups"];

/**
 * Stitch Home — horizontal scroll circle tile (4:5, icon + name + avatar stack).
 */
export default function DashboardCircleCard({ href, name, index = 0 }) {
  const icon = ICONS[index % ICONS.length];
  const isGold = index % 2 === 0;

  return (
    <Link
      href={href}
      className="group relative flex aspect-[4/5] w-36 shrink-0 flex-col justify-between overflow-hidden rounded-xl border border-outline-variant bg-surface-container p-4"
    >
      <Image
        src={HERO_STADIUM_IMAGE}
        alt=""
        fill
        sizes="144px"
        className="object-cover opacity-10 grayscale transition-opacity group-hover:opacity-20"
      />
      <div className="relative z-10">
        <div
          className={[
            "mb-3 flex h-8 w-8 items-center justify-center rounded-lg border",
            isGold
              ? "border-primary-container/40 bg-primary-container/20"
              : "border-outline-variant bg-zinc-800",
          ].join(" ")}
        >
          <span
            className={[
              "material-symbols-outlined text-lg",
              isGold ? "text-primary-container" : "text-zinc-400",
            ].join(" ")}
          >
            {icon}
          </span>
        </div>
        <p className="text-sm font-bold leading-tight text-on-surface">
          {name}
        </p>
      </div>
      <div className="relative z-10 flex -space-x-2">
        <div
          className="h-6 w-6 rounded-full border-2 border-surface-container bg-zinc-700"
          title=""
        />
        <div
          className="h-6 w-6 rounded-full border-2 border-surface-container bg-zinc-600"
          title=""
        />
        <div className="flex h-6 w-6 items-center justify-center rounded-full border-2 border-surface-container bg-zinc-500 text-[8px] font-bold text-on-surface">
          +
        </div>
      </div>
    </Link>
  );
}
