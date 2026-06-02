-- CreateTable
CREATE TABLE "TeamMember" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "TeamMember_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Chore" (
    "id" SERIAL NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT,
    "assignedToId" INTEGER,
    "recurrence" TEXT NOT NULL,
    "recurrenceDays" TEXT,
    "startDate" TIMESTAMP(3) NOT NULL,
    "endDate" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Chore_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Completion" (
    "id" SERIAL NOT NULL,
    "choreId" INTEGER NOT NULL,
    "completedBy" TEXT NOT NULL,
    "completedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "occurrenceDate" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Completion_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "Chore" ADD CONSTRAINT "Chore_assignedToId_fkey" FOREIGN KEY ("assignedToId") REFERENCES "TeamMember"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Completion" ADD CONSTRAINT "Completion_choreId_fkey" FOREIGN KEY ("choreId") REFERENCES "Chore"("id") ON DELETE CASCADE ON UPDATE CASCADE;
