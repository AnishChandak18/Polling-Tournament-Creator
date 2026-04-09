import { prisma } from "@/lib/prisma";
import { HttpError } from "@/services/server/api/errors";

const USERNAME_RE = /^[a-zA-Z0-9_]{3,20}$/;

export type UpdateProfileInput = {
  username?: string | null;
  name?: string | null;
  markOnboardingComplete?: boolean;
};

export async function updateUserProfile(userId: string, input: UpdateProfileInput) {
  const data: {
    username?: string | null;
    name?: string | null;
    onboardingCompletedAt?: Date;
  } = {};

  if (input.username !== undefined) {
    if (input.username === null) {
      data.username = null;
    } else {
      const raw = input.username.trim();
      if (!raw) {
        data.username = null;
      } else {
        if (!USERNAME_RE.test(raw)) {
          throw new HttpError(
            "Username must be 3–20 characters: letters, numbers, underscores",
            400
          );
        }
        const taken = await prisma.user.findFirst({
          where: { username: raw, NOT: { id: userId } },
          select: { id: true },
        });
        if (taken) throw new HttpError("Username is already taken", 409);
        data.username = raw;
      }
    }
  }

  if (input.name !== undefined) {
    const n = input.name?.trim();
    data.name = n ? n : null;
  }

  if (input.markOnboardingComplete) {
    data.onboardingCompletedAt = new Date();
  }

  if (Object.keys(data).length === 0) {
    throw new HttpError("No fields to update", 400);
  }

  await prisma.user.update({
    where: { id: userId },
    data,
  });
}
