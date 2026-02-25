-- CreateTable
CREATE TABLE "TeamMember" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "name" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- CreateTable
CREATE TABLE "Chore" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "title" TEXT NOT NULL,
    "description" TEXT,
    "assignedToId" INTEGER,
    "recurrence" TEXT NOT NULL,
    "recurrenceDays" TEXT,
    "startDate" DATETIME NOT NULL,
    "endDate" DATETIME,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "Chore_assignedToId_fkey" FOREIGN KEY ("assignedToId") REFERENCES "TeamMember" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "Completion" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "choreId" INTEGER NOT NULL,
    "completedBy" TEXT NOT NULL,
    "completedAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "occurrenceDate" DATETIME NOT NULL,
    CONSTRAINT "Completion_choreId_fkey" FOREIGN KEY ("choreId") REFERENCES "Chore" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);
