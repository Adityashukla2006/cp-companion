-- CreateTable
CREATE TABLE "CodeforcesQuestion" (
    "id" INTEGER NOT NULL,
    "contestName" TEXT NOT NULL,
    "timeLimit" TEXT NOT NULL,
    "memoryLimit" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "notes" TEXT NOT NULL,
    "url" TEXT NOT NULL,

    CONSTRAINT "CodeforcesQuestion_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "LeetcodeQuestion" (
    "id" INTEGER NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "difficulty" TEXT NOT NULL,
    "hints" TEXT NOT NULL,
    "notes" TEXT NOT NULL,
    "url" TEXT NOT NULL,

    CONSTRAINT "LeetcodeQuestion_pkey" PRIMARY KEY ("id")
);
