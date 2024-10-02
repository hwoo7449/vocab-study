-- CreateTable
CREATE TABLE "WordReport" (
    "id" TEXT NOT NULL,
    "wordId" TEXT NOT NULL,
    "wordbookId" TEXT NOT NULL,
    "day" INTEGER NOT NULL,
    "originalEnglish" TEXT NOT NULL,
    "originalKorean" TEXT NOT NULL,
    "reportedEnglish" TEXT NOT NULL,
    "reportedKorean" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'pending',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "userId" TEXT NOT NULL,

    CONSTRAINT "WordReport_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "WordReport" ADD CONSTRAINT "WordReport_wordId_fkey" FOREIGN KEY ("wordId") REFERENCES "Word"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "WordReport" ADD CONSTRAINT "WordReport_wordbookId_fkey" FOREIGN KEY ("wordbookId") REFERENCES "Wordbook"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "WordReport" ADD CONSTRAINT "WordReport_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
