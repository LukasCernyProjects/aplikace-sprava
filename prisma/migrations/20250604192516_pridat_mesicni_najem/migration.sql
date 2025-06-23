-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_Najemnik" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "jmeno" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "nemovitostId" INTEGER NOT NULL,
    "mesicniNajem" REAL NOT NULL DEFAULT 12000,
    CONSTRAINT "Najemnik_nemovitostId_fkey" FOREIGN KEY ("nemovitostId") REFERENCES "Nemovitost" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);
INSERT INTO "new_Najemnik" ("email", "id", "jmeno", "nemovitostId") SELECT "email", "id", "jmeno", "nemovitostId" FROM "Najemnik";
DROP TABLE "Najemnik";
ALTER TABLE "new_Najemnik" RENAME TO "Najemnik";
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
