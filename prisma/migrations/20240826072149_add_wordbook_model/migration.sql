-- CreateTable
CREATE TABLE "Wordbook" (
  "id" TEXT NOT NULL,
  "name" TEXT NOT NULL,
  "totalDays" INTEGER NOT NULL,
  "description" TEXT,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "Wordbook_pkey" PRIMARY KEY ("id")
);
-- AlterTable
ALTER TABLE "Word"
ADD COLUMN "wordbookId" TEXT;
-- AlterTable
ALTER TABLE "UserProgress"
ADD COLUMN "wordbookId" TEXT;
-- Create a default Wordbook
INSERT INTO "Wordbook" ("id", "name", "totalDays", "updatedAt")
VALUES (
    'default_wordbook',
    'Default Wordbook',
    30,
    CURRENT_TIMESTAMP
  );
-- Update existing Words to use the default Wordbook
UPDATE "Word"
SET "wordbookId" = 'default_wordbook'
WHERE "wordbookId" IS NULL;
-- Update existing UserProgress to use the default Wordbook
UPDATE "UserProgress"
SET "wordbookId" = 'default_wordbook'
WHERE "wordbookId" IS NULL;
-- Now make the columns required
ALTER TABLE "Word"
ALTER COLUMN "wordbookId"
SET NOT NULL;
ALTER TABLE "UserProgress"
ALTER COLUMN "wordbookId"
SET NOT NULL;
-- AddForeignKey
ALTER TABLE "Word"
ADD CONSTRAINT "Word_wordbookId_fkey" FOREIGN KEY ("wordbookId") REFERENCES "Wordbook"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
-- AddForeignKey
ALTER TABLE "UserProgress"
ADD CONSTRAINT "UserProgress_wordbookId_fkey" FOREIGN KEY ("wordbookId") REFERENCES "Wordbook"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
-- CreateIndex
CREATE INDEX "Word_wordbookId_day_idx" ON "Word"("wordbookId", "day");