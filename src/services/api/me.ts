import { apiRequest } from "@/services/api/client";

export async function patchMe(payload: {
  username?: string | null;
  name?: string | null;
  onboardingComplete?: boolean;
}) {
  return apiRequest<{ ok: boolean }>("/api/me", {
    method: "PATCH",
    body: payload,
  });
}
