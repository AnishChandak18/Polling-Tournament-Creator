-- Per-user throttle for IPL fixture sync (background refresh after first sync).
ALTER TABLE "User" ADD COLUMN "lastFixtureSyncAt" TIMESTAMP(3);
