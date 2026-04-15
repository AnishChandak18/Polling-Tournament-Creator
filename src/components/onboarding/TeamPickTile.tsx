"use client";

import Image from "next/image";
import type { StaticImageData } from "next/image";
import { cn } from "@/lib/utils";

type TeamPickTileProps = {
  name: string;
  logo: StaticImageData;
  selected: boolean;
  onSelect: () => void;
};

/** Compact square tile for IPL team selection — shows official crest + label. */
export function TeamPickTile({
  name,
  logo,
  selected,
  onSelect,
}: TeamPickTileProps) {
  return (
    <button
      type="button"
      onClick={onSelect}
      className={cn(
        "relative flex aspect-square flex-col overflow-hidden rounded-xl border border-outline-variant bg-surface-container-high text-left transition-all active:scale-95 dark:bg-surface-container",
        selected
          ? "ring-2 ring-primary shadow-md"
          : "hover:ring-2 hover:ring-outline-variant",
      )}
    >
      <div className="relative min-h-0 flex-1 w-full">
        <Image
          src={logo}
          alt={name}
          fill
          sizes="(max-width: 640px) 33vw, 120px"
          className="scale-110 object-cover p-2"
        />
      </div>
      <div className="relative z-20 border-t border-outline-variant/20 bg-surface-container-highest/95 px-2 py-2">
        <p className="line-clamp-2 font-display text-[10px] font-bold uppercase leading-tight text-on-surface">
          {name}
        </p>
      </div>
      {selected ? (
        <div className="absolute right-2 top-2 z-30 flex h-5 w-5 items-center justify-center rounded-full bg-primary">
          <span className="material-symbols-outlined text-[12px] text-on-primary">
            check
          </span>
        </div>
      ) : null}
    </button>
  );
}
