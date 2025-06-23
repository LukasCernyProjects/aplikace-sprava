/*
  Warnings:

  - You are about to drop the column `floorLocation` on the `Apartment` table. All the data in the column will be lost.
  - You are about to drop the column `floorsAbove` on the `Apartment` table. All the data in the column will be lost.
  - You are about to drop the column `floorsBelow` on the `Apartment` table. All the data in the column will be lost.
  - You are about to drop the column `heating` on the `Apartment` table. All the data in the column will be lost.
  - You are about to drop the column `structure` on the `Apartment` table. All the data in the column will be lost.

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
    "insuranceAnnualPrice" REAL,
    "insuranceNumber" TEXT,
    "insuranceNote" TEXT,
    "ownershipType" TEXT,
    "buildingType" TEXT,
    "buildingConstruction" TEXT,
    "heatingType" TEXT,
    "area" REAL,
    "eicCode" TEXT,
    "eanCode" TEXT,
    "floorNumber" INTEGER,
    "totalFloorsAbove" INTEGER,
    "totalFloorsBelow" INTEGER,
    "hasElevator" BOOLEAN DEFAULT false,
    "hasBalcony" BOOLEAN DEFAULT false,
    "hasLoggia" BOOLEAN DEFAULT false,
    "hasTerrace" BOOLEAN DEFAULT false,
    "hasStorage" BOOLEAN DEFAULT false,
    "technicalNote" TEXT,
    CONSTRAINT "Apartment_parentId_fkey" FOREIGN KEY ("parentId") REFERENCES "Apartment" ("id") ON DELETE SET NULL ON UPDATE CASCADE,
    CONSTRAINT "Apartment_ownerId_fkey" FOREIGN KEY ("ownerId") REFERENCES "User" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);
INSERT INTO "new_Apartment" ("address", "area", "buildingType", "city", "createdAt", "currentValue", "eanCode", "eicCode", "id", "insuranceAnnualPrice", "insuranceNote", "insuranceNumber", "ownerId", "ownershipType", "parentId", "postalCode", "purchaseDate", "purchasePrice", "updatedAt") SELECT "address", "area", "buildingType", "city", "createdAt", "currentValue", "eanCode", "eicCode", "id", "insuranceAnnualPrice", "insuranceNote", "insuranceNumber", "ownerId", "ownershipType", "parentId", "postalCode", "purchaseDate", "purchasePrice", "updatedAt" FROM "Apartment";
DROP TABLE "Apartment";
ALTER TABLE "new_Apartment" RENAME TO "Apartment";
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
