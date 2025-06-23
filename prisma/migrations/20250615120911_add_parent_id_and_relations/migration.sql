/*
  Warnings:

  - You are about to drop the column `name` on the `Apartment` table. All the data in the column will be lost.
  - You are about to drop the column `email` on the `Tenant` table. All the data in the column will be lost.
  - You are about to drop the column `fullName` on the `Tenant` table. All the data in the column will be lost.
  - Added the required column `name` to the `Tenant` table without a default value. This is not possible if the table is not empty.

*/
-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_Apartment" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "address" TEXT NOT NULL,
    "city" TEXT NOT NULL,
    "postalCode" TEXT NOT NULL,
    "purchasePrice" REAL,
    "currentValue" REAL,
    "purchaseDate" DATETIME,
    "parentId" INTEGER,
    "ownerId" INTEGER NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "Apartment_parentId_fkey" FOREIGN KEY ("parentId") REFERENCES "Apartment" ("id") ON DELETE SET NULL ON UPDATE CASCADE,
    CONSTRAINT "Apartment_ownerId_fkey" FOREIGN KEY ("ownerId") REFERENCES "User" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);
INSERT INTO "new_Apartment" ("address", "city", "createdAt", "id", "ownerId", "postalCode", "updatedAt") SELECT "address", "city", "createdAt", "id", "ownerId", "postalCode", "updatedAt" FROM "Apartment";
DROP TABLE "Apartment";
ALTER TABLE "new_Apartment" RENAME TO "Apartment";
CREATE TABLE "new_Tenant" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "name" TEXT NOT NULL,
    "phone" TEXT,
    "apartmentId" INTEGER,
    CONSTRAINT "Tenant_apartmentId_fkey" FOREIGN KEY ("apartmentId") REFERENCES "Apartment" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);
INSERT INTO "new_Tenant" ("apartmentId", "id", "phone") SELECT "apartmentId", "id", "phone" FROM "Tenant";
DROP TABLE "Tenant";
ALTER TABLE "new_Tenant" RENAME TO "Tenant";
CREATE TABLE "new_User" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "email" TEXT NOT NULL,
    "password" TEXT NOT NULL,
    "role" TEXT NOT NULL,
    "isActive" BOOLEAN NOT NULL DEFAULT true
);
INSERT INTO "new_User" ("email", "id", "isActive", "password", "role") SELECT "email", "id", "isActive", "password", "role" FROM "User";
DROP TABLE "User";
ALTER TABLE "new_User" RENAME TO "User";
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
