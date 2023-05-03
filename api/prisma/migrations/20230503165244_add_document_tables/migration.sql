-- CreateTable
CREATE TABLE "Document" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "blankDocumentUrl" TEXT NOT NULL,
    "signedDocumentUrl" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    "ownerId" TEXT,
    CONSTRAINT "Document_ownerId_fkey" FOREIGN KEY ("ownerId") REFERENCES "User" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "Signature" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "isSigned" BOOLEAN NOT NULL DEFAULT false,
    "x" REAL,
    "y" REAL,
    "width" REAL,
    "height" REAL,
    "pageIndex" INTEGER,
    "signedAt" DATETIME,
    "documentId" TEXT NOT NULL,
    "signeeId" TEXT,
    "signatureAssetId" TEXT,
    CONSTRAINT "Signature_documentId_fkey" FOREIGN KEY ("documentId") REFERENCES "Document" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "Signature_signeeId_fkey" FOREIGN KEY ("signeeId") REFERENCES "User" ("id") ON DELETE SET NULL ON UPDATE CASCADE,
    CONSTRAINT "Signature_signatureAssetId_fkey" FOREIGN KEY ("signatureAssetId") REFERENCES "SignatureAsset" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "SignatureAsset" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "signatureUrl" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    "signeeId" TEXT NOT NULL,
    CONSTRAINT "SignatureAsset_signeeId_fkey" FOREIGN KEY ("signeeId") REFERENCES "User" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateIndex
CREATE UNIQUE INDEX "Document_id_key" ON "Document"("id");

-- CreateIndex
CREATE UNIQUE INDEX "Document_blankDocumentUrl_key" ON "Document"("blankDocumentUrl");

-- CreateIndex
CREATE UNIQUE INDEX "Signature_id_key" ON "Signature"("id");
