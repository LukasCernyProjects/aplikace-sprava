-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_Ukol" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "popis" TEXT NOT NULL,
    "datum" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "najemnikId" INTEGER NOT NULL,
    CONSTRAINT "Ukol_najemnikId_fkey" FOREIGN KEY ("najemnikId") REFERENCES "Najemnik" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);
INSERT INTO "new_Ukol" ("datum", "id", "najemnikId", "popis") SELECT "datum", "id", "najemnikId", "popis" FROM "Ukol";
DROP TABLE "Ukol";
ALTER TABLE "new_Ukol" RENAME TO "Ukol";
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
