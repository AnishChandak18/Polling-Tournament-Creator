import type { StaticImageData } from "next/image";

import cskLogo from "@/assets/csk-logo.jpeg";
import dcLogo from "@/assets/dc-logo.jpeg";
import gtLogo from "@/assets/gt-logo.jpeg";
import kkrLogo from "@/assets/kkr-logo.jpeg";
import lsgLogo from "@/assets/lsg-logo.jpeg";
import miLogo from "@/assets/mi-logo.jpeg";
import pkLogo from "@/assets/pk-logo.jpeg";
import rcbLogo from "@/assets/rcb-logo.jpeg";
import rrLogo from "@/assets/rr-logo.jpeg";
import srhLogo from "@/assets/srh-logo.jpeg";

export type TeamKey = "csk" | "mi" | "rcb" | "kkr" | "dc" | "rr" | "srh" | "pbks" | "gt" | "lsg";

/** IPL franchise crests (local assets). Punjab Kings file: `pk-logo.jpeg`. */
export const TEAM_LOGOS: Record<TeamKey, StaticImageData> = {
  csk: cskLogo,
  mi: miLogo,
  rcb: rcbLogo,
  kkr: kkrLogo,
  dc: dcLogo,
  rr: rrLogo,
  srh: srhLogo,
  pbks: pkLogo,
  gt: gtLogo,
  lsg: lsgLogo,
};

export { default as HERO_STADIUM_IMAGE } from "@/assets/stadium-image.jpeg";

const TEAM_ALIASES: Record<string, TeamKey> = {
  csk: "csk",
  "chennai super kings": "csk",
  mi: "mi",
  "mumbai indians": "mi",
  rcb: "rcb",
  "royal challengers bengaluru": "rcb",
  "royal challengers bangalore": "rcb",
  kkr: "kkr",
  "kolkata knight riders": "kkr",
  dc: "dc",
  "delhi capitals": "dc",
  rr: "rr",
  "rajasthan royals": "rr",
  srh: "srh",
  "sunrisers hyderabad": "srh",
  pbks: "pbks",
  pk: "pbks",
  "punjab kings": "pbks",
  "kings xi punjab": "pbks",
  gt: "gt",
  "gujarat titans": "gt",
  lsg: "lsg",
  "lucknow super giants": "lsg",
};

export function resolveTeamKey(teamName: string): TeamKey | null {
  const key = teamName.trim().toLowerCase().replace(/\s+/g, " ");
  return TEAM_ALIASES[key] ?? null;
}

export function getTeamLogoByName(teamName: string): StaticImageData | null {
  const key = resolveTeamKey(teamName);
  return key ? TEAM_LOGOS[key] : null;
}
