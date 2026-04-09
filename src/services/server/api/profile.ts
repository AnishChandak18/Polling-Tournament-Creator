import { getCurrentUserOrThrow } from "@/lib/currentUser";
import {
  updateUserProfile,
  type UpdateProfileInput,
} from "@/services/server/profile";

export async function patchProfileForCurrentUser(input: UpdateProfileInput) {
  const user = await getCurrentUserOrThrow();
  await updateUserProfile(user.id, input);
}
