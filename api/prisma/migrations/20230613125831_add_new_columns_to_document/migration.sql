/*
  Warnings:

  - Added the required column `title` to the `Document` table without a default value. This is not possible if the table is not empty.

*/
-- RedefineTables
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_Document" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "title" TEXT NOT NULL,
    "blankDocumentUrl" TEXT NOT NULL,
    "signedDocumentUrl" TEXT,
    "signedFileHash" TEXT,
    "block" INTEGER,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    "ownerId" TEXT,
    CONSTRAINT "Document_ownerId_fkey" FOREIGN KEY ("ownerId") REFERENCES "User" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);
INSERT INTO "new_Document" ("blankDocumentUrl", "createdAt", "id", "ownerId", "signedDocumentUrl", "updatedAt") SELECT "blankDocumentUrl", "createdAt", "id", "ownerId", "signedDocumentUrl", "updatedAt" FROM "Document";
DROP TABLE "Document";
ALTER TABLE "new_Document" RENAME TO "Document";
CREATE UNIQUE INDEX "Document_id_key" ON "Document"("id");
CREATE UNIQUE INDEX "Document_blankDocumentUrl_key" ON "Document"("blankDocumentUrl");
PRAGMA foreign_key_check;
PRAGMA foreign_keys=ON;
