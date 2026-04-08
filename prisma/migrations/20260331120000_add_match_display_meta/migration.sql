-- AlterTable (IF NOT EXISTS: safe to run twice or from Supabase SQL editor)
ALTER TABLE "Match" ADD COLUMN IF NOT EXISTS "displayMeta" JSONB;
