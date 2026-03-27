-- CreateTable
CREATE TABLE "JournalPage" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    "journalId" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "type" TEXT NOT NULL DEFAULT 'custom',
    "language" TEXT NOT NULL DEFAULT 'ru',
    "content" TEXT NOT NULL DEFAULT '',
    "seoTitle" TEXT,
    "seoDescription" TEXT,
    "published" BOOLEAN NOT NULL DEFAULT false,
    "showInRightMenu" BOOLEAN NOT NULL DEFAULT false,
    "showInTopNav" BOOLEAN NOT NULL DEFAULT false,
    "sortOrder" INTEGER NOT NULL DEFAULT 0,
    CONSTRAINT "JournalPage_journalId_fkey" FOREIGN KEY ("journalId") REFERENCES "Journal" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_Issue" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    "journalId" TEXT NOT NULL,
    "year" INTEGER NOT NULL,
    "volume" INTEGER,
    "number" INTEGER,
    "title" TEXT,
    "description" TEXT,
    "coverImageUrl" TEXT,
    "publicationDate" DATETIME,
    "status" TEXT NOT NULL DEFAULT 'Draft',
    CONSTRAINT "Issue_journalId_fkey" FOREIGN KEY ("journalId") REFERENCES "Journal" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);
INSERT INTO "new_Issue" ("createdAt", "id", "journalId", "number", "title", "updatedAt", "volume", "year") SELECT "createdAt", "id", "journalId", "number", "title", "updatedAt", "volume", "year" FROM "Issue";
DROP TABLE "Issue";
ALTER TABLE "new_Issue" RENAME TO "Issue";
CREATE INDEX "Issue_journalId_year_idx" ON "Issue"("journalId", "year");
CREATE TABLE "new_Submission" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    "journalId" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'NEW_SUBMISSION',
    "title" TEXT NOT NULL,
    "abstract" TEXT NOT NULL,
    "keywords" JSONB NOT NULL,
    "language" TEXT NOT NULL,
    "articleType" TEXT NOT NULL,
    "references" TEXT,
    "authorId" TEXT NOT NULL,
    "handlingEditorId" TEXT,
    CONSTRAINT "Submission_journalId_fkey" FOREIGN KEY ("journalId") REFERENCES "Journal" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "Submission_authorId_fkey" FOREIGN KEY ("authorId") REFERENCES "User" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "Submission_handlingEditorId_fkey" FOREIGN KEY ("handlingEditorId") REFERENCES "User" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);
INSERT INTO "new_Submission" ("abstract", "articleType", "authorId", "createdAt", "id", "journalId", "keywords", "language", "references", "status", "title", "updatedAt") SELECT "abstract", "articleType", "authorId", "createdAt", "id", "journalId", "keywords", "language", "references", "status", "title", "updatedAt" FROM "Submission";
DROP TABLE "Submission";
ALTER TABLE "new_Submission" RENAME TO "Submission";
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;

-- CreateIndex
CREATE INDEX "JournalPage_journalId_published_idx" ON "JournalPage"("journalId", "published");

-- CreateIndex
CREATE UNIQUE INDEX "JournalPage_journalId_slug_language_key" ON "JournalPage"("journalId", "slug", "language");
