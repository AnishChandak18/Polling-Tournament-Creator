-- Private circle invites + profile onboarding
ALTER TABLE "User" ADD COLUMN "username" TEXT;
ALTER TABLE "User" ADD COLUMN "onboardingCompletedAt" TIMESTAMP(3);
CREATE UNIQUE INDEX "User_username_key" ON "User"("username");

ALTER TABLE "Tournament" ADD COLUMN "inviteToken" TEXT;
ALTER TABLE "Tournament" ADD COLUMN "inviteTokenCreatedAt" TIMESTAMP(3);
CREATE UNIQUE INDEX "Tournament_inviteToken_key" ON "Tournament"("inviteToken");
