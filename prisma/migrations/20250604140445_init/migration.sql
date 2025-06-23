-- CreateTable
CREATE TABLE "Nemovitost" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "nazev" TEXT NOT NULL,
    "adresa" TEXT NOT NULL
);

-- CreateTable
CREATE TABLE "Najemnik" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "jmeno" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "nemovitostId" INTEGER NOT NULL,
    CONSTRAINT "Najemnik_nemovitostId_fkey" FOREIGN KEY ("nemovitostId") REFERENCES "Nemovitost" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "Platba" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "castka" REAL NOT NULL,
    "datum" DATETIME NOT NULL,
    "najemnikId" INTEGER NOT NULL,
    CONSTRAINT "Platba_najemnikId_fkey" FOREIGN KEY ("najemnikId") REFERENCES "Najemnik" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "Meridlo" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "typ" TEXT NOT NULL,
    "stav" REAL NOT NULL,
    "najemnikId" INTEGER NOT NULL,
    CONSTRAINT "Meridlo_najemnikId_fkey" FOREIGN KEY ("najemnikId") REFERENCES "Najemnik" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "Ukol" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "popis" TEXT NOT NULL,
    "datum" DATETIME NOT NULL,
    "najemnikId" INTEGER NOT NULL,
    CONSTRAINT "Ukol_najemnikId_fkey" FOREIGN KEY ("najemnikId") REFERENCES "Najemnik" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);
