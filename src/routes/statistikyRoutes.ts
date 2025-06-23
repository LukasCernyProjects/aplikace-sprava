import express from "express";
import { PrismaClient, Platba } from "@prisma/client";

const router = express.Router();
const prisma = new PrismaClient();

// Statistiky: součet plateb podle měsíce
router.get("/mesicni", async (req, res) => {
  try {
    const platby = await prisma.platba.findMany({
      select: {
        datum: true,
        castka: true
      }
    });

    const agregace: { [mesic: string]: number } = {};

    platby.forEach((platba) => {
      const datum = new Date(platba.datum);
      const mesic = `${datum.getFullYear()}-${String(datum.getMonth() + 1).padStart(2, "0")}`;
      agregace[mesic] = (agregace[mesic] || 0) + platba.castka;
    });

    res.json(agregace);
  } catch (error) {
    res.status(500).json({ error: "Chyba při získávání statistik" });
  }
});

// Statistiky: součet plateb podle nájemníka
router.get("/najemnici", async (req, res) => {
  try {
    const platby = await prisma.platba.findMany({
      select: {
        castka: true,
        najemnik: {
          select: {
            jmeno: true
          }
        }
      }
    });

    const agregace: { [jmeno: string]: number } = {};

    platby.forEach((platba) => {
      const jmeno = platba.najemnik.jmeno;
      agregace[jmeno] = (agregace[jmeno] || 0) + platba.castka;
    });

    res.json(agregace);
  } catch (error) {
    res.status(500).json({ error: "Chyba při získávání statistik" });
  }
});

// Statistiky: dluhy/přeplatky
router.get("/zustatky", async (req, res) => {
  try {
    const najemnici = await prisma.najemnik.findMany({
      include: {
        platby: true
      }
    });

    const pocetMesicu = 3;

const vysledky = najemnici.map((najemnik) => {
  const zaplaceno = najemnik.platby.reduce(
    (suma: number, platba: Platba) => suma + platba.castka,
    0
  );

  const mesicniNajem = (najemnik as any).mesicniNajem; // 👈 klíčový krok!

  const ocekavano = mesicniNajem * pocetMesicu;

  return {
    jmeno: najemnik.jmeno,
    zaplaceno,
    ocekavano,
    zustatek: zaplaceno - ocekavano
  };
});


    res.json(vysledky);
  } catch (err) {
    console.error("Chyba při výpočtu zůstatků:", err);
    res.status(500).json({ error: "Chyba při výpočtu zůstatků" });
  }
});

export default router;
