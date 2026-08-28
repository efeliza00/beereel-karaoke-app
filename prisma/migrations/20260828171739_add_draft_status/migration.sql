-- AlterTable
ALTER TABLE "ChangelogEntry" ADD COLUMN "status" TEXT NOT NULL DEFAULT 'draft',
ADD COLUMN "publishedAt" TIMESTAMP(3);

-- Backfill existing entries as published (they were live before draft support)
UPDATE "ChangelogEntry" SET "status" = 'published', "publishedAt" = "date" WHERE "status" = 'draft';
