-- CreateTable
CREATE TABLE "User" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    "email" TEXT NOT NULL,
    "passwordHash" TEXT NOT NULL,
    "emailVerified" BOOLEAN NOT NULL DEFAULT false,
    "fullName" TEXT,
    "orcid" TEXT,
    "affiliation" TEXT,
    "country" TEXT
);

-- CreateTable
CREATE TABLE "UserGlobalRole" (
    "userId" TEXT NOT NULL,
    "role" TEXT NOT NULL,

    PRIMARY KEY ("userId", "role"),
    CONSTRAINT "UserGlobalRole_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "Journal" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    "title" TEXT NOT NULL,
    "subdomain" TEXT NOT NULL,
    "defaultLang" TEXT NOT NULL DEFAULT 'en',
    "aimScope" TEXT,
    "guidelines" TEXT,
    "ethicalPolicy" TEXT,
    "publicationPolicy" TEXT,
    "pricingPolicy" TEXT
);

-- CreateTable
CREATE TABLE "UserJournalRole" (
    "userId" TEXT NOT NULL,
    "journalId" TEXT NOT NULL,
    "role" TEXT NOT NULL,

    PRIMARY KEY ("userId", "journalId", "role"),
    CONSTRAINT "UserJournalRole_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "UserJournalRole_journalId_fkey" FOREIGN KEY ("journalId") REFERENCES "Journal" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "Submission" (
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
    CONSTRAINT "Submission_journalId_fkey" FOREIGN KEY ("journalId") REFERENCES "Journal" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "Submission_authorId_fkey" FOREIGN KEY ("authorId") REFERENCES "User" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "Review" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    "submissionId" TEXT NOT NULL,
    "reviewerId" TEXT NOT NULL,
    "decision" TEXT,
    "commentToEditor" TEXT,
    "commentToAuthor" TEXT,
    "dueAt" DATETIME,
    "submittedAt" DATETIME,
    CONSTRAINT "Review_submissionId_fkey" FOREIGN KEY ("submissionId") REFERENCES "Submission" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "Review_reviewerId_fkey" FOREIGN KEY ("reviewerId") REFERENCES "User" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "Issue" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    "journalId" TEXT NOT NULL,
    "year" INTEGER NOT NULL,
    "volume" INTEGER,
    "number" INTEGER,
    "title" TEXT,
    CONSTRAINT "Issue_journalId_fkey" FOREIGN KEY ("journalId") REFERENCES "Journal" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "Publication" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    "submissionId" TEXT NOT NULL,
    "issueId" TEXT,
    "doi" TEXT,
    "nationalId" TEXT NOT NULL,
    "publishedAt" DATETIME,
    CONSTRAINT "Publication_submissionId_fkey" FOREIGN KEY ("submissionId") REFERENCES "Submission" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "Publication_issueId_fkey" FOREIGN KEY ("issueId") REFERENCES "Issue" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);

-- CreateIndex
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");

-- CreateIndex
CREATE UNIQUE INDEX "Journal_subdomain_key" ON "Journal"("subdomain");

-- CreateIndex
CREATE INDEX "UserJournalRole_journalId_role_idx" ON "UserJournalRole"("journalId", "role");

-- CreateIndex
CREATE INDEX "Review_submissionId_idx" ON "Review"("submissionId");

-- CreateIndex
CREATE INDEX "Review_reviewerId_idx" ON "Review"("reviewerId");

-- CreateIndex
CREATE INDEX "Issue_journalId_year_idx" ON "Issue"("journalId", "year");

-- CreateIndex
CREATE UNIQUE INDEX "Publication_submissionId_key" ON "Publication"("submissionId");

-- CreateIndex
CREATE UNIQUE INDEX "Publication_doi_key" ON "Publication"("doi");

-- CreateIndex
CREATE UNIQUE INDEX "Publication_nationalId_key" ON "Publication"("nationalId");
