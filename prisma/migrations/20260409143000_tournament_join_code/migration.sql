-- Typed circle join code for direct join flow.
ALTER TABLE "Tournament" ADD COLUMN "joinCode" TEXT;

-- Backfill existing rows with a deterministic unique fallback using current id.
UPDATE "Tournament" SET "joinCode" = UPPER(SUBSTRING(REPLACE(id, '-', '') FROM 1 FOR 8))
WHERE "joinCode" IS NULL;

ALTER TABLE "Tournament" ALTER COLUMN "joinCode" SET NOT NULL;
CREATE UNIQUE INDEX "Tournament_joinCode_key" ON "Tournament"("joinCode");
