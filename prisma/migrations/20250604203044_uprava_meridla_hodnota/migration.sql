/*
  Warnings:

  - You are about to drop the column `stav` on the `Meridlo` table. All the data in the column will be lost.
  - Added the required column `hodnota` to the `Meridlo` table without a default value. This is not possible if the table is not empty.

*/
-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_Meridlo" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "typ" TEXT NOT NULL,
    "hodnota" REAL NOT NULL,
    "datum" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "najemnikId" INTEGER NOT NULL,
    CONSTRAINT "Meridlo_najemnikId_fkey" FOREIGN KEY ("najemnikId") REFERENCES "Najemnik" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);
INSERT INTO "new_Meridlo" ("id", "najemnikId", "typ") SELECT "id", "najemnikId", "typ" FROM "Meridlo";
DROP TABLE "Meridlo";
ALTER TABLE "new_Meridlo" RENAME TO "Meridlo";
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
