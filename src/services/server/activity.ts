import { prisma } from "@/lib/prisma";

export type CircleActivityRow = {
  id: string;
  actorLabel: string;
  pickTeam: string;
  circleName: string;
  ago: string;
  iconLetter: string;
};

function formatRelativeAgo(d: Date): string {
  const sec = Math.max(0, Math.floor((Date.now() - d.getTime()) / 1000));
  if (sec < 60) return "just now";
  if (sec < 3600) return `${Math.floor(sec / 60)}m ago`;
  if (sec < 86400) return `${Math.floor(sec / 3600)}h ago`;
  return `${Math.floor(sec / 86400)}d ago`;
}

function actorInitial(name: string | null, email: string) {
  const s = (name || email || "?").trim();
  return s.slice(0, 1).toUpperCase();
}

/** Recent votes in circles the user belongs to (or owns). */
export async function getRecentCircleActivity(
  userId: string,
  take = 6
): Promise<CircleActivityRow[]> {
  const votes = await prisma.vote.findMany({
    where: {
      match: {
        tournament: {
          OR: [{ ownerId: userId }, { members: { some: { userId } } }],
        },
      },
    },
    orderBy: { createdAt: "desc" },
    take,
    select: {
      id: true,
      teamVoted: true,
      createdAt: true,
      user: { select: { name: true, email: true } },
      match: {
        select: {
          tournament: { select: { name: true } },
        },
      },
    },
  });

  return votes.map((v) => {
    const actorLabel = v.user.name?.trim() || v.user.email.split("@")[0] || "Someone";
    return {
      id: v.id,
      actorLabel,
      pickTeam: v.teamVoted,
      circleName: v.match.tournament.name,
      ago: formatRelativeAgo(v.createdAt),
      iconLetter: actorInitial(v.user.name, v.user.email),
    };
  });
}
