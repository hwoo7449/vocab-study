-- CreateTable
CREATE TABLE "Word" (
    "id" TEXT NOT NULL,
    "english" TEXT NOT NULL,
    "korean" TEXT NOT NULL,
    "day" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Word_pkey" PRIMARY KEY ("id")
);
